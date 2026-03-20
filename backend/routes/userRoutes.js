const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/userController');

// Route to register a new user from Clerk
router.post('/', registerUser);

module.exports = router;
