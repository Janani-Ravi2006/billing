const Product = require("../models/productModel");

// Add product
const addProduct = (req, res) => {
  Product.createProduct(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Product added", id: result.insertId });
  });
};

// Get products
const getProducts = (req, res) => {
  Product.getAllProducts((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Delete product
const deleteProduct = (req, res) => {
  const { id } = req.params;
  Product.deleteProduct(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  });
};

// Update product
const updateProduct = (req, res) => {
  const { id } = req.params;
  Product.updateProduct(id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated", id });
  });
};

module.exports = { addProduct, getProducts, deleteProduct, updateProduct };
