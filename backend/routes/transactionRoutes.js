// const express = require("express");
// const db = require("../config/db");
// const router = express.Router();

// // Get all transactions
// router.get("/", (req, res) => {
//   const query = "SELECT * FROM transactions ORDER BY date DESC";
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching transactions:", err);
//       return res.status(500).json({ error: "Failed to fetch transactions" });
//     }
//     res.json(results);
//   });
// });

// // Add a new transaction
// router.post("/", (req, res) => {
//   const { date, reason, amount, type, category } = req.body;
  
//   if (!date || !reason || !amount || !type) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   const query = "INSERT INTO transactions (date, reason, amount, type, category) VALUES (?, ?, ?, ?, ?)";
//   db.query(query, [date, reason, amount, type, category || 'general'], (err, result) => {
//     if (err) {
//       console.error("Error adding transaction:", err);
//       return res.status(500).json({ error: "Failed to add transaction" });
//     }
//     res.status(201).json({ id: result.insertId, message: "Transaction added successfully" });
//   });
// });

// // Update a transaction
// router.put("/:id", (req, res) => {
//   const { id } = req.params;
//   const { date, reason, amount, type, category } = req.body;

//   const query = "UPDATE transactions SET date = ?, reason = ?, amount = ?, type = ?, category = ? WHERE id = ?";
//   db.query(query, [date, reason, amount, type, category || 'general', id], (err, result) => {
//     if (err) {
//       console.error("Error updating transaction:", err);
//       return res.status(500).json({ error: "Failed to update transaction" });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Transaction not found" });
//     }
//     res.json({ message: "Transaction updated successfully" });
//   });
// });

// // Delete a transaction
// router.delete("/:id", (req, res) => {
//   const { id } = req.params;
//   const query = "DELETE FROM transactions WHERE id = ?";
  
//   db.query(query, [id], (err, result) => {
//     if (err) {
//       console.error("Error deleting transaction:", err);
//       return res.status(500).json({ error: "Failed to delete transaction" });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Transaction not found" });
//     }
//     res.json({ message: "Transaction deleted successfully" });
//   });
// });

// // Calculate profit with purchase and executive salary breakdown
// router.get("/profit", (req, res) => {
//   const { from, to } = req.query;
  
//   if (!from || !to) {
//     return res.status(400).json({ error: "From and To dates are required" });
//   }

//   // 1. Get total income from bills
//   const incomeQuery = `
//     SELECT COALESCE(SUM(total_amount), 0) as totalIncome
//     FROM bills
//     WHERE bill_date BETWEEN ? AND ?
//   `;

//   // 2. Get regular expenses from transactions
//   const expenseQuery = `
//     SELECT 
//       COALESCE(SUM(CASE WHEN category = 'general' THEN amount ELSE 0 END), 0) as generalExpense,
//       COALESCE(SUM(CASE WHEN category = 'executive_salary' THEN amount ELSE 0 END), 0) as manualExecutiveSalary
//     FROM transactions
//     WHERE type = 'expense' AND date BETWEEN ? AND ?
//   `;

//   // 3. Get total purchase amount from purchase table
//   const purchaseQuery = `
//     SELECT 
//       COALESCE(SUM(total_amount), 0) as totalPurchase,
//       COUNT(*) as totalPurchaseCount
//     FROM purchases
//     WHERE purchase_date BETWEEN ? AND ?
//   `;

//   // 4. Get executive-wise purchase count for salary calculation
//   const executivePurchaseQuery = `
//     SELECT 
//       u.username,
//       u.id as userId,
//       COUNT(p.purchase_id) as purchaseCount,
//       COALESCE(SUM(p.total_amount), 0) as totalPurchaseAmount
//     FROM users u
//     LEFT JOIN purchases p ON p.created_by = u.id 
//       AND p.purchase_date BETWEEN ? AND ?
//     GROUP BY u.id, u.username
//     HAVING purchaseCount > 0
//   `;

//   db.query(incomeQuery, [from, to], (err, incomeResults) => {
//     if (err) {
//       console.error("Error fetching income:", err);
//       return res.status(500).json({ error: "Failed to fetch income data" });
//     }

//     db.query(expenseQuery, [from, to], (err, expenseResults) => {
//       if (err) {
//         console.error("Error fetching expenses:", err);
//         return res.status(500).json({ error: "Failed to fetch expense data" });
//       }

//       db.query(purchaseQuery, [from, to], (err, purchaseResults) => {
//         if (err) {
//           console.error("Error fetching purchases:", err);
//           return res.status(500).json({ error: "Failed to fetch purchase data" });
//         }

