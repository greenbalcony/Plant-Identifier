const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch");
const path = require("path");

// Create an instance of Express
const app = express();

// Set Content Security Policy to allow embedding
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://www.greenbalcony.com"
  );
  next();
});

// Allow CORS from your domains
app.use(
  cors({
    origin: [
      "https://your-app-url.vercel.app", // Replace with your actual app URL
      "https://www.greenbalcony.com",
    ],
    methods: "GET, POST",
    allowedHeaders: "Content-Type",
    credentials: true,
  })
);

app.use(express.json());

// Set up Multer for file uploads
const upload = multer();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Root route handler
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Handle the API requests to identify plants
app.post("/identify", upload.single("image"), async (req, res) => {
  // ... (same as before)
});

// Export the Express app as a serverless function
module.exports = app;
