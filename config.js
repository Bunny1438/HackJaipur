exports.DATABASE_URL = process.env.DATABASE_URL;
exports.TEST_DATABASE_URL = 'mongodb://localhost/test-reflections-app';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '86400' // expires in 24 hours
