const prisma = require('../config/db');

const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await prisma.cart.findUnique({
            where: {
                userId
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        if(!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    category: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        const totalPrice = cart.items.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                cart,
                totalPrice,
                itemCount: cart.items.length,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get cart',
            error: error.message
        })
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const quantityInt = parseInt(req.body.quantity);
        const {productId} = req.body;

        if(!productId || !quantityInt || quantityInt < 1) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and valid quantity are required',
            });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            },
        });

        if(!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (product.stock < quantityInt) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
            });
        }

        let cart = await prisma.cart.findUnique({
            where: {
                userId
            },
        });

        if(!cart) {
            cart = await prisma.cart.create({
                data:{
                    userId
                },
            });
        }

        const exisitngCartItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        let cartItem;

        if(exisitngCartItem) {
            const newQuantity = exisitngCartItem.quantity + quantityInt;

            if(product.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock for the requested quantity',
                });
            }

            cartItem = await prisma.cartItem.update({
                where: {
                    id: exisitngCartItem.id,
                },
                data: {
                    quantity: newQuantity,
                },
                include: {
                    product: true,
                },
            });
        } else {
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity: quantityInt,
                },
                include: {
                    product: true,
                },
            });
        }

        res.status(201).json({
            success: true,
            message: 'Product added to cart successfully',
            data: cartItem,
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add to cart',
            error: error.message
        })
    }
};

const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            res.status(400).json({
                success: false,
                message: 'Valid quantity is required',
            });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: {
                id: itemId,
            },
            include: {
                cart: true,
                product: true,
            },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            res.status(404).json({
                success: false,
                message: 'Cart item not found',
            });
        }

        if (cartItem.product.stock < quantity) {
            res.status(400).json({
                success: false,
                message: 'Insufficient stock',
            });
        }

        const updateCartItem = await prisma.cartItem.update({
            where: {
                id: itemId,
            },
            data: {
                quantity: parseInt(quantity),
            },
            include: {
                product: true,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: updateCartItem,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: error.message
        })
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const cartItem = await prisma.cartItem.findUnique({
            where: {
                id: itemId,
            },
            include: {
                cart: true,
            },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            return res.status(404).json({
                success: false,
                message: 'Cart Item not found',
            });
        }

        await prisma.cartItem.delete({
            where: {
                id: itemId,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Cart item removed successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove cart item',
            error: error.message
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: {
                userId
            },
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
