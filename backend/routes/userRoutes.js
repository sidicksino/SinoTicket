const express = require('express');
const router = express.Router();
const { registerUser, checkUserExists } = require('../controllers/userController');

// Route to check if user already exists
router.post('/check', checkUserExists);

// Route to register a new user from Clerk
router.post('/', registerUser);

module.exports = router;
