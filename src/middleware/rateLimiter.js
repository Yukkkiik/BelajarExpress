const rateLimit = new Map();

const rateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
        max = 100,
        message = 'Too many requests, please try againt later.',
    } = options;

    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if(!rateLimit.has(ip)) {
            rateLimit.set(ip, {
                count: 1,
                resetTime: now + windowMs,
            });
            return next();
        }

        const record = rateLimit.get(ip);

        if(now > record.resetTime) {
            record.count = 1;
            record.resetTime = now + windowMs;
            return next();
        }

        if(record.count >= max) {
            return res.status(429).json({
                success: false,
                message,
            });
        }

        record.count++;
        next();
    };
};

setInterval(() => {
    const now = Date.now();
    for(const [ip, record] of rateLimit.entries()) {
        if (now > record.resetTime) {
            rateLimit.delete(ip);
        }
    }
}, 60 * 60 * 1000);

module.exports = rateLimiter