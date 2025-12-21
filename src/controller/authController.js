const prisma = require('../config/db');
const {generateToken} = require('../utils/jwt');
const {hashPassword, comparePassword} = require('../utils/hashPassword');

//register 
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success:false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            },
        });

        if (existingUser) {
            return res.status(400).json({
                success:false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'CUSTOMER'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        //create empty cart for new customer
        if(user.role === "CUSTOMER") {
            await prisma.cart.create({
                data: {
                    userId: user.id
                },
            });
        }

        const token = generateToken({ id: user.id, role: user.role });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success:false,
                message: 'Email and password are required'
            });
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success:false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken({ id: user.id, role: user.role });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

module.exports = {
    register,
    login
};