// // const express = require("express");
// // const db = require("../config/db");
// // const router = express.Router();

// // // Get all users for dropdown
// // router.get("/users", (req, res) => {
// //   const query = "SELECT id, username FROM users ORDER BY username";
  
// //   db.query(query, (err, results) => {
// //     if (err) {
// //       console.error("Error fetching users:", err);
// //       return res.status(500).json({ error: "Failed to fetch users" });
// //     }
// //     res.json(results);
// //   });
// // });

// // // Get executive salary data by username
// // router.get("/executive-salary/:username", (req, res) => {
// //   const { username } = req.params;
  
// //   // First, verify user exists
// //   const userQuery = "SELECT id, username FROM users WHERE username = ?";
  
// //   db.query(userQuery, [username], (err, userResults) => {
// //     if (err) {
// //       console.error("Error fetching user:", err);
// //       return res.status(500).json({ error: "Failed to fetch user" });
// //     }
    
// //     if (userResults.length === 0) {
// //       return res.status(404).json({ error: "User not found" });
// //     }
    
// //     const user = userResults[0];
    
// //     // Get bills count and total amount
// //     // Note: Currently getting all bills. If you want to track which user created each bill,
// //     // you need to add a 'created_by' column to the bills table
// //     const billsQuery = `
// //       SELECT 
// //         COUNT(*) as totalBills,
// //         SUM(total_amount) as totalRevenue,
// //         DATE_FORMAT(MIN(bill_date), '%Y-%m-%d') as firstBillDate,
// //         DATE_FORMAT(MAX(bill_date), '%Y-%m-%d') as lastBillDate
// //       FROM bills
// //     `;
    
// //     db.query(billsQuery, (err, billResults) => {
// //       if (err) {
// //         console.error("Error fetching bills data:", err);
// //         return res.status(500).json({ error: "Failed to fetch bills data" });
// //       }
      
// //       const data = billResults[0];
      
// //       // Calculate salary based on number of bills
// //       // ₹50 per bill (you can change this rate)
// //       const salaryPerBill = 50;
// //       const calculatedSalary = (data.totalBills || 0) * salaryPerBill;
      
// //       res.json({
// //         username: user.username,
// //         userId: user.id,
// //         totalBills: data.totalBills || 0,
// //         totalRevenue: parseFloat(data.totalRevenue || 0),
// //         salary: calculatedSalary,
// //         salaryPerBill: salaryPerBill,
// //         firstBillDate: data.firstBillDate,
// //         lastBillDate: data.lastBillDate,
// //         generatedDate: new Date().toISOString()
// //       });
// //     });
// //   });
// // });

// // // Get detailed bills for a user (optional - for viewing bill details)
// // router.get("/executive-salary/:username/bills", (req, res) => {
// //   const { username } = req.params;
  
// //   const query = `
// //     SELECT 
// //       b.bill_id,
// //       b.bill_no,
// //       b.bill_date,
// //       b.customer_name,
// //       b.total_amount,
// //       b.payment_method,
// //       DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as created_at
// //     FROM bills b
// //     ORDER BY b.bill_date DESC, b.bill_no DESC
// //     LIMIT 100
// //   `;
  
// //   db.query(query, (err, results) => {
// //     if (err) {
// //       console.error("Error fetching user bills:", err);
// //       return res.status(500).json({ error: "Failed to fetch bills" });
// //     }
// //     res.json(results);
// //   });
// // });

// // module.exports = router;


// const express = require("express");
// const db = require("../config/db");
// const router = express.Router();

// // Get all users for dropdown
// router.get("/users", (req, res) => {
//   const query = "SELECT id, username FROM users ORDER BY username";
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching users:", err);
//       return res.status(500).json({ error: "Failed to fetch users" });
//     }
//     res.json(results);
//   });
// });

// // Get executive salary data by username
// router.get("/executive-salary/:username", (req, res) => {
//   const { username } = req.params;
  
//   // First, verify user exists and get their ID
//   const userQuery = "SELECT id, username FROM users WHERE username = ?";
  
//   db.query(userQuery, [username], (err, userResults) => {
//     if (err) {
//       console.error("Error fetching user:", err);
//       return res.status(500).json({ error: "Failed to fetch user" });
//     }
    
//     if (userResults.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }
    
//     const user = userResults[0];
//     const userId = user.id;
    
