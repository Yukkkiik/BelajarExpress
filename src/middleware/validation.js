const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if(!email || !validateEmail(email)) {
        errors.push('Valid email is required')
    }

    if(!password) {
        errors.push('Password is required')
    }

    if(errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    next();
};

const validateProduct = (req, res, next) => {
    const { name, description, price, stock, categoryId } = req.body;
    const errors = [];

    if(!name || name.trim().length < 3) {
        errors.push('Product Name must be at least 3 characters');
    }

    if(!description || description.trim().length < 10) {
        errors.push('Description must be at least 10 characters');
    }

    if(!price || isNaN(price) || parseFloat(price) <= 0) {
        errors.push('Valid price is required ( must be greater than 0)');
    }

    if(!categoryId || categoryId.trim().length === 0) {
        errors.push('Category ID is required');
    }

    if(errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errros,
        });
    }

    next();
};

const validateCart = (req, res, next) => {
    const { productId, quantity } = req.body;
    const errors = [];

    if(!productId || productId.trim().length === 0) {
        errors.push('Product ID is required')
    }

    if(!quantity || isNaN(quantity) || parseInt(quantity) < 1) {
        errors.push('Quantity must be at least 1')
    }

    if(errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }
    next();
};

module.exports = {
    validateLogin,
    validateProduct,
    validateCart,
}