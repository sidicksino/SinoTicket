const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const mongoose = require('mongoose');

// Helper to confirm admin
const getAdminUser = async (req) => {
  if (!req.auth || !req.auth.userId) return null;
  const user = await User.findOne({ user_id: req.auth.userId });
  if (!user || user.role !== 'Admin') return null;
  return user;
};

// @desc    Add a new event
// @route   POST /api/events/add
// @access  Private (Admin only)
const addEvent = async (req, res) => {
  try {
    const { title, description, date, venue_id, artist_lineup, ticket_categories, status, imageUrl, category } = req.body;

    // Explicit Validation Check (More thorough)
    if (!title || !date || !Array.isArray(ticket_categories)) {
      return res.status(400).json({ success: false, message: "Missing or invalid fields" });
    }

    const adminUser = await getAdminUser(req);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    // Optional Check: Confirm venue exists and validate its ID
    if (venue_id) {
      if (!mongoose.Types.ObjectId.isValid(venue_id)) {
        return res.status(400).json({ success: false, message: 'Invalid Venue ID' });
      }
      const venue = await Venue.findById(venue_id);
      if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Security: Prevent manual injection of "sold" count and negative values
    const safeTickets = ticket_categories.map(ticket => {
      if (ticket.quantity < 0 || ticket.price < 0) {
        throw new Error("Invalid ticket data");
      }
      return {
        ...ticket,
        sold: 0 // force reset
      };
    });

    const newEvent = new Event({
      title,
      description,
      date,
      venue_id,
      imageUrl,
      category,
      status: status || 'Upcoming',
      artist_lineup: artist_lineup || [],
      ticket_categories: safeTickets,
      admin_id: adminUser._id
    });

    const savedEvent = await newEvent.save();
    return res.status(201).json({ success: true, event: savedEvent });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Automate status updates for past events
    await Event.updateMany(
      { date: { $lt: new Date() }, status: { $ne: 'Ended' } },
      { $set: { status: 'Ended' } }
    );

    const query = {};
    
    // Default to upcoming events unless specifically asked for 'all' or a specific status
    if (req.query.upcoming === 'true' || (!req.query.status && req.query.all !== 'true')) {
      query.date = { $gte: new Date() };
    }

    if (req.query.venue_id) query.venue_id = req.query.venue_id;
    if (req.query.status) query.status = req.query.status;
    if (req.query.category && req.query.category !== 'All') query.category = req.query.category;
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .populate('venue_id', 'name location capacity')
      .populate('admin_id', 'name email');

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      events
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, events: [], message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const event = await Event.findById(req.params.id)
      .populate('venue_id', 'name location capacity')
      .populate('admin_id', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Refresh status if date passed
    if (new Date(event.date) < new Date() && event.status !== 'Ended') {
      event.status = 'Ended';
      await event.save();
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Edit an existing event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
const updateEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const adminUser = await getAdminUser(req);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    const allowedUpdates = [
      "title",
      "description",
      "date",
      "venue_id",
      "status",
      "artist_lineup",
      "ticket_categories",
      "imageUrl",
      "category"
    ];

    const updates = {};
    for (let key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedEvent) return res.status(404).json({ success: false, message: 'Event not found' });

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
const deleteEvent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const adminUser = await getAdminUser(req);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ success: false, message: 'Event not found' });

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = { addEvent, getEvents, getEventById, updateEvent, deleteEvent };
