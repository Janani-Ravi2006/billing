const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/stats", async (req, res) => {
  try {
    // Execute all queries
    const [categories] = await db.promise().query("SELECT * FROM categories");
    const [products] = await db.promise().query("SELECT * FROM products");
    const [purchases] = await db.promise().query("SELECT * FROM purchases");
    const [stocks] = await db.promise().query("SELECT * FROM stocks");
    const [bills] = await db.promise().query("SELECT * FROM bills");
    const [overdues] = await db.promise().query("SELECT * FROM bills WHERE balance_due > 0");

    // Return all data
    res.json({
      categories,
      products,
      purchases,
      stocks,
      bills,
      overdues
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ 
      error: "Failed to fetch dashboard data",
      details: error.message 
    });
  }
});

module.exports = router;