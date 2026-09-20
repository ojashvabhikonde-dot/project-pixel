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
        'crew',
        'viewer',
        'alumni',
        'faculty'
      ],
      default: 'viewer',
    },
    specialization: { type: String, default: 'Visual Creator' },
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
    socialLinks: [
      {
        platform: { type: String },
        url: { type: String },
      }
    ],
    phone: { type: String },
    avatarUrl: { type: String },
    isApproved: { type: Boolean, default: false },
    currentProfession: { type: String }, // for alumni
    pastRole: { type: String }, // e.g., 'Ex Prime', 'Ex Chief', 'Club Alumni'
    tenureYear: { type: String }, // e.g., '2025-2026', '2024-2025'
    designation: { type: String }, // e.g., 'Faculty Coordinator', 'Senior Faculty Advisor'
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

// Compare password method with safe fallback and auto-upgrade
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    if (isMatch) return true;
  } catch (err) {
    // Stored password might not be a valid bcrypt string, check plain text fallback
  }

  // Plain text fallback (for legacy or seeded accounts)
  if (enteredPassword === this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(enteredPassword, salt);
      await this.save();
    } catch (saveErr) {
      // Ignore save error on auth check
    }
    return true;
  }

  return false;
};

export const User = mongoose.model('User', userSchema);
