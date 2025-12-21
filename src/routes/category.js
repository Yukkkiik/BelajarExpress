const express = require('express');
const {
    getAllCategories,
    getCategoryById,
    createCategory,
} = require('../controller/categoryController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authMiddleware, authorize('ADMIN'), createCategory)

module.exports = router;