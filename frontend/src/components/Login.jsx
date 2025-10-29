// Login.jsx - UPDATED
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login({ onSwitch, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      
      console.log("Login response:", res.data); // Debug log
      
      if (res.data.success) {
        toast.success(res.data.message);
        
        // ✅ CRITICAL: Pass both username and userId to parent component
        onLoginSuccess(res.data.username, res.data.userId);
        
        console.log("✅ Logged in! Username:", res.data.username, "UserID:", res.data.userId);
        
        setUsername("");
        setPassword("");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      if (err.response) {
        toast.error(`Login Failed! ${err.response.status}: ${err.response.data.message || "Unknown error"}`);
      } else if (err.request) {
        toast.error("Login Failed! No response from server.");
      } else {
        toast.error("Login Failed! " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-[Inter]">
      <div className="bg-white p-10 rounded-2xl w-[500px] shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Login</h2>

        <form className="space-y-7" onSubmit={handleLogin}>
          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500">
            <FaUser className="text-black text-lg" />
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full pl-3 outline-none text-gray-800 text-lg" 
              required 
            />
          </div>

          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500">
            <FaLock className="text-black text-lg" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full pl-3 outline-none text-gray-800 text-lg" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full bg-teal-500 text-white font-semibold py-4 rounded-lg hover:bg-teal-600 transition text-lg ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-base text-center mt-5 text-gray-600">
            New user? <span className="text-teal-600 font-semibold cursor-pointer hover:underline" onClick={onSwitch}>Create Account</span>
          </p>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}