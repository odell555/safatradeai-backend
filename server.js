require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'SafaTradeAI backend' });
});

// Stripe webhook (raw body)
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('checkout.session.completed');
        break;

      case 'invoice.paid':
        console.log('invoice.paid');
        break;

      case 'customer.subscription.updated':
        console.log('customer.subscription.updated');
        break;

      case 'invoice.payment_failed':
        console.log('invoice.payment_failed');
        break;

      default:
        console.log('Unhandled event:', event.type);
    }

    res.json({ received: true });
  }
);

// Body parser for non-webhook routes
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SafaTradeAI backend running on port ${PORT}`);
});
