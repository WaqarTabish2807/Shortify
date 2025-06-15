const { LemonSqueezy } = require('@lemonsqueezy/lemonsqueezy.js');
require('dotenv').config();

// Initialize Lemon Squeezy client
const lemonSqueezy = new LemonSqueezy(process.env.LEMON_SQUEEZY_API_KEY);

// Function to create a checkout
async function createCheckout(variantId, customData = {}) {
    try {
        const checkout = await lemonSqueezy.createCheckout({
            storeId: process.env.LEMON_SQUEEZY_STORE_ID,
            variantId: variantId,
            customData: customData,
            successUrl: `${process.env.FRONTEND_URL}/payment/success`,
            cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
        });
        return checkout;
    } catch (error) {
        console.error('Error creating checkout:', error);
        throw error;
    }
}

// Function to verify webhook signature
function verifyWebhookSignature(payload, signature) {
    try {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET);
        const digest = hmac.update(JSON.stringify(payload)).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return false;
    }
}

// Function to handle subscription events
async function handleSubscriptionEvent(event) {
    switch (event.meta.event_name) {
        case 'subscription_created':
            // Handle new subscription
            return await handleNewSubscription(event.data);
        case 'subscription_updated':
            // Handle subscription update
            return await handleSubscriptionUpdate(event.data);
        case 'subscription_cancelled':
            // Handle subscription cancellation
            return await handleSubscriptionCancellation(event.data);
        default:
            console.log('Unhandled event type:', event.meta.event_name);
            return null;
    }
}

// Helper functions for subscription events
async function handleNewSubscription(subscriptionData) {
    // Implement your logic for new subscriptions
    // e.g., update user's subscription status in your database
    return subscriptionData;
}

async function handleSubscriptionUpdate(subscriptionData) {
    // Implement your logic for subscription updates
    return subscriptionData;
}

async function handleSubscriptionCancellation(subscriptionData) {
    // Implement your logic for subscription cancellations
    return subscriptionData;
}

module.exports = {
    createCheckout,
    verifyWebhookSignature,
    handleSubscriptionEvent,
    lemonSqueezy
}; 