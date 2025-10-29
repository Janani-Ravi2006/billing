// ============ routes/api.js (COMPLETE WITH LATEST BALANCE_DUE FIX) ============

const express = require("express");
const db = require("../config/db");
const router = express.Router();

// ==================== PRODUCT ROUTES ====================

// Get all products
router.get("/products", (req, res) => {
  const query = "SELECT * FROM products ORDER BY categoryName, productName";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.json(results);
  });
});

// ==================== CUSTOMER ROUTES (UPDATED) ====================

// Get all customers with LATEST bill's balance_due only
router.get("/customers", (req, res) => {
  const query = `
    SELECT 
      c.customer_id as id,
      c.customer_name as customerName,
      c.customer_phone as phone,
      COALESCE(
        (SELECT balance_due 
         FROM bills 
         WHERE customer_phone = c.customer_phone 
         ORDER BY bill_date DESC, bill_id DESC 
         LIMIT 1), 
        0
      ) as dueAmount,
      c.created_at,
      c.updated_at
    FROM customers c
    ORDER BY c.customer_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching customers:", err);
      return res.status(500).json({ error: "Failed to fetch customers" });
    }
    
    const formattedResults = results.map(customer => ({
      ...customer,
      dueAmount: parseFloat(customer.dueAmount) || 0
    }));
    
    console.log(`Fetched ${formattedResults.length} customers with latest balance_due`);
    res.json(formattedResults);
  });
});

// Get customer by phone number with LATEST bill's balance_due
router.get("/customers/:phone", (req, res) => {
  const phone = req.params.phone;
  
  const query = `
    SELECT 
      c.customer_id as id,
      c.customer_name as customerName,
      c.customer_phone as phone,
      COALESCE(
        (SELECT balance_due 
         FROM bills 
         WHERE customer_phone = ? 
         ORDER BY bill_date DESC, bill_id DESC 
         LIMIT 1), 
        0
      ) as dueAmount
    FROM customers c
    WHERE c.customer_phone = ?
  `;
  
  db.query(query, [phone, phone], (err, results) => {
    if (err) {
      console.error("Error fetching customer:", err);
      return res.status(500).json({ error: "Failed to fetch customer" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    const customer = {
      ...results[0],
      dueAmount: parseFloat(results[0].dueAmount) || 0
    };
    
    console.log("✓ Customer found with latest balance_due:", customer.dueAmount);
    res.json(customer);
  });
});

// ==================== BILL ROUTES ====================

// Get latest bill number
router.get("/bills/latest-bill-no", (req, res) => {
  const query = "SELECT MAX(bill_no) as latestBillNo FROM bills";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching latest bill number:", err);
      return res.status(500).json({ error: "Failed to fetch bill number" });
    }
    
    const latestBillNo = results[0].latestBillNo || 0;
    console.log("Latest bill number:", latestBillNo);
    res.json({ latestBillNo });
  });
});

// Save bill
router.post("/bills", (req, res) => {
  const {
    billNo,
    customerName,
    customerPhone,
    language,
    paymentMethod,
    paidAmount = 0,
    balanceDue = 0,
    items = [],
    dueItems = [],
    totalAmount,
    createdBy = 1
  } = req.body;

  console.log("=== SAVING BILL ===");
  console.log("Bill No:", billNo);
  console.log("Customer:", customerName, customerPhone);
  console.log("Total:", totalAmount, "Paid:", paidAmount, "Due:", balanceDue);
  console.log("Items:", items.length, "Due Items:", dueItems.length);

  if (!billNo || !customerName || !totalAmount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (items.length === 0) {
    return res.status(400).json({ error: "At least one item is required" });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Transaction error" });
    }

    const findCustomerQuery = "SELECT customer_id FROM customers WHERE customer_phone = ?";
    
    db.query(findCustomerQuery, [customerPhone], (err, customerResults) => {
      if (err) {
        return rollbackAndRespond("Error finding customer:", err);
      }

      let customerId = null;
      
      const saveBillData = () => {
        const insertBillQuery = `
          INSERT INTO bills (
            bill_no, customer_id, customer_name, customer_phone, 
            total_amount, paid_amount, balance_due,
            payment_method, language, bill_date, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
        `;
        
        db.query(
          insertBillQuery,
          [billNo, customerId, customerName, customerPhone, totalAmount, paidAmount, balanceDue, paymentMethod, language, createdBy],
          (err, result) => {
            if (err) {
              return rollbackAndRespond("Error saving bill:", err);
            }

            const billId = result.insertId;
            console.log("✓ Bill saved with ID:", billId);

            if (items && items.length > 0) {
              const insertItemQuery = `
                INSERT INTO bill_items (bill_id, product_id, product_name, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?, ?)
              `;

              let itemsCompleted = 0;
              let hasItemError = false;

              items.forEach(item => {
                db.query(
                  insertItemQuery,
                  [billId, item.product_id, item.productName, item.quantity, item.unitPrice, item.totalPrice],
                  (err) => {
                    if (err) {
                      console.error("Error saving bill item:", err);
                      hasItemError = true;
                    }
                    itemsCompleted++;
                    
                    if (itemsCompleted === items.length) {
                      if (hasItemError) {
                        return rollbackAndRespond("Error saving some bill items");
                      }
                      
                      console.log(`✓ Saved ${items.length} regular items`);
                      
                      if (dueItems && dueItems.length > 0) {
                        let dueItemsCompleted = 0;
                        let hasDueItemError = false;
                        
                        dueItems.forEach(dueItem => {
                          db.query(
                            insertItemQuery,
                            [billId, null, dueItem.productName, 1, dueItem.amount, dueItem.amount],
                            (err) => {
                              if (err) {
                                console.error("Error saving due item:", err);
                                hasDueItemError = true;
                              }
                              dueItemsCompleted++;
                              
                              if (dueItemsCompleted === dueItems.length) {
                                if (hasDueItemError) {
                                  return rollbackAndRespond("Error saving some due items");
                                }
                                console.log(`✓ Saved ${dueItems.length} due items`);
                                commitAndRespond(billId);
                              }
                            }
                          );
                        });
                      } else {
                        commitAndRespond(billId);
                      }
                    }
                  }
                );
              });
            } else {
              commitAndRespond(billId);
            }
          }
        );
      };

      if (customerResults.length > 0) {
        customerId = customerResults[0].customer_id;
        console.log("✓ Existing customer:", customerId);
        saveBillData();
      } else if (customerPhone) {
        const insertCustomerQuery = "INSERT INTO customers (customer_name, customer_phone) VALUES (?, ?)";
        db.query(insertCustomerQuery, [customerName, customerPhone], (err, result) => {
          if (err) {
            console.error("Error creating customer:", err);
            saveBillData();
          } else {
            customerId = result.insertId;
            console.log("✓ New customer created:", customerId);
            saveBillData();
          }
        });
      } else {
        saveBillData();
      }
    });

    function rollbackAndRespond(message, error = null) {
      if (error) console.error(message, error);
      db.rollback(() => {
        res.status(500).json({ error: message });
      });
    }

    function commitAndRespond(billId) {
      db.commit((err) => {
        if (err) {
          return rollbackAndRespond("Commit failed:", err);
        }
        console.log("✓ Bill transaction committed successfully");
        console.log("===================\n");
        res.json({ 
          message: "Bill saved successfully!", 
          billId,
          billNo 
        });
      });
    }
  });
});

// Update bill payment
router.put("/bills/:id/payment", (req, res) => {
  const billId = req.params.id;
  const { paidAmount, balanceDue, paymentMethod } = req.body;
  
  console.log("=== UPDATING PAYMENT ===");
  console.log("Bill ID:", billId);
  console.log("Paid:", paidAmount, "Balance Due:", balanceDue, "Method:", paymentMethod);
  
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Transaction error" });
    }

    const getBillQuery = "SELECT bill_id, customer_phone, total_amount FROM bills WHERE bill_id = ?";
    
    db.query(getBillQuery, [billId], (err, billResults) => {
      if (err || billResults.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: "Bill not found" });
        });
      }

      const customerPhone = billResults[0].customer_phone;
      const totalAmount = billResults[0].total_amount;
      const paidAmountNum = parseFloat(paidAmount) || 0;
      const totalAmountNum = parseFloat(totalAmount) || 0;
      
      const newBalanceDue = Math.max(0, totalAmountNum - paidAmountNum);
      
      console.log("Customer Phone:", customerPhone);
      console.log("Total:", totalAmountNum, "Paid:", paidAmountNum, "New Balance:", newBalanceDue);
      
      const updateBillQuery = `
        UPDATE bills 
        SET paid_amount = ?, balance_due = ?, payment_method = ?, updated_at = CURRENT_TIMESTAMP
        WHERE bill_id = ?
      `;
      
      db.query(updateBillQuery, [paidAmountNum, newBalanceDue, paymentMethod, billId], (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error updating bill:", err);
            res.status(500).json({ error: "Failed to update payment" });
          });
        }

        if (newBalanceDue === 0 && customerPhone) {
          console.log("✓ Bill fully paid! Clearing previous dues for customer:", customerPhone);
          
          const clearDuesQuery = `
            UPDATE bills 
            SET balance_due = 0, updated_at = CURRENT_TIMESTAMP
            WHERE customer_phone = ? AND balance_due > 0
          `;
          
          db.query(clearDuesQuery, [customerPhone], (err, updateResult) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error clearing previous dues:", err);
                res.status(500).json({ error: "Failed to clear previous dues" });
              });
            }

            console.log(`✓ Cleared ${updateResult.affectedRows} bills' dues`);

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Commit error:", err);
                  res.status(500).json({ error: "Failed to commit transaction" });
                });
              }
              
              console.log("✓ Payment updated successfully");
              console.log("✓ New balance_due:", newBalanceDue);
              console.log("✓ All customer dues cleared");
              console.log("===================\n");
              
              res.json({ 
                message: "Payment updated successfully. All dues cleared.",
                newBalance: newBalanceDue,
                paid: paidAmountNum,
                billsCleared: updateResult.affectedRows
              });
            });
          });
        } else if (newBalanceDue > 0) {
          console.log("✓ Partial payment. Previous dues remain.");
          
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Commit error:", err);
                res.status(500).json({ error: "Failed to commit transaction" });
              });
            }
            
            console.log("✓ Payment updated successfully");
            console.log("✓ New balance_due:", newBalanceDue);
            console.log("===================\n");
            
            res.json({ 
              message: "Payment updated successfully",
              newBalance: newBalanceDue,
              paid: paidAmountNum,
              billsCleared: 0
            });
          });
        } else {
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Commit error:", err);
                res.status(500).json({ error: "Failed to commit transaction" });
              });
            }
            
            console.log("✓ Payment updated successfully");
            console.log("===================\n");
            
            res.json({ 
              message: "Payment updated successfully",
              newBalance: newBalanceDue,
              paid: paidAmountNum
            });
          });
        }
      });
    });
  });
});

