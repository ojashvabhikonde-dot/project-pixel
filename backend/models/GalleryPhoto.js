import mongoose from 'mongoose';

const galleryPhotoSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: [
        'Nature',
        'Street',
        'Portrait',
        'Wildlife',
        'Architecture',
        'Macro',
        'Drone',
        'Events',
        'Night',
        'Black and White'
      ],
    },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    camera: { type: String, default: 'Sony Alpha' },
    lens: { type: String, default: 'Sony Lens' },
    settings: {
      aperture: { type: String, default: 'f/2.8' },
      shutterSpeed: { type: String, default: '1/125s' },
      iso: { type: Number, default: 400 },
      focalLength: { type: String, default: '50mm' },
    },
    exifData: { type: mongoose.Schema.Types.Mixed },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downloadsCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const GalleryPhoto = mongoose.model('GalleryPhoto', galleryPhotoSchema);
