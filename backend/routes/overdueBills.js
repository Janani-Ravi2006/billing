// // routes/overdueBills.js
// const express = require('express');
// const router = express.Router();
// const db = require('../config/db');

// // Get all overdue bills
// router.get('/overdue-bills', (req, res) => {
//   const query = `
//     SELECT 
//       b.bill_id,
//       b.bill_no,
//       b.bill_date,
//       b.customer_name,
//       b.customer_phone,
//       b.total_amount,
//       b.paid_amount,
//       b.balance_due,
//       DATEDIFF(CURDATE(), b.bill_date) as days_overdue
//     FROM bills b
//     WHERE b.balance_due > 0
//     ORDER BY b.bill_date ASC
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching overdue bills:", err);
//       return res.status(500).json({ error: "Failed to fetch overdue bills" });
//     }
//     res.json(results);
//   });
// });

// // Get overdue bills filtered by days
// router.get('/overdue-bills/filter/:days', (req, res) => {
//   const days = parseInt(req.params.days);
  
//   const query = `
//     SELECT 
//       b.bill_id,
//       b.bill_no,
//       b.bill_date,
//       b.customer_name,
//       b.customer_phone,
//       b.total_amount,
//       b.paid_amount,
//       b.balance_due,
//       DATEDIFF(CURDATE(), b.bill_date) as days_overdue
//     FROM bills b
//     WHERE b.balance_due > 0 
//     AND DATEDIFF(CURDATE(), b.bill_date) >= ?
//     ORDER BY b.bill_date ASC
//   `;

//   db.query(query, [days], (err, results) => {
//     if (err) {
//       console.error("Error fetching filtered overdue bills:", err);
//       return res.status(500).json({ error: "Failed to fetch overdue bills" });
//     }
//     res.json(results);
//   });
// });

// // Get overdue bills summary/stats
// router.get('/overdue-bills/summary', (req, res) => {
//   const query = `
//     SELECT 
//       COUNT(*) as total_overdue_bills,
//       SUM(balance_due) as total_overdue_amount,
//       AVG(DATEDIFF(CURDATE(), bill_date)) as avg_days_overdue,
//       MAX(DATEDIFF(CURDATE(), bill_date)) as max_days_overdue
//     FROM bills
//     WHERE balance_due > 0
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching overdue summary:", err);
//       return res.status(500).json({ error: "Failed to fetch summary" });
//     }
//     res.json(results[0]);
//   });
// });

// // Update payment for an overdue bill
// router.post('/overdue-bills/payment', (req, res) => {
//   const { bill_id, payment_amount } = req.body;

//   if (!bill_id || !payment_amount) {
//     return res.status(400).json({ error: "Bill ID and payment amount required" });
//   }

//   // First get current bill details
//   db.query('SELECT * FROM bills WHERE bill_id = ?', [bill_id], (err, results) => {
//     if (err || results.length === 0) {
//       return res.status(404).json({ error: "Bill not found" });
//     }

//     const bill = results[0];
//     const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(payment_amount);
//     const newBalanceDue = parseFloat(bill.total_amount) - newPaidAmount;

//     // Update the bill
//     const updateQuery = `
//       UPDATE bills 
//       SET paid_amount = ?, balance_due = ?
//       WHERE bill_id = ?
//     `;

//     db.query(updateQuery, [newPaidAmount, newBalanceDue, bill_id], (err) => {
//       if (err) {
//         console.error("Error updating payment:", err);
//         return res.status(500).json({ error: "Failed to update payment" });
//       }
//       res.json({ 
//         success: true, 
//         message: "Payment updated successfully",
//         new_balance: newBalanceDue
//       });
//     });
//   });
// });

// // Get bill details by bill_id
// router.get('/overdue-bills/:bill_id', (req, res) => {
//   const { bill_id } = req.params;

//   const query = `
//     SELECT 
//       b.*,
//       bi.product_name,
//       bi.quantity,
//       bi.unit_price,
//       bi.total_price
//     FROM bills b
//     LEFT JOIN bill_items bi ON b.bill_id = bi.bill_id
//     WHERE b.bill_id = ?
//   `;

//   db.query(query, [bill_id], (err, results) => {
//     if (err) {
//       console.error("Error fetching bill details:", err);
//       return res.status(500).json({ error: "Failed to fetch bill details" });
//     }
//     res.json(results);
//   });
// });

// module.exports = router;


