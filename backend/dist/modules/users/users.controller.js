"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAvatar = exports.setAvailability = exports.getById = exports.getActivity = exports.getMe = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const response_1 = require("../../shared/utils/response");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const usersService = __importStar(require("./users.service"));
const AppError_1 = require("../../shared/errors/AppError");
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    return (0, response_1.sendSuccess)(res, 200, await usersService.getMyProfile(user.id));
});
exports.getActivity = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    return (0, response_1.sendSuccess)(res, 200, await usersService.getActivity(user.id));
});
exports.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    return (0, response_1.sendSuccess)(res, 200, await usersService.getPublicProfile(req.params.id));
});
exports.setAvailability = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    const body = req.body;
    const data = await usersService.updateAvailability(user.id, body.isAvailable);
    return (0, response_1.sendSuccess)(res, 200, data);
});
exports.updateAvatar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = (0, auth_middleware_1.requireUser)(req);
    if (!req.file)
        throw new AppError_1.AppError(400, 'Debes adjuntar una imagen en el campo avatar', 'IMAGE_REQUIRED');
    const data = await usersService.updateAvatar(user.id, req.file.buffer);
    return (0, response_1.sendSuccess)(res, 200, data, 'Foto de perfil actualizada');
});
//# sourceMappingURL=users.controller.js.map