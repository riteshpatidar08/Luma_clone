import User from '../models/user.model.js';
import Event from '../models/event.model.js';

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, bio, phone, avatarUrl, organizerProfile } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (phone !== undefined) update.phone = phone;
    if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
    if (organizerProfile !== undefined) update.organizerProfile = organizerProfile;

    const user = await User.findByIdAndUpdate(req.user.id, update, { returnDocument: 'after' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleSaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const user = await User.findById(req.user.id);
    const alreadySaved = user.savedEvents.some((id) => id.toString() === eventId);

    if (alreadySaved) {
      user.savedEvents = user.savedEvents.filter((id) => id.toString() !== eventId);
    } else {
      user.savedEvents.push(eventId);
    }
    await user.save();

    res.json({ message: alreadySaved ? 'Event removed from saved' : 'Event saved', saved: !alreadySaved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSavedEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedEvents',
      populate: { path: 'organizer', select: 'name avatarUrl' },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user.savedEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- Admin-only user management ----

export const listUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await User.countDocuments(filter);

    res.json({ data: users, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['attendee', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You can't change your own role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You can't deactivate your own account" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: user.isActive ? 'User activated' : 'User deactivated', data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You can't delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
