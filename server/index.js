const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

// CORS configuration for separate deployment
const corsOptions = {
  origin: process.env.CLIENT_URL || true, // true allows the current origin
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', authRoutes);

// Serve static files in production (if deployed as a single unit)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Crystal Events Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
