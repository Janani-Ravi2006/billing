// DELETE THIS DUPLICATE CODE FROM Billing.js:
import { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";  

// Import Pages
import Purchase from "./components/Purchase";
import Stock from "./components/Stock";
import Category from "./components/Category";
import SavedCategories from "./components/SavedCategories";
import SavedProducts from "./components/SavedProducts";
import Products from "./components/Products";
import Billing from "./components/Billing";
import ExecutiveSalary from "./components/ExecutiveSalary";
import AccountPage from "./components/AccountPage";
import OverDues from "./components/Overdue";
import ProductSalesReport from "./components/ProductSalesReport";
import Dashboard from "./components/Dashboard";
import Transaction from "./components/Transaction";
import ExectiveReport from "./components/ExecutiveReport";
import PackerEntry from "./components/PackerEntry";
import PackerReport from "./components/PackerReport";
export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleLoginSuccess = (username, id) => {
    setUser(username);
    setUserId(id);
    console.log("Logged in user:", username, "ID:", id);
  };

  const handleLogout = () => {
    setUser(null);
    setUserId(null);
    setIsLogin(true);
  };

  return (
    <Router>
      {user ? (
        <div className="flex">
          <Navbar username={user} onLogout={handleLogout} />

          <div className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard userId={userId} username={user} />} />
              <Route path="/purchase" element={<Purchase userId={userId} />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/category" element={<Category />} />
              <Route path="/saved" element={<SavedCategories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/saved-products" element={<SavedProducts />} />
              <Route path="/billing" element={<Billing userId={userId} />} />
              <Route path="/executive-salary" element={<ExecutiveSalary />} />
              <Route path="/accounts" element={<AccountPage />} />
              <Route path="/over-dues" element={<OverDues />} />
              <Route path="/product-sales-report" element={<ProductSalesReport />} />
              <Route path="/transactions" element={<Transaction />} />
              <Route path="/executive-report" element={<ExectiveReport />} />
              <Route path="/packer-entry" element={<PackerEntry />} />
              <Route path="/package-section-report" element={<PackerReport />} />
              <Route path="/" element={
                <div className="text-center mt-20">
                  <h2 className="text-3xl font-bold text-teal-600">Welcome, {user}!</h2>
                  <p className="text-gray-600 mt-4">Your User ID: {userId}</p>
                </div>
              } />
            </Routes>
          </div>
        </div>
      ) : isLogin ? (
        <Login
          onSwitch={() => setIsLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <Signup onSwitch={() => setIsLogin(true)} />
      )}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}