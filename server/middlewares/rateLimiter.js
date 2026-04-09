const { client } = require("../connectRedis")
const rateLimiter = ({ keyGenerator, maxRequests, window }) => {
    return async (req, res, next) => {
        try {
            const id = req.userId
            const rateIdentifer = id ? `user:${id}` : `ip:${req.ip}`
            const keyPrefix = keyGenerator(req)
            const key = `rate:${keyPrefix}:${rateIdentifer}`

            const count = await client.incr(key)

            if (count == 1) {
                await client.expire(key, window)
            }

            if (count > maxRequests) {
                return res.status(429).json({ message: "Too many requests. try again later.." })
            }
            next()
        } catch (error) {
            console.log("Rate limit error :", error)
            next()
        }

    }

}

module.exports = { rateLimiter }