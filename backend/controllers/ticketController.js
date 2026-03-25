const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');

// Helper to get mongo user
const getMongoUser = async (clerkId) => {
    if (!clerkId) return null;
    return await User.findOne({ user_id: clerkId });
};

// Generate a secure unique QR code hash
const generateQRCode = (userId, eventId, seatId) => {
    const data = `${userId}-${eventId}-${seatId}-${Date.now()}-${Math.random()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

// @desc    Checkout and generate Ticket from a Reservation
// @route   POST /api/tickets/checkout
// @access  Private
const checkoutReservation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { reservation_id, payment_method } = req.body;
    if (!reservation_id || !payment_method) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Missing reservation_id or payment_method' });
    }

    const mongoUser = await getMongoUser(req.auth?.userId);
    if (!mongoUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Validate the Reservation
    const reservation = await Reservation.findById(reservation_id).session(session);
    if (!reservation) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (!reservation.user_id.equals(mongoUser._id)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ success: false, message: 'Not your reservation' });
    }

    if (reservation.status !== 'Active') {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: `Reservation is already ${reservation.status}` });
    }

    const now = new Date();
    if (reservation.expires_at < now) {
        // Automatically mark as expired
        reservation.status = 'Expired';
        await reservation.save({ session });
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Reservation has expired. Please select the seat again.' });
    }

    // 2. Validate the Seat is still legally locked by THIS reservation
    const seat = await Seat.findById(reservation.seat_id).session(session);
    if (!seat || seat.status !== 'reserved' || seat.reserved_until < now) {
        // Edge case: manual DB override or severe race condition
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Seat is no longer reserved for you' });
    }

    // 3. Simulate Payment Processing (MVP)
    // For now, we simulate a successful 0-cost mobile money / card transaction
    const payment = new Payment({
        user_id: mongoUser._id,
        event_id: reservation.event_id,
        amount: 0, // In reality, fetch from Event/Section
        currency: 'XAF',
        status: 'Success',
        payment_method: payment_method,
        transaction_id: `TXN_${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    });
    await payment.save({ session });

    // 4. Generate the Ticket
    const ticket = new Ticket({
        event_id: reservation.event_id,
        attendee_id: mongoUser._id,
        seat_id: seat._id,
        qr_code: generateQRCode(mongoUser._id.toString(), reservation.event_id.toString(), seat._id.toString()),
        status: 'Active'
    });
    const savedTicket = await ticket.save({ session });

    // 5. Finalize State Updates
    // Mark Reservation as Completed
    reservation.status = 'Completed';
    await reservation.save({ session });

    // Mark Seat as permanently Booked and attach Ticket ID
    seat.status = 'booked';
    seat.current_ticket_id = savedTicket._id;
    await seat.save({ session });

    // (Optional Increment Event Sold Count)
    const event = await Event.findById(reservation.event_id).session(session);
    if (event && event.ticket_categories.length > 0) {
        // Increment the first category's sold count as a placeholder
        event.ticket_categories[0].sold += 1;
        await event.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
        success: true, 
        message: 'Checkout successful! Ticket generated.', 
        ticket: savedTicket,
        payment: payment
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in checkoutReservation:", error);
    res.status(500).json({ success: false, message: 'Server Error during checkout', error: error.message });
  }
};

// @desc    Get my purchased tickets
// @route   GET /api/tickets/me
// @access  Private
const getMyTickets = async (req, res) => {
  try {
     const mongoUser = await getMongoUser(req.auth?.userId);
     if (!mongoUser) return res.status(401).json({ success: false, message: 'Unauthorized' });

     const tickets = await Ticket.find({ attendee_id: mongoUser._id })
     .populate('event_id', 'title date location venue_id imageUrl')
     .populate({
         path: 'seat_id',
         select: 'number section_id',
         populate: {
             path: 'section_id',
             select: 'name venue_id'
         }
     })
     .sort({ createdAt: -1 });

     res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (error) {
     console.error("Error in getMyTickets:", error);
     res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = { checkoutReservation, getMyTickets };
