const db = require("../config/db");

const createCategory = (name, callback) => {
  const sql = "INSERT INTO categories (name) VALUES (?)";
  db.query(sql, [name], callback);
};

const getAllCategories = (callback) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, callback);
};

const deleteCategory = (id, callback) => {
  const sql = "DELETE FROM categories WHERE category_id = ?";
  db.query(sql, [id], callback);
};

// 🔥 New: Update Category
const updateCategory = (id, name, callback) => {
  const sql = "UPDATE categories SET name = ? WHERE category_id = ?";
  db.query(sql, [name, id], callback);
};

module.exports = {  
  createCategory, 
  getAllCategories, 
  deleteCategory,
  updateCategory // <-- export pannunga
};
