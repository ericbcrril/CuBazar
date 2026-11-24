"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
function sendSuccess(res, statusCode, data, message = 'Operación realizada correctamente') {
    return res.status(statusCode).json({ success: true, message, data });
}
//# sourceMappingURL=response.js.map