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
    const event = await Event.create(EventData);
    res.status(201).json({
      message: 'success',
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

//NOTE  pagination from backend , sorting from backend ,

export const getEvents = async (req, res) => {
  try {
    const { limit, page, sort ,searchQuery } = req.query;

    let sortValue;
    if (sort === 'asc') sortValue = 1;
    if (sort === 'desc') sortValue = -1;
const filter = {} ;
if(searchQuery) filter.$text = {$search : searchQuery}
    const events = await Event.find(filter)
      .sort({ 'schedule.startDate': sortValue || 1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    const totalEventDocument = await Event.countDocuments();
 
    res.json({
      totalEvents: totalEventDocument,
      length: events.length,
      data: events,
    });
  } catch (error) {
    res.send(error.message)
  }
};





export const getEventsById = async (req, res) => {
  try {
    const { id } = req.params

  
    const events = await Event.findById(id)
     
    if(!events){
      return res.status(404).json({
        message : "No event found"
      })
    }
 
    res.json({
      message : "fetched successfully",
     success : true ,
      data: events,
    });
  } catch (error) {
    res.send(error.message)
  }
};


//delete event and update event