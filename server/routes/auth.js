const express = require("express");
const userRouter = express.Router();
const { SignJWT, jwtVerify, createLocalJWKSet } = require("jose")
const bcrypt = require("bcryptjs")
const prisma = require("../lib/prisma")
const { AuthProvider } = require("@prisma/client")
const dotenv = require("dotenv")
const { getSigningKey, getJwks } = require("../services/dbKeyStore")
const crypto = require("crypto")
const { rateLimiter } = require('../middlewares/rateLimiter')
dotenv.config()

userRouter.post("/register", rateLimiter({ keyGenerator: (req) => "/register", maxRequests: 2, window: 60 * 10 }), async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" })
    } const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })
    if (user) {
        return res.status(400).json({ message: "User already exists" })
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: {
            name,
            email,
            method: {
                create: {
                    provider: AuthProvider.LOCAL,
                    password: hashedPassword
                }
            }
        }
    }).then((user) => {
        return res.status(201).json({ message: "User created successfully" })
    })
})

userRouter.post("/login", rateLimiter({ keyGenerator: (req) => "/login", maxRequests: 5, window: 60 * 10 }), async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }
    const user = await prisma.user.findUnique({
        where: {
            email: email
        },
        include: {
            method: true
        }
    })
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    const localMethod = user.method.find(m => m.provider === AuthProvider.LOCAL)

    if (!localMethod || !localMethod.password) {
        return res.status(400).json({ message: "Invalid login method" })
    }

    const isPasswordValid = await bcrypt.compare(password, localMethod.password)
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" })
    }
    try {
        const { privateKey: key, kid } = await getSigningKey()
        const accessToken = await new SignJWT({ id: user.id })
            .setProtectedHeader({ alg: "RS256", kid: kid })
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(key)
        const refreshToken = crypto.randomBytes(64).toString("hex")
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: tokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000)
            }
        })
        res.status(200).cookie("refresh_token", refreshToken, { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
        return res.status(200).cookie("access_token", accessToken, { httpOnly: true, secure: false, sameSite: "strict", path: "/" }).json({ message: "Login successful", code: 200 })
    } catch (error) {
        console.error("Error generating token:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
})

userRouter.get("/isAuthenticated", async (req, res) => {
    const token = req.cookies.access_token
    if (!token) {
        return res.status(401).json({ message: "missing access token" })
    }
    try {
        const jwks = createLocalJWKSet({ keys: await getJwks() })
        const { payload } = await jwtVerify(token, jwks)
        return res.status(200).json({ message: "authenticated", code: 200 })

    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: "invalid access token" })
    }
})

userRouter.post("/refresh", async (req, res) => {
    let refreshToken = req.cookies.refresh_token
    try {
        if (!refreshToken) {
            return res.status(401).json({ message: "missing refresh token" })
        }
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
        const token = await prisma.refreshToken.findUnique({
            where: {
                tokenHash: tokenHash
            }
        })
        if (!token) {
            return res.status(401).json({ message: "Invalid Token" })
        }
        if (token.expiresAt < new Date()) {
            await prisma.refreshToken.update({
                where: {
                    tokenHash: tokenHash
                },
                data: {
                    revoked: true
                }
            })
            return res.status(401).json({ message: "Token expired" })
        }
        const { privateKey: key, kid } = await getSigningKey()
        const newAccessToken = await new SignJWT({ id: token.userId })
            .setProtectedHeader({ alg: "RS256", kid: kid })
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(key)
        const newRefreshToken = crypto.randomBytes(64).toString("hex")
        const newTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex")
        await prisma.refreshToken.create({
            data: {
                userId: token.userId,
                tokenHash: newTokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000)
            }
        })
        return res.status(200).cookie("access_token", newAccessToken, { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
            .cookie("refresh_token", newRefreshToken, { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
            .json({ message: "success", code: 200 })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})

userRouter.post("/logout", async (req, res) => {
    const refreshToken = req.cookies.refresh_token
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
    await prisma.refreshToken.update({
        where: {
            tokenHash: tokenHash
        },
        data: {
            revoked: true
        }
    })
    return res.status(200).clearCookie("access_token", { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
        .clearCookie("refresh_token", { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
        .json({ message: "Logout successful" })
})

module.exports = userRouter;