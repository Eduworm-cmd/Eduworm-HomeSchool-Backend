const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Teacher name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectKit", // Ensure your SubjectKit model exists
      required: [true, "Subject is required"],
    },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    profileImage: {
      type: String, // Cloudinary URL or local path
      default: "",  // Default empty if no image uploaded
    },
  },
  { timestamps: true }
);

// Prevent model recompilation errors in development
module.exports = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
