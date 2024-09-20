                const express = require("express");
                const cors = require("cors");
                const multer = require("multer");
                const FormData = require("form-data");
                const fetch = require("node-fetch");
                const path = require("path");

                const app = express();

                // Allow CORS for both your website and Vercel domain
                app.use(
                  cors({
                    origin: [
                      "https://www.greenbalcony.com",
                      "https://plant-identifier-msls2uh2b-brunos-projects-e594ffb4.vercel.app"
                    ], // Allow both your domain and Vercel app
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

                  console.log("API Key:", apiKey);

                  if (!apiKey) {
                    console.error("API Key is missing!");
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
                    console.error("No image file found in request.");
                    res.status(400).json({ error: "No image file found." });
                    return;
                  }

                  console.log("Sending request to Pl@ntNet API...");

                  fetch(apiUrl, {
                    method: "POST",
                    headers: formData.getHeaders(),
                    body: formData,
                  })
                    .then((response) => {
                      console.log("Pl@ntNet API response status:", response.status);

                      if (!response.ok) {
                        console.error("Failed to fetch from Pl@ntNet API:", response.statusText);
                        throw new Error(`Error from Pl@ntNet API: ${response.statusText}`);
                      }

                      return response.json();
                    })
                    .then((data) => {
                      console.log("Received data from Pl@ntNet API:", data);
                      res.json(data);
                    })
                    .catch(async (error) => {
                      console.error("Error during API request:", error.message || error);

                      if (error.response) {
                        const errorBody = await error.response.text();
                        console.error("Error response body:", errorBody);
                        res.status(error.response.status).json({ error: errorBody });
                      } else {
                        res.status(500).json({ error: error.toString() });
                      }
                    });
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
