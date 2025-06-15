const express = require('express');
const router = express.Router();
const { createCheckout, verifyWebhookSignature, handleSubscriptionEvent } = require('../utils/lemonSqueezy');

// Create a checkout session
router.post('/create-checkout', async (req, res) => {
    try {
        const { variantId, customData } = req.body;
        
        if (!variantId) {
            return res.status(400).json({ error: 'Variant ID is required' });
        }

        const checkout = await createCheckout(variantId, customData);
        res.json({ checkoutUrl: checkout.data.attributes.url });
    } catch (error) {
        console.error('Error creating checkout:', error);
        res.status(500).json({ error: 'Failed to create checkout' });
    }
});

// Handle webhook events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['x-signature'];
        
        if (!signature) {
            return res.status(401).json({ error: 'No signature provided' });
        }

        const payload = req.body;
        
        // Verify webhook signature
        if (!verifyWebhookSignature(payload, signature)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Handle the webhook event
        await handleSubscriptionEvent(payload);
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router; 