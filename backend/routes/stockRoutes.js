// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");

// // Get purchase rate for a specific product
// router.get("/get-purchase-rate/:category/:productName", (req, res) => {
//   const { category, productName } = req.params;
//   const sql = `
//     SELECT rate as purchase_rate 
//     FROM purchase_items 
//     WHERE LOWER(category) = LOWER(?) 
//     AND LOWER(product_name) = LOWER(?)
//     ORDER BY item_id DESC 
//     LIMIT 1
//   `;
//   db.query(sql, [category, productName], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (rows.length === 0) return res.json({ purchase_rate: null });
//     res.json({ purchase_rate: rows[0].purchase_rate });
//   });
// });

// // Get selling rate (unitPrice) from products table
// router.get("/get-selling-rate/:productName", (req, res) => {
//   const { productName } = req.params;
//   const sql = `
//     SELECT unitPrice as selling_rate 
//     FROM products 
//     WHERE LOWER(productName) = LOWER(?)
//     LIMIT 1
//   `;
//   db.query(sql, [productName], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (rows.length === 0) return res.json({ selling_rate: null });
//     res.json({ selling_rate: rows[0].selling_rate });
//   });
// });

// // Save stock items
// router.post("/save-stock", (req, res) => {
//   const { items } = req.body;
//   if (!items || items.length === 0)
//     return res.status(400).json({ error: "No items provided" });

//   console.log('Received items:', items); // Debug log

//   const values = items.map((item) => [
//     item.date,
//     item.category,
//     item.productName,
//     parseInt(item.quantity) || 0,
//     parseFloat(item.purchaseRate) || 0,
//     parseFloat(item.sellingRate) || 0,
//     item.priceLimit ? parseFloat(item.priceLimit) : null,
//   ]);

//   console.log('Prepared values:', values); // Debug log

//   const sql = `
//     INSERT INTO stocks (date, category, product_name, quantity, purchase_rate, selling_rate, price_limit)
//     VALUES ?
//   `;
//   db.query(sql, [values], (err, result) => {
//     if (err) {
//       console.error('Database error:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     console.log('Insert result:', result);
//     res.json({ message: "Stock saved successfully", count: items.length });
//   });
// });

// // Get all stocks
// router.get("/", (req, res) => {
//   const sql = `
//     SELECT 
//       stock_id, 
//       date, 
//       category, 
//       product_name, 
//       COALESCE(quantity, 0) as quantity,
//       purchase_rate, 
//       selling_rate, 
//       price_limit 
//     FROM stocks 
//     ORDER BY date DESC
//   `;
//   db.query(sql, (err, rows) => {
//     if (err) {
//       console.error('Error fetching stocks:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     console.log('Fetched stocks sample:', rows.length > 0 ? rows[0] : 'No data');
//     res.json(rows);
//   });
// });

// // Get stock by ID
// router.get("/:id", (req, res) => {
//   const stockId = req.params.id;
//   const sql = "SELECT * FROM stocks WHERE stock_id = ?";
//   db.query(sql, [stockId], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (rows.length === 0)
//       return res.status(404).json({ error: "Stock not found" });
//     res.json(rows[0]);
//   });
// });

// // Update stock by ID
// router.put("/:id", (req, res) => {
//   const stockId = req.params.id;
//   const { date, category, product_name, quantity, purchase_rate, selling_rate, price_limit } = req.body;

//   console.log('Updating stock:', stockId, req.body); // Debug log

//   const sql = `
//     UPDATE stocks
//     SET date = ?, category = ?, product_name = ?, quantity = ?, purchase_rate = ?, selling_rate = ?, price_limit = ?
//     WHERE stock_id = ?
//   `;
//   const values = [
//     date,
//     category,
//     product_name,
//     parseInt(quantity) || 0,
//     parseFloat(purchase_rate),
//     parseFloat(selling_rate),
//     price_limit ? parseFloat(price_limit) : null,
//     stockId,
//   ];