//         db.query(executivePurchaseQuery, [from, to], (err, executiveResults) => {
//           if (err) {
//             console.error("Error fetching executive purchases:", err);
//             return res.status(500).json({ error: "Failed to fetch executive data" });
//           }

//           const totalIncome = parseFloat(incomeResults[0].totalIncome || 0);
//           const generalExpense = parseFloat(expenseResults[0].generalExpense || 0);
//           const manualExecutiveSalary = parseFloat(expenseResults[0].manualExecutiveSalary || 0);
//           const totalPurchase = parseFloat(purchaseResults[0].totalPurchase || 0);
          
//           // Calculate executive salary based on purchase count
//           const salaryPerPurchase = 50; // ₹50 per purchase - You can change this
//           let executiveSalaryFromPurchases = 0;
//           const executiveDetails = executiveResults.map(exec => {
//             const salary = exec.purchaseCount * salaryPerPurchase;
//             executiveSalaryFromPurchases += salary;
//             return {
//               username: exec.username,
//               purchaseCount: exec.purchaseCount,
//               totalPurchaseAmount: parseFloat(exec.totalPurchaseAmount || 0),
//               salary: salary,
//               salaryPerPurchase: salaryPerPurchase
//             };
//           });

//           // Total expenses = general + purchases + executive salaries (both manual and calculated)
//           const totalExpense = generalExpense + totalPurchase + executiveSalaryFromPurchases + manualExecutiveSalary;
//           const profit = totalIncome - totalExpense;

//           res.json({
//             totalIncome: totalIncome,
//             totalExpense: totalExpense,
//             profit: profit,
//             expenseBreakdown: {
//               purchase: totalPurchase,
//               executiveSalary: executiveSalaryFromPurchases + manualExecutiveSalary,
//               general: generalExpense
//             },
//             executiveDetails: executiveDetails,
//             purchaseStats: {
//               totalPurchases: purchaseResults[0].totalPurchaseCount,
//               totalAmount: totalPurchase
//             }
//           });
//         });
//       });
//     });
//   });
// });

// // Get category summary
// router.get("/summary/category", (req, res) => {
//   const { from, to } = req.query;
  
//   if (!from || !to) {
//     return res.status(400).json({ error: "From and To dates are required" });
//   }

//   const query = `
//     SELECT 
//       category,
//       COUNT(*) as transactionCount,
//       SUM(amount) as totalAmount
//     FROM transactions
//     WHERE type = 'expense' AND date BETWEEN ? AND ?
//     GROUP BY category
//     ORDER BY totalAmount DESC
//   `;

//   db.query(query, [from, to], (err, results) => {
//     if (err) {
//       console.error("Error fetching category summary:", err);
//       return res.status(500).json({ error: "Failed to fetch category summary" });
//     }
//     res.json(results);
//   });
// });

// module.exports = router;


// const express = require("express");
// const db = require("../config/db");
// const router = express.Router();

// // Get all transactions
// router.get("/", (req, res) => {
//   const query = "SELECT * FROM transactions ORDER BY date DESC";
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching transactions:", err);
//       return res.status(500).json({ error: "Failed to fetch transactions" });
//     }
//     res.json(results);
//   });
// });

// // Add a new transaction
// router.post("/", (req, res) => {
//   const { date, reason, amount, type, category } = req.body;
  
//   if (!date || !reason || !amount || !type) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   const query = "INSERT INTO transactions (date, reason, amount, type, category) VALUES (?, ?, ?, ?, ?)";
//   db.query(query, [date, reason, amount, type, category || 'general'], (err, result) => {
//     if (err) {
//       console.error("Error adding transaction:", err);
//       return res.status(500).json({ error: "Failed to add transaction" });
//     }
//     res.status(201).json({ id: result.insertId, message: "Transaction added successfully" });
//   });
// });

// // Update a transaction
// router.put("/:id", (req, res) => {
//   const { id } = req.params;
//   const { date, reason, amount, type, category } = req.body;

//   const query = "UPDATE transactions SET date = ?, reason = ?, amount = ?, type = ?, category = ? WHERE id = ?";
//   db.query(query, [date, reason, amount, type, category || 'general', id], (err, result) => {
//     if (err) {
//       console.error("Error updating transaction:", err);
//       return res.status(500).json({ error: "Failed to update transaction" });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Transaction not found" });
//     }
//     res.json({ message: "Transaction updated successfully" });
//   });
// });

