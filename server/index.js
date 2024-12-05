const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

// Initialize Express app
const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Supabase initialization
const supabaseUrl = "https://zjvbmahavecgovtgjkch.supabase.co"; // Replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdmJtYWhhdmVjZ292dGdqa2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMDM0MDQsImV4cCI6MjA0ODY3OTQwNH0.s6D59MWDEeEAKUnAco7_RSoLjbkRbivqhJaMmVpttpQ"; // Replace with your API Key
const supabase = createClient(supabaseUrl, supabaseKey);

// Routes
const authRoutes = require("./webroute/auth");
app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