// Get all bills with items (FOR SALES REPORT)
router.get("/bills", (req, res) => {
  const billsQuery = `
    SELECT 
      b.bill_id,
      b.bill_no,
      b.customer_id,
      b.customer_name,
      b.customer_phone,
      b.total_amount,
      b.paid_amount,
      b.balance_due,
      b.payment_method,
      b.language,
      b.bill_date,
      b.created_at,
      b.updated_at,
      u.username as created_by_username
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.id
    ORDER BY b.bill_date DESC, b.bill_no DESC
  `;

  db.query(billsQuery, (err, bills) => {
    if (err) {
      console.error("Error fetching bills:", err);
      return res.status(500).json({ error: "Failed to fetch bills" });
    }

    if (bills.length === 0) {
      return res.json([]);
    }

    console.log(`Fetched ${bills.length} bills, fetching items...`);

    let completedBills = 0;
    const billsWithItems = [];

    bills.forEach((bill, index) => {
      const itemsQuery = `
        SELECT 
          bi.bill_item_id,
          bi.bill_id,
          bi.product_id,
          bi.product_name,
          bi.quantity,
          bi.unit_price,
          bi.total_price,
          p.categoryName,
          p.unitOfMeasurement,
          p.hsnCode
        FROM bill_items bi
        LEFT JOIN products p ON bi.product_id = p.product_id
        WHERE bi.bill_id = ?
      `;

      db.query(itemsQuery, [bill.bill_id], (err, items) => {
        if (err) {
          console.error(`Error fetching items for bill ${bill.bill_id}:`, err);
          items = [];
        }

        billsWithItems[index] = {
          ...bill,
          bill_items: items || []
        };

        completedBills++;

        if (completedBills === bills.length) {
          console.log("✓ All bills fetched with items");
          res.json(billsWithItems);
        }
      });
    });
  });
});

