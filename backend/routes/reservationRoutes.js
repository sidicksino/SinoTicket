const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reservation
 *   description: Temporary seat locks before ticket purchase
 */

/**
 * @swagger
 * /api/reservations/reserve:
 *   post:
 *     summary: Reserve a seat for 15 minutes (Starts checkout timer)
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_id:
 *                 type: string
 *               seat_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Seat reserved for 15 minutes
 *       400:
 *         description: Seat unavailable or invalid match
 *       401:
 *         description: Unauthorized
 */
router.post('/reserve', authenticateToken, reservationController.reserveSeat);

/**
 * @swagger
 * /api/reservations/me:
 *   get:
 *     summary: Get my active reservations (Cart/Pending checkout items)
 *     tags: [Reservation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active, unexpired reservations currently held by the user
 */
router.get('/me', authenticateToken, reservationController.getMyReservations);

module.exports = router;
