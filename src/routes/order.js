const express = require('express');
const {
    checkout,
    getOrders,
    getOrderById,
    updateOrder,
} = require('../controller/orderController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/checkout', authMiddleware, checkout);
router.get('/',authMiddleware, getOrders);
router.get('/:id', authMiddleware,getOrderById);
router.put('/:id/status', authMiddleware,authorize('ADMIN'), updateOrder);

module.exports = router;