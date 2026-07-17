import express from "express";
import { login, verifyOtp, updateProfile, verifyGoogleLogin } from "../controller/auth.controller.js";

const router = express.Router() ;




router.post('/login' , login);
router.post('/verifyOtp' , verifyOtp)
router.post('/updateProfile', updateProfile);
router.post('/verifyGoogleLogin' , verifyGoogleLogin);

export default router