//     // Get bills count and total amount for THIS SPECIFIC EXECUTIVE ONLY
//     const billsQuery = `
//       SELECT 
//         COUNT(*) as totalBills,
//         COALESCE(SUM(total_amount), 0) as totalRevenue,
//         DATE_FORMAT(MIN(bill_date), '%Y-%m-%d') as firstBillDate,
//         DATE_FORMAT(MAX(bill_date), '%Y-%m-%d') as lastBillDate
//       FROM bills
//       WHERE created_by = ?
//     `;
    
//     db.query(billsQuery, [userId], (err, billResults) => {
//       if (err) {
//         console.error("Error fetching bills data:", err);
//         return res.status(500).json({ error: "Failed to fetch bills data" });
//       }
      
//       const data = billResults[0];
      
//       res.json({
//         username: user.username,
//         userId: user.id,
//         totalBills: data.totalBills || 0,
//         totalRevenue: parseFloat(data.totalRevenue || 0),
//         firstBillDate: data.firstBillDate,
//         lastBillDate: data.lastBillDate,
//         generatedDate: new Date().toISOString()
//       });
//     });
//   });
// });

// // Get detailed bills for a specific executive
// router.get("/executive-salary/:username/bills", (req, res) => {
//   const { username } = req.params;
  
//   // First get user ID
//   const userQuery = "SELECT id FROM users WHERE username = ?";
  
//   db.query(userQuery, [username], (err, userResults) => {
//     if (err) {
//       console.error("Error fetching user:", err);
//       return res.status(500).json({ error: "Failed to fetch user" });
//     }
    
//     if (userResults.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }
    
//     const userId = userResults[0].id;
    
//     // Get bills created by this executive only
//     const billsQuery = `
//       SELECT 
//         b.bill_id,
//         b.bill_no,
//         b.bill_date,
//         b.customer_name,
//         b.total_amount,
//         b.payment_method,
//         DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as created_at
//       FROM bills b
//       WHERE b.created_by = ?
//       ORDER BY b.bill_date DESC, b.bill_no DESC
//       LIMIT 100
//     `;
    
//     db.query(billsQuery, [userId], (err, results) => {
//       if (err) {
//         console.error("Error fetching user bills:", err);
//         return res.status(500).json({ error: "Failed to fetch bills" });
//       }
//       res.json(results);
//     });
//   });
// });

// module.exports = router;


const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Get all users for dropdown
router.get("/users", (req, res) => {
  const query = "SELECT id, username FROM users ORDER BY username";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    res.json(results);
  });
});

