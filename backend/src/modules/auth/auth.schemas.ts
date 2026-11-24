import { z } from 'zod';

const institutionalEmail = z
  .string()
  .email('Formato de correo inválido')
  .endsWith('@alumnos.udg.mx', 'Debe ser un correo institucional @alumnos.udg.mx')
  .transform((email) => email.toLowerCase());

export const registerSchema = z.object({
  body: z.object({
    email: institutionalEmail,
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: institutionalEmail,
    password: z.string().min(1, 'La contraseña es requerida'),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'El token de Google es requerido'),
  }),
});
