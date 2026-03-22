const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

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
    const { title, description, date, venue_id, artist_lineup, ticket_categories, status } = req.body;

    // Explicit Validation Check
    if (!title || !date) {
      return res.status(400).json({ success: false, message: "Missing required fields: title, date" });
    }

    const adminUser = await getAdminUser(req);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    // Optional Check: Confirm venue exists
    if (venue_id) {
      const venue = await Venue.findById(venue_id);
      if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      venue_id,
      status: status || 'Upcoming',
      artist_lineup: artist_lineup || [],
      ticket_categories: ticket_categories || [],
      admin_id: adminUser._id
    });

    const savedEvent = await newEvent.save();
    return res.status(201).json({ success: true, event: savedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const query = {};
    if (req.query.venue_id) query.venue_id = req.query.venue_id;
    if (req.query.status) query.status = req.query.status;

    const events = await Event.find(query)
      .populate('venue_id', 'name location capacity')
      .populate('admin_id', 'name email');
      
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('venue_id', 'name location capacity')
      .populate('admin_id', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Edit an existing event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
const updateEvent = async (req, res) => {
  try {
    const adminUser = await getAdminUser(req);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedEvent) return res.status(404).json({ success: false, message: 'Event not found' });
    
    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
const deleteEvent = async (req, res) => {
  try {
    const adminUser = await getAdminUser(req);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) return res.status(404).json({ success: false, message: 'Event not found' });

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = { addEvent, getEvents, getEventById, updateEvent, deleteEvent };
