import Event from '../models/event.model.js';

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      visibility,
      calender,
      startDate,
      endDate,
      location,
      options,
    } = req.body;
    console.log(req.body);
    const EventData = {
      title,
      description,
      visibility,
      calender,
      schedule: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    };
    console.log(EventData);
   const event =  await Event.create(EventData);
   res.status(201).json({
    message : "success",
    data : event
   })
  } catch (error) {
    res.status(500).json({
      error : error.message
    })
  }
};


//NOTE  pagination from backend , sorting from backend , 