import React, { useState, useEffect } from "react";
import { Download, Calendar, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function ProductSalesReport() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("overview");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message, type = "info") => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    fetchAndProcessBills();
  }, []);

  useEffect(() => {
    if (reportData && reportData.allBills) {
      filterByDateRange();
    }
  }, [startDate, endDate]);

  const fetchAndProcessBills = async () => {
    setLoading(true);
    try {
      console.log("Fetching bills from /api/bills...");
      const res = await fetch("http://localhost:5000/api/bills/bills");
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const bills = await res.json();
      console.log("Bills received:", bills.length);

      if (bills.length === 0) {
        showToast("No bills found in database", "error");
        setLoading(false);
        return;
      }

      const billDates = bills
        .map(b => b.bill_date)
        .filter(d => d)
        .sort();
      if (billDates.length > 0) {
        setStartDate(billDates[0]);
        setEndDate(billDates[billDates.length - 1]);
      }

      processAllBills(bills);
    } catch (err) {
      console.error("Error fetching bills:", err);
      showToast("Error loading sales data: " + err.message, "error");
      setLoading(false);
    }
  };

  const processAllBills = (bills) => {
    try {
      console.log("Processing", bills.length, "bills...");
      const products = {};
      const categoryData = {};
      let totalRevenue = 0;
      let totalQuantity = 0;

      bills.forEach(bill => {
        if (!bill.bill_items || !Array.isArray(bill.bill_items)) {
          console.warn(`Bill ${bill.bill_no} has no items`);
          return;
        }

        bill.bill_items.forEach(item => {
          const productName = item.product_name || "Unknown";
          const category = item.categoryName || "Uncategorized";
          const qty = parseFloat(item.quantity) || 0;
          const revenue = parseFloat(item.total_price) || 0;

          if (!products[productName]) {
            products[productName] = {
              name: productName,
              category: category,
              quantity: 0,
              revenue: 0,
              unitsSold: 0,
              avgPrice: 0
            };
          }

          products[productName].quantity += qty;
          products[productName].revenue += revenue;
          products[productName].unitsSold += 1;

          totalRevenue += revenue;
          totalQuantity += qty;

          if (!categoryData[category]) {
            categoryData[category] = {
              name: category,
              quantity: 0,
              revenue: 0
            };
          }
          categoryData[category].quantity += qty;
          categoryData[category].revenue += revenue;
        });
      });

      Object.values(products).forEach(prod => {
        if (prod.unitsSold > 0) {
          prod.avgPrice = (prod.revenue / prod.unitsSold).toFixed(2);
        }
      });

      const catList = Object.keys(categoryData);
      setCategories(catList);

      const productArray = Object.values(products).sort((a, b) => b.revenue - a.revenue);
      const topProducts = productArray.slice(0, 10);
      const categoryArray = Object.values(categoryData).sort((a, b) => b.revenue - a.revenue);

      setReportData({
        totalRevenue: totalRevenue.toFixed(2),
        totalQuantity: totalQuantity.toFixed(2),
        totalBills: bills.length,
        averageOrderValue: bills.length > 0 ? (totalRevenue / bills.length).toFixed(2) : 0,
        topProducts,
        categories: categoryArray,
        allProducts: productArray,
        allBills: bills
      });

      console.log("Report data prepared");
      setLoading(false);
    } catch (err) {
      console.error("Error processing bills:", err);
      showToast("Error processing sales data", "error");
      setLoading(false);
    }
  };

  const filterByDateRange = () => {
    if (!reportData) return;

    try {
      let start = startDate ? new Date(startDate) : new Date("2000-01-01");
      let end = endDate ? new Date(endDate) : new Date();
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const filtered = reportData.allBills.filter(bill => {
        try {
          const billDate = new Date(bill.bill_date);
          billDate.setHours(0, 0, 0, 0);
          return billDate >= start && billDate <= end;
        } catch {
          return false;
        }
      });

      if (filtered.length === 0) {
        showToast("No bills found in selected date range", "info");
        return;
      }

      processFilteredBills(filtered);
    } catch (err) {
      console.error("Error filtering bills:", err);
    }
  };

  const processFilteredBills = (filteredBills) => {
    const products = {};
    const categoryData = {};
    const dailyData = {};
    let totalRevenue = 0;
    let totalQuantity = 0;

    filteredBills.forEach(bill => {
      let billDateStr;
      try {
        billDateStr = new Date(bill.bill_date).toLocaleDateString("en-IN");
      } catch {
        billDateStr = new Date().toLocaleDateString("en-IN");
      }

      if (!dailyData[billDateStr]) {
        dailyData[billDateStr] = {
          date: billDateStr,
          revenue: 0,
          bills: 0,
          quantity: 0
        };
      }

      dailyData[billDateStr].bills += 1;

      if (bill.bill_items && Array.isArray(bill.bill_items)) {
        bill.bill_items.forEach(item => {
          const productName = item.product_name || "Unknown";
          const category = item.categoryName || "Uncategorized";
          const qty = parseFloat(item.quantity) || 0;
          const revenue = parseFloat(item.total_price) || 0;

          if (!products[productName]) {
            products[productName] = {
              name: productName,
              category: category,
              quantity: 0,
              revenue: 0,
              unitsSold: 0,
              avgPrice: 0
            };
          }

          products[productName].quantity += qty;
          products[productName].revenue += revenue;
          products[productName].unitsSold += 1;

          dailyData[billDateStr].revenue += revenue;
          dailyData[billDateStr].quantity += qty;

          totalRevenue += revenue;
          totalQuantity += qty;

          if (!categoryData[category]) {
            categoryData[category] = {
              name: category,
              quantity: 0,
              revenue: 0
            };
          }
          categoryData[category].quantity += qty;
          categoryData[category].revenue += revenue;
        });
      }
    });

    Object.values(products).forEach(prod => {
      if (prod.unitsSold > 0) {
        prod.avgPrice = (prod.revenue / prod.unitsSold).toFixed(2);
      }
    });

    const productArray = Object.values(products).sort((a, b) => b.revenue - a.revenue);
    const dailyArray = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    const topProducts = productArray.slice(0, 10);
    const categoryArray = Object.values(categoryData).sort((a, b) => b.revenue - a.revenue);

    setReportData(prev => ({
      ...prev,
      totalRevenue: totalRevenue.toFixed(2),
      totalQuantity: totalQuantity.toFixed(2),
      totalBills: filteredBills.length,
      averageOrderValue: filteredBills.length > 0 ? (totalRevenue / filteredBills.length).toFixed(2) : 0,
      topProducts,
      categories: categoryArray,
      allProducts: productArray,
      dailyData: dailyArray
    }));
  };

  const downloadCSV = () => {
    if (!reportData) return;

    const headers = ["Product Name", "Category", "Quantity", "Revenue", "Avg Price", "Units Sold"];
    const rows = reportData.allProducts.map(p => [
      p.name,
      p.category,
      p.quantity,
      p.revenue.toFixed(2),
      p.avgPrice,
      p.unitsSold
    ]);

    let csv = `Sales Report from ${startDate || "All"} to ${endDate || "All"}\n\n`;
    csv += headers.join(",") + "\n";
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
    element.setAttribute("download", `sales_report_${startDate}_to_${endDate}.csv`);
    element.click();
    showToast("Report downloaded!", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 mb-4">Loading sales data...</div>
          <div className="text-gray-500">Fetching bills from database</div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-2xl font-bold text-gray-600">No data available</div>
      </div>
    );
  }

  const COLORS = ["#0891b2", "#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc", "#cffafe"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-white border-l-4 border-teal-600 shadow-lg p-4 rounded z-50">
          {toastMessage}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Sales Report</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {startDate && endDate && `From ${startDate} to ${endDate}`}
              </p>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              Download CSV
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={() => {
                  if (reportData && reportData.allBills) {
                    const billDates = reportData.allBills
                      .map(b => b.bill_date)
                      .filter(d => d)
                      .sort();
                    if (billDates.length > 0) {
                      setStartDate(billDates[0]);
                      setEndDate(billDates[billDates.length - 1]);
                    } else {
                      setStartDate("");
                      setEndDate("");
                    }
                  }
                  setSelectedCategory("all");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-teal-600">₹{reportData.totalRevenue}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Quantity</div>
              <div className="text-3xl font-bold text-blue-600">{reportData.totalQuantity}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Bills</div>
              <div className="text-3xl font-bold text-purple-600">{reportData.totalBills}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Average Order Value</div>
              <div className="text-3xl font-bold text-green-600">₹{reportData.averageOrderValue}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setView("overview")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === "overview" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setView("detailed")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === "detailed" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setView("daily")}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === "daily" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Daily Trend
            </button>
          </div>
        </div>

        {view === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-teal-600" />
                Top 10 Products by Revenue
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.categories}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {reportData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === "daily" && reportData.dailyData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Sales Trend</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#0891b2" name="Revenue (₹)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="quantity" stroke="#8b5cf6" name="Quantity" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Product Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Category</th>
                  <th className="px-6 py-4 text-center font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-right font-semibold">Revenue (₹)</th>
                  <th className="px-6 py-4 text-right font-semibold">Avg Price (₹)</th>
                  <th className="px-6 py-4 text-center font-semibold">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {reportData.allProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No sales data available for selected date range
                    </td>
                  </tr>
                ) : (
                  reportData.allProducts.map((product, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                      <td className="px-6 py-4 text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{product.quantity}</td>
                      <td className="px-6 py-4 text-right font-semibold text-teal-600">
                        ₹{product.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">₹{product.avgPrice}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{product.unitsSold}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}