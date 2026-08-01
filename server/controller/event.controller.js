import Event from '../models/event.model.js';
import cloudinary from '../config/cloudinary.js';
import User from '../models/user.model.js';

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
      address,
      meetingLink,
      ticketPrice,
      requireApproval,
      capacity,
      options,
    } = req.body;
    console.log(req.body);

    let result = { secure_url: '' };
    if (req.file) {
      console.log(req.file.path);
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'event_managment',
      });
    }

    let parsedOptions = {};
    if (options) {
      try {
        parsedOptions =
          typeof options === 'string' ? JSON.parse(options) : options;
      } catch (e) {
        console.error('Error parsing options:', e);
      }
    } else {
      parsedOptions = {
        ticketPrice:
          ticketPrice !== undefined && ticketPrice !== ''
            ? Number(ticketPrice)
            : 0,
        requireApproval: requireApproval === 'true' || requireApproval === true,
        capacity:
          capacity !== undefined && capacity !== '' && capacity !== 'unlimited'
            ? Number(capacity)
            : undefined,
      };
    }

    const EventData = {
      title,
      description,
      visibility,
      calender: calender || 'personal',
      bannerUrl: result.secure_url,
      schedule: {
        startDate: new Date(startDate),
        endData: endDate ? new Date(endDate) : undefined,
      },
      location,
      address,
      meetingLink,
      options: parsedOptions,
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
    const { limit, page, sort, searchQuery } = req.query;
    console.log(searchQuery);
    let sortValue;
    if (sort === 'asc') sortValue = 1;
    if (sort === 'desc') sortValue = -1;
    const filter = { status: 'approved' };
    if (searchQuery) filter.$text = { $search: searchQuery };
    const events = await Event.find(filter)
      .sort({ 'schedule.startDate': sortValue || 1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .populate('organizer', 'email');
    const totalEventDocument = await Event.countDocuments();

    res.json({
      totalEvents: totalEventDocument,
      length: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getEventsById = async (req, res) => {
  try {
    const { id } = req.params;

    const events = await Event.findById(id);

    if (!events) {
      return res.status(404).json({
        message: 'No event found',
      });
    }

    res.json({
      message: 'fetched successfully',
      success: true,
      data: events,
    });
  } catch (error) {
    res.send(error.message);
  }
};

//delete event and update event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const events = await Event.findByIdAndDelete(id);

    // if (!events) {
    //   return res.status(404).json({
    //     message: 'No event found',
    //   });
    // }

    res.status(204).json({
      message: 'Delete Successfullu',
      success: true,
      data: events,
    });
  } catch (error) {
    res.send(error.message);
  }
};

export const bookEvent = async (req, res) => {
  try {
    //event ki id  + jo user event book krega uska data
    const { id } = req.params;
    const { email, name } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(400).json({
        message: 'No event found',
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // const passwordHash = await bcrypt.hash(password , 10)
      user = await User.create({ name, email });
      user.roles = 'attendee';
      await user.save();
    }
    console.log(event.attendee);

    if (event.attendee.some((id) => user._id.toString() === id.toString())) {
      return res.status(400).json({
        message: 'Already booked',
      });
    }

    event.attendee.push(user._id);

    await event.save();
    res.status(201).json({
      message: 'event book successfull , use your email to login your account',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: "Status is invalid value must be 'approved  or rejected",
      });
    }
    const event = await Event.findById(id);
    event.status = status;
    await event.save();
    res.status(200).json({
      message: 'status updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllEventsAdmin = async (req, res) => {
  try {
  } catch (error) {}
};

export const getEventStats = async (req, res) => {
  try {
  } catch (error) {}
};

// db.events.aggregate([
//   { $match: { location: 'online' } },
//   { $project: { title: 1, description: 1 } },
//   { $sort: { title: 1 } },
// ]);

// db.events.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
