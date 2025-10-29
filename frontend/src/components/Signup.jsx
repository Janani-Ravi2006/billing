import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  // 🔹 Signup Submit
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== rePassword) {
      toast.error("Passwords do not match!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/auth/signup", {
        username,
        password,
      });

      // ✅ Success toast
      toast.success(res.data.message || "Account Created Successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      // ✅ Clear fields
      setUsername("");
      setPassword("");
      setRePassword("");
    } catch (err) {
      // ❌ Error toast
      toast.error("Signup Failed! " + err.message, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-[Inter]">
      <div className="bg-white p-10 rounded-2xl w-[500px]">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Create Account
        </h2>

        <form className="space-y-7" onSubmit={handleSignup}>
          {/* Username */}
          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500">
            <FaUser className="text-black text-lg" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-3 outline-none text-gray-800 text-lg"
            />
          </div>

          {/* Password */}
          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500">
            <FaLock className="text-black text-lg" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-3 outline-none text-gray-800 text-lg"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500">
            <FaLock className="text-black text-lg" />
            <input
              type="password"
              placeholder="Re-type Password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              className="w-full pl-3 outline-none text-gray-800 text-lg"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-teal-500 text-white font-semibold py-4 rounded-lg hover:bg-teal-600 transition text-lg"
          >
            Create Account
          </button>

          {/* Switch */}
          <p className="text-base text-center mt-5 text-gray-600">
            Already have an account?{" "}
            <span
              className="text-teal-600 font-semibold cursor-pointer hover:underline"
              onClick={onSwitch}
            >
              Login
            </span>
          </p>
        </form>
      </div>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
}
