const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");



const router = express.Router();
const stripe = Stripe('your_stripe_secret_key_here');



router.post("/create-payment-intent", async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: currency || "usd",
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
