const mongoose = require('mongoose');

const { Schema } = mongoose;

/* =========================
   USER
========================= */
const UserSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    profile_photo: {
      type: String,
      default: null,
    },

    phone_number: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ['Attendee', 'Admin'],
      default: 'Attendee',
    },

    preferences: {
      type: Schema.Types.Mixed,
      default: {},
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    last_login: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* =========================
   VENUE
========================= */
const VenueSchema = new Schema(
  {
    name: String,
    location: String,
    capacity: Number,

    admin_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    map_data: Schema.Types.Mixed,
  },
  { timestamps: true }
);

/* =========================
   SECTION
========================= */
const SectionSchema = new Schema(
  {
    venue_id: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
    },

    name: String,
    description: String,

    parent_section_id: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
  },
  { timestamps: true }
);

/* =========================
   SEAT
========================= */
const SeatSchema = new Schema(
  {
    section_id: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
    },

    number: Number,

    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available',
    },

    current_ticket_id: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
  },
  { timestamps: true }
);

/* =========================
   EVENT
========================= */
const EventSchema = new Schema(
  {
    title: String,
    description: String,
    date: Date,

    venue_id: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
    },

    admin_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Ended'],
      default: 'Upcoming',
    },

    artist_lineup: [
      {
        name: String,
        time: String,
      },
    ],

    ticket_categories: [
      {
        category_id: {
          type: Schema.Types.ObjectId,
        },
        name: String,
        price: Number,
        section_id: {
          type: Schema.Types.ObjectId,
          ref: 'Section',
        },
        quantity: Number,
        sold: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

/* =========================
   TICKET
========================= */
const TicketSchema = new Schema(
  {
    event_id: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },

    category_id: {
      type: Schema.Types.ObjectId,
    },

    attendee_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    seat_id: {
      type: Schema.Types.ObjectId,
      ref: 'Seat',
    },

    qr_code: String,

    status: {
      type: String,
      enum: ['Active', 'Used', 'Refunded'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

/* =========================
   PAYMENT
========================= */
const PaymentSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    event_id: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },

    amount: Number,
    currency: String,

    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending',
    },

    payment_method: {
      type: String,
      enum: ['MobileMoney', 'Card'],
    },

    transaction_id: String,
  },
  { timestamps: true }
);

/* =========================
   RESERVATION (ANTI DOUBLE BOOKING)
========================= */
const ReservationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    event_id: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },

    seat_id: {
      type: Schema.Types.ObjectId,
      ref: 'Seat',
    },

    expires_at: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['Active', 'Expired', 'Completed'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

/* 🔥 AUTO DELETE expired reservations */
ReservationSchema.index(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
);

EventSchema.index({ date: 1 });

TicketSchema.index({ attendee_id: 1 });
TicketSchema.index({ event_id: 1 });

SeatSchema.index({ section_id: 1 });

/* =========================
   EXPORTS
========================= */
module.exports = {
  User: mongoose.model('User', UserSchema),
  Venue: mongoose.model('Venue', VenueSchema),
  Section: mongoose.model('Section', SectionSchema),
  Seat: mongoose.model('Seat', SeatSchema),
  Event: mongoose.model('Event', EventSchema),
  Ticket: mongoose.model('Ticket', TicketSchema),
  Payment: mongoose.model('Payment', PaymentSchema),
  Reservation: mongoose.model('Reservation', ReservationSchema),
};