// Get bill by ID with items
router.get("/bills/:id", (req, res) => {
  const billId = req.params.id;
  
  const billQuery = `
    SELECT 
      b.*,
      c.customer_name,
      c.customer_phone,
      u.username as created_by_username
    FROM bills b 
    LEFT JOIN customers c ON b.customer_id = c.customer_id 
    LEFT JOIN users u ON b.created_by = u.id
    WHERE b.bill_id = ?
  `;
  
  const itemsQuery = `
    SELECT 
      bi.*,
      p.categoryName,
      p.unitOfMeasurement 
    FROM bill_items bi 
    LEFT JOIN products p ON bi.product_id = p.product_id 
    WHERE bi.bill_id = ?
  `;
  
  db.query(billQuery, [billId], (err, billResults) => {
    if (err) {
      console.error("Error fetching bill:", err);
      return res.status(500).json({ error: "Failed to fetch bill" });
    }
    
    if (billResults.length === 0) {
      return res.status(404).json({ error: "Bill not found" });
    }
    
    db.query(itemsQuery, [billId], (err, itemResults) => {
      if (err) {
        console.error("Error fetching bill items:", err);
        return res.status(500).json({ error: "Failed to fetch bill items" });
      }
      
      res.json({
        bill: billResults[0],
        items: itemResults
      });
    });
  });
});

// Get bills by customer phone with items
router.get("/bills/customer/:phone", (req, res) => {
  const phone = req.params.phone;
  
  console.log("=== FETCHING CUSTOMER BILLS ===");
  console.log("Phone:", phone);
  
  const billsQuery = `
    SELECT 
      b.*,
      u.username as created_by_username
    FROM bills b
    LEFT JOIN users u ON b.created_by = u.id
    WHERE b.customer_phone = ?
    ORDER BY b.bill_date DESC, b.bill_no DESC
  `;
  
  db.query(billsQuery, [phone], (err, bills) => {
    if (err) {
      console.error("Error fetching customer bills:", err);
      return res.status(500).json({ error: "Failed to fetch customer bills" });
    }
    
    if (bills.length === 0) {
      console.log("No bills found for this customer");
      return res.json([]);
    }
    
    console.log(`Found ${bills.length} bills`);
    
    let completedBills = 0;
    const billsWithItems = [];
    
    bills.forEach((bill, index) => {
      const itemsQuery = `
        SELECT 
          bi.*,
          p.categoryName,
          p.unitOfMeasurement,
          p.hsnCode
        FROM bill_items bi 
        LEFT JOIN products p ON bi.product_id = p.product_id 
        WHERE bi.bill_id = ?
      `;
      
      db.query(itemsQuery, [bill.bill_id], (err, items) => {
        if (err) {
          console.error("Error fetching items for bill:", bill.bill_id, err);
          items = [];
        }
        
        console.log(`Bill #${bill.bill_no} has ${items.length} items`);
        
        billsWithItems[index] = {
          ...bill,
          items: items
        };
        
        completedBills++;
        
        if (completedBills === bills.length) {
          console.log("✓ All bills fetched with items");
          console.log("===================\n");
          res.json(billsWithItems);
        }
      });
    });
  });
});

// Delete bill
router.delete("/bills/:id", (req, res) => {
  const billId = req.params.id;
  
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err);
      return res.status(500).json({ error: "Transaction error" });
    }
    
    const deleteItemsQuery = "DELETE FROM bill_items WHERE bill_id = ?";
    
    db.query(deleteItemsQuery, [billId], (err) => {
      if (err) {
        db.rollback(() => {
          console.error("Error deleting bill items:", err);
          res.status(500).json({ error: "Failed to delete bill items" });
        });
        return;
      }
      
      const deleteBillQuery = "DELETE FROM bills WHERE bill_id = ?";
      
      db.query(deleteBillQuery, [billId], (err, result) => {
        if (err) {
          db.rollback(() => {
            console.error("Error deleting bill:", err);
            res.status(500).json({ error: "Failed to delete bill" });
          });
          return;
        }
        
        if (result.affectedRows === 0) {
          db.rollback(() => {
            res.status(404).json({ error: "Bill not found" });
          });
          return;
        }
        
        db.commit((err) => {
          if (err) {
            db.rollback(() => {
              console.error("Commit error:", err);
              res.status(500).json({ error: "Failed to delete bill" });
            });
            return;
          }
          
          console.log("✓ Bill deleted successfully:", billId);
          res.json({ message: "Bill deleted successfully" });
        });
      });
    });
  });
});

// ==================== SALES REPORT ROUTES ====================