// // Delete a transaction
// router.delete("/:id", (req, res) => {
//   const { id } = req.params;
//   const query = "DELETE FROM transactions WHERE id = ?";
  
//   db.query(query, [id], (err, result) => {
//     if (err) {
//       console.error("Error deleting transaction:", err);
//       return res.status(500).json({ error: "Failed to delete transaction" });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Transaction not found" });
//     }
//     res.json({ message: "Transaction deleted successfully" });
//   });
// });

// // Calculate profit with purchase and executive salary from their respective tables
// // PROFIT = INCOME - (GENERAL EXPENSES + PURCHASES FROM SELLERS + EXECUTIVE SALARIES)
// router.get("/profit", (req, res) => {
//   const { from, to } = req.query;
  
//   if (!from || !to) {
//     return res.status(400).json({ error: "From and To dates are required" });
//   }

//   // 1. Get total income from bills (customers kitta neenga vikkardhu)
//   const incomeQuery = `
//     SELECT COALESCE(SUM(total_amount), 0) as totalIncome
//     FROM bills
//     WHERE bill_date BETWEEN ? AND ?
//   `;

//   // 2. Get ONLY general expenses from transactions (general expenses)
//   const expenseQuery = `
//     SELECT 
//       COALESCE(SUM(amount), 0) as generalExpense
//     FROM transactions
//     WHERE type = 'expense' 
//       AND category = 'general'
//       AND date BETWEEN ? AND ?
//   `;

//   // 3. Get total purchase amount from purchases table (sellers kitta stock vaangardhu)
//   const purchaseQuery = `
//     SELECT 
//       COALESCE(SUM(total_amount), 0) as totalPurchase,
//       COUNT(*) as totalPurchaseCount
//     FROM purchases
//     WHERE purchase_date BETWEEN ? AND ?
//   `;

//   // 4. Get executive salary from executive_salaries table (employees ku salary)
//   const executiveSalaryQuery = `
//     SELECT 
//       username,
//       SUM(salary_amount) as totalSalary,
//       SUM(total_bills) as totalBills,
//       GROUP_CONCAT(DISTINCT salary_month ORDER BY salary_month) as months
//     FROM executive_salaries
//     WHERE date BETWEEN ? AND ?
//     GROUP BY username
//   `;

//   db.query(incomeQuery, [from, to], (err, incomeResults) => {
//     if (err) {
//       console.error("Error fetching income:", err);
//       return res.status(500).json({ error: "Failed to fetch income data" });
//     }

//     db.query(expenseQuery, [from, to], (err, expenseResults) => {
//       if (err) {
//         console.error("Error fetching expenses:", err);
//         return res.status(500).json({ error: "Failed to fetch expense data" });
//       }

//       db.query(purchaseQuery, [from, to], (err, purchaseResults) => {
//         if (err) {
//           console.error("Error fetching purchases:", err);
//           return res.status(500).json({ error: "Failed to fetch purchase data" });
//         }

//         db.query(executiveSalaryQuery, [from, to], (err, salaryResults) => {
//           if (err) {
//             console.error("Error fetching executive salaries:", err);
//             return res.status(500).json({ error: "Failed to fetch executive salary data" });
//           }

//           const totalIncome = parseFloat(incomeResults[0].totalIncome || 0);
//           const generalExpense = parseFloat(expenseResults[0].generalExpense || 0);
//           const totalPurchase = parseFloat(purchaseResults[0].totalPurchase || 0);
          
//           // Get total executive salary from executive_salaries table
//           let totalExecutiveSalary = 0;
//           const executiveDetails = salaryResults.map(exec => {
//             const salary = parseFloat(exec.totalSalary || 0);
//             totalExecutiveSalary += salary;
            
//             return {
//               username: exec.username,
//               salary: salary,
//               totalBills: exec.totalBills,
//               months: exec.months
//             };
//           });

//           // Total expenses = general + purchases (from sellers) + executive salaries
//           const totalExpense = generalExpense + totalPurchase + totalExecutiveSalary;
//           const profit = totalIncome - totalExpense;

//           res.json({
//             totalIncome: totalIncome,
//             totalExpense: totalExpense,
//             profit: profit,
//             expenseBreakdown: {
//               purchase: totalPurchase,              // Sellers kitta vaanguna amount
//               executiveSalary: totalExecutiveSalary, // Employees ku kudukura salary
//               general: generalExpense                // Migatha expenses
//             },
//             executiveDetails: executiveDetails,      // Employee-wise salary details
//             purchaseStats: {
//               totalPurchases: purchaseResults[0].totalPurchaseCount,
//               totalAmount: totalPurchase
//             },
//             dateRange: {
//               from: from,
//               to: to
//             }
//           });
//         });
//       });
//     });
//   });
// });

