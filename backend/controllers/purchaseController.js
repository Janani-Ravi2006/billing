const Purchase = require("../models/purchaseModel");

// Save Purchase (handles multiple items)
const savePurchase = (req, res) => {
  const { date, buyer, items, total, paid } = req.body;

  if (!date || !buyer || !items || items.length === 0) {
    return res.status(400).json({ error: "Date, buyer, and items are required" });
  }

  Purchase.createPurchase(req.body, (err, result) => {
    if (err) {
      console.error("Error saving purchase:", err);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "Purchase saved successfully",
      purchaseId: result.purchaseId
    });
  });
};

// Get all purchases
const getPurchases = (req, res) => {
  Purchase.getAllPurchases((err, rows) => {
    if (err) {
      console.error("Error fetching purchases:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
};

// Mark purchase as paid
const markPaid = (req, res) => {
  const { id } = req.params;

  Purchase.markAsPaid(id, (err, result) => {
    if (err) {
      console.error("Error marking as paid:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.json({ message: "Payment confirmed successfully" });
  });
};

// Delete purchase
const deletePurchase = (req, res) => {
  const { id } = req.params;

  Purchase.deletePurchase(id, (err, result) => {
    if (err) {
      console.error("Error deleting purchase:", err);
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.json({ message: "Purchase deleted successfully" });
  });
};



// Get single purchase by ID (NEW)
const getPurchaseById = (req, res) => {
  const { id } = req.params;

  Purchase.getPurchaseById(id, (err, purchase) => {
    if (err) {
      console.error("Error fetching purchase:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.json(purchase);
  });
};

module.exports = { 
  savePurchase, 
  getPurchases,
  getPurchaseById,  // Add this
  markPaid, 
  deletePurchase 
};