// Get sales report summary
router.get("/sales-report/summary", (req, res) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  let dateFilter = "";
  const params = [];

  if (startDate && endDate) {
    endDate.setHours(23, 59, 59, 999);
    dateFilter = "WHERE b.bill_date BETWEEN ? AND ?";
    params.push(startDate.toISOString().split("T")[0]);
    params.push(endDate.toISOString().split("T")[0]);
  }

  const query = `
    SELECT 
      COUNT(DISTINCT b.bill_id) as totalBills,
      SUM(b.total_amount) as totalRevenue,
      SUM(bi.quantity) as totalQuantity,
      COUNT(DISTINCT p.categoryName) as categoryCount,
      AVG(b.total_amount) as avgOrderValue
    FROM bills b
    LEFT JOIN bill_items bi ON b.bill_id = bi.bill_id
    LEFT JOIN products p ON bi.product_id = p.product_id
    ${dateFilter}
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching sales summary:", err);
      return res.status(500).json({ error: "Failed to fetch sales summary" });
    }

    const summary = {
      totalBills: results[0].totalBills || 0,
      totalRevenue: parseFloat(results[0].totalRevenue) || 0,
      totalQuantity: parseFloat(results[0].totalQuantity) || 0,
      categoryCount: results[0].categoryCount || 0,
      avgOrderValue: parseFloat(results[0].avgOrderValue) || 0
    };

    res.json(summary);
  });
});

// Get top products
router.get("/sales-report/top-products", (req, res) => {
  const limit = req.query.limit || 10;
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  let dateFilter = "";
  const params = [];

  if (startDate && endDate) {
    endDate.setHours(23, 59, 59, 999);
    dateFilter = "WHERE b.bill_date BETWEEN ? AND ?";
    params.push(startDate.toISOString().split("T")[0]);
    params.push(endDate.toISOString().split("T")[0]);
  }

  params.push(parseInt(limit));

  const query = `
    SELECT 
      p.productName,
      p.categoryName,
      SUM(bi.quantity) as totalQuantity,
      SUM(bi.total_price) as totalRevenue,
      COUNT(bi.bill_item_id) as unitsSold,
      AVG(bi.unit_price) as avgPrice
    FROM bill_items bi
    LEFT JOIN products p ON bi.product_id = p.product_id
    LEFT JOIN bills b ON bi.bill_id = b.bill_id
    WHERE p.productName IS NOT NULL
    ${dateFilter}
    GROUP BY p.productName, p.categoryName
    ORDER BY totalRevenue DESC
    LIMIT ?
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching top products:", err);
      return res.status(500).json({ error: "Failed to fetch top products" });
    }

    res.json(results);
  });
});

// Get category-wise sales
router.get("/sales-report/categories", (req, res) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  let dateFilter = "";
  const params = [];

  if (startDate && endDate) {
    endDate.setHours(23, 59, 59, 999);
    dateFilter = "WHERE b.bill_date BETWEEN ? AND ?";
    params.push(startDate.toISOString().split("T")[0]);
    params.push(endDate.toISOString().split("T")[0]);
  }

  const query = `
    SELECT 
      p.categoryName as name,
      SUM(bi.quantity) as quantity,
      SUM(bi.total_price) as revenue,
      COUNT(DISTINCT bi.bill_item_id) as itemCount
    FROM bill_items bi
    LEFT JOIN products p ON bi.product_id = p.product_id
    LEFT JOIN bills b ON bi.bill_id = b.bill_id
    ${dateFilter}
    GROUP BY p.categoryName
    ORDER BY revenue DESC
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching category sales:", err);
      return res.status(500).json({ error: "Failed to fetch category sales" });
    }

    res.json(results);
  });
});

// Get daily sales trend
router.get("/sales-report/daily", (req, res) => {
  const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

  let dateFilter = "";
  const params = [];

  if (startDate && endDate) {
    endDate.setHours(23, 59, 59, 999);
    dateFilter = "WHERE b.bill_date BETWEEN ? AND ?";
    params.push(startDate.toISOString().split("T")[0]);
    params.push(endDate.toISOString().split("T")[0]);
  }

  const query = `
    SELECT 
      b.bill_date as date,
      COUNT(DISTINCT b.bill_id) as bills,
      SUM(b.total_amount) as revenue,
      SUM(bi.quantity) as quantity
    FROM bills b
    LEFT JOIN bill_items bi ON b.bill_id = bi.bill_id
    ${dateFilter}
    GROUP BY b.bill_date
    ORDER BY b.bill_date ASC
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching daily sales:", err);
      return res.status(500).json({ error: "Failed to fetch daily sales" });
    }

    res.json(results);
  });
});

module.exports = router;


// ============ routes/api.js (COMPLETE WITH HSN FILTER FOR CUSTOMERS) ============

// ============ routes/api.js (COMPLETE WITH HSN FILTER - FINAL VERSION) ============

// const express = require("express");
// const db = require("../config/db");
// const router = express.Router();

// // ==================== PRODUCT ROUTES ====================

// // Get all products
// router.get("/products", (req, res) => {
//   const query = "SELECT * FROM products ORDER BY categoryName, productName";
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching products:", err);
//       return res.status(500).json({ error: "Failed to fetch products" });
//     }
//     res.json(results);
//   });
// });

// // ==================== CUSTOMER ROUTES (STRICT HSN FILTER) ====================

// // Get ONLY customers who purchased products WITH HSN code
// router.get("/customers", (req, res) => {
//   const query = `
//     SELECT 
//       c.customer_id as id,
//       c.customer_name as customerName,
//       c.customer_phone as phone,
//       COALESCE(
//         (SELECT balance_due 
//          FROM bills 
//          WHERE customer_phone = c.customer_phone 
//          ORDER BY bill_date DESC, bill_id DESC 
//          LIMIT 1), 
//         0
//       ) as dueAmount,
//       c.created_at,
//       c.updated_at
//     FROM customers c
//     WHERE EXISTS (
//       SELECT 1 
//       FROM bills b
//       INNER JOIN bill_items bi ON b.bill_id = bi.bill_id
//       INNER JOIN products p ON bi.product_id = p.product_id
//       WHERE b.customer_phone = c.customer_phone
//       AND bi.product_id IS NOT NULL
//       AND p.hsnCode IS NOT NULL 
//       AND TRIM(p.hsnCode) != ''
//     )
//     ORDER BY c.customer_name
//   `;
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching customers:", err);
//       return res.status(500).json({ error: "Failed to fetch customers" });
//     }
    
//     const formattedResults = results.map(customer => ({
//       ...customer,
//       dueAmount: parseFloat(customer.dueAmount) || 0
//     }));
    
//     console.log(`✅ Fetched ${formattedResults.length} customers with HSN product purchases ONLY`);
//     console.log("Customers:", formattedResults.map(c => `${c.customerName} (${c.phone})`).join(", "));
//     res.json(formattedResults);
//   });
// });