//   console.log('SQL values:', values); // Debug log

//   db.query(sql, values, (err, result) => {
//     if (err) {
//       console.error('Update error:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     console.log('Update result:', result); // Debug log
//     if (result.affectedRows === 0)
//       return res.status(404).json({ error: "Stock not found" });
//     res.json({ message: "Stock updated successfully", affectedRows: result.affectedRows });
//   });
// });

// // Delete stock by ID
// router.delete("/:id", (req, res) => {
//   const stockId = req.params.id;
//   const sql = "DELETE FROM stocks WHERE stock_id = ?";
//   db.query(sql, [stockId], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.affectedRows === 0)
//       return res.status(404).json({ error: "Stock not found" });
//     res.json({ message: "Stock deleted successfully" });
//   });
// });

// module.exports = router;



// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");
// const nodemailer = require("nodemailer");

// // ✅ Email Configuration (நீங்க உங்க details பாட்டுங்க)
// const emailConfig = {
//   service: 'gmail',
//   auth: {
//     user: 'rjanani335@gmail.com', // உங்க Gmail
//     pass: 'oret hhpx fcra gfpq' // Gmail App Password (not regular password)
//   }
// };

// // Create email transporter
// const transporter = nodemailer.createTransport(emailConfig);

// // Function to send low stock email
// const sendLowStockEmail = async (stockData) => {
//   const mailOptions = {
//     from: emailConfig.auth.user,
//     to: 'jananiravikumar321@gmail.com', // யாருக்கு mail அனுப்பணும்
//     subject: `⚠️ Low Stock Alert: ${stockData.product_name}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
//         <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
//           <h2 style="color: #dc3545; margin-top: 0;">🚨 Low Stock Alert</h2>
//           <p style="font-size: 16px; color: #333;">The following product has reached low stock level:</p>
          
//           <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr>
//                 <td style="padding: 8px; font-weight: bold;">Product Name:</td>
//                 <td style="padding: 8px;">${stockData.product_name}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold;">Category:</td>
//                 <td style="padding: 8px;">${stockData.category}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold;">Current Quantity:</td>
//                 <td style="padding: 8px; color: #dc3545; font-size: 18px; font-weight: bold;">${stockData.quantity}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold;">Purchase Rate:</td>
//                 <td style="padding: 8px;">₹${stockData.purchase_rate}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; font-weight: bold;">Selling Rate:</td>
//                 <td style="padding: 8px;">₹${stockData.selling_rate}</td>
//               </tr>
//             </table>
//           </div>
          
//           <p style="color: #666; font-size: 14px; margin-top: 20px;">
//             ⚠️ Please reorder this product as soon as possible to avoid stock shortage.
//           </p>
          
//           <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
//             This is an automated alert from your Stock Management System.<br>
//             Date: ${new Date().toLocaleString('en-IN')}
//           </p>
//         </div>
//       </div>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`✅ Low stock email sent for: ${stockData.product_name}`);
//     return true;
//   } catch (error) {
//     console.error('❌ Email sending failed:', error);
//     return false;
//   }
// };

// // Get purchase rate for a specific product
// router.get("/get-purchase-rate/:category/:productName", (req, res) => {
//   const { category, productName } = req.params;
//   const sql = `
//     SELECT rate as purchase_rate 
//     FROM purchase_items 
//     WHERE LOWER(category) = LOWER(?) 
//     AND LOWER(product_name) = LOWER(?)
//     ORDER BY item_id DESC 
//     LIMIT 1
//   `;
//   db.query(sql, [category, productName], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (rows.length === 0) return res.json({ purchase_rate: null });
//     res.json({ purchase_rate: rows[0].purchase_rate });
//   });
// });