// // routes/overdueBills.js
// // const express = require("express");
// // const router = express.Router();
// // const db = require("../config/db");

// // // ✅ 1. Get all overdue bills (only latest unpaid bill per customer)
// // router.get("/overdue-bills", (req, res) => {
// //   const query = `
// //     SELECT 
// //       b.bill_id,
// //       b.bill_no,
// //       b.bill_date,
// //       b.customer_name,
// //       b.customer_phone,
// //       b.total_amount,
// //       b.paid_amount,
// //       b.balance_due,
// //       DATEDIFF(CURDATE(), b.bill_date) AS days_overdue
// //     FROM bills b
// //     INNER JOIN (
// //       SELECT 
// //         customer_name,
// //         customer_phone,
// //         MAX(bill_date) AS latest_bill_date
// //       FROM bills
// //       WHERE balance_due > 0
// //         AND customer_phone IS NOT NULL
// //         AND customer_phone != ''
// //       GROUP BY customer_name, customer_phone
// //     ) latest 
// //       ON b.customer_name = latest.customer_name
// //       AND b.customer_phone = latest.customer_phone
// //       AND b.bill_date = latest.latest_bill_date
// //     WHERE b.balance_due > 0

// //     UNION

// //     SELECT 
// //       b.bill_id,
// //       b.bill_no,
// //       b.bill_date,
// //       b.customer_name,
// //       b.customer_phone,
// //       b.total_amount,
// //       b.paid_amount,
// //       b.balance_due,
// //       DATEDIFF(CURDATE(), b.bill_date) AS days_overdue
// //     FROM bills b
// //     WHERE b.balance_due > 0 
// //       AND (b.customer_phone IS NULL OR b.customer_phone = '')
// //     ORDER BY bill_date DESC
// //   `;

// //   db.query(query, (err, results) => {
// //     if (err) {
// //       console.error("Error fetching overdue bills:", err);
// //       return res.status(500).json({ error: "Failed to fetch overdue bills" });
// //     }
// //     res.json(results);
// //   });
// // });

// // // ✅ 2. Get overdue bills filtered by days (latest unpaid bill per customer)
// // router.get("/overdue-bills/filter/:days", (req, res) => {
// //   const days = parseInt(req.params.days);

// //   const query = `
// //     SELECT 
// //       b.bill_id,
// //       b.bill_no,
// //       b.bill_date,
// //       b.customer_name,
// //       b.customer_phone,
// //       b.total_amount,
// //       b.paid_amount,
// //       b.balance_due,
// //       DATEDIFF(CURDATE(), b.bill_date) AS days_overdue
// //     FROM bills b
// //     INNER JOIN (
// //       SELECT 
// //         customer_name,
// //         customer_phone,
// //         MAX(bill_date) AS latest_bill_date
// //       FROM bills
// //       WHERE balance_due > 0
// //         AND DATEDIFF(CURDATE(), bill_date) >= ?
// //         AND customer_phone IS NOT NULL
// //         AND customer_phone != ''
// //       GROUP BY customer_name, customer_phone
// //     ) latest 
// //       ON b.customer_name = latest.customer_name
// //       AND b.customer_phone = latest.customer_phone
// //       AND b.bill_date = latest.latest_bill_date
// //     WHERE b.balance_due > 0 
// //       AND DATEDIFF(CURDATE(), b.bill_date) >= ?

// //     UNION

// //     SELECT 
// //       b.bill_id,
// //       b.bill_no,
// //       b.bill_date,
// //       b.customer_name,
// //       b.customer_phone,
// //       b.total_amount,
// //       b.paid_amount,
// //       b.balance_due,
// //       DATEDIFF(CURDATE(), b.bill_date) AS days_overdue
// //     FROM bills b
// //     WHERE b.balance_due > 0
// //       AND DATEDIFF(CURDATE(), b.bill_date) >= ?
// //       AND (b.customer_phone IS NULL OR b.customer_phone = '')
// //     ORDER BY bill_date DESC
// //   `;

// //   db.query(query, [days, days, days], (err, results) => {
// //     if (err) {
// //       console.error("Error fetching filtered overdue bills:", err);
// //       return res.status(500).json({ error: "Failed to fetch overdue bills" });
// //     }
// //     res.json(results);
// //   });
// // });

