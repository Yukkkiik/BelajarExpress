const prisma = require('../config/db');

const checkout = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product.name}`, 
                });
            }
        }

        const totalPrice = cart.items.reduce((total, item) => {
            return total + item.product.price * item.quantity
        }, 0);

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalPrice,
                    status: 'PENDING'
                },
            });

            for (const item of cart.items) {
                await tx.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    },
                });

                await tx.product.update({
                    where: {
                        id: item.productId,
                    },
                    data: {
                        stock: {
                            decrement: item.quantity
                        },
                    },
                });
            }

            await tx.cartItem.deleteMany({
                where: {
                    cartId: cart.id
                },
            });

            return newOrder;
        });

        const orderWithItems = await prisma.order.findUnique({
            where: {
                id: order.id,
            },
            include: {
                items: {
                    include: {
                        product: true
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Order Created successfully',
            data: orderWithItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Checkout failed',
            error: error.message
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = req.user.role === 'ADMIN' ? {} :{userId};

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    items: {
                        include: {
                            product: true
                        },
                    },
                },
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.order.count({ where })
        ]);
        
        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get Orders',
            error: error.message
        })
    }
};

const getOrderById = async (req, res) => {
    try{
        const userId = req.user.id;
        const { id } = req.params;
        const userRole = req.user.role;

        const order = await prisma.order.findUnique({
            where: {
                id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            include: {
                                category: true
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'order not found'
            });
        }

        if (userRole !== 'ADMIN' && order.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get Order',
            error: error.message
        })
    }
};

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const order = await prisma.order.findUnique({
            where: {
                id,
            },
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        const updatedOrder = await prisma.order.update({
            where: {
                id,
            },
            data: {
                status,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: true
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Order status Updated',
            data: updatedOrder,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message,
        });
    }
}

module.exports = {
    checkout,
    getOrders,
    getOrderById,
    updateOrder,
}