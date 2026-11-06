const express = require('express')
const paymentRouter = express.Router()
const authentication = require('../middlewares/authentication')
const subscriptions = require('../services/subscription')
const Stripe = require("stripe")
const dotenv = require("dotenv")
const { rateLimiter } = require("../middlewares/rateLimiter")

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

paymentRouter.post('/create-checkout-session', authentication, rateLimiter({ keyGenerator: (req) => "payment", maxRequests: 3, window: 60 * 10 }), async (req, res) => {
    try {
        const planName = req.body.planName?.toLowerCase()
        console.log(planName)
        if (!planName) {
            return res.status(400).json({ message: "Plan name is required" })
        }
        const tier = subscriptions.get(planName)
        if (!tier) {
            return res.status(400).json({ message: "tier not found" })
        }
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{
                price: tier.priceId,
                quantity: 1,
            }],
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                userId: req.userId,
                planName: planName
            }
        })
        return res.status(200).json({ url: session.url })
    }
    catch (error) {
        console.error('Error creating checkout session:', error)
        return res.status(500).json({ message: "Error creating checkout session" })
    }
})

paymentRouter.get('/pricing-tiers', (req, res) => {
    return res.status(200).json({ tiers: [...subscriptions.values()] })
})

const handleCheckoutSessionCompleted = async (session) => {
    const { userId } = session.metadata
    const subscription = await stripe.subscriptions.retrieve(session.subscription)
    const priceId = subscription.items.data[0].price.id

    await prisma.subscription.upsert({
        where: { userId },
        update: {
            stripeSubscriptionId: session.subscription,
            stripePriceId: priceId,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(subscription.current_period_end * 1000),
        },
        create: {
            userId,
            stripeSubscriptionId: session.subscription,
            stripePriceId: priceId,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
    })
}

paymentRouter.post('/webhook', async (req, res) => {
    const sig = req.headers["stripe-signature"]
    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        return res.status(400).send(`Webhook error: ${error.message}`)
    }

    try {
        if (event.type === "checkout.session.completed") {
            await handleCheckoutSessionCompleted(event.data.object)
        }
        return res.status(200).send()
    } catch (error) {
        console.error("Error handling webhook:", error)
        return res.status(500).send()
    }
})


module.exports = paymentRouter
