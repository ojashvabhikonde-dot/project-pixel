import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true }, // HTML/Markdown payload
    category: {
      type: String,
      required: true,
      enum: ['Tutorial', 'Review', 'Guide'],
    },
    tags: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverImageUrl: { type: String },
    readTime: { type: String, default: '5 mins read' },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export const Blog = mongoose.model('Blog', blogSchema);
