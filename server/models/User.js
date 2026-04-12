import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      maxlength: 300,
    },
    avatarUrl: {
      type: String,
    },

    // Progress tracking
    completedTutorials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tutorial",
      },
    ],
    completedDSAQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DSAQuestion",
      },
    ],
    bookmarkedTutorials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tutorial",
      },
    ],
    bookmarkedDSAQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DSAQuestion",
      },
    ],

    // Streak & engagement
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for common queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

// Never return passwordHash in JSON
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
