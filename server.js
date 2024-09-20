const express = require("express");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch");
const path = require("path");

const app = express();

// Allow CORS only from your website and Vercel
app.use(
  cors({
    origin: ["https://www.greenbalcony.com", "https://plant-identifier-msls2uh2b-brunos-projects-e594ffb4.vercel.app"], // Allow requests only from your website and Vercel
    methods: "GET, POST",
    allowedHeaders: "Content-Type",
  })
);

app.use(express.json());

// Set up Multer for file uploads
const upload = multer();

// Serve static files from the current directory (for serving index.html)
app.use(express.static(path.join(__dirname)));

// Handle the API requests to identify plants
app.post("/identify", upload.single("image"), (req, res) => {
  const apiKey = process.env.PLANTNET_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "API Key is missing!" });
    return;
  }

  const apiUrl = `https://my-api.plantnet.org/v2/identify/all?include-related-images=true&no-reject=false&nb-results=10&lang=en&api-key=${apiKey}`;

  const formData = new FormData();
  formData.append("organs", req.body.organ || "auto");

  if (req.file) {
    formData.append("images", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
  } else {
    res.status(400).json({ error: "No image file found." });
    return;
  }

  fetch(apiUrl, {
    method: "POST",
    headers: formData.getHeaders(),
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error from Pl@ntNet API: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => res.json(data))
    .catch((error) => res.status(500).json({ error: error.toString() }));
});

// Set headers to allow embedding in iframe on your domain
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "ALLOW-FROM https://www.greenbalcony.com");
  next();
});

// Listen on the appropriate port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
