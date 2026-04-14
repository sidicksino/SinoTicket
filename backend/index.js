require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const venueRouters = require('./routes/venueRoutes');
const sectionRouters = require('./routes/sectionRoutes');
const eventRouters = require('./routes/eventRoutes');
const seatRouters = require('./routes/seatRoutes');
const reservationRouters = require('./routes/reservationRoutes');
const ticketRouters = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = require('./config/db');

// Connect Database
connectDB();


// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(clerkMiddleware()); // Required by @clerk/express to validate JWTs

// Use Routes
app.use('/api/users', userRoutes);

// Venue
app.use('/api/venue', venueRouters);

// Event
app.use('/api/events', eventRouters);

// Section
app.use('/api/sections', sectionRouters);

// Seats
app.use('/api/seats', seatRouters);

// Reservations
app.use('/api/reservations', reservationRouters);

// Tickets
app.use('/api/tickets', ticketRouters);

// Notifications
app.use('/api/notifications', notificationRoutes);

// Uploads
app.use('/api/upload', uploadRoutes);

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
