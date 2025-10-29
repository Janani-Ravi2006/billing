// const db = require("../config/db");

// // Create a purchase with multiple items
// const createPurchase = (purchaseData, callback) => {
//   const { date, buyer, items, total, paid = false } = purchaseData;
  
//   // Start transaction
//   db.beginTransaction((err) => {
//     if (err) return callback(err);

//     // Insert main purchase record
//     const purchaseSql = `
//       INSERT INTO purchases (purchase_date, buyer_name, total_amount, paid)
//       VALUES (?, ?, ?, ?)
//     `;
    
//     db.query(purchaseSql, [date, buyer, total, paid], (err, result) => {
//       if (err) {
//         return db.rollback(() => callback(err));
//       }

//       const purchaseId = result.insertId;

//       // Insert purchase items
//       const itemsSql = `
//         INSERT INTO purchase_items (purchase_id, category, product_name, hsn_code, quantity, rate, total)
//         VALUES ?
//       `;
      
//       const itemsValues = items.map(item => [
//         purchaseId,
//         item.category || '',
//         item.product,
//         item.hsn || '',
//         item.qty,
//         item.rate,
//         item.total
//       ]);

//       db.query(itemsSql, [itemsValues], (err) => {
//         if (err) {
//           return db.rollback(() => callback(err));
//         }

//         db.commit((err) => {
//           if (err) {
//             return db.rollback(() => callback(err));
//           }
//           callback(null, { purchaseId });
//         });
//       });
//     });
//   });
// };

// // Get all purchases with items
// const getAllPurchases = (callback) => {
//   const sql = `
//     SELECT 
//       p.purchase_id as id,
//       p.purchase_date,
//       p.buyer_name,
//       p.total_amount,
//       p.paid,
//       GROUP_CONCAT(pi.product_name SEPARATOR ', ') as products
//     FROM purchases p
//     LEFT JOIN purchase_items pi ON p.purchase_id = pi.purchase_id
//     GROUP BY p.purchase_id
//     ORDER BY p.purchase_date DESC
//   `;
//   db.query(sql, callback);
// };

// // Mark purchase as paid
// const markAsPaid = (purchaseId, callback) => {
//   const sql = `UPDATE purchases SET paid = 1 WHERE purchase_id = ?`;
//   db.query(sql, [purchaseId], callback);
// };

// // Delete a purchase (will cascade delete items if foreign key is set)
// const deletePurchase = (id, callback) => {
//   db.query("DELETE FROM purchases WHERE purchase_id = ?", [id], callback);
// };



// const getPurchaseById = (purchaseId, callback) => {
//   const purchaseSql = `
//     SELECT 
//       p.purchase_id as id,
//       p.purchase_date,
//       p.buyer_name,
//       p.total_amount,
//       p.paid
//     FROM purchases p
//     WHERE p.purchase_id = ?
//   `;
  
//   const itemsSql = `
//     SELECT 
//       category,
//       product_name as product,
//       hsn_code as hsn,
//       quantity as qty,
//       rate,
//       total
//     FROM purchase_items
//     WHERE purchase_id = ?
//     ORDER BY item_id
//   `;

//   db.query(purchaseSql, [purchaseId], (err, purchaseRows) => {
//     if (err) return callback(err);
//     if (purchaseRows.length === 0) {
//       return callback(null, null);
//     }

//     db.query(itemsSql, [purchaseId], (err, itemRows) => {
//       if (err) return callback(err);
      
//       const purchase = purchaseRows[0];
//       purchase.items = itemRows;
//       callback(null, purchase);
//     });
//   });
// };

// module.exports = { 
//   createPurchase, 
//   getAllPurchases,
//   getPurchaseById, 
//   markAsPaid,
//   deletePurchase 
// };


const db = require("../config/db");

