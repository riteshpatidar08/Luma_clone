import express from "express";
import { login, verifyOtp } from "../controller/auth.controller.js";

const router = express.Router() ;




router.post('/login' , login);
router.post('/verifyOtp' , verifyOtp)


export default router