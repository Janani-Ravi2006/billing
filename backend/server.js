const express = require("express");
const cors = require("cors");
const path = require("path");

// ✅ Import routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const stockRoutes = require("./routes/stockRoutes");
const billRoutes = require("./routes/billRoutes");
const overdueBillsRouter = require("./routes/overdueBills");
const apiRoutes = require("./routes/executiveRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const paymentRoutes = require('./routes/payment');
const packerRoutes = require('./routes/packerRoutes');
const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, req.body);
  next();
});

// 🔹 Health check for Electron
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ✅ Safe route mounting
const routes = [
  { path: "/auth", router: authRoutes },
  { path: "/categories", router: categoryRoutes },
  { path: "/products", router: productRoutes },
  { path: "/api/purchases", router: purchaseRoutes },
  { path: "/api/stocks", router: stockRoutes },
  { path: "/api/bills", router: billRoutes },
  { path: "/api/overdue-bills", router: overdueBillsRouter },
  { path: "/api/executive", router: apiRoutes },
  {path:"/api/dashboard", router: dashboardRoutes},
  {path:"/api/transactions", router: transactionRoutes},
  {path:"/api/payment", router: paymentRoutes},
  {path:"/api/packer", router: packerRoutes},
];

routes.forEach((r) => {
  if (!r.router || (typeof r.router !== "function" && !r.router.use)) {
    console.error(`❌ Route at path '${r.path}' is invalid or undefined`);
  } else {
    console.log(`✅ Route mounted at '${r.path}'`);
    app.use(r.path, r.router);
  }
});

// 🔹 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.url,
    method: req.method,
  });
});

// 🔹 Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Environment: ${process.env.NODE_ENV || "development"}`);
});

// 🔹 Graceful shutdown
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});