// Helper function to add purchased items to stock table
const addToStock = (purchaseDate, category, productName, quantity, purchaseRate, sellingRate, callback) => {
  // Insert into stock table
  const stockSql = `
    INSERT INTO stocks (date, category, product_name, quantity, purchase_rate, selling_rate, price_limit)
    VALUES (?, ?, ?, ?, ?, ?, NULL)
  `;
  
  db.query(stockSql, [purchaseDate, category, productName, quantity, purchaseRate, sellingRate], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
};

// Create a purchase - AUTOMATICALLY SAVES TO BOTH purchases AND stocks tables
const createPurchase = (purchaseData, callback) => {
  const { date, buyer, items, total, paid = false } = purchaseData;
  
  // Start transaction
  db.beginTransaction((err) => {
    if (err) return callback(err);

    // STEP 1: Insert main purchase record into purchases table
    const purchaseSql = `
      INSERT INTO purchases (purchase_date, buyer_name, total_amount, paid)
      VALUES (?, ?, ?, ?)
    `;
    
    db.query(purchaseSql, [date, buyer, total, paid], (err, result) => {
      if (err) {
        return db.rollback(() => callback(err));
      }

      const purchaseId = result.insertId;

      // STEP 2: Insert purchase items into purchase_items table
      const itemsSql = `
        INSERT INTO purchase_items (purchase_id, category, product_name, hsn_code, quantity, rate, total)
        VALUES ?
      `;
      
      const itemsValues = items.map(item => [
        purchaseId,
        item.category || '',
        item.product,
        item.hsn || '',
        item.qty,
        item.rate,
        item.total
      ]);

      db.query(itemsSql, [itemsValues], (err) => {
        if (err) {
          return db.rollback(() => callback(err));
        }

        // STEP 3: AUTOMATICALLY ADD EACH ITEM TO STOCK TABLE
        let stockProcessed = 0;
        let hasError = false;

        if (items.length === 0) {
          return db.commit((err) => {
            if (err) {
              return db.rollback(() => callback(err));
            }
            callback(null, { 
              purchaseId,
              message: `✅ Purchase saved successfully!`
            });
          });
        }

        items.forEach((item) => {
          // Calculate selling rate (purchase rate + 10% profit margin as default)
          const sellingRate = parseFloat(item.rate) * 1.1;
          
          addToStock(
            date,
            item.category || '',
            item.product,
            item.qty,
            item.rate,
            sellingRate,
            (err) => {
              if (err && !hasError) {
                hasError = true;
                return db.rollback(() => callback(err));
              }

              if (!hasError) {
                stockProcessed++;

                // When all items are added to stock, commit transaction
                if (stockProcessed === items.length) {
                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => callback(err));
                    }
                    callback(null, { 
                      purchaseId,
                      message: `✅ Purchase saved! ${items.length} items added to purchase & stock tables.`
                    });
                  });
                }
              }
            }
          );
        });
      });
    });
  });
};

// Get all purchases with items
const getAllPurchases = (callback) => {
  const sql = `
    SELECT 
      p.purchase_id as id,
      p.purchase_date,
      p.buyer_name,
      p.total_amount,
      p.paid,
      GROUP_CONCAT(pi.product_name SEPARATOR ', ') as products
    FROM purchases p
    LEFT JOIN purchase_items pi ON p.purchase_id = pi.purchase_id
    GROUP BY p.purchase_id
    ORDER BY p.purchase_date DESC
  `;
  db.query(sql, callback);
};

// Mark purchase as paid
const markAsPaid = (purchaseId, callback) => {
  const sql = `UPDATE purchases SET paid = 1 WHERE purchase_id = ?`;
  db.query(sql, [purchaseId], callback);
};

// Delete a purchase (will cascade delete items if foreign key is set)
const deletePurchase = (id, callback) => {
  db.query("DELETE FROM purchases WHERE purchase_id = ?", [id], callback);
};

// Get purchase by ID with all items
const getPurchaseById = (purchaseId, callback) => {
  const purchaseSql = `
    SELECT 
      p.purchase_id as id,
      p.purchase_date,
      p.buyer_name,
      p.total_amount,
      p.paid
    FROM purchases p
    WHERE p.purchase_id = ?
  `;
  
  const itemsSql = `
    SELECT 
      category,
      product_name as product,
      hsn_code as hsn,
      quantity as qty,
      rate,
      total
    FROM purchase_items
    WHERE purchase_id = ?
    ORDER BY item_id
  `;

  db.query(purchaseSql, [purchaseId], (err, purchaseRows) => {
    if (err) return callback(err);
    if (purchaseRows.length === 0) {
      return callback(null, null);
    }

    db.query(itemsSql, [purchaseId], (err, itemRows) => {
      if (err) return callback(err);
      
      const purchase = purchaseRows[0];
      purchase.items = itemRows;
      callback(null, purchase);
    });
  });
};

module.exports = { 
  createPurchase, 
  getAllPurchases,
  getPurchaseById, 
  markAsPaid,
  deletePurchase,
  addToStock
};