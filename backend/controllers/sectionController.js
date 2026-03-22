const User = require('../models/User');
const Venue = require('../models/Venue');
const Section = require('../models/Section');
const Seat = require('../models/Seat');
const mongoose = require('mongoose');

// Helper function to get MongoDB User from Clerk auth and verify Admin role
const getAdminUser = async (clerkUserId) => {
  if (!clerkUserId) return null;
  const user = await User.findOne({ user_id: clerkUserId });
  return user?.role === 'Admin' ? user : null;
};

// @desc    Add a new section
// @route   POST /api/sections/add
const addSection = async (req, res) => {
  try {
    const { name, description, venue_id, parent_section_id } = req.body;

    if (!name || !venue_id) {
      return res.status(400).json({ success: false, message: "Missing required fields: name, venue_id" });
    }

    if (!mongoose.Types.ObjectId.isValid(venue_id)) {
      return res.status(400).json({ success: false, message: 'Invalid venue_id format' });
    }

    const adminUser = await getAdminUser(req.auth?.userId);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    // 🔥 SECURITY: Confirm that the venue exists AND belongs to this admin
    const venue = await Venue.findById(venue_id);
    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found" });
    }
    
    if (!venue.admin_id.equals(adminUser._id)) {
        return res.status(403).json({ success: false, message: "Not your venue: Ownership required" });
    }

    // 🔥 PREVENT DUPLICATION: Check if section name already exists in this venue
    const existing = await Section.findOne({
        name: name.trim(),
        venue_id
    });
    if (existing) {
        return res.status(400).json({ success: false, message: "Section already exists in this venue" });
    }
    
    // 🔥 CONSISTENCY: check if parent section exists and belongs to the same venue
    if (parent_section_id) {
      if (!mongoose.Types.ObjectId.isValid(parent_section_id)) {
        return res.status(400).json({ success: false, message: 'Invalid parent_section_id format' });
      }
      const parent = await Section.findById(parent_section_id);
      if (!parent) return res.status(404).json({ success: false, message: "Parent Section not found" });
      
      if (!parent.venue_id.equals(venue_id)) {
        return res.status(400).json({ success: false, message: "Parent must be in the same venue" });
      }
    }

    const newSection = new Section({
      name,
      description,
      venue_id,
      parent_section_id: parent_section_id || null
    });

    const savedSection = await newSection.save();
    return res.status(201).json({ success: true, section: savedSection });
  } catch (error) {
    console.error("Error in addSection:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get sections
// @route   GET /api/sections
const getSections = async (req, res) => {
  try {
    const query = {};
    if (req.query.venue_id) {
       if (mongoose.Types.ObjectId.isValid(req.query.venue_id)) {
          query.venue_id = req.query.venue_id;
       }
    }
    if (req.query.parent_section_id) {
       query.parent_section_id = req.query.parent_section_id;
    }

    const sections = await Section.find(query).populate('venue_id', 'name location');
    
    res.status(200).json({ success: true, count: sections.length, sections });
  } catch (error) {
    console.error("Error in getSections:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get section by ID
// @route   GET /api/sections/:id
const getSectionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid section ID' });
    }

    const section = await Section.findById(req.params.id).populate('venue_id', 'name');
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    res.status(200).json({ success: true, section });
  } catch (error) {
    console.error("Error in getSectionById:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
const updateSection = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid section ID' });
    }

    const adminUser = await getAdminUser(req.auth?.userId);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    // Find the section first to check ownership of the venue
    const section = await Section.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const venue = await Venue.findById(section.venue_id);
    if (!venue || !venue.admin_id.equals(adminUser._id)) {
        return res.status(403).json({ success: false, message: "Forbidden: You don't own this venue" });
    }

    // 🔥 SECURITY: Restricted updates to prevent moving sections between venues
    const allowedUpdates = ["name", "description"];
    const updates = {};
    for (let key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedSection = await Section.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    res.status(200).json({ success: true, section: updatedSection });
  } catch (error) {
    console.error("Error in updateSection:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Helper function for recursive section deletion (Atomic Tree Delete)
const deleteSectionRecursive = async (sectionId, session) => {
  // 1. Find all sub-sections
  const subSections = await Section.find({ parent_section_id: sectionId }).session(session);
  
  // 2. Recursively delete each sub-section
  for (const sub of subSections) {
    await deleteSectionRecursive(sub._id, session);
  }
  
  // 3. Delete all seats associated with THIS specific section
  await Seat.deleteMany({ section_id: sectionId }).session(session);
  
  // 4. Finally, delete the section itself
  await Section.findByIdAndDelete(sectionId).session(session);
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
const deleteSection = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Invalid section ID' });
    }

    const adminUser = await getAdminUser(req.auth?.userId);
    if (!adminUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }

    // Check ownership before deleting
    const section = await Section.findById(req.params.id).session(session);
    if (!section) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const venue = await Venue.findById(section.venue_id).session(session);
    if (!venue || !venue.admin_id.equals(adminUser._id)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ success: false, message: "Forbidden: You don't own this venue" });
    }

    // 🔥 CASCADE DELETE: Recursive tree delete (Sections + Seats) with transaction
    await deleteSectionRecursive(req.params.id, session);
    
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: 'Section and all its sub-elements deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in deleteSection:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = { addSection, getSections, getSectionById, updateSection, deleteSection };
