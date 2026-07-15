import express from 'express' ;
import { createEvent } from '../controller/event.controller.js';
const router = express.Router() ;


router.post('/events' , createEvent)

export default router