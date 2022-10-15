// @desc    Logger Middleware
const logger = (req, res, next) => {
    // req.hello = 'Hello Request Middleware';
    // console.log('Middleware ran...');
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl} `);
    next();
}

module.exports = logger;