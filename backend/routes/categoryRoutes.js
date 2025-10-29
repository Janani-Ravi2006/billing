const express = require("express");
const { addCategory, getCategories, deleteCategory,updateCategory } = require("../controllers/categoryController");

const router = express.Router();

// Category routes
router.post("/", addCategory);
router.get("/", getCategories);
router.delete("/:id", deleteCategory);
router.put("/:id", updateCategory); // <-- new route
module.exports = router;
