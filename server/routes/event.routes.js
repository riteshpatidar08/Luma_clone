import express from 'express' ;
import { createEvent, getEvents, getEventsById } from '../controller/event.controller.js';
const router = express.Router() ;


router.post('/events' , createEvent)
router.get('/events' , getEvents)
router.get('/events/:id' , getEventsById)
export default router