import Event from '../models/event.model.js';
import Ticket from '../models/ticket.model.js';
import mongoose from 'mongoose';

export const getOverview = async (req, res) => {
  try {
    const organizerId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    const [eventStats] = await Event.aggregate([
      { $match: { organizer: organizerId } },
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
          totalTicketsSold: { $sum: '$ticketsSold' },
        },
      },
    ]);

    const eventIds = await Event.find({ organizer: organizerId }).distinct('_id');

    const [ticketStats] = await Ticket.aggregate([
      { $match: { event: { $in: eventIds }, status: { $in: ['valid', 'scanned'] } } },
      {
        $group: {
          _id: null,
          totalAttendees: { $sum: 1 },
          totalRevenue: { $sum: { $cond: ['$payment.isPaid', '$payment.amountPaid', 0] } },
          checkedIn: { $sum: { $cond: [{ $eq: ['$status', 'scanned'] }, 1, 0] } },
        },
      },
    ]);

    const pendingApprovals = await Ticket.countDocuments({ event: { $in: eventIds }, status: 'pending_approval' });

    const recentTickets = await Ticket.find({ event: { $in: eventIds } })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('event', 'title')
      .populate('user', 'name avatarUrl');

    const revenueByMonth = await Ticket.aggregate([
      { $match: { event: { $in: eventIds }, 'payment.isPaid': true } },
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
        totalEvents: eventStats?.totalEvents || 0,
        approved: eventStats?.approved || 0,
        pending: eventStats?.pending || 0,
        rejected: eventStats?.rejected || 0,
        upcoming: eventStats?.upcoming || 0,
        totalAttendees: ticketStats?.totalAttendees || 0,
        totalRevenue: ticketStats?.totalRevenue || 0,
        checkedIn: ticketStats?.checkedIn || 0,
        pendingApprovals,
        recentTickets,
        revenueByMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listMyEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { organizer: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Event.countDocuments(filter);

    res.json({ data: events, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
