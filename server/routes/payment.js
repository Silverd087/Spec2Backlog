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

paymentRouter.post('/webhook', async (req, res) => {
    console.log("webhook endpoint hit")
    const sig = req.headers["stripe-signature"]
    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    }
    catch (error) {
        console.log("Error", error.message)
        return res.status(400).send(`Webhook error: ${error.message}`)
    }
    if (event.type == "checkout.session.completed") {
        const session = event.data.object
        await handleCheckoutSessionCompleted(session)
    }
    res.status(200).send()
})

const handCheckoutSessionCompleted = async (session) => {
    const { userId, planName } = session.metadata
    const subscription = await stripe.subscriptions.retrieve(session.subscriptionId)

    await prisma.subscription.upsert({
        where: {
            userId: userId
        },
        update: {
            stripeSubscriptionId: session.subscriptionId,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            createdAt: subscription.created,
            updatedAt: subscription.updated

        },
        create: {
            stripeSubscriptionId: session.subscriptionId,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            createdAt: subscription.created,
            updatedAt: subscription.updated,
            userId: userId
        }
    })
}



module.exports = paymentRouter
