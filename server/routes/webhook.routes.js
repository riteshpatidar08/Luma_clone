import express from 'express';
import { handleStripeWebhook } from '../controller/webhook.controller.js';

const router = express.Router();

// Stripe requires the raw, unparsed body to verify the webhook signature --
// this router must be mounted before the global express.json() middleware.
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
