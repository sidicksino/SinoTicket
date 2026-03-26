const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');

// Helper to get mongo user
const getMongoUser = async (clerkId) => {
    if (!clerkId) return null;
    return await User.findOne({ user_id: clerkId });
};

// @desc    Reserve a seat for 15 minutes
// @route   POST /api/reservations/reserve
// @access  Private
const reserveSeat = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { event_id, seat_id } = req.body;
    if (!event_id || !seat_id) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Missing event_id or seat_id' });
    }

    if (!mongoose.Types.ObjectId.isValid(event_id) || !mongoose.Types.ObjectId.isValid(seat_id)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const mongoUser = await getMongoUser(req.auth?.userId);
    if (!mongoUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Validate Event
    const event = await Event.findById(event_id).session(session);
    if (!event) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // 2. Validate Seat and Locking Status
    const seat = await Seat.findById(seat_id).populate('section_id').session(session);
    if (!seat) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'Seat not found' });
    }
    
    // Lazy Evaluation: If reserved but timer expired, it's legally available.
    const now = new Date();
    
    // Check if the current user already has an active reservation for this seat
    const existingReservation = await Reservation.findOne({
        user_id: mongoUser._id,
        event_id: event._id,
        seat_id: seat._id,
        status: 'Active',
        expires_at: { $gt: now }
    }).session(session);

    const isAvailable = seat.status === 'available' || 
                        (seat.status === 'reserved' && seat.reserved_until && seat.reserved_until < now) ||
                        (existingReservation && seat.status === 'reserved');

    if (!isAvailable) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Seat is currently not available (already booked or reserved)' });
    }

    // Ensure the seat belongs to the exact same venue as the event
    if (!seat.section_id.venue_id.equals(event.venue_id)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Seat does not belong to the Event\'s venue' });
    }

    // 3. Lock the Seat (15 minute reservation timeout)
    const expirationTime = new Date(now.getTime() + 15 * 60000); 
    seat.status = 'reserved';
    seat.reserved_until = expirationTime;
    await seat.save({ session });

    // 4. Create or Update implicit Reservation Document
    let reservation;
    if (existingReservation) {
        existingReservation.expires_at = expirationTime;
        await existingReservation.save({ session });
        reservation = existingReservation;
    } else {
        reservation = new Reservation({
            user_id: mongoUser._id,
            event_id: event._id,
            seat_id: seat._id,
            expires_at: expirationTime,
            status: 'Active'
        });
        await reservation.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, message: 'Seat strictly reserved for 15 minutes', reservation });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in reserveSeat:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Cancel/Release reservations
// @route   POST /api/reservations/cancel
// @access  Private
const cancelReservations = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { reservation_ids } = req.body;
        if (!Array.isArray(reservation_ids) || reservation_ids.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'No reservation_ids provided' });
        }

        const mongoUser = await getMongoUser(req.auth?.userId);
        if (!mongoUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const reservations = await Reservation.find({
            _id: { $in: reservation_ids },
            user_id: mongoUser._id
        }).session(session);

        if (reservations.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'No reservations found to cancel' });
        }

        const seatIds = reservations.map(r => r.seat_id);

        // Update reservations
        await Reservation.updateMany(
            { _id: { $in: reservation_ids } },
            { status: 'Expired' } // Or 'Cancelled' if you add it to enum
        ).session(session);

        // Update seats back to available IF they are still reserved
        await Seat.updateMany(
            { _id: { $in: seatIds }, status: 'reserved' },
            { status: 'available', $unset: { reserved_until: "" } }
        ).session(session);

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ success: true, message: 'Reservations released successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in cancelReservations:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get current user's active/pending reservations (Cart)
// @route   GET /api/reservations/me
// @access  Private
const getMyReservations = async (req, res) => {
  try {
     const mongoUser = await getMongoUser(req.auth?.userId);
     if (!mongoUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

     // Fetch active and non-expired reservations for the checkout frontend
     const now = new Date();
     const reservations = await Reservation.find({
         user_id: mongoUser._id,
         status: 'Active',
         expires_at: { $gt: now }
     })
     .populate('event_id', 'title date venue_id')
     .populate('seat_id', 'number section_id status')
     .sort({ createdAt: -1 });

     res.status(200).json({ success: true, count: reservations.length, reservations });
  } catch (error) {
     console.error("Error in getMyReservations:", error);
     res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = { reserveSeat, cancelReservations, getMyReservations };
