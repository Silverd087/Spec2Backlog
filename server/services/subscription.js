const subscriptions = new Map()

subscriptions.set('starter', {
    priceId: 'price_1Sr2DKIdTwRPD359TXxTfVjg',
    name: 'Starter',
    price: '$0',
    description: 'Ideal for small projects and exploration.',
    features: ['1 AI-Generated Projects', 'Standard Prompt Engine', 'CSV Export'],
    highlighted: false,
})
subscriptions.set('professional', {
    priceId: 'price_1Sr2DuIdTwRPD359nJRr518R',
    name: 'Professional',
    price: '$19',
    description: 'Designed for product managers and power users.',
    features: ['Unlimited Projects', 'Advanced Reasoning Model', 'Full Export Suite (PDF/CSV)', 'Priority Processing'],
    highlighted: true,
})
subscriptions.set('enterprise', {
    priceId: 'prod_TofZBigwnq6yra',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams that need maximum control and speed.',
    features: ['Everything in Pro', 'Custom AI Fine-tuning', 'Dedicated Infrastructure', 'SLA & 24/7 Support'],
    highlighted: false,
})

module.exports = subscriptions
