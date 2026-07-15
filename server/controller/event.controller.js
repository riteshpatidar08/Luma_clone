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
        startDatea: new Date(startDate),
        endDate: new Date(endDate),
      },
    };
    console.log(EventData);
    // await Event.create();
  } catch (error) {}
};
