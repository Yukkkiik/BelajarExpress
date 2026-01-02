const express = require('express');

const {
    getCart,
    addToCart
} = require('../controller/cartController');
const { authMiddleware }  = require('../middleware/auth');
const { validateCart } = require('../middleware/validation');

const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/items', authMiddleware, validateCart, addToCart);

module.exports = router;