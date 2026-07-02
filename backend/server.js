const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
const homestayRoutes = require('./routes/homestays');
const authRoutes     = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');
const adminRoutes    = require('./routes/admin');
const reviewsRouter = require('./routes/reviews');
const refundsRouter = require('./routes/refunds');
const contactRouter = require('./routes/contact');



app.use('/api/homestays', homestayRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/bookings',  bookingsRouter);
app.use('/api/admin',     adminRoutes);
app.use('/api/reviews', reviewsRouter);
app.use('/api/refunds', refundsRouter);
app.use('/api/contact', contactRouter);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Zamanss Homestay API is running!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});