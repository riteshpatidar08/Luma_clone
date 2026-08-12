import Event from '../models/event.model.js';
import Ticket from '../models/ticket.model.js';
import cloudinary from '../config/cloudinary.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';
import { textToEmbeddings } from '../config/gemini.js';
import { signToken } from '../utils/jwt.js';
import EventService from '../services/events.service.js';
import { encodeCursor, decodeCursor } from '../utils/cursor.js';
const buildEmbeddingText = (e) =>
  `${e.title}\n${e.category}\n${e.description}\nPrice: ${e.options?.ticketPrice ?? 0}\nStatus: ${e.status}\nStart: ${e.schedule?.startDate}\nLocation: ${e.location?.type === 'physical' ? e.location?.address : 'Online'}`;

// Fire-and-forget embedding refresh; never blocks/breaks the caller.
const refreshEmbedding = async (event) => {
  try {
    const vectors = await textToEmbeddings(buildEmbeddingText(event));
    if (vectors) {
      await Event.updateOne({ _id: event._id }, { embedding: vectors });
    }
  } catch (error) {
    console.log('refreshEmbedding failed:', error.message);
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      visibility,
      calender,
      category,
      startDate,
      endDate,
      timeZone,
      location,
      address,
      placeId,
      city,
      country,
      lat,
      lng,
      meetingLink,
      options,
    } = req.body;

    if (!title || !description || !startDate || !location) {
      return res.status(400).json({ error: 'title, description, startDate and location are required' });
    }

    let bannerUrl;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'event_managment',
      });
      bannerUrl = result.secure_url;
    }

    let parsedOptions = {};
    if (options) {
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid options payload' });
      }
    }

    const eventData = {
      title,
      description,
      visibility: visibility || 'Public',
      calender: calender || category || 'personal',
      category: category || calender || 'personal',
      bannerUrl,
      schedule: {
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        timeZone: timeZone || 'UTC',
      },
      location: {
        type: location,
        meetingLink: location === 'online' ? meetingLink : undefined,
        address: location === 'physical' ? address : undefined,
        placeId: location === 'physical' ? placeId : undefined,
        city: location === 'physical' ? city : undefined,
        country: location === 'physical' ? country : undefined,
        coordinates:
          location === 'physical' && lat && lng
            ? { type: 'Point', coordinates: [Number(lng), Number(lat)] }
            : undefined,
      },
      options: {
        ticketPrice: Number(parsedOptions.ticketPrice) || 0,
        currency: parsedOptions.currency || 'usd',
        requireApproval: Boolean(parsedOptions.requireApproval),
        capacity: parsedOptions.capacity ? Number(parsedOptions.capacity) : undefined,
      },
      organizer: req.user.id,
    };

    const event = await Event.create(eventData);

    // Anyone can host on Nexus -- first event auto-upgrades an attendee to
    // organizer. The JWT carries the role as a claim, so a stale token would
    // still read 'attendee' after this write -- reissue it whenever the role
    // actually changes so the client's very next request is authorized.
    let reissuedToken;
    if (req.user.role === 'attendee') {
      const upgradedUser = await User.findByIdAndUpdate(req.user.id, { role: 'organizer' }, { returnDocument: 'after' });
      reissuedToken = signToken(upgradedUser);
    }

    refreshEmbedding(event);

    res.status(201).json({ message: 'success', data: event, token: reissuedToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'No event found' });

    const isOwner = event.organizer.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You cannot edit this event' });
    }

    const {
      title,
      description,
      visibility,
      calender,
      category,
      startDate,
      endDate,
      timeZone,
      location,
      address,
      placeId,
      city,
      country,
      lat,
      lng,
      meetingLink,
      options,
    } = req.body;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'event_managment',
      });
      event.bannerUrl = result.secure_url;
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (visibility !== undefined) event.visibility = visibility;
    if (calender !== undefined) event.calender = calender;
    if (category !== undefined) event.category = category;
    if (startDate !== undefined) event.schedule.startDate = new Date(startDate);
    if (endDate !== undefined) event.schedule.endDate = endDate ? new Date(endDate) : undefined;
    if (timeZone !== undefined) event.schedule.timeZone = timeZone;

    if (location !== undefined) {
      event.location.type = location;
      if (location === 'online') {
        event.location.meetingLink = meetingLink;
        event.location.address = undefined;
        event.location.coordinates = undefined;
      } else {
        event.location.address = address;
        event.location.placeId = placeId;
        event.location.city = city;
        event.location.country = country;
        event.location.meetingLink = undefined;
        if (lat && lng) {
          event.location.coordinates = { type: 'Point', coordinates: [Number(lng), Number(lat)] };
        }
      }
    }

    if (options) {
      const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      event.options = {
        ticketPrice: Number(parsedOptions.ticketPrice) || 0,
        currency: parsedOptions.currency || event.options.currency || 'usd',
        requireApproval: Boolean(parsedOptions.requireApproval),
        capacity: parsedOptions.capacity ? Number(parsedOptions.capacity) : undefined,
      };
    }

    // Substantive edits should go back through moderation.
    if (req.user.role !== 'admin') {
      event.status = 'pending';
    }

    await event.save();
    refreshEmbedding(event);

    res.json({ message: 'Event updated', data: event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { limit = 12, page, sort, searchQuery, category, location, cursor } = req.query;
    const numLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const sortValue = sort === 'desc' ? -1 : 1;

    const filter = { status: 'approved', visibility: 'Public' };
    if (searchQuery) filter.$text = { $search: searchQuery };
    if (category && category !== 'all') filter.category = category;
    if (location && location !== 'all') filter['location.type'] = location;

    const sortQuery = {
      'schedule.startDate': sortValue,
      _id: sortValue,
    };

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (decoded) {
        const cursorDate = new Date(decoded.d);
        if (sortValue === 1) {
          filter.$or = [
            { 'schedule.startDate': { $gt: cursorDate } },
            { 'schedule.startDate': cursorDate, _id: { $gt: decoded.id } },
          ];
        } else {
          filter.$or = [
            { 'schedule.startDate': { $lt: cursorDate } },
            { 'schedule.startDate': cursorDate, _id: { $lt: decoded.id } },
          ];
        }
      }
    }

    let eventsQuery = Event.find(filter);

    if (!cursor && page && Number(page) > 1) {
      eventsQuery = eventsQuery.skip((Number(page) - 1) * numLimit);
    }

    const events = await eventsQuery
      .sort(sortQuery)
      .limit(numLimit + 1)
      .populate('organizer', 'name avatarUrl');

    const hasNextPage = events.length > numLimit;
    if (hasNextPage) {
      events.pop();
    }

    const lastEvent = events.length > 0 ? events[events.length - 1] : null;
    const nextCursor = hasNextPage && lastEvent
      ? encodeCursor(lastEvent.schedule.startDate, lastEvent._id)
      : null;

    const totalEvents = await Event.countDocuments({
      status: 'approved',
      visibility: 'Public',
      ...(category && category !== 'all' ? { category } : {}),
      ...(location && location !== 'all' ? { 'location.type': location } : {}),
      ...(searchQuery ? { $text: { $search: searchQuery } } : {}),
    });

    res.json({
      totalEvents,
      length: events.length,
      data: events,
      pagination: {
        nextCursor,
        hasNextPage,
        limit: numLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Location-based discovery feed, mirroring Luma's city pages: near-me via
// geolocation coordinates or a city picked from Places Autocomplete -- both
// resolve to the same lat/lng-driven $geoNear query.
export const discoverEvents = async (req, res) => {
  try {
    const { lat, lng, radiusKm = 50, category, page = 1, limit = 12 } = req.query;

    const baseMatch = { status: 'approved', visibility: 'Public' };
    if (category && category !== 'all') baseMatch.category = category;

    let nearbyEvents = [];
    if (lat && lng) {
      nearbyEvents = await Event.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            distanceField: 'distanceMeters',
            maxDistance: Number(radiusKm) * 1000,
            spherical: true,
            query: { ...baseMatch, 'location.type': 'physical' },
          },
        },
        { $sort: { distanceMeters: 1 } },
        { $skip: (Number(page) - 1) * Number(limit) },
        { $limit: Number(limit) },
        { $project: { embedding: 0 } },
      ]);
      await Event.populate(nearbyEvents, { path: 'organizer', select: 'name avatarUrl' });
    }

    const onlineEvents = await Event.find({ ...baseMatch, 'location.type': 'online' })
      .sort({ 'schedule.startDate': 1 })
      .limit(Number(limit))
      .populate('organizer', 'name avatarUrl');

    res.json({
      nearby: nearbyEvents.map((e) => ({ ...e, distanceKm: e.distanceMeters ? e.distanceMeters / 1000 : undefined })),
      online: onlineEvents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventsById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await EventService.getSingleEvent(id);
    if (!event) {
      return res.status(404).json({ message: 'No event found' });
    }
    res.json({ message: 'fetched successfully', success: true, data: event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'No event found' });

    const isOwner = event.organizer.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You cannot delete this event' });
    }

    await Ticket.deleteMany({ event: id });
    await event.deleteOne();

    res.status(200).json({ message: 'Deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'No event found' });

    event.status = status;
    await event.save();

    await Notification.create({
      user: event.organizer,
      type: status === 'approved' ? 'event_approved' : 'event_rejected',
      title: status === 'approved' ? 'Your event was approved' : 'Your event was rejected',
      message: `"${event.title}" was ${status} by an admin.`,
      link: `/eventdetails/${event._id}`,
    });

    res.status(200).json({ message: 'Status updated successfully', data: event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// db.places.aggregate([
//   {
//   $geoNear: {
//   near: { type: "Point", coordinates: [-73.98, 40.76] },
//   distanceField: "dist.calculated",
//   maxDistance: 2000, // Distance in meters
//   query: { category: "Parks" },
//   includeLocs: "dist.location",
//   spherical: true
//   }
//   }
//   ]);