// // Get customer by phone - ONLY if they purchased products with HSN code
// router.get("/customers/:phone", (req, res) => {
//   const phone = req.params.phone;
  
//   const query = `
//     SELECT 
//       c.customer_id as id,
//       c.customer_name as customerName,
//       c.customer_phone as phone,
//       COALESCE(
//         (SELECT balance_due 
//          FROM bills 
//          WHERE customer_phone = ? 
//          ORDER BY bill_date DESC, bill_id DESC 
//          LIMIT 1), 
//         0
//       ) as dueAmount
//     FROM customers c
//     WHERE c.customer_phone = ?
//     AND EXISTS (
//       SELECT 1 
//       FROM bills b
//       INNER JOIN bill_items bi ON b.bill_id = bi.bill_id
//       INNER JOIN products p ON bi.product_id = p.product_id
//       WHERE b.customer_phone = ?
//       AND bi.product_id IS NOT NULL
//       AND p.hsnCode IS NOT NULL 
//       AND TRIM(p.hsnCode) != ''
//     )
//   `;
  
//   db.query(query, [phone, phone, phone], (err, results) => {
//     if (err) {
//       console.error("❌ Error fetching customer:", err);
//       return res.status(500).json({ error: "Failed to fetch customer" });
//     }
    
//     if (results.length === 0) {
//       console.log(`❌ Customer ${phone} not found or has NO HSN product purchases`);
//       return res.status(404).json({ error: "Customer not found or has no HSN product purchases" });
//     }
    
//     const customer = {
//       ...results[0],
//       dueAmount: parseFloat(results[0].dueAmount) || 0
//     };
    
//     console.log(`✅ Customer ${customer.customerName} found with HSN products, balance_due:`, customer.dueAmount);
//     res.json(customer);
//   });
// });

// // ==================== BILL ROUTES ====================

// // Get latest bill number
// router.get("/bills/latest-bill-no", (req, res) => {
//   const query = "SELECT MAX(bill_no) as latestBillNo FROM bills";
  
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching latest bill number:", err);
//       return res.status(500).json({ error: "Failed to fetch bill number" });
//     }
    
//     const latestBillNo = results[0].latestBillNo || 0;
//     console.log("Latest bill number:", latestBillNo);
//     res.json({ latestBillNo });
//   });
// });

// // Save bill
// router.post("/bills", (req, res) => {
//   const {
//     billNo,
//     customerName,
//     customerPhone,
//     language,
//     paymentMethod,
//     paidAmount = 0,
//     balanceDue = 0,
//     items = [],
//     dueItems = [],
//     totalAmount,
//     createdBy = 1
//   } = req.body;

//   console.log("=== SAVING BILL ===");
//   console.log("Bill No:", billNo);
//   console.log("Customer:", customerName, customerPhone);
//   console.log("Total:", totalAmount, "Paid:", paidAmount, "Due:", balanceDue);
//   console.log("Items:", items.length, "Due Items:", dueItems.length);

//   if (!billNo || !customerName || !totalAmount) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   if (items.length === 0) {
//     return res.status(400).json({ error: "At least one item is required" });
//   }

//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction error:", err);
//       return res.status(500).json({ error: "Transaction error" });
//     }

//     const findCustomerQuery = "SELECT customer_id FROM customers WHERE customer_phone = ?";
    
//     db.query(findCustomerQuery, [customerPhone], (err, customerResults) => {
//       if (err) {
//         return rollbackAndRespond("Error finding customer:", err);
//       }

//       let customerId = null;
      
//       const saveBillData = () => {
//         const insertBillQuery = `
//           INSERT INTO bills (
//             bill_no, customer_id, customer_name, customer_phone, 
//             total_amount, paid_amount, balance_due,
//             payment_method, language, bill_date, created_by
//           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
//         `;
        
//         db.query(
//           insertBillQuery,
//           [billNo, customerId, customerName, customerPhone, totalAmount, paidAmount, balanceDue, paymentMethod, language, createdBy],
//           (err, result) => {
//             if (err) {
//               return rollbackAndRespond("Error saving bill:", err);
//             }

//             const billId = result.insertId;
//             console.log("✓ Bill saved with ID:", billId);

//             if (items && items.length > 0) {
//               const insertItemQuery = `
//                 INSERT INTO bill_items (bill_id, product_id, product_name, quantity, unit_price, total_price)
//                 VALUES (?, ?, ?, ?, ?, ?)
//               `;

//               let itemsCompleted = 0;
//               let hasItemError = false;

//               items.forEach(item => {
//                 db.query(
//                   insertItemQuery,
//                   [billId, item.product_id, item.productName, item.quantity, item.unitPrice, item.totalPrice],
//                   (err) => {
//                     if (err) {
//                       console.error("Error saving bill item:", err);
//                       hasItemError = true;
//                     }
//                     itemsCompleted++;
                    
//                     if (itemsCompleted === items.length) {
//                       if (hasItemError) {
//                         return rollbackAndRespond("Error saving some bill items");
//                       }
                      
//                       console.log(`✓ Saved ${items.length} regular items`);
                      
//                       if (dueItems && dueItems.length > 0) {
//                         let dueItemsCompleted = 0;
//                         let hasDueItemError = false;
                        
//                         dueItems.forEach(dueItem => {
//                           db.query(
//                             insertItemQuery,
//                             [billId, null, dueItem.productName, 1, dueItem.amount, dueItem.amount],
//                             (err) => {
//                               if (err) {
//                                 console.error("Error saving due item:", err);
//                                 hasDueItemError = true;
//                               }
//                               dueItemsCompleted++;
                              
//                               if (dueItemsCompleted === dueItems.length) {
//                                 if (hasDueItemError) {
//                                   return rollbackAndRespond("Error saving some due items");
//                                 }
//                                 console.log(`✓ Saved ${dueItems.length} due items`);
//                                 commitAndRespond(billId);
//                               }
//                             }
//                           );
//                         });
//                       } else {
//                         commitAndRespond(billId);
//                       }
//                     }
//                   }
//                 );
//               });
//             } else {
//               commitAndRespond(billId);
//             }
//           }
//         );
//       };

