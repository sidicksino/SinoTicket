const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken, checkAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Admin dashboard global statistics
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Fetch massive analytical stats for the admin homepage
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytical data
 */
router.get('/stats', authenticateToken, checkAdmin, getDashboardStats);

module.exports = router;
