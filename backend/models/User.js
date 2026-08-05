import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        'admin',
        'president',
        'vice_president',
        'secretary',
        'treasurer',
        'tech_head',
        'creative_head',
        'photography_head',
        'social_media_head',
        'member',
        'alumni',
        'faculty'
      ],
      default: 'member',
    },
    semester: { type: Number },
    year: { type: String }, // e.g., '1st Year', '2nd Year', '3rd Year', '4th Year'
    department: { type: String },
    skills: [{ type: String }],
    photographyGenre: [{ type: String }],
    bio: { type: String },
    portfolioUrl: { type: String },
    instagramUrl: { type: String },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    phone: { type: String },
    avatarUrl: { type: String },
    isApproved: { type: Boolean, default: false },
    currentProfession: { type: String }, // for alumni
    timelineOrder: { type: Number }, // for order display
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
