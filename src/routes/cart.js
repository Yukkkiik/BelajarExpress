const express = require('express');

const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} = require('../controller/cartController');
const { authMiddleware }  = require('../middleware/auth');
const { validateCart } = require('../middleware/validation');

const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/items', authMiddleware, validateCart, addToCart);
router.put('/items/:itemId', authMiddleware, updateCartItem);
router.delete('/items/:itemId', authMiddleware, removeFromCart);
router.delete('/clear', authMiddleware, clearCart);

module.exports = router;