const User = require('../models/User');
const Venue = require('../models/Venue');

// Helper function to get MongoDB User from Clerk auth and verify Admin role
const getAdminUser = async (req) => {
  if (!req.auth || !req.auth.userId) return null;
  const user = await User.findOne({ user_id: req.auth.userId });
  if (!user || user.role !== 'Admin') return null;
  return user;
};

// @desc    Add a new venue
// @route   POST /api/venue/add
// @access  Private (Admin only)
const addVenue = async (req, res) => {
  try {
    const adminUser = await getAdminUser(req);
    if (!adminUser) {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }

    const { name, location, capacity, map_data } = req.body;
    
    // Create venue
    const newVenue = new Venue({
      name,
      location,
      capacity,
      map_data,
      admin_id: adminUser._id
    });

    const savedVenue = await newVenue.save();
    return res.status(201).json({ success: true, venue: savedVenue });
  } catch (error) {
    console.error('Error adding venue:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all venues (or filter by query)
// @route   GET /api/venue/getVenue
// @access  Public
const getVenue = async (req, res) => {
  try {
    const query = {};
    if (req.query.admin_id) query.admin_id = req.query.admin_id;
    if (req.query.id) query._id = req.query.id;

    // We can populate the admin_id to get the admin's details (name, email)
    const venues = await Venue.find(query).populate('admin_id', 'name email');
    return res.status(200).json({ success: true, venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return res.status(500).json({ success: false, venues: [], message: 'Server Error', error: error.message });
  }
};

// @desc    Update a venue
// @route   PUT /api/venue/updateVenue/:id
// @access  Private (Admin only)
const updateVenue = async (req, res) => {
  try {
    const adminUser = await getAdminUser(req);
    if (!adminUser) {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }

    const { id } = req.params;
    const { name, location, capacity, map_data } = req.body;

    const updatedVenue = await Venue.findByIdAndUpdate(
      id,
      { name, location, capacity, map_data },
      { new: true, runValidators: true }
    );

    if (!updatedVenue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    return res.status(200).json({ success: true, venue: updatedVenue });
  } catch (error) {
    console.error('Error updating venue:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a venue
// @route   DELETE /api/venue/deleteVenue/:id
// @access  Private (Admin only)
const deleteVenue = async (req, res) => {
  try {
    const adminUser = await getAdminUser(req);
    if (!adminUser) {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }

    const { id } = req.params;

    const deletedVenue = await Venue.findByIdAndDelete(id);

    if (!deletedVenue) {
      return res.status(404).json({ success: false, message: 'Venue not found' });
    }

    // Optionally: Cascade delete sections and seats belonging to this venue here

    return res.status(200).json({ success: true, message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error deleting venue:', error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  addVenue,
  getVenue,
  updateVenue,
  deleteVenue,
};
