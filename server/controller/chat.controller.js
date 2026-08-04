import mongoose from 'mongoose';
import Event from '../models/event.model.js';
import Ticket from '../models/ticket.model.js';
import User from '../models/user.model.js';
import ChatMessage from '../models/chatMessage.model.js';
import { textToEmbeddings, streamAnswer, generateAnswer } from '../config/gemini.js';

const EVENT_PROJECTION = {
  title: 1,
  description: 1,
  category: 1,
  status: 1,
  schedule: 1,
  location: 1,
  options: 1,
  ticketsSold: 1,
  organizer: 1,
};

const SYSTEM_PROMPTS = {
  attendee: `You are Nexus Concierge, a friendly assistant for people discovering and attending events on Nexus.
You can only see PUBLIC, APPROVED events (given to you as context below) -- never claim knowledge of anything else.
Help with: finding events, logistics (dates, location, price, capacity), how to register, and recommendations.
If context has no relevant events, say so plainly and suggest the person browse Discover. Be concise and warm.`,
  organizer: `You are Nexus Copilot, an assistant for an event organizer managing their own events on Nexus.
The context below contains ONLY this organizer's own events (any status: draft/pending/approved/rejected) and, when relevant, live stats about them.
Help with: understanding their event performance, RSVP/ticket questions, and suggestions to improve turnout. Never imply you can see other organizers' events.
When numeric stats are provided in context, state them exactly -- do not estimate or invent numbers.`,
  admin: `You are the Nexus Admin Assistant, helping a platform administrator moderate and understand the whole platform.
The context below may include events across all organizers/statuses and platform-wide stats.
Help with: moderation triage (what's pending review), platform health questions, and finding specific events or trends.
When numeric stats are provided in context, state them exactly -- do not estimate or invent numbers.`,
};

const formatEventForContext = (e) => {
  const loc =
    e.location?.type === 'online' ? 'Online' : e.location?.address || e.location?.city || 'Physical (address n/a)';
  return `- "${e.title}" [${e.status}] category=${e.category} | ${new Date(e.schedule?.startDate).toDateString()} | ${loc} | price=${e.options?.ticketPrice ? `$${e.options.ticketPrice}` : 'free'} | ticketsSold=${e.ticketsSold ?? 0}${e.options?.capacity ? `/${e.options.capacity}` : ''}\n  ${(e.description || '').slice(0, 220)}`;
};

const ANALYTICS_KEYWORDS = /revenue|earn|sold|sales|attendee|rsvp|how many|stats|statistic|performance|checked.?in/i;

const retrieveEvents = async (role, userId, question) => {
  const roleFilter =
    role === 'organizer'
      ? { organizer: new mongoose.Types.ObjectId(userId) }
      : role === 'admin'
        ? {}
        : { status: 'approved', visibility: 'Public' };

  const queryVector = await textToEmbeddings(question);

  if (queryVector) {
    try {
      const results = await Event.aggregate([
        {
          $vectorSearch: {
            index: 'event_vector_index',
            path: 'embedding',
            queryVector,
            numCandidates: 100,
            limit: 6,
            filter: roleFilter,
          },
        },
        { $project: EVENT_PROJECTION },
      ]);
      if (results.length) return results;
    } catch (error) {
      console.log('vectorSearch unavailable, falling back to text search:', error.message);
    }
  }

  
  const words = question.split(/\s+/).filter((w) => w.length > 2).slice(0, 6);
  const textFilter = { ...roleFilter };
  if (words.length) textFilter.$text = { $search: words.join(' ') };

  let results = await Event.find(textFilter, EVENT_PROJECTION).limit(6).lean();
  if (!results.length) {
 
    results = await Event.find(roleFilter, EVENT_PROJECTION).sort({ createdAt: -1 }).limit(6).lean();
  }
  return results;
};

const buildAnalyticsContext = async (role, userId, question) => {
  if (!ANALYTICS_KEYWORDS.test(question)) return '';

  const eventFilter = role === 'admin' ? {} : { organizer: new mongoose.Types.ObjectId(userId) };
  if (role === 'attendee') return '';

  const eventIds = await Event.find(eventFilter).distinct('_id');
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

  let extra = `\n\nLIVE STATS (ground truth, use these exact numbers):\n- Total confirmed attendees: ${ticketStats?.totalAttendees || 0}\n- Total revenue collected: $${(ticketStats?.totalRevenue || 0).toFixed(2)}\n- Checked in so far: ${ticketStats?.checkedIn || 0}`;

  if (role === 'admin') {
    const totalUsers = await User.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    extra += `\n- Total platform users: ${totalUsers}\n- Events awaiting moderation: ${pendingEvents}`;
  }

  return extra;
};

const getRole = (user) => (['organizer', 'admin'].includes(user.role) ? user.role : 'attendee');

const getHistory = async (userId) => {
  const recent = await ChatMessage.find({ user: userId }).sort({ createdAt: -1 }).limit(10).lean();
  return recent.reverse().map((m) => ({ role: m.role, content: m.content }));
};

// Non-streaming JSON response (used by clients that can't consume SSE).
export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required' });

    const role = getRole(req.user);
    const events = await retrieveEvents(role, req.user.id, message);
    const analyticsContext = await buildAnalyticsContext(role, req.user.id, message);
    const contextBlock = events.map(formatEventForContext).join('\n') + analyticsContext;
    const history = await getHistory(req.user.id);

    const systemPrompt = `${SYSTEM_PROMPTS[role]}\n\nCONTEXT:\n${contextBlock || 'No matching events found.'}`;

    const answer = await generateAnswer({ systemPrompt, history, question: message });

    await ChatMessage.create([
      { user: req.user.id, role: 'user', content: message },
      { user: req.user.id, role: 'assistant', content: answer, sourceEventIds: events.map((e) => e._id) },
    ]);

    res.json({ data: { answer, role, sources: events.map((e) => ({ id: e._id, title: e.title })) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SSE streaming endpoint -- consumed via fetch()+ReadableStream on the client
// (not native EventSource, since we need a POST body for the question).
export const chatStream = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'message is required' });

    const role = getRole(req.user);
    const events = await retrieveEvents(role, req.user.id, message);
    const analyticsContext = await buildAnalyticsContext(role, req.user.id, message);
    const contextBlock = events.map(formatEventForContext).join('\n') + analyticsContext;
    const history = await getHistory(req.user.id);

    const systemPrompt = `${SYSTEM_PROMPTS[role]}\n\nCONTEXT:\n${contextBlock || 'No matching events found.'}`;

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.flushHeaders?.();

    res.write(`event: sources\ndata: ${JSON.stringify(events.map((e) => ({ id: e._id, title: e.title })))}\n\n`);

    const fullText = await streamAnswer({ systemPrompt, history, question: message }, (chunk) => {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    });

    await ChatMessage.create([
      { user: req.user.id, role: 'user', content: message },
      { user: req.user.id, role: 'assistant', content: fullText, sourceEventIds: events.map((e) => e._id) },
    ]);

    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (error) {
    console.log('chatStream error:', error.message);
    try {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } catch (e) {
      // response already closed
    }
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user.id }).sort({ createdAt: 1 }).limit(50);
    res.json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user.id });
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
