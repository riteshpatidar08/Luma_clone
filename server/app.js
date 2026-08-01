//client and server ko ek repo main push

//github par push
//atlas par account banana hain
//mongodb atlas

import express from 'express';
import { dbConnect } from './config/dbConnect.js';
import authRouter from './routes/auth.route.js';
import eventRouter from './routes/event.routes.js';
import cors from 'cors';
import admin from 'firebase-admin'

// import serviceAccount from './key/test-1bf72-firebase-adminsdk-pg6k8-a8e3134601.json' with {type : 'json'} ;

const app = express();

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

console.log(admin)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// console.log(admin.get)


import dotenv from 'dotenv'; //npm i dotenv
app.use(cors());
app.use(express.json());
dotenv.config(); //configure the .env variables to use in the app
dbConnect(); //make connection with databse :

app.get('/' , (req,res)=>{
  res.send("Server deployed....")
})

app.use('/api/v1', authRouter); //authentication logic
app.use('/api/v1', eventRouter); //event logic 

app.listen(process.env.PORT, () => {
  console.log(`server is running on ${process.env.PORT}`);
});


// npm i firebase-admin@13 installing the