//       if (customerResults.length > 0) {
//         customerId = customerResults[0].customer_id;
//         console.log("✓ Existing customer:", customerId);
//         saveBillData();
//       } else if (customerPhone) {
//         const insertCustomerQuery = "INSERT INTO customers (customer_name, customer_phone) VALUES (?, ?)";
//         db.query(insertCustomerQuery, [customerName, customerPhone], (err, result) => {
//           if (err) {
//             console.error("Error creating customer:", err);
//             saveBillData();
//           } else {
//             customerId = result.insertId;
//             console.log("✓ New customer created:", customerId);
//             saveBillData();
//           }
//         });
//       } else {
//         saveBillData();
//       }
//     });

//     function rollbackAndRespond(message, error = null) {
//       if (error) console.error(message, error);
//       db.rollback(() => {
//         res.status(500).json({ error: message });
//       });
//     }

//     function commitAndRespond(billId) {
//       db.commit((err) => {
//         if (err) {
//           return rollbackAndRespond("Commit failed:", err);
//         }
//         console.log("✓ Bill transaction committed successfully");
//         console.log("===================\n");
//         res.json({ 
//           message: "Bill saved successfully!", 
//           billId,
//           billNo 
//         });
//       });
//     }
//   });
// });

// // Update bill payment
// router.put("/bills/:id/payment", (req, res) => {
//   const billId = req.params.id;
//   const { paidAmount, balanceDue, paymentMethod } = req.body;
  
//   console.log("=== UPDATING PAYMENT ===");
//   console.log("Bill ID:", billId);
//   console.log("Paid:", paidAmount, "Balance Due:", balanceDue, "Method:", paymentMethod);
  
//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction error:", err);
//       return res.status(500).json({ error: "Transaction error" });
//     }

//     const getBillQuery = "SELECT bill_id, customer_phone, total_amount FROM bills WHERE bill_id = ?";
    
//     db.query(getBillQuery, [billId], (err, billResults) => {
//       if (err || billResults.length === 0) {
//         return db.rollback(() => {
//           res.status(404).json({ error: "Bill not found" });
//         });
//       }

//       const customerPhone = billResults[0].customer_phone;
//       const totalAmount = billResults[0].total_amount;
//       const paidAmountNum = parseFloat(paidAmount) || 0;
//       const totalAmountNum = parseFloat(totalAmount) || 0;
      
//       const newBalanceDue = Math.max(0, totalAmountNum - paidAmountNum);
      
//       console.log("Customer Phone:", customerPhone);
//       console.log("Total:", totalAmountNum, "Paid:", paidAmountNum, "New Balance:", newBalanceDue);
      
//       const updateBillQuery = `
//         UPDATE bills 
//         SET paid_amount = ?, balance_due = ?, payment_method = ?, updated_at = CURRENT_TIMESTAMP
//         WHERE bill_id = ?
//       `;
      
//       db.query(updateBillQuery, [paidAmountNum, newBalanceDue, paymentMethod, billId], (err, result) => {
//         if (err) {
//           return db.rollback(() => {
//             console.error("Error updating bill:", err);
//             res.status(500).json({ error: "Failed to update payment" });
//           });
//         }

//         if (newBalanceDue === 0 && customerPhone) {
//           console.log("✓ Bill fully paid! Clearing previous dues for customer:", customerPhone);
          
//           const clearDuesQuery = `
//             UPDATE bills 
//             SET balance_due = 0, updated_at = CURRENT_TIMESTAMP
//             WHERE customer_phone = ? AND balance_due > 0
//           `;
          
//           db.query(clearDuesQuery, [customerPhone], (err, updateResult) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Error clearing previous dues:", err);
//                 res.status(500).json({ error: "Failed to clear previous dues" });
//               });
//             }

//             console.log(`✓ Cleared ${updateResult.affectedRows} bills' dues`);

//             db.commit((err) => {
//               if (err) {
//                 return db.rollback(() => {
//                   console.error("Commit error:", err);
//                   res.status(500).json({ error: "Failed to commit transaction" });
//                 });
//               }
              
//               console.log("✓ Payment updated successfully");
//               console.log("✓ New balance_due:", newBalanceDue);
//               console.log("✓ All customer dues cleared");
//               console.log("===================\n");
              
//               res.json({ 
//                 message: "Payment updated successfully. All dues cleared.",
//                 newBalance: newBalanceDue,
//                 paid: paidAmountNum,
//                 billsCleared: updateResult.affectedRows
//               });
//             });
//           });
//         } else if (newBalanceDue > 0) {
//           console.log("✓ Partial payment. Previous dues remain.");
          
//           db.commit((err) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Commit error:", err);
//                 res.status(500).json({ error: "Failed to commit transaction" });
//               });
//             }
            
//             console.log("✓ Payment updated successfully");
//             console.log("✓ New balance_due:", newBalanceDue);
//             console.log("===================\n");
            
//             res.json({ 
//               message: "Payment updated successfully",
//               newBalance: newBalanceDue,
//               paid: paidAmountNum,
//               billsCleared: 0
//             });
//           });
//         } else {
//           db.commit((err) => {
//             if (err) {
//               return db.rollback(() => {
//                 console.error("Commit error:", err);
//                 res.status(500).json({ error: "Failed to commit transaction" });
//               });
//             }
            
//             console.log("✓ Payment updated successfully");
//             console.log("===================\n");
            
//             res.json({ 
//               message: "Payment updated successfully",
//               newBalance: newBalanceDue,
//               paid: paidAmountNum
//             });
//           });
//         }
//       });
//     });
//   });
// });

// // Get all bills with items (FOR SALES REPORT)
// router.get("/bills", (req, res) => {
//   const billsQuery = `
//     SELECT 
//       b.bill_id,
//       b.bill_no,
//       b.customer_id,
//       b.customer_name,
//       b.customer_phone,
//       b.total_amount,
//       b.paid_amount,
//       b.balance_due,
//       b.payment_method,
//       b.language,
//       b.bill_date,
//       b.created_at,
//       b.updated_at,
//       u.username as created_by_username
//     FROM bills b
//     LEFT JOIN users u ON b.created_by = u.id
//     ORDER BY b.bill_date DESC, b.bill_no DESC
//   `;

