const db = require("../config/db");

const createProduct = (product, callback) => {
  const { categoryName, productName, unitOfMeasurement, unitPrice, hsnCode } = product;
  const sql = `INSERT INTO products (categoryName, productName, unitOfMeasurement, unitPrice, hsnCode) 
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [categoryName, productName, unitOfMeasurement, unitPrice, hsnCode], callback);
};

const getAllProducts = (callback) => {
  db.query("SELECT * FROM products", callback);
};

const deleteProduct = (id, callback) => {
  db.query("DELETE FROM products WHERE product_id = ?", [id], callback);
};

const updateProduct = (id, product, callback) => {
  const { categoryName, productName, unitOfMeasurement, unitPrice, hsnCode } = product;
  const sql = `UPDATE products 
               SET categoryName=?, productName=?, unitOfMeasurement=?, unitPrice=?, hsnCode=? 
               WHERE product_id=?`;
  db.query(sql, [categoryName, productName, unitOfMeasurement, unitPrice, hsnCode, id], callback);
};

module.exports = { createProduct, getAllProducts, deleteProduct, updateProduct };
