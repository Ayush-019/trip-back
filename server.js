// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Allow CORS for all origins (configure if needed)
app.use(express.json()); // Parse JSON bodies

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Route: Proxy POST requests for itinerary generation to OpenRouter API
app.post("/api/openrouter/completions", async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({ error: "OpenRouter API key not configured" });
    }
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "OpenRouter proxy error:",
      error.response?.data || error.message
    );
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

// Route: Proxy GET requests for Pexels image search
app.get("/api/pexels/search", async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }
  try {
    if (!PEXELS_API_KEY) {
      return res.status(500).json({ error: "Pexels API key not configured" });
    }
    const response = await axios.get("https://api.pexels.com/v1/search", {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
      params: {
        query,
        per_page: 1,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Pexels proxy error:", error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend proxy server listening on port ${PORT}`);
});
