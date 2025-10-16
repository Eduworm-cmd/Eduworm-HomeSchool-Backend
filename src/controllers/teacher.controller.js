const mongoose = require("mongoose");
const Teacher = require("../models/teacher.model");

class TeacherController {
  // Create Teacher
  async create(req, res) {
    try {
      const teacher = new Teacher(req.body);
      await teacher.save();
      res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: teacher,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(400)
          .json({ success: false, message: "Email or phone already exists" });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get All Teachers
  async getAll(req, res) {
    try {
      const teachers = await Teacher.find().populate("subject");
      res.status(200).json({
        success: true,
        message: "Teachers fetched successfully",
        data: teachers,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Get Teacher by ID
  async getById(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const teacher = await Teacher.findById(req.params.id).populate("subject");
      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      res.status(200).json({
        success: true,
        message: "Teacher fetched successfully",
        data: teacher,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Update Teacher
  async update(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      res.status(200).json({
        success: true,
        message: "Teacher updated successfully",
        data: teacher,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(400)
          .json({ success: false, message: "Email or phone already exists" });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Delete Teacher
  async delete(req, res) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const teacher = await Teacher.findByIdAndDelete(req.params.id);
      if (!teacher) {
        return res
          .status(404)
          .json({ success: false, message: "Teacher not found" });
      }

      res.status(200).json({
        success: true,
        message: "Teacher deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new TeacherController();
