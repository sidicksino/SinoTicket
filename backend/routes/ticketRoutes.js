const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Ticket
 *   description: Ticket issuance and retrieval
 */

/**
 * @swagger
 * /api/tickets/checkout:
 *   post:
 *     summary: Purchase/Checkout an active reservation and generate a Ticket
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reservation_id:
 *                 type: string
 *               payment_method:
 *                 type: string
 *                 enum: [MobileMoney, Card]
 *     responses:
 *       201:
 *         description: Ticket successfully purchased and generated
 *       400:
 *         description: Reservation expired, invalid, or seat unavailable
 */
router.post('/checkout', authenticateToken, ticketController.checkoutReservation);

/**
 * @swagger
 * /api/tickets/verify/{qr}:
 *   get:
 *     summary: Verify and consume a Ticket via QR code scan
 *     tags: [Ticket]
 *     parameters:
 *       - in: path
 *         name: qr
 *         required: true
 *         schema:
 *           type: string
 *         description: The QR code hash to verify
 *     responses:
 *       200:
 *         description: Ticket verification status
 */
router.get('/verify/:qr', ticketController.verifyTicket);

/**
 * @swagger
 * /api/tickets/me:
 *   get:
 *     summary: Retrieve my purchased tickets (Wallet)
 *     tags: [Ticket]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchased tickets currently owned by user
 */
router.get('/me', authenticateToken, ticketController.getMyTickets);

module.exports = router;
