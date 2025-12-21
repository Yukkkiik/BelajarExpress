const prisma = require('../config/db');

const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select : { products: true },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get categories',
            error: error.message
        })
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await prisma.category.findUnique({
            where: {
                id,
            },
            include: {
                products: true
            },
        });

        if(!category) {
            res.status(404).json({
                success: false,
                message: 'Category Not Found',
            });
        }

        res.status(200).json({
            success: true,
            data: category
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get category',
            error: error.message
        })
    }
};

const createCategory = async ( req, res ) => {
    try {
        const { name } = req.body;

        if(!name) {
            res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }

        const exisitngCategory = await prisma.category.findUnique({
            where: {
                name,
            },
        });

        if(exisitngCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists',
            });
        }
        
        const category = await prisma.category.create({
            data: {
                name,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        })
    }
}
module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory
}