// // Get selling rate (unitPrice) from products table
// router.get("/get-selling-rate/:productName", (req, res) => {
//   const { productName } = req.params;
//   const sql = `
//     SELECT unitPrice as selling_rate 
//     FROM products 
//     WHERE LOWER(productName) = LOWER(?)
//     LIMIT 1
//   `;
//   db.query(sql, [productName], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (rows.length === 0) return res.json({ selling_rate: null });
//     res.json({ selling_rate: rows[0].selling_rate });
//   });
// });

// // Save stock items
// router.post("/save-stock", async (req, res) => {
//   const { items } = req.body;
//   if (!items || items.length === 0)
//     return res.status(400).json({ error: "No items provided" });

//   console.log('Received items:', items);

//   const values = items.map((item) => [
//     item.date,
//     item.category,
//     item.productName,
//     parseInt(item.quantity) || 0,
//     parseFloat(item.purchaseRate) || 0,
//     parseFloat(item.sellingRate) || 0,
//     item.priceLimit ? parseFloat(item.priceLimit) : null,
//   ]);

//   console.log('Prepared values:', values);

//   const sql = `
//     INSERT INTO stocks (date, category, product_name, quantity, purchase_rate, selling_rate, price_limit)
//     VALUES ?
//   `;
  
//   db.query(sql, [values], async (err, result) => {
//     if (err) {
//       console.error('Database error:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     console.log('Insert result:', result);
    
//     // ✅ Check for low stock and send notifications
//     const lowStockItems = items.filter(item => parseInt(item.quantity) <= 20);
//     const notificationResults = [];
    
//     for (const item of lowStockItems) {
//       const emailSent = await sendLowStockEmail({
//         product_name: item.productName,
//         category: item.category,
//         quantity: item.quantity,
//         purchase_rate: item.purchaseRate,
//         selling_rate: item.sellingRate
//       });
      
//       notificationResults.push({
//         product: item.productName,
//         quantity: item.quantity,
//         emailSent
//       });
//     }
    
//     res.json({ 
//       message: "Stock saved successfully", 
//       count: items.length,
//       lowStockAlerts: notificationResults
//     });
//   });
// });

// // Get all stocks
// router.get("/", (req, res) => {
//   const sql = `
//     SELECT 
//       stock_id, 
//       date, 
//       category, 
//       product_name, 
//       COALESCE(quantity, 0) as quantity,
//       purchase_rate, 
//       selling_rate, 
//       price_limit 
//     FROM stocks 
//     ORDER BY date DESC
//   `;
//   db.query(sql, (err, rows) => {
//     if (err) {
//       console.error('Error fetching stocks:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     console.log('Fetched stocks sample:', rows.length > 0 ? rows[0] : 'No data');
//     res.json(rows);
//   });
// });

// // ✅ New endpoint to check low stock items
// router.get("/low-stock-alerts", (req, res) => {
//   const sql = `
//     SELECT 
//       stock_id, 
//       date, 
//       category, 
//       product_name, 
//       quantity,
//       purchase_rate, 
//       selling_rate 
//     FROM stocks 
//     WHERE quantity <= 20
//     ORDER BY quantity ASC, date DESC
//   `;
//   db.query(sql, (err, rows) => {
//     if (err) {
//       console.error('Error fetching low stock:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(rows);
//   });
// });

// // Get stock by ID
// router.get("/:id", (req, res) => {
//   const stockId = req.params.id;
//   const sql = "SELECT * FROM stocks WHERE stock_id = ?";
//   db.query(sql, [stockId], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (rows.length === 0)
//       return res.status(404).json({ error: "Stock not found" });
//     res.json(rows[0]);
//   });
// });

// // Update stock by ID
// router.put("/:id", async (req, res) => {
//   const stockId = req.params.id;
//   const { date, category, product_name, quantity, purchase_rate, selling_rate, price_limit } = req.body;

//   console.log('Updating stock:', stockId, req.body);

