const express = require('express');
const {register, login} = require('../controller/authController');
const {authMiddleware} = require('../middleware/auth');
const {  validateLogin} = require('../middleware/validation')

const router = express.Router();

router.post('/register', register);
router.post('/login', validateLogin, login);

module.exports = router;