// const { setApiKey, Checkouts } = require('@lemonsqueezy/lemonsqueezy.js');
// require('dotenv').config();

// setApiKey(process.env.LEMON_SQUEEZY_API_KEY);

// Function to create a checkout
// async function createCheckout(variantId, customData = {}) {
//     try {
//         const checkout = await Checkouts.create({
//             store_id: process.env.LEMON_SQUEEZY_STORE_ID,
//             variant_id: variantId,
//             custom_data: customData,
//             checkout_options: {
//                 success_url: `${process.env.FRONTEND_URL}/payment/success`,
//                 cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
//             }
//         });
//         return checkout;
//     } catch (error) {
//         console.error('Error creating checkout:', error);
//         throw error;
//     }
// }

// Function to verify webhook signature
// function verifyWebhookSignature(payload, signature) {
//     try {
//         const crypto = require('crypto');
//         const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET);
//         const digest = hmac.update(JSON.stringify(payload)).digest('hex');
//         return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
//     } catch (error) {
//         console.error('Error verifying webhook signature:', error);
//         return false;
//     }
// }

// Function to handle subscription events
// async function handleSubscriptionEvent(event) {
//     switch (event.meta.event_name) {
//         case 'subscription_created':
//             return await handleNewSubscription(event.data);
//         case 'subscription_updated':
//             return await handleSubscriptionUpdate(event.data);
//         case 'subscription_cancelled':
//             return await handleSubscriptionCancellation(event.data);
//         default:
//             console.log('Unhandled event type:', event.meta.event_name);
//             return null;
//     }
// }

// Helper functions for subscription events
// async function handleNewSubscription(subscriptionData) {
//     // Implement your logic for new subscriptions
//     return subscriptionData;
// }

// async function handleSubscriptionUpdate(subscriptionData) {
//     // Implement your logic for subscription updates
//     return subscriptionData;
// }

// async function handleSubscriptionCancellation(subscriptionData) {
//     // Implement your logic for subscription cancellations
//     return subscriptionData;
// }

// module.exports = {
//     createCheckout,
//     verifyWebhookSignature,
//     handleSubscriptionEvent
// };

// LemonSqueezy integration is commented out for now. Will be used later. 