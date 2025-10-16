const express = require("express");
const router = express.Router();
const multer = require("multer");
const teacherController = require("../controllers/teacher.controller");

// Multer setup (memory storage for Cloudinary)
const upload = multer();

// Routes
router.post("/create", upload.single("profileImage"), teacherController.create);
router.get("/all", teacherController.getAll);
router.get("/:id", teacherController.getById);
router.put("/:id", upload.single("profileImage"), teacherController.update);
router.delete("/:id", teacherController.delete);

module.exports = router;
