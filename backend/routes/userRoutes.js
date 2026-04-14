const express = require('express');
const router = express.Router();
const { registerUser, checkUserExists, getMe, makeMeAdmin, updateMe, getAllUsers } = require('../controllers/userController');
const { authenticateToken, checkAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Get all registered users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with pagination
 */
router.get('/all', authenticateToken, checkAdmin, getAllUsers);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current logged in user or sync from Clerk
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', authenticateToken, getMe);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current logged in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user profile
 */
router.put('/me', authenticateToken, updateMe);

/**
 * @swagger
 * /api/users/make-me-admin:
 *   get:
 *     summary: Temp route to upgrade you to Admin
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role upgraded
 */
router.get('/make-me-admin', authenticateToken, makeMeAdmin);

/**
 * @swagger
 * /api/users/check:
 *   post:
 *     summary: Check if a user with an email already exists
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns boolean exists
 */
router.post('/check', checkUserExists);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user from Clerk (Legacy/Manual Sync)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/', registerUser);

module.exports = router;