// // // ✅ 3. Get overdue summary/stats
// // router.get("/overdue-bills/summary", (req, res) => {
// //   const query = `
// //     SELECT 
// //       COUNT(*) AS total_overdue_bills,
// //       SUM(balance_due) AS total_overdue_amount,
// //       AVG(DATEDIFF(CURDATE(), bill_date)) AS avg_days_overdue,
// //       MAX(DATEDIFF(CURDATE(), bill_date)) AS max_days_overdue
// //     FROM bills
// //     WHERE balance_due > 0
// //   `;

// //   db.query(query, (err, results) => {
// //     if (err) {
// //       console.error("Error fetching overdue summary:", err);
// //       return res.status(500).json({ error: "Failed to fetch summary" });
// //     }
// //     res.json(results[0]);
// //   });
// // });

// // // ✅ 4. Update payment for an overdue bill
// // router.post("/overdue-bills/payment", (req, res) => {
// //   const { bill_id, payment_amount } = req.body;

// //   if (!bill_id || !payment_amount) {
// //     return res.status(400).json({ error: "Bill ID and payment amount required" });
// //   }

// //   db.query("SELECT * FROM bills WHERE bill_id = ?", [bill_id], (err, results) => {
// //     if (err || results.length === 0) {
// //       return res.status(404).json({ error: "Bill not found" });
// //     }

// //     const bill = results[0];
// //     const newPaidAmount = parseFloat(bill.paid_amount) + parseFloat(payment_amount);
// //     const newBalanceDue = parseFloat(bill.total_amount) - newPaidAmount;

// //     const updateQuery = `
// //       UPDATE bills 
// //       SET paid_amount = ?, balance_due = ?
// //       WHERE bill_id = ?
// //     `;

// //     db.query(updateQuery, [newPaidAmount, Math.max(newBalanceDue, 0), bill_id], (err) => {
// //       if (err) {
// //         console.error("Error updating payment:", err);
// //         return res.status(500).json({ error: "Failed to update payment" });
// //       }

// //       res.json({
// //         success: true,
// //         message:
// //           newBalanceDue <= 0
// //             ? "Payment completed. Bill cleared from overdue list."
// //             : "Payment updated successfully.",
// //         new_balance: Math.max(newBalanceDue, 0),
// //       });
// //     });
// //   });
// // });

// // // ✅ 5. Get bill details by bill_id
// // router.get("/overdue-bills/:bill_id", (req, res) => {
// //   const { bill_id } = req.params;

// //   const query = `
// //     SELECT 
// //       b.*,
// //       bi.product_name,
// //       bi.quantity,
// //       bi.unit_price,
// //       bi.total_price
// //     FROM bills b
// //     LEFT JOIN bill_items bi ON b.bill_id = bi.bill_id
// //     WHERE b.bill_id = ?
// //   `;

// //   db.query(query, [bill_id], (err, results) => {
// //     if (err) {
// //       console.error("Error fetching bill details:", err);
// //       return res.status(500).json({ error: "Failed to fetch bill details" });
// //     }
// //     res.json(results);
// //   });
// // });

// // module.exports = router;



