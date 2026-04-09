const dotenv = require("dotenv")
const { jwtVerify, createLocalJWKSet } = require("jose")
const { getJwks } = require("../services/dbKeyStore")
dotenv.config()
const authentication = async (req, res, next) => {
    const jwks = createLocalJWKSet({ keys: await getJwks(), alg: "RS256" })
    const token = req.cookies.access_token
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    try {
        const decoded = await jwtVerify(token, jwks)
        req.userId = decoded.payload.id || decoded.payload.sub
        next()
    } catch (error) {
        if (error.name == "JWTExpired") {
            return res.status(401).json({ message: "token expired" })
        }
        console.error("Error verifying token:", error)
        return res.status(401).json({ message: "Unauthorized" })
    }
}

module.exports = authentication
