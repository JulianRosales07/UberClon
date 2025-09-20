const express = require('express');
const { register, login, logout, getProfile } = require('../controllers/AuthController');
const { validateUser, validateLogin } = require('../../shared/middleware/validators');
const { authenticateToken } = require('../../shared/middleware/auth');

const router = express.Router();

// Rutas públicas
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);

// Rutas protegidas
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;