//   const sql = `
//     UPDATE stocks
//     SET date = ?, category = ?, product_name = ?, quantity = ?, purchase_rate = ?, selling_rate = ?, price_limit = ?
//     WHERE stock_id = ?
//   `;
//   const values = [
//     date,
//     category,
//     product_name,
//     parseInt(quantity) || 0,
//     parseFloat(purchase_rate),
//     parseFloat(selling_rate),
//     price_limit ? parseFloat(price_limit) : null,
//     stockId,
//   ];

//   console.log('SQL values:', values);

//   db.query(sql, values, async (err, result) => {
//     if (err) {
//       console.error('Update error:', err);
//       return res.status(500).json({ error: err.message });
//     }
//     console.log('Update result:', result);
//     if (result.affectedRows === 0)
//       return res.status(404).json({ error: "Stock not found" });
    
//     // ✅ Check if updated quantity is low and send alert
//     if (parseInt(quantity) <= 20) {
//       await sendLowStockEmail({
//         product_name,
//         category,
//         quantity,
//         purchase_rate,
//         selling_rate
//       });
//     }
    
//     res.json({ 
//       message: "Stock updated successfully", 
//       affectedRows: result.affectedRows,
//       lowStockAlert: parseInt(quantity) <= 20
//     });
//   });
// });

// // Delete stock by ID
// router.delete("/:id", (req, res) => {
//   const stockId = req.params.id;
//   const sql = "DELETE FROM stocks WHERE stock_id = ?";
//   db.query(sql, [stockId], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.affectedRows === 0)
//       return res.status(404).json({ error: "Stock not found" });
//     res.json({ message: "Stock deleted successfully" });
//   });
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const db = require("../config/db");
// const nodemailer = require("nodemailer");

// // ✅ Gmail Configuration
// // Make sure 2-Step Verification is ON for your Gmail account
// // and generate an "App Password" at https://myaccount.google.com/apppasswords

// const emailConfig = {
//   service: "gmail",
//   auth: {
//     user: "rjanani335@gmail.com", // your Gmail
//     pass: "oret hhpx fcra gfpq" // App password, NOT normal Gmail password
//   },
// };

// // Create email transporter with debug logs
// const transporter = nodemailer.createTransport({
//   ...emailConfig,
//   logger: true,
//   debug: true,
// });

// // ✅ Function to send low stock email
// const sendLowStockEmail = async (stockData) => {
//   console.log("📧 Preparing to send low stock email for:", stockData.product_name);

//   const mailOptions = {
//     from: emailConfig.auth.user,
//     to: "jananiravikumar321@gmail.com", // recipient
//     subject: `⚠️ Low Stock Alert: ${stockData.product_name}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
//         <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
//           <h2 style="color: #dc3545;">🚨 Low Stock Alert</h2>
//           <p>The following product has reached a low stock level:</p>
//           <table style="width: 100%; border-collapse: collapse; background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px;">
//             <tr><td><b>Product Name:</b></td><td>${stockData.product_name}</td></tr>
//             <tr><td><b>Category:</b></td><td>${stockData.category}</td></tr>
//             <tr><td><b>Quantity:</b></td><td style="color:red;font-weight:bold;">${stockData.quantity}</td></tr>
//             <tr><td><b>Purchase Rate:</b></td><td>₹${stockData.purchase_rate}</td></tr>
//             <tr><td><b>Selling Rate:</b></td><td>₹${stockData.selling_rate}</td></tr>
//           </table>
//           <p style="color: #555; margin-top: 20px;">
//             ⚠️ Please reorder this product as soon as possible to avoid stock shortage.
//           </p>
//           <p style="font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px;">
//             This is an automated alert from your Stock Management System.<br>
//             Sent on: ${new Date().toLocaleString("en-IN")}
//           </p>
//         </div>
//       </div>
//     `
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✅ Low stock email sent for: ${stockData.product_name}`, info.response);
//     return true;
//   } catch (error) {
//     console.error("❌ Email sending failed:", error);
//     return false;
//   }
// };

// // ✅ Get purchase rate
// router.get("/get-purchase-rate/:category/:productName", (req, res) => {
//   const { category, productName } = req.params;
//   const sql = `
//     SELECT rate as purchase_rate 
//     FROM purchase_items 
//     WHERE LOWER(category) = LOWER(?) 
//     AND LOWER(product_name) = LOWER(?)
//     ORDER BY item_id DESC 
//     LIMIT 1
//   `;
//   db.query(sql, [category, productName], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ purchase_rate: rows.length ? rows[0].purchase_rate : null });
//   });
// });

