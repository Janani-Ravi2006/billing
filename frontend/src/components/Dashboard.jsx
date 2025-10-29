import { useState, useEffect } from "react";
import { 
  Package, ShoppingCart, DollarSign, AlertCircle, 
  TrendingUp, FileText, Bell, RefreshCw, X, Calendar, User
} from "lucide-react";

export default function Dashboard({ userId, username }) {
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    completedPurchases: 0,
    pendingPurchases: 0,
    totalPurchaseAmount: 0,
    pendingPurchaseAmount: 0,
    lowStockItems: 0,
    totalBills: 0,
    totalSales: 0,
    totalOverdue: 0,
    overdueCount: 0,
    // Filtered stats for financial overview
    filteredCompletedPurchases: 0,
    filteredPendingPurchases: 0,
    filteredTotalBills: 0,
    filteredOverdueCount: 0,
    filteredTotalPurchaseAmount: 0,
    filteredPendingPurchaseAmount: 0,
    filteredTotalSales: 0,
    filteredTotalOverdue: 0
  });

  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch from single dashboard endpoint
      const response = await fetch("http://localhost:5000/api/dashboard/stats");
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      
      // Extract data from response
      const categories = data.categories || 0;
      const products = data.products || 0;
      const purchases = data.purchases || [];
      const stocks = data.stocks || [];
      const bills = data.bills || [];
      const overdues = data.overdues || [];

      const completedPurchases = purchases.filter(p => p.paid === 1);
      const pendingPurchases = purchases.filter(p => p.paid === 0);
      
      // Filtered data for financial overview
      const filteredCompletedPurchases = filterByDate(completedPurchases);
      const filteredPendingPurchases = filterByDate(pendingPurchases);
      const filteredBills = filterByDate(bills);
      const filteredOverdues = filterByDate(overdues);
      
      const totalPurchaseAmount = filteredCompletedPurchases
        .reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);
      
      const pendingPurchaseAmount = filteredPendingPurchases
        .reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);

      const lowStockItems = stocks.filter(s => s.quantity <= (s.min_threshold || 10));

      const totalSales = filteredBills
        .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

      const totalOverdue = filteredOverdues
        .reduce((sum, o) => sum + parseFloat(o.balance_due || 0), 0);

      setStats({
        // Top 8 cards - All time data (no filter)
        totalCategories: categories.length,
        totalProducts: products.length,
        completedPurchases: completedPurchases.length,
        pendingPurchases: pendingPurchases.length,
        lowStockItems: lowStockItems.length,
        totalBills: bills.length,
        overdueCount: overdues.length,
        
        // Filtered data for financial overview
        filteredCompletedPurchases: filteredCompletedPurchases.length,
        filteredPendingPurchases: filteredPendingPurchases.length,
        filteredTotalBills: filteredBills.length,
        filteredOverdueCount: filteredOverdues.length,
        totalPurchaseAmount,
        pendingPurchaseAmount,
        totalSales,
        totalOverdue
      });

      const newAlerts = [
        ...lowStockItems.slice(0, 10).map(item => ({
          type: "low-stock",
          message: `${item.product_name} - Only ${item.quantity} ${item.unit || 'units'} left`,
          severity: "warning"
        })),
        ...overdues.slice(0, 10).map(item => ({
          type: "overdue",
          message: `${item.customer_name} - ₹${parseFloat(item.balance_due).toFixed(2)} overdue`,
          severity: "danger"
        }))
      ];
      
      setAlerts(newAlerts);
      setUnreadAlerts(newAlerts.length);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (data) => {
    if (dateFilter === "all") return data;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return data.filter(item => {
      const itemDate = new Date(item.bill_date || item.purchase_date || item.created_at);
      
      switch (dateFilter) {
        case "today":
          return itemDate >= today;
        case "custom":
          if (customDate.from && customDate.to) {
            return itemDate >= new Date(customDate.from) && itemDate <= new Date(customDate.to);
          }
          return true;
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [dateFilter, customDate]);

  // Top 4 Cards - Basic Metrics (All Time - No Filter)
  const topCards = [
    {
      title: "Total Categories",
      value: stats.totalCategories,
      icon: Package,
      iconBg: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: ShoppingCart,
      iconBg: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Completed Payments",
      value: stats.completedPurchases,
      icon: FileText,
      iconBg: "bg-green-500",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Pending Payments",
      value: stats.pendingPurchases,
      icon: AlertCircle,
      iconBg: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
      badge: stats.pendingPurchases > 0
    }
  ];

  // Middle 4 Cards - Alerts & Bills (All Time - No Filter)
  const middleCards = [
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: Package,
      iconBg: "bg-white",
      iconColor: "text-red-700",
      gradient: "from-white to-red-50",
      textColor: "text-white",
      badge: stats.lowStockItems > 0,
      pulse: stats.lowStockItems > 0,
      bgColor: "bg-gradient-to-br from-red-600 to-red-800",
      isAlert: true
    },
    {
      title: "Total Bills",
      value: stats.totalBills,
      icon: FileText,
      iconBg: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Overdue Bills",
      value: stats.overdueCount,
      icon: AlertCircle,
      iconBg: "bg-white",
      iconColor: "text-red-700",
      gradient: "from-white to-red-50",
      textColor: "text-white",
      badge: stats.overdueCount > 0,
      pulse: stats.overdueCount > 0,
      bgColor: "bg-gradient-to-br from-red-600 to-red-800",
      isAlert: true
    },
    {
      title: "Total Transactions",
      value: stats.totalBills + stats.completedPurchases,
      icon: TrendingUp,
      iconBg: "bg-cyan-500",
      gradient: "from-cyan-500 to-cyan-600"
    }
  ];

  // New Cards - Transaction Counts (FILTERED)
  const transactionCards = [
    {
      title: "Completed Purchases",
      value: stats.filteredCompletedPurchases,
      icon: FileText,
      iconBg: "bg-green-500",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Pending Purchases",
      value: stats.filteredPendingPurchases,
      icon: AlertCircle,
      iconBg: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
      badge: stats.filteredPendingPurchases > 0
    },
    {
      title: "Total Bills",
      value: stats.filteredTotalBills,
      icon: FileText,
      iconBg: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Overdue Bills",
      value: stats.filteredOverdueCount,
      icon: AlertCircle,
      iconBg: "bg-rose-500",
      gradient: "from-rose-500 to-rose-600",
      badge: stats.filteredOverdueCount > 0
    },
    {
      title: "Total Transactions",
      value: stats.filteredTotalBills + stats.filteredCompletedPurchases,
      icon: TrendingUp,
      iconBg: "bg-cyan-500",
      gradient: "from-cyan-500 to-cyan-600"
    }
  ];

  // Financial Amount Cards (FILTERED)
  const financialCards = [
    {
      title: "Total Purchase Amount",
      value: stats.totalPurchaseAmount,
      icon: DollarSign,
      iconBg: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Pending Purchase Amount",
      value: stats.pendingPurchaseAmount,
      icon: AlertCircle,
      iconBg: "bg-amber-500",
      gradient: "from-amber-500 to-amber-600"
    },
    {
      title: "Total Sales",
      value: stats.totalSales,
      icon: TrendingUp,
      iconBg: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Overdue Amount",
      value: stats.totalOverdue,
      icon: AlertCircle,
      iconBg: "bg-rose-500",
      gradient: "from-rose-500 to-rose-600",
      badge: stats.totalOverdue > 0
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-full">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {getGreeting()}, {username || "User"}! 👋
              </h1>
              <p className="text-teal-50 text-lg">
                Welcome to your Business Dashboard
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadAlerts(0);
              }}
              className="relative bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 p-3 rounded-xl transition-all"
            >
              <Bell className="w-6 h-6" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {unreadAlerts}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-5 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Cards - Basic Metrics (ALL TIME) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {topCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
          >
            {card.badge && (
              <div className="absolute top-3 right-3">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                  Alert
                </span>
              </div>
            )}
            
            <div className={`${card.iconBg} p-3 rounded-lg shadow-md w-fit mb-4`}>
              <card.icon className="w-7 h-7 text-white" />
            </div>
            
            <h3 className="text-gray-600 text-sm font-medium mb-2">{card.title}</h3>
            <p className={`text-4xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Middle 4 Cards - Alerts & Bills (ALL TIME) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {middleCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor || 'bg-white'} rounded-xl shadow-lg p-6 relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 ${card.isAlert ? 'border-2 border-red-900 shadow-red-500/50' : ''}`}
          >
            {card.pulse && (
              <div className="absolute top-3 right-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              </div>
            )}

            {card.badge && !card.pulse && (
              <div className="absolute top-3 right-3">
                <span className="bg-white text-red-700 text-xs font-bold px-2 py-1 rounded-full shadow">
                  Alert
                </span>
              </div>
            )}
            
            <div className={`${card.iconBg} p-3 rounded-lg shadow-md w-fit mb-4`}>
              <card.icon className={`w-7 h-7 ${card.iconColor || 'text-white'}`} />
            </div>
            
            <h3 className={`text-sm font-semibold mb-2 ${card.textColor || 'text-gray-600'}`}>{card.title}</h3>
            <p className={`text-4xl font-bold ${card.isAlert ? 'text-white' : `bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Financial Overview Section with Filter */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-teal-500" />
              Financial Overview
            </h2>
            <p className="text-gray-600">Track your revenue and expenses (Filtered Data)</p>
          </div>

          {/* Date Filter Buttons */}
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
            <Calendar className="w-5 h-5 text-gray-500" />
            
            <button
              onClick={() => setDateFilter("all")}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                dateFilter === "all"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Time
            </button>

            <button
              onClick={() => setDateFilter("today")}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                dateFilter === "today"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Today
            </button>

            <button
              onClick={() => setDateFilter("custom")}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                dateFilter === "custom"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Custom Date Picker */}
        {dateFilter === "custom" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  value={customDate.from}
                  onChange={(e) => setCustomDate({ ...customDate, from: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700 font-medium"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  value={customDate.to}
                  onChange={(e) => setCustomDate({ ...customDate, to: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700 font-medium"
                />
              </div>

              <button
                onClick={fetchDashboardData}
                className="mt-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-teal-700 transition font-semibold shadow-lg"
              >
                Apply Filter
              </button>
            </div>
          </div>
        )}

        {/* Transaction Count Cards (FILTERED) */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-500" />
            Transaction Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {transactionCards.map((card, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-gray-100"
              >
                {card.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                      Alert
                    </span>
                  </div>
                )}
                
                <div className={`${card.iconBg} p-3 rounded-lg shadow-md w-fit mb-4`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-gray-600 text-xs font-medium mb-2">{card.title}</h3>
                <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Amount Cards (FILTERED) */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-teal-500" />
            Financial Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialCards.map((card, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-gray-100"
              >
                {card.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                      Alert
                    </span>
                  </div>
                )}
                
                <div className={`${card.iconBg} p-3 rounded-lg shadow-md w-fit mb-4`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-gray-600 text-sm font-medium mb-2">{card.title}</h3>
                <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  ₹{card.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Status Badge */}
        {dateFilter !== "all" && (
          <div className="mt-6 flex justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">
                {dateFilter === "today" 
                  ? "Showing Today's Data" 
                  : `Custom Range: ${customDate.from} to ${customDate.to}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed right-6 top-24 bg-white rounded-2xl shadow-2xl w-96 max-h-[600px] overflow-hidden z-50 border-2 border-gray-200">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <h3 className="font-bold text-xl">System Alerts</h3>
              <span className="bg-white text-teal-600 text-xs font-bold px-3 py-1 rounded-full">
                {alerts.length}
              </span>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="hover:bg-teal-600 p-2 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[500px]">
            {alerts.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-semibold text-lg">No alerts</p>
                <p className="text-sm">Everything is running smoothly!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-5 hover:bg-gray-50 transition ${
                      alert.severity === "danger" ? "border-l-4 border-red-500" : "border-l-4 border-yellow-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.severity === "danger" ? "bg-red-100" : "bg-yellow-100"
                      }`}>
                        <AlertCircle className={`w-6 h-6 ${
                          alert.severity === "danger" ? "text-red-500" : "text-yellow-500"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 mb-2">{alert.message}</p>
                        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                          alert.type === "low-stock" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {alert.type === "low-stock" ? "LOW STOCK" : "OVERDUE"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}