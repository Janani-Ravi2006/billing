const express = require("express");
const router = express.Router();
const {
  savePurchase,
  getPurchases,
  getPurchaseById,  // Add this
  markPaid,
  deletePurchase,
} = require("../controllers/purchaseController");

router.post("/save-purchase", savePurchase);
router.get("/purchases", getPurchases);
router.get("/purchase/:id", getPurchaseById);  // Add this NEW route
router.post("/mark-paid/:id", markPaid);
router.delete("/purchases/:id", deletePurchase);

module.exports = router;