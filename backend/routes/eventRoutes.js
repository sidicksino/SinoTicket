const express = require('express');
const router = express.Router();
const eventControllers = require('../controllers/eventController');
const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Event
 *   description: Event management APIs for organizing concerts or tech summits.
 */

/**
 * @swagger
 * /api/events/add:
 *   post:
 *     summary: Create a new event (Admin only)
 *     tags: [Event]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: SinoTicket Launch Party
 *               description:
 *                 type: string
 *                 example: The biggest tech event of the year
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-03-21T23:17:54.778Z
 *               venue_id:
 *                 type: string
 *                 example: 69bf21a28054daabe7f0f297
 *               status:
 *                 type: string
 *                 enum: [Upcoming, Ongoing, Ended]
 *                 example: Upcoming
 *               artist_lineup:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: DJ Snake
 *                     time:
 *                       type: string
 *                       example: "22:00"
 *               ticket_categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category_id:
 *                       type: string
 *                       example: 69bf21a28054daabecategoryxx
 *                     name:
 *                       type: string
 *                       example: VIP Box
 *                     price:
 *                       type: number
 *                       example: 15000
 *                     section_id:
 *                       type: string
 *                       example: 69bf21a28054daabesectionxx
 *                     quantity:
 *                       type: number
 *                       example: 50
 *                     sold:
 *                       type: number
 *                       example: 0
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post('/add', authenticateToken, eventControllers.addEvent);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Retrieve all events or filter by queries
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: A list of events
 */
router.get('/', eventControllers.getEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a specific event by ID
 *     tags: [Event]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested event
 */
router.get('/:id', eventControllers.getEventById);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an existing event (Admin only)
 *     tags: [Event]
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
 *     responses:
 *       200:
 *         description: Event updated
 */
router.put('/:id', authenticateToken, eventControllers.updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event (Admin only)
 *     tags: [Event]
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
 *         description: Event deleted
 */
router.delete('/:id', authenticateToken, eventControllers.deleteEvent);

module.exports = router;
