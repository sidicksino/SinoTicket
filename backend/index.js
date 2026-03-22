const express = require('express');
const cors = require('cors');
require('dotenv').config({ override: true });

// Import Routes
const userRoutes = require('./routes/userRoutes');
const venueRouters = require('./routes/venueRoutes');
const sectionRouters = require('./routes/sectionRoutes');
const eventRouters = require('./routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = require('./config/db');

// Connect Database
connectDB();


// Middleware
app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api/users', userRoutes);

// Venue
app.use('/api/venue', venueRouters);

// Event
app.use('/api/events', eventRouters);

// Section
app.use('/api/sections', sectionRouters);

// Swagger Documentation
const setupSwagger = require('./swagger/swaggerConfig');
setupSwagger(app);

// Basic Route
app.get('/', (req, res) => {
  res.send('SinoTicket Backend is running...');
});

// Global Error Handler (Formats Clerk and standard errors as JSON)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