// // ✅ Get selling rate
// router.get("/get-selling-rate/:productName", (req, res) => {
//   const { productName } = req.params;
//   const sql = `
//     SELECT unitPrice as selling_rate 
//     FROM products 
//     WHERE LOWER(productName) = LOWER(?)
//     LIMIT 1
//   `;
//   db.query(sql, [productName], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ selling_rate: rows.length ? rows[0].selling_rate : null });
//   });
// });

// // ✅ Save stock
// router.post("/save-stock", async (req, res) => {
//   const { items } = req.body;
//   if (!items || items.length === 0)
//     return res.status(400).json({ error: "No items provided" });

//   console.log("📦 Received items:", items);

//   const values = items.map((item) => [
//     item.date,
//     item.category,
//     item.productName,
//     parseInt(item.quantity) || 0,
//     parseFloat(item.purchaseRate) || 0,
//     parseFloat(item.sellingRate) || 0,
//     item.priceLimit ? parseFloat(item.priceLimit) : null,
//   ]);

//   const sql = `
//     INSERT INTO stocks (date, category, product_name, quantity, purchase_rate, selling_rate, price_limit)
//     VALUES ?
//   `;

//   db.query(sql, [values], async (err, result) => {
//     if (err) {
//       console.error("❌ Database error:", err);
//       return res.status(500).json({ error: err.message });
//     }

//     console.log("✅ Stock inserted:", result.affectedRows);

//     const lowStockItems = items.filter((i) => parseInt(i.quantity) <= 20);
//     const notifications = [];

//     for (const item of lowStockItems) {
//       console.log("⚠️ Low stock detected:", item.productName, "Qty:", item.quantity);
//       const emailSent = await sendLowStockEmail({
//         product_name: item.productName,
//         category: item.category,
//         quantity: item.quantity,
//         purchase_rate: item.purchaseRate,
//         selling_rate: item.sellingRate,
//       });
//       notifications.push({ product: item.productName, emailSent });
//     }

//     res.json({
//       message: "Stock saved successfully",
//       totalItems: items.length,
//       lowStockAlerts: notifications,
//     });
//   });
// });

// // ✅ Get all stocks
// router.get("/", (req, res) => {
//   const sql = `
//     SELECT stock_id, date, category, product_name, COALESCE(quantity,0) as quantity,
//     purchase_rate, selling_rate, price_limit
//     FROM stocks ORDER BY date DESC
//   `;
//   db.query(sql, (err, rows) => {
//     if (err) {
//       console.error("❌ Error fetching stocks:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(rows);
//   });
// });

// // ✅ Get low stock alerts
// router.get("/low-stock-alerts", (req, res) => {
//   const sql = `
//     SELECT stock_id, date, category, product_name, quantity, purchase_rate, selling_rate
//     FROM stocks
//     WHERE quantity <= 20
//     ORDER BY quantity ASC, date DESC
//   `;
//   db.query(sql, (err, rows) => {
//     if (err) {
//       console.error("❌ Error fetching low stock:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(rows);
//   });
// });

// // ✅ Get single stock
// router.get("/:id", (req, res) => {
//   const sql = "SELECT * FROM stocks WHERE stock_id = ?";
//   db.query(sql, [req.params.id], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!rows.length) return res.status(404).json({ error: "Stock not found" });
//     res.json(rows[0]);
//   });
// });

