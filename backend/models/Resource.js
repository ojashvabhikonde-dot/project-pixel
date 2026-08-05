import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Notes', 'Guide', 'Preset', 'LUT'],
    },
    software: {
      type: String,
      required: true,
      enum: ['Lightroom', 'Photoshop', 'Premiere Pro', 'DaVinci Resolve', 'General'],
      default: 'General',
    },
    fileUrl: { type: String, required: true },
    previewUrl: { type: String },
    description: { type: String },
    tags: [{ type: String }],
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Resource = mongoose.model('Resource', resourceSchema);
