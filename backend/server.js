const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables

const proRoutes = require("./routes/product.js");
const authRoutes = require("./routes/auth.js");

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/products", proRoutes);
app.use("/api/auth", authRoutes);


// MongoDB connection
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error("❌ MONGO_URI is missing from .env file.");
  process.exit(1);
}

console.log("🔍 Connecting to MongoDB...");

mongoose.connect(dbURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:");
    console.error(err);
  });

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