// // ✅ Update stock
// router.put("/:id", async (req, res) => {
//   const stockId = req.params.id;
//   const { date, category, product_name, quantity, purchase_rate, selling_rate, price_limit } = req.body;

//   const sql = `
//     UPDATE stocks
//     SET date=?, category=?, product_name=?, quantity=?, purchase_rate=?, selling_rate=?, price_limit=?
//     WHERE stock_id=?
//   `;
//   const values = [
//     date, category, product_name,
//     parseInt(quantity) || 0,
//     parseFloat(purchase_rate),
//     parseFloat(selling_rate),
//     price_limit ? parseFloat(price_limit) : null,
//     stockId,
//   ];

//   db.query(sql, values, async (err, result) => {
//     if (err) {
//       console.error("❌ Update error:", err);
//       return res.status(500).json({ error: err.message });
//     }
//     if (!result.affectedRows)
//       return res.status(404).json({ error: "Stock not found" });

//     console.log("✅ Stock updated:", product_name);

//     // Send alert if quantity <= 20
//     let emailSent = false;
//     if (parseInt(quantity) <= 20) {
//       emailSent = await sendLowStockEmail({
//         product_name, category, quantity, purchase_rate, selling_rate
//       });
//     }

//     res.json({ message: "Stock updated successfully", emailSent });
//   });
// });

// // ✅ Delete stock
// router.delete("/:id", (req, res) => {
//   const sql = "DELETE FROM stocks WHERE stock_id = ?";
//   db.query(sql, [req.params.id], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (!result.affectedRows)
//       return res.status(404).json({ error: "Stock not found" });
//     res.json({ message: "Stock deleted successfully" });
//   });
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const db = require("../config/db");
const nodemailer = require("nodemailer");
const cron = require("node-cron"); // ✅ Install: npm install node-cron

// ✅ Gmail Configuration
const emailConfig = {
  service: "gmail",
  auth: {
    user: "rjanani335@gmail.com",
    pass: "oret hhpx fcra gfpq"
  },
};

// Create email transporter
const transporter = nodemailer.createTransport({
  ...emailConfig,
  logger: true,
  debug: true,
});

// ✅ Function to send individual low stock email
const sendLowStockEmail = async (stockData) => {
  console.log("📧 Preparing to send low stock email for:", stockData.product_name);

  const mailOptions = {
    from: emailConfig.auth.user,
    to: "jananiravikumar321@gmail.com",
    subject: `⚠️ Low Stock Alert: ${stockData.product_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #dc3545;">🚨 Low Stock Alert</h2>
          <p>The following product has reached a low stock level:</p>
          <table style="width: 100%; border-collapse: collapse; background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px;">
            <tr><td><b>Product Name:</b></td><td>${stockData.product_name}</td></tr>
            <tr><td><b>Category:</b></td><td>${stockData.category}</td></tr>
            <tr><td><b>Quantity:</b></td><td style="color:red;font-weight:bold;">${stockData.quantity}</td></tr>
            <tr><td><b>Purchase Rate:</b></td><td>₹${stockData.purchase_rate}</td></tr>
            <tr><td><b>Selling Rate:</b></td><td>₹${stockData.selling_rate}</td></tr>
          </table>
          <p style="color: #555; margin-top: 20px;">
            ⚠️ Please reorder this product as soon as possible to avoid stock shortage.
          </p>
          <p style="font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px;">
            This is an automated alert from your Stock Management System.<br>
            Sent on: ${new Date().toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Low stock email sent for: ${stockData.product_name}`, info.response);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
};

