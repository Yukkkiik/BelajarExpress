const express = require('express');
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controller/categoryController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authMiddleware, authorize('ADMIN'), createCategory);
router.put('/:id', authMiddleware, authorize('ADMIN'), updateCategory);
router.delete('/:id', authMiddleware, authorize('ADMIN'), deleteCategory);

module.exports = router;