//   db.query(billsQuery, (err, bills) => {
//     if (err) {
//       console.error("Error fetching bills:", err);
//       return res.status(500).json({ error: "Failed to fetch bills" });
//     }

//     if (bills.length === 0) {
//       return res.json([]);
//     }

//     console.log(`Fetched ${bills.length} bills, fetching items...`);

//     let completedBills = 0;
//     const billsWithItems = [];

//     bills.forEach((bill, index) => {
//       const itemsQuery = `
//         SELECT 
//           bi.bill_item_id,
//           bi.bill_id,
//           bi.product_id,
//           bi.product_name,
//           bi.quantity,
//           bi.unit_price,
//           bi.total_price,
//           p.categoryName,
//           p.unitOfMeasurement,
//           p.hsnCode
//         FROM bill_items bi
//         LEFT JOIN products p ON bi.product_id = p.product_id
//         WHERE bi.bill_id = ?
//       `;

//       db.query(itemsQuery, [bill.bill_id], (err, items) => {
//         if (err) {
//           console.error(`Error fetching items for bill ${bill.bill_id}:`, err);
//           items = [];
//         }

//         billsWithItems[index] = {
//           ...bill,
//           bill_items: items || []
//         };

//         completedBills++;

//         if (completedBills === bills.length) {
//           console.log("✓ All bills fetched with items");
//           res.json(billsWithItems);
//         }
//       });
//     });
//   });
// });

// // Get bill by ID with items
// router.get("/bills/:id", (req, res) => {
//   const billId = req.params.id;
  
//   const billQuery = `
//     SELECT 
//       b.*,
//       c.customer_name,
//       c.customer_phone,
//       u.username as created_by_username
//     FROM bills b 
//     LEFT JOIN customers c ON b.customer_id = c.customer_id 
//     LEFT JOIN users u ON b.created_by = u.id
//     WHERE b.bill_id = ?
//   `;
  
//   const itemsQuery = `
//     SELECT 
//       bi.*,
//       p.categoryName,
//       p.unitOfMeasurement 
//     FROM bill_items bi 
//     LEFT JOIN products p ON bi.product_id = p.product_id 
//     WHERE bi.bill_id = ?
//   `;
  
//   db.query(billQuery, [billId], (err, billResults) => {
//     if (err) {
//       console.error("Error fetching bill:", err);
//       return res.status(500).json({ error: "Failed to fetch bill" });
//     }
    
//     if (billResults.length === 0) {
//       return res.status(404).json({ error: "Bill not found" });
//     }
    
//     db.query(itemsQuery, [billId], (err, itemResults) => {
//       if (err) {
//         console.error("Error fetching bill items:", err);
//         return res.status(500).json({ error: "Failed to fetch bill items" });
//       }
      
//       res.json({
//         bill: billResults[0],
//         items: itemResults
//       });
//     });
//   });
// });

// // Get bills by customer phone with items
// router.get("/bills/customer/:phone", (req, res) => {
//   const phone = req.params.phone;
  
//   console.log("=== FETCHING CUSTOMER BILLS ===");
//   console.log("Phone:", phone);
  
//   const billsQuery = `
//     SELECT 
//       b.*,
//       u.username as created_by_username
//     FROM bills b
//     LEFT JOIN users u ON b.created_by = u.id
//     WHERE b.customer_phone = ?
//     ORDER BY b.bill_date DESC, b.bill_no DESC
//   `;
  
//   db.query(billsQuery, [phone], (err, bills) => {
//     if (err) {
//       console.error("Error fetching customer bills:", err);
//       return res.status(500).json({ error: "Failed to fetch customer bills" });
//     }
    
//     if (bills.length === 0) {
//       console.log("No bills found for this customer");
//       return res.json([]);
//     }
    
//     console.log(`Found ${bills.length} bills`);
    
//     let completedBills = 0;
//     const billsWithItems = [];
    
//     bills.forEach((bill, index) => {
//       const itemsQuery = `
//         SELECT 
//           bi.*,
//           p.categoryName,
//           p.unitOfMeasurement,
//           p.hsnCode
//         FROM bill_items bi 
//         LEFT JOIN products p ON bi.product_id = p.product_id 
//         WHERE bi.bill_id = ?
//       `;
      
//       db.query(itemsQuery, [bill.bill_id], (err, items) => {
//         if (err) {
//           console.error("Error fetching items for bill:", bill.bill_id, err);
//           items = [];
//         }
        
//         console.log(`Bill #${bill.bill_no} has ${items.length} items`);
        
//         billsWithItems[index] = {
//           ...bill,
//           items: items
//         };
        
//         completedBills++;
        
//         if (completedBills === bills.length) {
//           console.log("✓ All bills fetched with items");
//           console.log("===================\n");
//           res.json(billsWithItems);
//         }
//       });
//     });
//   });
// });

// // Delete bill
// router.delete("/bills/:id", (req, res) => {
//   const billId = req.params.id;
  
//   db.beginTransaction((err) => {
//     if (err) {
//       console.error("Transaction error:", err);
//       return res.status(500).json({ error: "Transaction error" });
//     }
    
//     const deleteItemsQuery = "DELETE FROM bill_items WHERE bill_id = ?";
    
//     db.query(deleteItemsQuery, [billId], (err) => {
//       if (err) {
//         db.rollback(() => {
//           console.error("Error deleting bill items:", err);
//           res.status(500).json({ error: "Failed to delete bill items" });
//         });
//         return;
//       }
      
//       const deleteBillQuery = "DELETE FROM bills WHERE bill_id = ?";
      
//       db.query(deleteBillQuery, [billId], (err, result) => {
//         if (err) {
//           db.rollback(() => {
//             console.error("Error deleting bill:", err);
//             res.status(500).json({ error: "Failed to delete bill" });
//           });
//           return;
//         }
        
