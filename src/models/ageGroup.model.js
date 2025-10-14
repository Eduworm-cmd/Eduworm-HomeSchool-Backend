const mongoose = require("mongoose");

const ageGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
    },
    min: {
      type: Number,
      required: [true, 'Min age is required'],
      min: [0, 'Min age cannot be negative'],
    },
    max: {
      type: Number,
      required: [true, 'Max age is required'],
      min: [0, 'Max age cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AgeGroup", ageGroupSchema);
