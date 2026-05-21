const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// Middleware
// CORS — allow React (port 5173) to talk to this server
app.use(cors({ origin: 'http://localhost:5173' }));

// Parse JSON request body
app.use(express.json());

// Routes
const homestayRoutes = require('./routes/homestays');
const authRoutes     = require('./routes/auth');

app.use('/api/homestays', homestayRoutes);
app.use('/api/auth',      authRoutes);

// Test route — to check server is running
app.get('/', (req, res) => {
  res.json({ message: 'Zamanss Homestay API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});