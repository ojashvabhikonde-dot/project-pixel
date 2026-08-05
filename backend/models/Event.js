import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['Workshop', 'Photowalk', 'Competition', 'Seminar', 'Exhibition'],
    },
    bannerUrl: { type: String, required: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    schedule: [
      {
        time: { type: String },
        title: { type: String },
        speaker: { type: String },
      },
    ],
    gallery: [{ type: String }],
    videos: [{ type: String }],
    speakers: [
      {
        name: { type: String },
        bio: { type: String },
        avatarUrl: { type: String },
      },
    ],
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['upcoming', 'past', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);
