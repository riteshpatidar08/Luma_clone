import Event from '../models/event.model.js';
import Ticket from '../models/ticket.model.js';
import User from '../models/user.model.js';

export const getPlatformStats = async (req, res) => {
  try {
    const now = new Date();

    const [userStats] = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          attendees: { $sum: { $cond: [{ $eq: ['$role', 'attendee'] }, 1, 0] } },
          organizers: { $sum: { $cond: [{ $eq: ['$role', 'organizer'] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        },
      },
    ]);

    const [eventStats] = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          upcoming: {
            $sum: { $cond: [{ $and: [{ $eq: ['$status', 'approved'] }, { $gte: ['$schedule.startDate', now] }] }, 1, 0] },
          },
        },
      },
    ]);

    const [revenueStats] = await Ticket.aggregate([
      { $match: { 'payment.isPaid': true } },
      { $group: { _id: null, totalRevenue: { $sum: '$payment.amountPaid' }, paidTickets: { $sum: 1 } } },
    ]);

    const eventsByCategory = await Event.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

    const revenueByMonth = await Ticket.aggregate([
      { $match: { 'payment.isPaid': true } },
      {
        $group: {
          _id: { year: { $year: '$payment.paidAt' }, month: { $month: '$payment.paidAt' } },
          revenue: { $sum: '$payment.amountPaid' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({
      data: {
        totalUsers: userStats?.totalUsers || 0,
        attendees: userStats?.attendees || 0,
        organizers: userStats?.organizers || 0,
        admins: userStats?.admins || 0,
        totalEvents: eventStats?.totalEvents || 0,
        approved: eventStats?.approved || 0,
        pending: eventStats?.pending || 0,
        rejected: eventStats?.rejected || 0,
        upcoming: eventStats?.upcoming || 0,
        totalRevenue: revenueStats?.totalRevenue || 0,
        paidTickets: revenueStats?.paidTickets || 0,
        eventsByCategory,
        revenueByMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listAllEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, searchQuery } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (searchQuery) filter.$text = { $search: searchQuery };

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('organizer', 'name email avatarUrl');
    const total = await Event.countDocuments(filter);

    res.json({ data: events, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
