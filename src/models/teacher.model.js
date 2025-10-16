const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    profileImage: { type: String }, // Cloudinary URL

    // Options (text/image)
    options: [
      {
        type: { type: String, enum: ["text", "image"], required: true },
        value: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
