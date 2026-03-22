const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    event_id: { type: Schema.Types.ObjectId, ref: 'Event' },
    amount: Number,
    currency: String,
    status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
    payment_method: { type: String, enum: ['MobileMoney', 'Card'] },
    transaction_id: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
