const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch");
const path = require("path");
const app = express();

// Allow CORS from your app and website domains
app.use(
  cors({
    origin: [
      "https://plant-identifier-kyop3edm8-brunos-projects-e594ffb4.vercel.app",
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
app.use(express.static(path.join(__dirname, "public")));

// **Removed** Content Security Policy Middleware
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "frame-ancestors 'self' https://www.greenbalcony.com"
//   );
//   next();
// });

// Root route handler
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle the API requests to identify plants
app.post("/identify", upload.single("image"), async (req, res) => {
  const apiKey = process.env.PLANTNET_API_KEY;
  if (!apiKey) {
    console.error("API Key is missing!");
    return res.status(500).json({ error: "API Key is missing!" });
  }

  const apiUrl = `https://my-api.plantnet.org/v2/identify/all?include-related-images=true&no-reject=false&lang=en&api-key=${apiKey}`;
  const formData = new FormData();
  formData.append("organs", req.body.organ || "auto");

  if (req.file) {
    formData.append("images", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
  } else {
    console.error("No image file found in request.");
    return res.status(400).json({ error: "No image file found." });
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error from Pl@ntNet API: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error during API request:", error.message || error);
    res.status(500).json({ error: error.toString() });
  }
});

// Listen on the appropriate port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
