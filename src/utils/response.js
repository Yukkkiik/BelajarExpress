const successResponse = (res, data, message = 'success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};

const errorResponse = (res, message = 'error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString(),
    });
};

const paginatedResponse = (res, data, pagination, message = 'success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages,
            hasNext: pagination.page < pagination.totalPages,
            hasPrev: pagination.page > 1,
        },
        timestamp: new Date().toISOString(),
    });
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse
};