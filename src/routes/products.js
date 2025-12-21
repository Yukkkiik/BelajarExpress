const express = require('express');
const { 
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts
 } = require  ('../controller/productController');
const { authMiddleware, authorize} = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/seller/my-products', authMiddleware, authorize('SELLER'), getSellerProducts)
router.post('/', authMiddleware, authorize('ADMIN', 'SELLER'), createProduct);
router.put('/:id', authMiddleware, authorize('ADMIN', 'SELLER'), updateProduct);
router.delete('/:id', authMiddleware, authorize('ADMIN', 'SELLER'), deleteProduct);

module.exports = router;