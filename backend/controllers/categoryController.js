const Category = require("../models/categoryModel");

// Add Category
const addCategory = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Category name is required" });

  Category.createCategory(name, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Category name already exists" });
      }
      return res.status(500).json({ error: err.message });
    }
    // return DB id
    res.status(201).json({ message: "Category created", category: { id: result.insertId, name } });
  });
};

// Get all categories
const getCategories = (req, res) => {
  Category.getAllCategories((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Send DB id + name to frontend
    const categories = rows.map((row) => ({
      id: row.category_id,
      name: row.name,
    }));

    res.json(categories);
  });
};

// Delete Category
const deleteCategory = (req, res) => {
  const { id } = req.params;
  Category.deleteCategory(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  });
};


const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  Category.updateCategory(id, name, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category updated", id, name });
  });
};
module.exports = { addCategory, getCategories, deleteCategory,updateCategory};
