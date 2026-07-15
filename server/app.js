//client and server ko ek repo main push

//github par push
//atlas par account banana hain
//mongodb atlas

import express from 'express';
import { dbConnect } from './config/dbConnect.js';
import authRouter from './routes/auth.route.js';
import eventRouter from './routes/event.routes.js';
import cors from 'cors';
const app = express();

import dotenv from 'dotenv'; //npm i dotenv
app.use(cors());
app.use(express.json());
dotenv.config(); //configure the .env variables to use in the app
dbConnect(); //make connection with databse :

app.use('/api/v1', authRouter);
app.use('/api/v1', eventRouter);


app.listen(process.env.PORT, () => {
  console.log('server is running on 3000');
});
