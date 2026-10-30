require('dotenv').config(); // load .env first, before anything reads process.env

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ---------- Global middleware (runs on every request, in this order) ----------
app.use(cors({ origin: process.env.CLIENT_URL })); // allow only our React app to call the API
app.use(express.json());                           // read JSON bodies into req.body
app.use(logger);                                   // log every request

// ---------- Routes ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Nestora API is running' });
});

// Feature routers (auth, rooms, fees...) will be mounted here in later steps.

// ---------- Error handling (must come LAST) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start: connect to MongoDB first, then listen ----------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });