import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientPhone: { type: String, required: true },
    eventType: {
      type: String,
      required: true,
      enum: ['College Fest', 'Seminar', 'Sports', 'Private Event', 'Product Shoot', 'Other'],
    },
    eventDate: { type: Date, required: true },
    venue: { type: String, required: true },
    details: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', bookingSchema);
