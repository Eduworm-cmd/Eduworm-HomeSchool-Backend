const mongoose = require("mongoose");
const Teacher = require("../models/teacher.model");
const ApiError = require("../utils/ApiError");
const { uploadToCloudinary } = require("../utils/teachercloudinary");

class TeacherController {
  // Create Teacher
  async create(req, res) {
    try {
      let profileImageUrl = null;

      // Profile image upload
      if (req.file) {
        if (!req.file.mimetype.startsWith("image/")) {
          throw new ApiError(400, "Only image files are allowed");
        }
        const uploaded = await uploadToCloudinary(req.file.buffer, "Teachers", "image");
        profileImageUrl = uploaded.secure_url;
      }

      // Teacher data
      const teacherData = {
        ...req.body,
        profileImage: profileImageUrl,
      };

      const teacher = new Teacher(teacherData);
      await teacher.save();

      res.status(201).json({ success: true, message: "Teacher created successfully", data: teacher });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ success: false, message: "Email or phone already exists" });
      }
      if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const teachers = await Teacher.find();
      res.status(200).json({ success: true, message: "Teachers fetched successfully", data: teachers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }
      const teacher = await Teacher.findById(req.params.id);
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });
      res.status(200).json({ success: true, message: "Teacher fetched successfully", data: teacher });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const updateData = { ...req.body };

      if (req.file) {
        const uploaded = await uploadToCloudinary(req.file.buffer, "Teachers", "image");
        updateData.profileImage = uploaded.secure_url;
      }

      const teacher = await Teacher.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });

      res.status(200).json({ success: true, message: "Teacher updated successfully", data: teacher });
    } catch (err) {
      if (err.code === 11000) return res.status(400).json({ success: false, message: "Email or phone already exists" });
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }
      const teacher = await Teacher.findByIdAndDelete(req.params.id);
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found" });
      res.status(200).json({ success: true, message: "Teacher deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new TeacherController();
