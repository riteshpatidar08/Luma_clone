import express from "express";
import { login, verifyOtp, updateProfile } from "../controller/auth.controller.js";

const router = express.Router() ;




router.post('/login' , login);
router.post('/verifyOtp' , verifyOtp)
router.post('/updateProfile', updateProfile);


export default router