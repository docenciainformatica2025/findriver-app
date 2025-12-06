const auth = require('./auth');
const validation = require('./validation');
const errorHandler = require('./errorHandler');
const notFound = require('./notFound');
const upload = require('./upload');

module.exports = {
    authenticate: auth.authenticate,
    authorize: auth.authorize,
    requireVerification: auth.requireVerification,
    sensitiveRoute: auth.sensitiveRoute,
    limitLoginAttempts: auth.limitLoginAttempts,
    validate: validation.validate,
    validateObjectId: validation.validateObjectId,
    validateFile: validation.validateFile,
    schemas: validation.schemas,
    errorHandler,
    notFound,
    upload
};
