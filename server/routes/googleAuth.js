const express = require("express")
const googleAuthRouter = express.Router()
const dotenv = require("dotenv")
const axios = require("axios")
const { jwtVerify, createRemoteJWKSet, SignJWT } = require("jose")
const prisma = require("../lib/prisma")
const { getSigningKey } = require("../services/dbKeyStore")
const { AuthProvider } = require("@prisma/client")
const crypto = require("crypto")
const { rateLimiter } = require("../middlewares/rateLimiter")


dotenv.config()

googleAuthRouter.get("/google", rateLimiter({ keyGenerator: (req) => "google", maxRequests: 5, window: 60 * 10 }), async (req, res) => {
    const code_challenge = req.query.code_challenge
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: "http://localhost:3000/api/auth/google/callback",
        response_type: "code",
        code_challenge,
        code_challenge_method: "S256",
        scope: "email profile"
    })
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    res.redirect(url)
})

googleAuthRouter.get("/google/callback", async (req, res) => {
    const { code, error } = req.query
    if (error) {
        return res.status(400).redirect("http://localhost:5173/")
    }
    const code_verifier = req.cookies.code_verifier
    const token = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        code_verifier,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "http://localhost:3000/api/auth/google/callback",
        grant_type: "authorization_code"
    })
    const { id_token } = token.data
    const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"))
    const { payload } = await jwtVerify(id_token, jwks)
    let user = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    })
    if (!user) {
        user = await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                method: {
                    create: {
                        provider: AuthProvider.GOOGLE,
                        providerId: payload.sub,
                    }
                }
            }
        })
    }
    const { privateKey: key, kid } = await getSigningKey()
    const jwt = await new SignJWT({ id: user.id })
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
    res.status(200).cookie("access_token", jwt, { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
    res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
    res.redirect("http://localhost:5173/")
})

module.exports = googleAuthRouter 