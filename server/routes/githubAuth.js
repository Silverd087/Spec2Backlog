const express = require('express')
const githubAuthRouter = express.Router()
const dotenv = require("dotenv")
const axios = require('axios')
const { SignJWT } = require("jose")
const prisma = require("../lib/prisma")
const { AuthProvider } = require("@prisma/client")
const { getSigningKey } = require("../services/dbKeyStore")
const crypto = require("crypto")
const { rateLimiter } = require("../middlewares/rateLimiter")

dotenv.config()

githubAuthRouter.get('/github', rateLimiter({ keyGenerator: (req)=>"github", maxRequests: 5, window: 60 * 10 }), (req, res) => {
    const code_challenge = req.query.code_challenge
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: "http://localhost:3000/api/auth/github/callback",
        scope: "user user:email",
        code_challenge: code_challenge,
        code_challenge_method: "S256",
        allow_signup: "true",
        prompt: "select_account"
    })
    const url = `https://github.com/login/oauth/authorize?${params.toString()}`
    res.redirect(url)
})

githubAuthRouter.get('/github/callback', async (req, res) => {
    const { code, error } = req.query
    if (error) {
        return res.status(400).redirect("http://localhost:5173/")
    }
    const code_verifier = req.cookies.code_verifier
    if (!code_verifier) {
        return res.status(400).redirect("http://localhost:5173/")
    }
    try {
        const token = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            code_verifier,
            redirect_uri: "http://localhost:3000/api/auth/github/callback",
        },
            {
                headers: {
                    Accept: "application/json"
                }
            })


        const access_token = token.data.access_token

        const user = await axios.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        const emails = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        const primaryEmail = emails.data.find(email => email.primary)?.email
        let prismaUser = await prisma.user.findUnique({
            where: {
                email: primaryEmail
            }
        })
        if (!prismaUser) {
            prismaUser = await prisma.user.create({
                data: {
                    name: user.data.login,
                    email: primaryEmail,
                    method: {
                        create: {
                            provider: AuthProvider.GITHUB,
                            providerId: user.data.id.toString()
                        }
                    }
                }
            })
        } else {
            await prisma.authMethod.upsert({
                where: {
                    userId_provider: {
                        userId: prismaUser.id,
                        provider: AuthProvider.GITHUB
                    }
                },
                update: {
                    providerId: user.data.id.toString()
                },
                create: {
                    userId: prismaUser.id,
                    provider: AuthProvider.GITHUB,
                    providerId: user.data.id.toString()
                }
            })
        }
        const { privateKey: key, kid } = await getSigningKey()
        const jwt = await new SignJWT({ id: prismaUser.id })
            .setProtectedHeader({ alg: "RS256", kid: kid })
            .setIssuedAt()
            .setExpirationTime("15m")
            .sign(key)
        const refreshToken = crypto.randomBytes(64).toString("hex")
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
        await prisma.refreshToken.create({
            data: {
                userId: prismaUser.id,
                tokenHash: tokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000)
            }
        })
        res.cookie("access_token", jwt, { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
        res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: false, sameSite: "strict", path: "/" })
        res.redirect("http://localhost:5173/")
    } catch (err) {
        console.error("GitHub Auth Error:", err)
        res.redirect("http://localhost:5173/auth?error=github_failed")
    }
})

module.exports = githubAuthRouter