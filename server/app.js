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

import serviceAccount from './key/test-1bf72-firebase-adminsdk-pg6k8-a8e3134601.json' with {type : 'json'} ;

const app = express();

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

app.use('/api/v1', authRouter); //authentication logic
app.use('/api/v1', eventRouter); //event logic 

app.listen(process.env.PORT, () => {
  console.log('server is running on 3000');
});


// npm i firebase-admin@13 installing the