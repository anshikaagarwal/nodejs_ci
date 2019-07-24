const { clearCache } = require('../services/cache');

module.exports = async (req, res, next) => {
    await next();
    clearCache(req.user._id);
    console.log("cache cleared");
}