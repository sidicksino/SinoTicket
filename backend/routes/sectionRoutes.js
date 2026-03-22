const express = require('express');
const router = express.Router();
const sectionControllers = require('../controllers/sectionController');
const authenticateToken = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Section
 *   description: Section mapping inside a Venue
 */

/**
 * @swagger
 * /api/sections/add:
 *   post:
 *     summary: Create a new section in a venue (Admin only)
 *     tags: [Section]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               venue_id:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: VIP Stand
 *               description:
 *                 type: string
 *                 example: Exclusive VIP access section
 *               parent_section_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Section created successfully
 */
router.post('/add', authenticateToken, sectionControllers.addSection);

/**
 * @swagger
 * /api/sections:
 *   get:
 *     summary: Fetch sections (can filter by venue_id)
 *     tags: [Section]
 *     parameters:
 *       - in: query
 *         name: venue_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of sections
 */
router.get('/', sectionControllers.getSections);

/**
 * @swagger
 * /api/sections/{id}:
 *   get:
 *     summary: Get specific section by ID
 *     tags: [Section]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested section
 */
router.get('/:id', sectionControllers.getSectionById);

/**
 * @swagger
 * /api/sections/{id}:
 *   put:
 *     summary: Update a section (Admin only)
 *     tags: [Section]
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
 *         description: Section updated
 */
router.put('/:id', authenticateToken, sectionControllers.updateSection);

/**
 * @swagger
 * /api/sections/{id}:
 *   delete:
 *     summary: Delete a section (Admin only)
 *     tags: [Section]
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
 *         description: Section deleted
 */
router.delete('/:id', authenticateToken, sectionControllers.deleteSection);

module.exports = router;
