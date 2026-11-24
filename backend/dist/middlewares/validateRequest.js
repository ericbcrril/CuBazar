"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const AppError_1 = require("../shared/errors/AppError");
const validateRequest = (schema) => (req, _res, next) => {
    const parsed = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
    });
    if (!parsed.success) {
        next(new AppError_1.AppError(400, 'La solicitud contiene datos inválidos', 'VALIDATION_ERROR', parsed.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }))));
        return;
    }
    const data = parsed.data;
    req.validated = {
        body: data.body,
        params: data.params,
        query: data.query,
    };
    if (req.validated.body)
        req.body = req.validated.body;
    if (req.validated.params)
        req.params = req.validated.params;
    next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map