// // Get category summary
// router.get("/summary/category", (req, res) => {
//   const { from, to } = req.query;
  
//   if (!from || !to) {
//     return res.status(400).json({ error: "From and To dates are required" });
//   }

//   const query = `
//     SELECT 
//       category,
//       COUNT(*) as transactionCount,
//       SUM(amount) as totalAmount
//     FROM transactions
//     WHERE type = 'expense' AND date BETWEEN ? AND ?
//     GROUP BY category
//     ORDER BY totalAmount DESC
//   `;

//   db.query(query, [from, to], (err, results) => {
//     if (err) {
//       console.error("Error fetching category summary:", err);
//       return res.status(500).json({ error: "Failed to fetch category summary" });
//     }
//     res.json(results);
//   });
// });

// // Get income vs expense summary
// router.get("/summary/overview", (req, res) => {
//   const { from, to } = req.query;
  
//   if (!from || !to) {
//     return res.status(400).json({ error: "From and To dates are required" });
//   }

//   const query = `
//     SELECT 
//       type,
//       COUNT(*) as count,
//       SUM(amount) as total
//     FROM transactions
//     WHERE date BETWEEN ? AND ?
//     GROUP BY type
//   `;

//   db.query(query, [from, to], (err, results) => {
//     if (err) {
//       console.error("Error fetching overview summary:", err);
//       return res.status(500).json({ error: "Failed to fetch overview summary" });
//     }
    
//     const summary = {
//       income: 0,
//       expense: 0,
//       incomeCount: 0,
//       expenseCount: 0
//     };

//     results.forEach(row => {
//       if (row.type === 'income') {
//         summary.income = parseFloat(row.total || 0);
//         summary.incomeCount = row.count;
//       } else if (row.type === 'expense') {
//         summary.expense = parseFloat(row.total || 0);
//         summary.expenseCount = row.count;
//       }
//     });

//     summary.balance = summary.income - summary.expense;

//     res.json(summary);
//   });
// });

// module.exports = router;


const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Get all transactions
router.get("/", (req, res) => {
  const query = "SELECT * FROM transactions ORDER BY date DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }
    res.json(results);
  });
});

// Add a new transaction
router.post("/", (req, res) => {
  const { date, reason, amount, type, category } = req.body;
  
  if (!date || !reason || !amount || !type) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = "INSERT INTO transactions (date, reason, amount, type, category) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [date, reason, amount, type, category || 'general'], (err, result) => {
    if (err) {
      console.error("Error adding transaction:", err);
      return res.status(500).json({ error: "Failed to add transaction" });
    }
    res.status(201).json({ id: result.insertId, message: "Transaction added successfully" });
  });
});

// Update a transaction
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { date, reason, amount, type, category } = req.body;

  const query = "UPDATE transactions SET date = ?, reason = ?, amount = ?, type = ?, category = ? WHERE id = ?";
  db.query(query, [date, reason, amount, type, category || 'general', id], (err, result) => {
    if (err) {
      console.error("Error updating transaction:", err);
      return res.status(500).json({ error: "Failed to update transaction" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json({ message: "Transaction updated successfully" });
  });
});

// Delete a transaction
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM transactions WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      return res.status(500).json({ error: "Failed to delete transaction" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted successfully" });
  });
});

