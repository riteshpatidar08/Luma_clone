//client and server ko ek repo main push 

//github par push
//atlas par account banana hain
 //mongodb atlas

 import express from 'express';
 import { dbConnect } from './config/dbConnect.js';
 const app = express() ;

import dotenv from 'dotenv'; //npm i dotenv 

dotenv.config();  //configure the .env variables to use in the app
dbConnect() //make connection with databse :
 

 app.listen(process.env.PORT,()=>{
    console.log('server is running on 3000')
 })