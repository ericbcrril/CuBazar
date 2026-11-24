"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.signInWithGoogle = signInWithGoogle;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const models_1 = require("../../models");
const AppError_1 = require("../../shared/errors/AppError");
const googleClient = new google_auth_library_1.OAuth2Client(env_1.env.GOOGLE_CLIENT_ID);
const tokenLifetimeSeconds = 8 * 60 * 60;
function createAccessToken(user) {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: tokenLifetimeSeconds });
}
function authResponse(user) {
    return {
        accessToken: createAccessToken(user),
        expiresIn: tokenLifetimeSeconds,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
        },
    };
}
async function register(input) {
    const email = input.email.toLowerCase();
    if (!email.endsWith('@alumnos.udg.mx')) {
        throw new AppError_1.AppError(400, 'Solo se permiten cuentas institucionales @alumnos.udg.mx', 'INVALID_EMAIL_DOMAIN');
    }
    const credHash = await bcryptjs_1.default.hash(input.password, 12);
    const user = await models_1.User.create({
        email,
        credHash,
        fullName: input.fullName,
    });
    await models_1.UserAvailability.create({ userId: user._id, isAvailable: false });
    return { userId: user.id, email: user.email };
}
async function login(input) {
    const user = await models_1.User.findOne({ email: input.email.toLowerCase() }).select('+credHash');
    const passwordMatches = user?.credHash
        ? await bcryptjs_1.default.compare(input.password, user.credHash)
        : false;
    if (!user || !passwordMatches) {
        throw new AppError_1.AppError(401, 'Correo o contraseña incorrectos', 'INVALID_CREDENTIALS');
    }
    return authResponse({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
    });
}
async function signInWithGoogle(idToken) {
    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: env_1.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    }
    catch {
        throw new AppError_1.AppError(401, 'El token de Google no es válido', 'INVALID_GOOGLE_TOKEN');
    }
    const email = payload?.email?.toLowerCase();
    if (!payload?.email_verified || !email || !email.endsWith('@alumnos.udg.mx') || !payload.sub) {
        throw new AppError_1.AppError(400, 'Solo se permiten cuentas institucionales @alumnos.udg.mx', 'INVALID_EMAIL_DOMAIN');
    }
    const existing = await models_1.User.findOne({ email }).select('profilePictureUrl');
    const user = await models_1.User.findOneAndUpdate({ email }, {
        $set: {
            googleId: payload.sub,
            isEmailVerified: true,
            ...(!existing?.profilePictureUrl && payload.picture
                ? { profilePictureUrl: payload.picture }
                : {}),
        },
        $setOnInsert: {
            email,
            fullName: payload.name?.trim() || email.split('@')[0],
            credHash: null,
            role: models_1.Role.STUDENT,
        },
    }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    if (!user)
        throw new AppError_1.AppError(500, 'No se pudo crear el perfil de Google', 'GOOGLE_SIGN_IN_FAILED');
    await models_1.UserAvailability.updateOne({ userId: user._id }, { $setOnInsert: { isAvailable: false } }, { upsert: true });
    return authResponse({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
    });
}
//# sourceMappingURL=auth.service.js.map