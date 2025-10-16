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
      ref: "SubjectKit", // ye reference SubjectKit ko point karega
     required: [true, "Subject is required"]
   },
    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: 0,
    },
    profileImage: {
      type: String, // URL or path of profile image
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
