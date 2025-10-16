const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacher.controller");

router.post("/create", teacherController.create);
router.get("/all", teacherController.getAll);
router.get("/:id", teacherController.getById);
router.put("/:id", teacherController.update);
router.delete("/:id", teacherController.delete);

module.exports = router;
