const mongoose = require("mongoose");
const Teacher = require("../models/teacher.model");
const Subject = require("../models/subject.model"); // ✅ Add this line
const uploadToCloudinary = require("../services/upload.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

class TeacherController {
  // ✅ Create Teacher with Image Upload
  create = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, experience } = req.body;
    const profileImage = req.files?.profileImage?.[0]; // multer field name should match

    // Validation
    if (!name || !email || !phone || !subject || !experience) {
      throw new ApiError(400, "All fields are required");
    }

    // Check duplicate email or phone
    const existingTeacher = await Teacher.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingTeacher) {
      throw new ApiError(400, "Email or phone already exists");
    }

    // Check if subject exists const mongoose = require("mongoose");
const Teacher = require("../models/teacher.model");
const Subject = require("../models/subjectKit.model");
const uploadToCloudinary = require("../services/upload.service");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

class TeacherController {
  create = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, experience } = req.body;
    const profileImage = req.files?.profileImage?.[0];

    if (!name || !email || !phone || !subject || !experience) {
      throw new ApiError(400, "All fields are required");
    }

    const existingTeacher = await Teacher.findOne({ $or: [{ email }, { phone }] });
    if (existingTeacher) throw new ApiError(400, "Email or phone already exists");

    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) throw new ApiError(404, "Subject not found");

    let uploadedImage;
    if (profileImage) {
      uploadedImage = await uploadToCloudinary(profileImage.buffer, "Teachers", "image");
    }

    const teacher = await Teacher.create({
      name,
      email,
      phone,
      subject,
      experience,
      profileImage: uploadedImage ? uploadedImage.secure_url : "",
    });

    const populatedTeacher = await Teacher.findById(teacher._id).populate("subject");

    res.status(201).json(new ApiResponse(201, populatedTeacher, "Teacher created successfully"));
  });

  getAll = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find().populate("subject");
    res.status(200).json(new ApiResponse(200, teachers, "Teachers fetched successfully"));
  });

  getById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, "Invalid ID");

    const teacher = await Teacher.findById(req.params.id).populate("subject");
    if (!teacher) throw new ApiError(404, "Teacher not found");

    res.status(200).json(new ApiResponse(200, teacher, "Teacher fetched successfully"));
  });

  update = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, "Invalid ID");

    const updateData = req.body;
    const profileImage = req.files?.profileImage?.[0];

    if (updateData.subject) {
      const subjectExists = await Subject.findById(updateData.subject);
      if (!subjectExists) throw new ApiError(404, "Subject not found");
    }

    if (profileImage) {
      const uploadedImage = await uploadToCloudinary(profileImage.buffer, "Teachers", "image");
      updateData.profileImage = uploadedImage.secure_url;
    }

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate("subject");

    if (!teacher) throw new ApiError(404, "Teacher not found");

    res.status(200).json(new ApiResponse(200, teacher, "Teacher updated successfully"));
  });

  delete = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, "Invalid ID");

    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) throw new ApiError(404, "Teacher not found");

    res.status(200).json(new ApiResponse(200, null, "Teacher deleted successfully"));
  });
}

module.exports = new TeacherController();
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      throw new ApiError(404, "Subject not found");
    }

    let uploadedImage;
    try {
      if (profileImage) {
        uploadedImage = await uploadToCloudinary(
          profileImage.buffer,
          "Teachers",
          "image"
        );
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new ApiError(500, "Image upload failed");
    }

    // Save to DB
    const teacher = await Teacher.create({
      name,
      email,
      phone,
      subject,
      experience,
      profileImage: uploadedImage ? uploadedImage.secure_url : "",
    });

    // Populate subject after creation
    const populatedTeacher = await Teacher.findById(teacher._id).populate(
      "subject"
    );

    res
      .status(201)
      .json(
        new ApiResponse(201, populatedTeacher, "Teacher created successfully")
      );
  });

  // ✅ Get All Teachers
  getAll = asyncHandler(async (req, res) => {
    const teachers = await Teacher.find().populate("subject"); // subject details load karega
    res
      .status(200)
      .json(new ApiResponse(200, teachers, "Teachers fetched successfully"));
  });

  // ✅ Get Teacher by ID
  getById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ApiError(400, "Invalid ID");
    }

    const teacher = await Teacher.findById(req.params.id).populate("subject");
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, teacher, "Teacher fetched successfully"));
  });

  // ✅ Update Teacher (with optional new image)
  update = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ApiError(400, "Invalid ID");
    }

    const updateData = req.body;
    const profileImage = req.files?.profileImage?.[0];

    // Check subject validity on update
    if (updateData.subject) {
      const subjectExists = await Subject.findById(updateData.subject);
      if (!subjectExists) {
        throw new ApiError(404, "Subject not found");
      }
    }

    if (profileImage) {
      const uploadedImage = await uploadToCloudinary(
        profileImage.buffer,
        "Teachers",
        "image"
      );
      updateData.profileImage = uploadedImage.secure_url;
    }

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("subject");

    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, teacher, "Teacher updated successfully"));
  });

  // ✅ Delete Teacher
  delete = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new ApiError(400, "Invalid ID");
    }

    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "Teacher deleted successfully"));
  });
}

module.exports = new TeacherController();
