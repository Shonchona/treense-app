const express = require("express");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Supabase setup
const supabaseUrl = "https://zjvbmahavecgovtgjkch.supabase.co"; // Replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdmJtYWhhdmVjZ292dGdqa2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMDM0MDQsImV4cCI6MjA0ODY3OTQwNH0.s6D59MWDEeEAKUnAco7_RSoLjbkRbivqhJaMmVpttpQ"; // Replace with your API Key
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT Secret Key
const JWT_SECRET = "your_jwt_secret_key"; // Replace with your own secret key

// User Signup Route
router.post("/web/views/signup.html", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Validate that password is provided
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password is required and must be at least 8 characters long" });
    }

    // Check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Log password for debugging (REMOVE THIS IN PRODUCTION)
    console.log("Password before hashing:", password);

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // Ensure the password is passed correctly
    console.log("Hashed password:", hashedPassword); // Log the hashed password

    // Insert new user into the database
    const { data, error } = await supabase.from("users").insert([
      {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: hashedPassword,
      },
    ]);

    if (error) {
      throw error; // Throw error to be caught by catch block
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});

// User Login Route
router.post("/web/views/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(200).json({
      message: "Login successful",
      token, // Send token back to the client
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// Fetch Reports Data for Admin (or after login)
router.get("/api/reports", async (req, res) => {
  try {
    // Ensure the user is authenticated (check JWT token)
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Check if the user is an admin (or apply role-based logic here)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For simplicity, assuming user with role 'admin' can fetch all reports
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    // Fetch report data (example for reports)
    const { data: reports, error: reportError } = await supabase
      .from("reports")
      .select("*");

    if (reportError) {
      return res.status(500).json({ message: "Error fetching reports", error: reportError.message });
    }

    // Analytics data (example, could be dynamic based on reports)
    const analytics = {
      labels: ["January", "February", "March"],
      data: [100, 150, 200],
    };

    res.status(200).json({
      totalReports: reports.length,
      recentActivity: reports[0] ? `Report #${reports[0].id} generated` : "No reports",
      reports,
      analytics,
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching report data", error: err.message });
  }
});

module.exports = router;
