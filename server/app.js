import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { dbConnect } from './config/dbConnect.js';
import cors from 'cors';
import admin from 'firebase-admin';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.route.js';
import eventRouter from './routes/event.routes.js';
import ticketRouter from './routes/ticket.routes.js';
import userRouter from './routes/user.routes.js';
import organizerRouter from './routes/organizer.routes.js';
import adminRouter from './routes/admin.routes.js';
import notificationRouter from './routes/notification.routes.js';
import webhookRouter from './routes/webhook.routes.js';
import chatRouter from './routes/chat.routes.js';

const app = express();

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

if (process.env.FIREBASE_PROJECT_ID && !admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

app.use(cors());

// Stripe webhook needs the raw body for signature verification, so it must
// be mounted before the global express.json() parser below.
app.use('/api/v1', webhookRouter);

app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const checkoutLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });


app.get('/', (req, res) => {
  res.send('Server deployed....');
});

app.use('/api/v1/login', authLimiter);
app.use('/api/v1/tickets/checkout', checkoutLimiter);
app.use('/api/v1/chat', chatLimiter);

// Each resource router is mounted at its own distinct prefix (rather than
// all sharing the flat '/api/v1' base) so a router-level `router.use(...)`
// guard (e.g. organizer/admin role checks) only ever applies to requests
// actually meant for that resource -- it can't intercept unrelated routes
// processed later in this list.
app.use('/api/v1', authRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/organizer', organizerRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/chat', chatRouter);

dbConnect();

app.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT}`);
});
