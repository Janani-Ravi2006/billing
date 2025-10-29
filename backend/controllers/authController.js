// authController.js - UPDATED
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// Signup
exports.signup = (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.json({ success: false, message: "Error hashing password" });

    User.create(username, hash, (err) => {
      if (err) return res.json({ success: false, message: "User already exists!" });
      res.json({ success: true, message: "Account created successfully!" });
    });
  });
};

// Login - FIXED VERSION
exports.login = (req, res) => {
  const { username, password } = req.body;
  
  console.log("🔐 Login attempt for username:", username);
  
  User.findByUsername(username, (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      console.log("❌ User not found:", username);
      return res.json({ success: false, message: "User not found" });
    }

    const user = results[0];
    console.log("✅ User found in database. ID:", user.id, "Username:", user.username);
    
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error("❌ Password compare error:", err);
        return res.json({ success: false, message: "Server error" });
      }

      if (!match) {
        console.log("❌ Invalid password for user:", username);
        return res.json({ success: false, message: "Invalid credentials" });
      }

      // ✅ CRITICAL: Return userId and username in response
      console.log("🎉 Login successful! Sending userId:", user.id);
      
      res.json({ 
        success: true, 
        message: "Login successful!",
        userId: user.id,        // IMPORTANT: User ID
        username: user.username  // IMPORTANT: Username
      });
    });
  });
};