// routes/overdueBills.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ Get all overdue bills (ONLY LATEST BILL per customer)
router.get('/overdue-bills', (req, res) => {
  const query = `
    SELECT 
      b.bill_id,
      b.bill_no,
      b.bill_date,
      b.customer_name,
      b.customer_phone,
      b.total_amount,
      b.paid_amount,
      b.balance_due,
      DATEDIFF(CURDATE(), b.bill_date) as days_overdue
    FROM bills b
    INNER JOIN (
      SELECT 
        customer_phone,
        MAX(bill_id) as latest_bill_id
      FROM bills
      WHERE customer_phone IS NOT NULL AND customer_phone != ''
      GROUP BY customer_phone
    ) latest ON b.bill_id = latest.latest_bill_id
    WHERE b.balance_due > 0
    ORDER BY b.bill_date ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching overdue bills:", err);
      return res.status(500).json({ error: "Failed to fetch overdue bills" });
    }
    res.json(results);
  });
});

// ✅ Get overdue bills filtered by days (ONLY LATEST per customer)
router.get('/overdue-bills/filter/:days', (req, res) => {
  const days = parseInt(req.params.days);
  
  const query = `
    SELECT 
      b.bill_id,
      b.bill_no,
      b.bill_date,
      b.customer_name,
      b.customer_phone,
      b.total_amount,
      b.paid_amount,
      b.balance_due,
      DATEDIFF(CURDATE(), b.bill_date) as days_overdue
    FROM bills b
    INNER JOIN (
      SELECT 
        customer_phone,
        MAX(bill_id) as latest_bill_id
      FROM bills
      WHERE customer_phone IS NOT NULL AND customer_phone != ''
      GROUP BY customer_phone
    ) latest ON b.bill_id = latest.latest_bill_id
    WHERE b.balance_due > 0 
    AND DATEDIFF(CURDATE(), b.bill_date) >= ?
    ORDER BY b.bill_date ASC
  `;

  db.query(query, [days], (err, results) => {
    if (err) {
      console.error("Error fetching filtered overdue bills:", err);
      return res.status(500).json({ error: "Failed to fetch overdue bills" });
    }
    res.json(results);
  });
});

// ✅ Get overdue bills summary (based on LATEST bills only)
router.get('/overdue-bills/summary', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_overdue_bills,
      SUM(balance_due) as total_overdue_amount,
      AVG(DATEDIFF(CURDATE(), bill_date)) as avg_days_overdue,
      MAX(DATEDIFF(CURDATE(), bill_date)) as max_days_overdue
    FROM bills b
    INNER JOIN (
      SELECT 
        customer_phone,
        MAX(bill_id) as latest_bill_id
      FROM bills
      WHERE customer_phone IS NOT NULL AND customer_phone != ''
      GROUP BY customer_phone
    ) latest ON b.bill_id = latest.latest_bill_id
    WHERE b.balance_due > 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching overdue summary:", err);
      return res.status(500).json({ error: "Failed to fetch summary" });
    }
    res.json(results[0]);
  });
});

// ✅ Add payment → INSERT NEW ROW (don't update old row)
router.post('/overdue-bills/payment', (req, res) => {
  const { bill_id, payment_amount } = req.body;

  if (!bill_id || !payment_amount) {
    return res.status(400).json({ error: "Bill ID and payment amount required" });
  }

  // Get old bill details
  db.query('SELECT * FROM bills WHERE bill_id = ?', [bill_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Bill not found" });
    }

    const oldBill = results[0];
    const newPaidAmount = parseFloat(oldBill.paid_amount) + parseFloat(payment_amount);
    const newBalanceDue = parseFloat(oldBill.total_amount) - newPaidAmount;

    // ✅ INSERT NEW ROW with updated payment details
    const insertQuery = `
      INSERT INTO bills (
        bill_no, bill_date, customer_name, customer_phone,
        total_amount, paid_amount, balance_due
      ) VALUES (?, NOW(), ?, ?, ?, ?, ?)
    `;

    const newBillNo = `${oldBill.bill_no}-P${Date.now()}`; // Generate unique bill number

    db.query(insertQuery, [
      newBillNo,
      oldBill.customer_name,
      oldBill.customer_phone,
      oldBill.total_amount,
      newPaidAmount,
      Math.max(newBalanceDue, 0)
    ], (err, insertResult) => {
      if (err) {
        console.error("Error inserting new bill:", err);
        return res.status(500).json({ error: "Failed to insert new bill" });
      }

      res.json({ 
        success: true, 
        message: "Payment recorded. New bill created.",
        new_balance: Math.max(newBalanceDue, 0),
        new_bill_id: insertResult.insertId,
        old_bill_unchanged: true
      });
    });
  });
});

// ✅ Get bill details by bill_id
router.get('/overdue-bills/:bill_id', (req, res) => {
  const { bill_id } = req.params;

  const query = `
    SELECT 
      b.*,
      bi.product_name,
      bi.quantity,
      bi.unit_price,
      bi.total_price
    FROM bills b
    LEFT JOIN bill_items bi ON b.bill_id = bi.bill_id
    WHERE b.bill_id = ?
  `;

  db.query(query, [bill_id], (err, results) => {
    if (err) {
      console.error("Error fetching bill details:", err);
      return res.status(500).json({ error: "Failed to fetch bill details" });
    }
    res.json(results);
  });
});

// ✅ Get customer payment history (all bills for a customer)
router.get('/customer-history/:phone', (req, res) => {
  const { phone } = req.params;

  const query = `
    SELECT 
      bill_id,
      bill_no,
      bill_date,
      total_amount,
      paid_amount,
      balance_due,
      DATEDIFF(CURDATE(), bill_date) as days_old
    FROM bills
    WHERE customer_phone = ?
    ORDER BY bill_id DESC
  `;

  db.query(query, [phone], (err, results) => {
    if (err) {
      console.error("Error fetching customer history:", err);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
    res.json(results);
  });
});

module.exports = router;