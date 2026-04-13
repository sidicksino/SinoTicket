const express = require('express');
const router = express.Router();
const seatControllers = require('../controllers/seatController');
const { authenticateToken, checkAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Seat
 *   description: Seat management inside Sections
 */

/**
 * @swagger
 * /api/seats/generate:
 *   post:
 *     summary: Bulk generate numbered seats in a section (Admin only)
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               section_id:
 *                 type: string
 *               start_number:
 *                 type: number
 *                 description: The starting number for the seats
 *                 example: 1
 *               count:
 *                 type: number
 *                 description: How many seats to generate
 *                 example: 100
 *     responses:
 *       201:
 *         description: Seats generated successfully
 */
router.post('/generate', authenticateToken, checkAdmin, seatControllers.generateSeats);

/**
 * @swagger
 * /api/seats:
 *   get:
 *     summary: Get seats with pagination and filtering
 *     tags: [Seat]
 *     parameters:
 *       - in: query
 *         name: section_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, reserved, booked]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of seats
 */
router.get('/', seatControllers.getSeats);

/**
 * @swagger
 * /api/seats/{id}:
 *   put:
 *     summary: Update seat status (Admin only)
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, reserved, booked]
 *     responses:
 *       200:
 *         description: Seat updated
 */
router.put('/:id', authenticateToken, checkAdmin, seatControllers.updateSeat);

/**
 * @swagger
 * /api/seats/{id}:
 *   delete:
 *     summary: Delete a specific seat (Admin only)
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seat deleted
 */
router.delete('/:id', authenticateToken, checkAdmin, seatControllers.deleteSeat);

/**
 * @swagger
 * /api/seats/section/{section_id}:
 *   delete:
 *     summary: Clear all seats in a section (Admin only)
 *     tags: [Seat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: section_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All seats deleted in section
 */
router.delete('/section/:section_id', authenticateToken, checkAdmin, seatControllers.clearSectionSeats);

module.exports = router;