// Calculate profit with purchase and executive salary from their respective tables
// PROFIT = INCOME - (GENERAL EXPENSES + PURCHASES FROM SELLERS + EXECUTIVE SALARIES)
router.get("/profit", (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: "From and To dates are required" });
  }

  // 1. Get total income from bills (customers kitta neenga vikkardhu)
  const incomeQuery = `
    SELECT COALESCE(SUM(total_amount), 0) as totalIncome
    FROM bills
    WHERE bill_date BETWEEN ? AND ?
  `;

  // 2. Get ONLY general expenses from transactions (general expenses)
  const expenseQuery = `
    SELECT 
      COALESCE(SUM(amount), 0) as generalExpense
    FROM transactions
    WHERE type = 'expense' 
      AND category = 'general'
      AND date BETWEEN ? AND ?
  `;

  // 3. Get total purchase amount from purchases table (sellers kitta stock vaangardhu)
  const purchaseQuery = `
    SELECT 
      COALESCE(SUM(total_amount), 0) as totalPurchase,
      COUNT(*) as totalPurchaseCount
    FROM purchases
    WHERE purchase_date BETWEEN ? AND ?
  `;

  // 4. Get executive salary from executive_salaries table (employees ku salary)
  const executiveSalaryQuery = `
    SELECT 
      username,
      SUM(salary_amount) as totalSalary,
      SUM(total_bills) as totalBills
    FROM executive_salaries
    WHERE date BETWEEN ? AND ?
    GROUP BY username
  `;

  db.query(incomeQuery, [from, to], (err, incomeResults) => {
    if (err) {
      console.error("Error fetching income:", err);
      return res.status(500).json({ error: "Failed to fetch income data" });
    }

    db.query(expenseQuery, [from, to], (err, expenseResults) => {
      if (err) {
        console.error("Error fetching expenses:", err);
        return res.status(500).json({ error: "Failed to fetch expense data" });
      }

      db.query(purchaseQuery, [from, to], (err, purchaseResults) => {
        if (err) {
          console.error("Error fetching purchases:", err);
          return res.status(500).json({ error: "Failed to fetch purchase data" });
        }

        db.query(executiveSalaryQuery, [from, to], (err, salaryResults) => {
          if (err) {
            console.error("Error fetching executive salaries:", err);
            return res.status(500).json({ error: "Failed to fetch executive salary data" });
          }

          const totalIncome = parseFloat(incomeResults[0].totalIncome || 0);
          const generalExpense = parseFloat(expenseResults[0].generalExpense || 0);
          const totalPurchase = parseFloat(purchaseResults[0].totalPurchase || 0);
          
          // Get total executive salary from executive_salaries table
          let totalExecutiveSalary = 0;
          const executiveDetails = salaryResults.map(exec => {
            const salary = parseFloat(exec.totalSalary || 0);
            totalExecutiveSalary += salary;
            
            return {
              username: exec.username,
              totalBills: exec.totalBills || 0,
              salary: salary
            };
          });

          // Total expenses = general + purchases (from sellers) + executive salaries
          const totalExpense = generalExpense + totalPurchase + totalExecutiveSalary;
          const profit = totalIncome - totalExpense;

          res.json({
            totalIncome: totalIncome,
            totalExpense: totalExpense,
            profit: profit,
            expenseBreakdown: {
              purchase: totalPurchase,              // Sellers kitta vaanguna amount
              executiveSalary: totalExecutiveSalary, // Employees ku kudukura salary
              general: generalExpense                // Migatha expenses
            },
            executiveDetails: executiveDetails,      // Employee-wise salary details (name, bills, and amount)
            purchaseStats: {
              totalPurchases: purchaseResults[0].totalPurchaseCount,
              totalAmount: totalPurchase
            },
            dateRange: {
              from: from,
              to: to
            }
          });
        });
      });
    });
  });
});

// Get category summary
router.get("/summary/category", (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: "From and To dates are required" });
  }

  const query = `
    SELECT 
      category,
      COUNT(*) as transactionCount,
      SUM(amount) as totalAmount
    FROM transactions
    WHERE type = 'expense' AND date BETWEEN ? AND ?
    GROUP BY category
    ORDER BY totalAmount DESC
  `;

  db.query(query, [from, to], (err, results) => {
    if (err) {
      console.error("Error fetching category summary:", err);
      return res.status(500).json({ error: "Failed to fetch category summary" });
    }
    res.json(results);
  });
});

// Get income vs expense summary
router.get("/summary/overview", (req, res) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: "From and To dates are required" });
  }

  const query = `
    SELECT 
      type,
      COUNT(*) as count,
      SUM(amount) as total
    FROM transactions
    WHERE date BETWEEN ? AND ?
    GROUP BY type
  `;

  db.query(query, [from, to], (err, results) => {
    if (err) {
      console.error("Error fetching overview summary:", err);
      return res.status(500).json({ error: "Failed to fetch overview summary" });
    }
    
    const summary = {
      income: 0,
      expense: 0,
      incomeCount: 0,
      expenseCount: 0
    };

    results.forEach(row => {
      if (row.type === 'income') {
        summary.income = parseFloat(row.total || 0);
        summary.incomeCount = row.count;
      } else if (row.type === 'expense') {
        summary.expense = parseFloat(row.total || 0);
        summary.expenseCount = row.count;
      }
    });

    summary.balance = summary.income - summary.expense;

    res.json(summary);
  });
});

module.exports = router;
