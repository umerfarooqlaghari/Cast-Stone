const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables

const proRoutes = require("./routes/product.js");
const authRoutes = require("./routes/auth.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/orders.js");
const adminRoutes = require("./routes/admin.js");
const collectionsRoutes = require("./routes/collections.js");

const app = express();
const port = 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/products", proRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/collections", collectionsRoutes);


// MongoDB connection
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.warn("⚠️  MONGO_URI is missing from .env file. Running in mock mode.");
} else {
  console.log("🔍 Connecting to MongoDB...");

  mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch((err) => {
      console.error("❌ MongoDB connection error (continuing in mock mode):");
      console.error(err.message);
    });
}

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
