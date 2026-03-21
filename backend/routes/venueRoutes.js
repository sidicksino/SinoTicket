const express = require('express');
const router = express.Router();
const venueControllers = require('../controllers/venueController');
const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Venue
 *   description: Venue management API
 */

/**
 * @swagger
 * /api/venue/add:
 *   post:
 *     summary: Create a new venue (Admin only)
 *     tags: [Venue]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Venue created successfully
 */
router.post('/add', authenticateToken, venueControllers.addVenue);

/**
 * @swagger
 * /api/venue/getVenue:
 *   get:
 *     summary: Retrieve all venues or filter by ID
 *     tags: [Venue]
 *     responses:
 *       200:
 *         description: A list of venues
 */
router.get('/getVenue', venueControllers.getVenue);

/**
 * @swagger
 * /api/venue/updateVenue/{id}:
 *   put:
 *     summary: Update an existing venue
 *     tags: [Venue]
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
 *         description: Venue updated
 */
router.put('/updateVenue/:id', authenticateToken, venueControllers.updateVenue);

/**
 * @swagger
 * /api/venue/deleteVenue/{id}:
 *   delete:
 *     summary: Delete a venue
 *     tags: [Venue]
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
 *         description: Venue deleted
 */
router.delete('/deleteVenue/:id', authenticateToken, venueControllers.deleteVenue);

module.exports = router;