// ✅ NEW: Function to send daily summary email with ALL low stock items
const sendDailySummaryEmail = async (lowStockItems) => {
  if (!lowStockItems || lowStockItems.length === 0) {
    console.log("✅ No low stock items - skipping daily email");
    return;
  }

  console.log(`📧 Sending daily summary for ${lowStockItems.length} low stock items`);

  const productRows = lowStockItems.map((item, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#fff' : '#f8f9fa'};">
      <td style="padding: 10px; border: 1px solid #dee2e6;">${idx + 1}</td>
      <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold;">${item.product_name}</td>
      <td style="padding: 10px; border: 1px solid #dee2e6;">${item.category}</td>
      <td style="padding: 10px; border: 1px solid #dee2e6; color: red; font-weight: bold;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #dee2e6;">₹${item.purchase_rate}</td>
      <td style="padding: 10px; border: 1px solid #dee2e6;">₹${item.selling_rate}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: emailConfig.auth.user,
    to: "jananiravikumar321@gmail.com",
    subject: `📊 Daily Low Stock Report - ${lowStockItems.length} Items`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
        <div style="max-width: 800px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #dc3545;">📊 Daily Low Stock Report</h2>
          <p style="font-size: 16px; color: #555;">
            You have <strong style="color: #dc3545;">${lowStockItems.length}</strong> products with stock ≤ 20 units
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background-color: #dc3545; color: white;">
                <th style="padding: 12px; border: 1px solid #dee2e6;">S.No</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Product Name</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Category</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Quantity</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Purchase Rate</th>
                <th style="padding: 12px; border: 1px solid #dee2e6;">Selling Rate</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              ⚠️ <strong>Action Required:</strong> Please review and reorder these products to maintain adequate stock levels.
            </p>
          </div>

          <p style="font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px;">
            This is an automated daily report from your Stock Management System.<br>
            Report generated on: ${new Date().toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Daily summary email sent successfully`, info.response);
    return true;
  } catch (error) {
    console.error("❌ Daily email sending failed:", error);
    return false;
  }
};

// ✅ NEW: Function to check and send daily alerts
const checkAndSendDailyAlerts = async () => {
  console.log("🔍 Running daily low stock check at:", new Date().toLocaleString("en-IN"));

  const sql = `
    SELECT stock_id, date, category, product_name, quantity, purchase_rate, selling_rate
    FROM stocks
    WHERE quantity <= 20
    ORDER BY quantity ASC, product_name ASC
  `;

  db.query(sql, async (err, rows) => {
    if (err) {
      console.error("❌ Error checking low stock:", err);
      return;
    }

    console.log(`📦 Found ${rows.length} low stock items`);

    if (rows.length > 0) {
      await sendDailySummaryEmail(rows);
    }
  });
};

// ✅ NEW: Schedule daily alerts at 9:00 AM IST (Indian Standard Time)
// Cron format: second minute hour day month weekday
// "0 9 * * *" = Every day at 9:00 sAM
cron.schedule("45 18 * * *", () => {
  console.log("⏰ Scheduled daily alert triggered");
  checkAndSendDailyAlerts();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata" // IST timezone
});

// ✅ For testing: Run check immediately when server starts (REMOVE IN PRODUCTION)
console.log("🚀 Daily alert scheduler initialized - Alerts will be sent at 9:00 AM IST daily");
// Uncomment below line to test immediately on server start:
// checkAndSendDailyAlerts();

// ✅ Get purchase rate
router.get("/get-purchase-rate/:category/:productName", (req, res) => {
  const { category, productName } = req.params;
  const sql = `
    SELECT rate as purchase_rate 
    FROM purchase_items 
    WHERE LOWER(category) = LOWER(?) 
    AND LOWER(product_name) = LOWER(?)
    ORDER BY item_id DESC 
    LIMIT 1
  `;
  db.query(sql, [category, productName], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ purchase_rate: rows.length ? rows[0].purchase_rate : null });
  });
});

// ✅ Get selling rate
router.get("/get-selling-rate/:productName", (req, res) => {
  const { productName } = req.params;
  const sql = `
    SELECT unitPrice as selling_rate 
    FROM products 
    WHERE LOWER(productName) = LOWER(?)
    LIMIT 1
  `;
  db.query(sql, [productName], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ selling_rate: rows.length ? rows[0].selling_rate : null });
  });
});

// ✅ Save stock
router.post("/save-stock", async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ error: "No items provided" });

  console.log("📦 Received items:", items);

  const values = items.map((item) => [
    item.date,
    item.category,
    item.productName,
    parseInt(item.quantity) || 0,
    parseFloat(item.purchaseRate) || 0,
    parseFloat(item.sellingRate) || 0,
    item.priceLimit ? parseFloat(item.priceLimit) : null,
  ]);

  const sql = `
    INSERT INTO stocks (date, category, product_name, quantity, purchase_rate, selling_rate, price_limit)
    VALUES ?
  `;

  db.query(sql, [values], async (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("✅ Stock inserted:", result.affectedRows);

    const lowStockItems = items.filter((i) => parseInt(i.quantity) <= 20);
    const notifications = [];

    for (const item of lowStockItems) {
      console.log("⚠️ Low stock detected:", item.productName, "Qty:", item.quantity);
      const emailSent = await sendLowStockEmail({
        product_name: item.productName,
        category: item.category,
        quantity: item.quantity,
        purchase_rate: item.purchaseRate,
        selling_rate: item.sellingRate,
      });
      notifications.push({ product: item.productName, emailSent });
    }

    res.json({
      message: "Stock saved successfully",
      totalItems: items.length,
      lowStockAlerts: notifications,
    });
  });
});

// ✅ Get all stocks
router.get("/", (req, res) => {
  const sql = `
    SELECT stock_id, date, category, product_name, COALESCE(quantity,0) as quantity,
    purchase_rate, selling_rate, price_limit
    FROM stocks ORDER BY date DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Error fetching stocks:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ✅ Get low stock alerts
router.get("/low-stock-alerts", (req, res) => {
  const sql = `
    SELECT stock_id, date, category, product_name, quantity, purchase_rate, selling_rate
    FROM stocks
    WHERE quantity <= 20
    ORDER BY quantity ASC, date DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Error fetching low stock:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ✅ NEW: Manual trigger for daily alert (for testing)
router.post("/trigger-daily-alert", async (req, res) => {
  console.log("🔔 Manual daily alert triggered");
  await checkAndSendDailyAlerts();
  res.json({ message: "Daily alert check triggered manually" });
});

// ✅ Get single stock
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM stocks WHERE stock_id = ?";
  db.query(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ error: "Stock not found" });
    res.json(rows[0]);
  });
});

// ✅ Update stock
router.put("/:id", async (req, res) => {
  const stockId = req.params.id;
  const { date, category, product_name, quantity, purchase_rate, selling_rate, price_limit } = req.body;

  const sql = `
    UPDATE stocks
    SET date=?, category=?, product_name=?, quantity=?, purchase_rate=?, selling_rate=?, price_limit=?
    WHERE stock_id=?
  `;
  const values = [
    date, category, product_name,
    parseInt(quantity) || 0,
    parseFloat(purchase_rate),
    parseFloat(selling_rate),
    price_limit ? parseFloat(price_limit) : null,
    stockId,
  ];

  db.query(sql, values, async (err, result) => {
    if (err) {
      console.error("❌ Update error:", err);
      return res.status(500).json({ error: err.message });
    }
    if (!result.affectedRows)
      return res.status(404).json({ error: "Stock not found" });

    console.log("✅ Stock updated:", product_name);

    // Send alert if quantity <= 20
    let lowStockAlert = false;
    if (parseInt(quantity) <= 20) {
      await sendLowStockEmail({
        product_name, category, quantity, purchase_rate, selling_rate
      });
      lowStockAlert = true;
    }

    res.json({ message: "Stock updated successfully", lowStockAlert });
  });
});

// ✅ Delete stock
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM stocks WHERE stock_id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!result.affectedRows)
      return res.status(404).json({ error: "Stock not found" });
    res.json({ message: "Stock deleted successfully" });
  });
});

module.exports = router;