//         if (result.affectedRows === 0) {
//           db.rollback(() => {
//             res.status(404).json({ error: "Bill not found" });
//           });
//           return;
//         }
        
//         db.commit((err) => {
//           if (err) {
//             db.rollback(() => {
//               console.error("Commit error:", err);
//               res.status(500).json({ error: "Failed to delete bill" });
//             });
//             return;
//           }
          
//           console.log("✓ Bill deleted successfully:", billId);
//           res.json({ message: "Bill deleted successfully" });
//         });
//       });
//     });
//   });
// });

// // ==================== SALES REPORT ROUTES ====================

// // Get sales report summary
// router.get("/sales-report/summary", (req, res) => {
//   const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
//   const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

//   let dateFilter = "";
//   const params = [];

//   if (startDate && endDate) {
//     endDate.setHours(23, 59, 59, 999);
//     dateFilter = "WHERE b.bill_date BETWEEN ? AND ?";
//     params.push(startDate.toISOString().split("T")[0]);
//     params.push(endDate.toISOString().split("T")[0]);
//   }

//   const query = `
//     SELECT 
//       COUNT(DISTINCT b.bill_id) as totalBills,
//       SUM(b.total_amount) as totalRevenue,
//       SUM(bi.quantity) as totalQuantity,
//       COUNT(DISTINCT p.categoryName) as categoryCount,
//       AVG(b.total_amount) as avgOrderValue
//     FROM bills b
//     LEFT JOIN bill_items bi ON b.bill_id = bi.bill_id
//     LEFT JOIN products p ON bi.product_id = p.product_id
//     ${dateFilter}
//   `;

//   db.query(query, params, (err, results) => {
//     if (err) {
//       console.error("Error fetching sales summary:", err);
//       return res.status(500).json({ error: "Failed to fetch sales summary" });
//     }

//     const summary = {
//       totalBills: results[0].totalBills || 0,
//       totalRevenue: parseFloat(results[0].totalRevenue) || 0,
//       totalQuantity: parseFloat(results[0].totalQuantity) || 0,
//       categoryCount: results[0].categoryCount || 0,
//       avgOrderValue: parseFloat(results[0].avgOrderValue) || 0
//     };

//     res.json(summary);
//   });
// });

// // Get top products
// router.get("/sales-report/top-products", (req, res) => {
//   const limit = req.query.limit || 10;
//   const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
//   const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

//   let dateFilter = "";
//   const params = [];

//   if (startDate && endDate) {
//     endDate.setHours(23, 59, 59, 999);
//     dateFilter = "WHERE b.bill_date BETWEEN ? AND ?";
//     params.push(startDate.toISOString().split("T")[0]);
//     params.push(endDate.toISOString().split("T")[0]);
//   }

//   params.push(parseInt(limit));

//   const query = `
//     SELECT 
//       p.productName,
//       p.categoryName,
//       SUM(bi.quantity) as totalQuantity,
//       SUM(bi.total_price) as totalRevenue,
//       COUNT(bi.bill_item_id) as unitsSold,
//       AVG(bi.unit_price) as avgPrice
//     FROM bill_items bi
//     LEFT JOIN products p ON bi.product_id = p.product_id
//     LEFT JOIN bills b ON bi.bill_id = b.bill_id
//     WHERE p.productName IS NOT NULL
//     ${dateFilter}
//     GROUP BY p.productName, p.categoryName
//     ORDER BY totalRevenue DESC
//     LIMIT ?
//   `;

//   db.query(query, params, (err, results) => {
//     if (err) {
//       console.error("Error fetching top products:", err);
//       return res.status(500).json({ error: "Failed to fetch top products" });
//     }

//     res.json(results);
//   });
// });

// // Get category-wise sales
// router.get("/sales-report/categories", (req, res) => {
//   const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
//   const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

//   let dateFilter = "";
//   const params = [];

//   if (startDate && endDate) {
//     endDate.setHours(23, 59, 59, 999);
//     dateFilter = "WHERE b.bill_date BETWEEN ? AND ?";
//     params.push(startDate.toISOString().split("T")[0]);
//     params.push(endDate.toISOString().split("T")[0]);
//   }

//   const query = `
//     SELECT 
//       p.categoryName as name,
//       SUM(bi.quantity) as quantity,
//       SUM(bi.total_price) as revenue,
//       COUNT(DISTINCT bi.bill_item_id) as itemCount
//     FROM bill_items bi
//     LEFT JOIN products p ON bi.product_id = p.product_id
//     LEFT JOIN bills b ON bi.bill_id = b.bill_id
//     ${dateFilter}
//     GROUP BY p.categoryName
//     ORDER BY revenue DESC
//   `;

//   db.query(query, params, (err, results) => {
//     if (err) {
//       console.error("Error fetching category sales:", err);
//       return res.status(500).json({ error: "Failed to fetch category sales" });
//     }

//     res.json(results);
//   });
// });

// // Get daily sales trend
// router.get("/sales-report/daily", (req, res) => {
//   const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
//   const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

//   let dateFilter = "";
//   const params = [];

//   if (startDate && endDate) {
//     endDate.setHours(23, 59, 59, 999);
//     dateFilter = "WHERE b.bill_date BETWEEN ? AND ?";
//     params.push(startDate.toISOString().split("T")[0]);
//     params.push(endDate.toISOString().split("T")[0]);
//   }

//   const query = `
//     SELECT 
//       b.bill_date as date,
//       COUNT(DISTINCT b.bill_id) as bills,
//       SUM(b.total_amount) as revenue,
//       SUM(bi.quantity) as quantity
//     FROM bills b
//     LEFT JOIN bill_items bi ON b.bill_id = bi.bill_id
//     ${dateFilter}
//     GROUP BY b.bill_date
//     ORDER BY b.bill_date ASC
//   `;

//   db.query(query, params, (err, results) => {
//     if (err) {
//       console.error("Error fetching daily sales:", err);
//       return res.status(500).json({ error: "Failed to fetch daily sales" });
//     }

//     res.json(results);
//   });
// });

// module.exports = router;