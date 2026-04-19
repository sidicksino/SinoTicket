const User = require('../models/User');
const Section = require('../models/Section');
const Venue = require('../models/Venue');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const Ticket = require('../models/Ticket');
const mongoose = require('mongoose');

const { clerkClient } = require('@clerk/express');

// Helper
const getAdminUser = async (clerkUserId) => {
  if (!clerkUserId) return null;
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const role = clerkUser.publicMetadata?.role;
    if (role !== 'Admin' && role !== 'admin') return null;
    const user = await User.findOne({ user_id: clerkUserId });
    return user;
  } catch {
    return null;
  }
};

// @desc    Generate massive seats for a section
// @route   POST /api/seats/generate
// @access  Private (Admin)
const generateSeats = async (req, res) => {
  try {
    const { section_id, start_number, count } = req.body;

    if (!section_id || typeof start_number !== 'number' || typeof count !== 'number') {
      return res.status(400).json({ success: false, message: 'Missing or invalid fields (section_id, start_number, count)' });
    }

    if (!mongoose.Types.ObjectId.isValid(section_id)) {
      return res.status(400).json({ success: false, message: 'Invalid section_id' });
    }

    if (count > 50000) {
      return res.status(400).json({ success: false, message: 'Cannot generate more than 50,000 seats at once' });
    }

    const adminUser = await getAdminUser(req.auth?.userId);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    // Verify section and venue ownership
    const section = await Section.findById(section_id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const venue = await Venue.findById(section.venue_id);
    if (!venue || !venue.admin_id.equals(adminUser._id)) {
      return res.status(403).json({ success: false, message: "Forbidden: You don't own the venue of this section" });
    }

    // Generate seats array in memory
    const seatsToInsert = [];
    for (let i = 0; i < count; i++) {
      seatsToInsert.push({
        section_id,
        number: start_number + i,
        status: 'available'
      });
    }

    // Insert massively
    // Use ordered: false so if some seats already exist (duplicate number index), it inserts the rest without failing totally
    const result = await Seat.insertMany(seatsToInsert, { ordered: false });

    res.status(201).json({ success: true, message: `${result.length} seats generated`, generated_count: result.length });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error from inserting existing seat numbers
      return res.status(400).json({ 
        success: false, 
        message: 'Some or all seat numbers already exist in this section. Unique inserts were applied.', 
        inserted: error.insertedDocs ? error.insertedDocs.length : 0 
      });
    }
    console.error("Error generating seats:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get seats with pagination and filters
// @route   GET /api/seats
const getSeats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // default larger for seats
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.section_id) {
       if (mongoose.Types.ObjectId.isValid(req.query.section_id)) {
           query.section_id = req.query.section_id;
       } else {
           return res.status(200).json({ success: true, total: 0, page, limit, seats: [] });
       }
    }
    const total = await Seat.countDocuments(query);
    const seats = await Seat.find(query)
      .sort({ number: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // DYNAMIC STATUS MAPPING
    const event_id = req.query.event_id;
    if (event_id && mongoose.Types.ObjectId.isValid(event_id)) {
        const now = new Date();
        const seatIds = seats.map(s => s._id);

        const activeReservations = await Reservation.find({
            event_id,
            seat_id: { $in: seatIds },
            status: 'Active',
            expires_at: { $gt: now }
        }).lean();

        const tickets = await Ticket.find({
            event_id,
            seat_id: { $in: seatIds }
        }).lean();

        const reservedSeatIds = new Set(activeReservations.map(r => r.seat_id.toString()));
        const bookedSeatIds = new Set(tickets.map(t => t.seat_id.toString()));

        seats.forEach(seat => {
            const sid = seat._id.toString();
            if (bookedSeatIds.has(sid)) {
                seat.status = 'booked';
            } else if (reservedSeatIds.has(sid)) {
                seat.status = 'reserved';
            } else {
                seat.status = 'available';
            }
        });
    } else if (!event_id) {
        // If no event_id is requested, we strongly force available because global DB status is deprecated
        seats.forEach(seat => { seat.status = 'available'; });
    }

    res.status(200).json({ success: true, total, page, limit, seats });
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Update seat status manually (Admin)
// @route   PUT /api/seats/:id
const updateSeat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid seat ID' });
    }

    const { status } = req.body;
    if (!['available', 'reserved', 'booked'].includes(status)) {
       return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const adminUser = await getAdminUser(req.auth?.userId);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    // Validate ownership
    const seat = await Seat.findById(req.params.id).populate('section_id');
    if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });

    const venue = await Venue.findById(seat.section_id.venue_id);
    if (!venue || !venue.admin_id.equals(adminUser._id)) {
        return res.status(403).json({ success: false, message: "Forbidden: You don't own this venue" });
    }

    const updatedSeat = await Seat.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    res.status(200).json({ success: true, seat: updatedSeat });
  } catch (error) {
    console.error("Error updating seat:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a seat (Admin)
// @route   DELETE /api/seats/:id
const deleteSeat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid seat ID' });
    }

    const adminUser = await getAdminUser(req.auth?.userId);
    if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });

    const seat = await Seat.findById(req.params.id).populate('section_id');
    if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });

    const venue = await Venue.findById(seat.section_id.venue_id);
    if (!venue || !venue.admin_id.equals(adminUser._id)) {
        return res.status(403).json({ success: false, message: "Forbidden: You don't own this venue" });
    }

    await Seat.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Seat deleted' });
  } catch (error) {
    console.error("Error deleting seat:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete all seats in a section (Admin)
// @route   DELETE /api/seats/section/:section_id
const clearSectionSeats = async (req, res) => {
    try {
        const { section_id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(section_id)) {
            return res.status(400).json({ success: false, message: 'Invalid section ID' });
        }
        
        const adminUser = await getAdminUser(req.auth?.userId);
        if (!adminUser) return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
        
        const section = await Section.findById(section_id);
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
        
        const venue = await Venue.findById(section.venue_id);
        if (!venue || !venue.admin_id.equals(adminUser._id)) {
            return res.status(403).json({ success: false, message: "Forbidden: You don't own this venue" });
        }
        
        const result = await Seat.deleteMany({ section_id });
        res.status(200).json({ success: true, message: `Cleared ${result.deletedCount} seats` });
    } catch (error) {
        console.error("Error clearing seats:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
}

module.exports = { generateSeats, getSeats, updateSeat, deleteSeat, clearSectionSeats };
