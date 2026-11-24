"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const institutionalEmail = zod_1.z
    .string()
    .email('Formato de correo inválido')
    .endsWith('@alumnos.udg.mx', 'Debe ser un correo institucional @alumnos.udg.mx')
    .transform((email) => email.toLowerCase());
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: institutionalEmail,
        password: zod_1.z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
        fullName: zod_1.z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: institutionalEmail,
        password: zod_1.z.string().min(1, 'La contraseña es requerida'),
    }),
});
exports.googleAuthSchema = zod_1.z.object({
    body: zod_1.z.object({
        idToken: zod_1.z.string().min(1, 'El token de Google es requerido'),
    }),
});
//# sourceMappingURL=auth.schemas.js.map