// Get executive salary data by username for a specific MONTH
router.get("/executive-salary-month/:username", (req, res) => {
  const { username } = req.params;
  const { month } = req.query; // Format: YYYY-MM
  
  if (!month) {
    return res.status(400).json({ error: "Month parameter is required" });
  }
  
  // First, verify user exists and get their ID
  const userQuery = "SELECT id, username FROM users WHERE username = ?";
  
  db.query(userQuery, [username], (err, userResults) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
    
    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const user = userResults[0];
    const userId = user.id;
    
    // Calculate first and last day of the month
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${year}-${monthNum}-${lastDay}`;
    
    // Get bills count for THIS SPECIFIC EXECUTIVE within the month
    const billsQuery = `
      SELECT 
        COUNT(*) as totalBills,
        DATE_FORMAT(MIN(bill_date), '%Y-%m-%d') as firstBillDate,
        DATE_FORMAT(MAX(bill_date), '%Y-%m-%d') as lastBillDate
      FROM bills
      WHERE created_by = ?
        AND bill_date >= ?
        AND bill_date <= ?
    `;
    
    db.query(billsQuery, [userId, startDate, endDate], (err, billResults) => {
      if (err) {
        console.error("Error fetching bills data:", err);
        return res.status(500).json({ error: "Failed to fetch bills data" });
      }
      
      const data = billResults[0];
      
      res.json({
        username: user.username,
        userId: user.id,
        totalBills: data.totalBills || 0,
        firstBillDate: data.firstBillDate,
        lastBillDate: data.lastBillDate,
        month: month,
        startDate: startDate,
        endDate: endDate,
        generatedDate: new Date().toISOString()
      });
    });
  });
});

// Save executive salaries to database
router.post("/save-salaries", (req, res) => {
  const { executives } = req.body;

  if (!executives || executives.length === 0) {
    return res.status(400).json({ error: "No executive data provided" });
  }

  // Validate that all executives have salary filled
  const invalidExecutives = executives.filter(exec => !exec.salary || exec.salary === "");
  if (invalidExecutives.length > 0) {
    return res.status(400).json({ error: "All executives must have salary entered" });
  }

  // Prepare batch insert query
  const insertQuery = `
    INSERT INTO executive_salaries 
    (date, username, salary_month, total_bills, salary_amount, first_bill_date, last_bill_date)
    VALUES ?
  `;

  const values = executives.map(exec => [
    exec.date,
    exec.username,
    exec.month, // Store the month (YYYY-MM format)
    exec.noOfBills,
    parseFloat(exec.salary),
    exec.startDate,
    exec.endDate
  ]);

  db.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error saving executive salaries:", err);
      return res.status(500).json({ error: "Failed to save executive salaries" });
    }

    res.json({ 
      message: "Executive salaries saved successfully!",
      insertedCount: result.affectedRows
    });
  });
});

// Get salary history with filters
router.get("/salary-history", (req, res) => {
  const { username, month } = req.query;
  
  let query = `
    SELECT 
      id,
      date,
      username,
      salary_month,
      total_bills,
      salary_amount,
      first_bill_date,
      last_bill_date,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
    FROM executive_salaries
    WHERE 1=1
  `;
  
  const queryParams = [];
  
  if (username) {
    query += ` AND username = ?`;
    queryParams.push(username);
  }
  
  if (month) {
    query += ` AND salary_month = ?`;
    queryParams.push(month);
  }
  
  query += ` ORDER BY date DESC, username`;
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching salary history:", err);
      return res.status(500).json({ error: "Failed to fetch salary history" });
    }
    res.json(results);
  });
});

// Get summary statistics for executive salaries
router.get("/salary-summary", (req, res) => {
  const { month, username } = req.query;
  
  let query = `
    SELECT 
      COUNT(DISTINCT username) as total_executives,
      SUM(total_bills) as total_bills_processed,
      SUM(salary_amount) as total_salary_paid,
      AVG(salary_amount) as avg_salary
    FROM executive_salaries
    WHERE 1=1
  `;
  
  const queryParams = [];
  
  if (month) {
    query += ` AND salary_month = ?`;
    queryParams.push(month);
  }
  
  if (username) {
    query += ` AND username = ?`;
    queryParams.push(username);
  }
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching salary summary:", err);
      return res.status(500).json({ error: "Failed to fetch salary summary" });
    }
    res.json(results[0]);
  });
});

// Delete a salary record
router.delete("/salary-record/:id", (req, res) => {
  const { id } = req.params;
  
  const deleteQuery = "DELETE FROM executive_salaries WHERE id = ?";
  
  db.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting salary record:", err);
      return res.status(500).json({ error: "Failed to delete salary record" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Salary record not found" });
    }
    
    res.json({ message: "Salary record deleted successfully" });
  });
});

// Update a salary record
router.put("/salary-record/:id", (req, res) => {
  const { id } = req.params;
  const { salary_amount } = req.body;
  
  if (!salary_amount) {
    return res.status(400).json({ error: "Salary amount is required" });
  }
  
  const updateQuery = "UPDATE executive_salaries SET salary_amount = ? WHERE id = ?";
  
  db.query(updateQuery, [parseFloat(salary_amount), id], (err, result) => {
    if (err) {
      console.error("Error updating salary record:", err);
      return res.status(500).json({ error: "Failed to update salary record" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Salary record not found" });
    }
    
    res.json({ message: "Salary record updated successfully" });
  });
});

// Get detailed bills for a specific executive within a month
router.get("/executive-bills/:username", (req, res) => {
  const { username } = req.params;
  const { month } = req.query;
  
  // First get user ID
  const userQuery = "SELECT id FROM users WHERE username = ?";
  
  db.query(userQuery, [username], (err, userResults) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
    
    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userId = userResults[0].id;
    
    let billsQuery = `
      SELECT 
        b.bill_id,
        b.bill_no,
        b.bill_date,
        b.customer_name,
        b.total_amount,
        b.payment_method,
        DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM bills b
      WHERE b.created_by = ?
    `;
    
    const queryParams = [userId];
    
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${year}-${monthNum}-${lastDay}`;
      
      billsQuery += ` AND b.bill_date >= ? AND b.bill_date <= ?`;
      queryParams.push(startDate, endDate);
    }
    
    billsQuery += ` ORDER BY b.bill_date DESC, b.bill_no DESC LIMIT 100`;
    
    db.query(billsQuery, queryParams, (err, results) => {
      if (err) {
        console.error("Error fetching user bills:", err);
        return res.status(500).json({ error: "Failed to fetch bills" });
      }
      res.json(results);
    });
  });
});

module.exports = router;