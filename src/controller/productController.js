const prisma = require('../config/db');

const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { name: {
                    contains: search,
                }
                },
                { description : {
                  contains: search,  
                }
                },
            ];
        }

        if(category) {
            where.category = category;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true
                        },
                    },
                    seller: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        },
                    },
                },
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.product.count({
                where
            }),
        ]);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            },
        });
    } catch (error) {
        res.status(500).json({
            succes: false,
            message: 'Failed to get products',
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await prisma.product.findUnique({
            where: {id},
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    },
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    },
                },
            },
        });

        if(!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product retrieved successfully',
            data: product,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get product',
        })
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, image} = req.body;

        if (!name || !description || !price || !stock || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        const finalPrice = parseFloat(price);
        const finalStock = parseInt(stock);

        const productData = {
            name,
            description,
            price: finalPrice,
            stock: finalStock,
            categoryId,
            image,
        };

        const userRole = req.user.role ? req.user.role.toUpperCase() : "";

        if (userRole === 'SELLER' || 'seller') {
            productData.sellerId = req.user.id;
        } 

        const product = await prisma.product.create({
            data: productData,
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    },
                },
            },
        });
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
        })
    }
};

const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const {name,description,price,stock,categoryId,image} = req.body;

        const existingProduct = await prisma.product.findUnique({
            where: {
                id
            },
        });

        if(!existingProduct) {
            res.status(404).json({
                success: false,
                message: 'Product not Found'
            });
        }

        if (req.user.role === 'SELLER' && existingProduct.sellerId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only update your own products'
            });
        }

        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: {
                    id: categoryId
                },
            });

            if(!category) {
                res.status(404).json({
                    success: false,
                    message: 'Category Not found'
                });
            }
        }

        const productData = {
            name,
            description,
            price: price ? parseFloat(price) : undefined,
            stock: stock ? parseInt(stock) : undefined,
            categoryId,
            image,
        };

        const product = await prisma.product.update({
            where: {
                id
            },
            data: productData,
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to updated category',
        });
    }
};

const deleteProduct = async (req,res) => {
    try{
        const {id} = req.params;

        const existingProduct = await prisma.product.findUnique({
            where: {
                id
            },
        });

        if(!existingProduct) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if(req.user.role === 'SELLER' && existingProduct.sellerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own products',
            });
        }

        await prisma.product.delete({
            where: {
                id
            },
        });

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        })
    }
};

const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { page = 1, limit = 10, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = { sellerId };

        if(search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true
                        },
                    },
                },
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: {
                    createdAt: 'desc'
                },
            }),
            prisma.product.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get seller products',
            error: error.message
        })
    }
}
module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts
};