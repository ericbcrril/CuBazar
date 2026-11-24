import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { User, UserAvailability, Role, type UserRecord } from '../../models';
import { AppError } from '../../shared/errors/AppError';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const tokenLifetimeSeconds = 8 * 60 * 60;

function createAccessToken(user: { id: string; email: string; role: UserRecord['role'] }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: tokenLifetimeSeconds },
  );
}

function authResponse(user: {
  id: string;
  email: string;
  fullName: string;
  profilePictureUrl: string | null;
  role: UserRecord['role'];
}) {
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

export async function register(input: { email: string; password: string; fullName: string }) {
  const email = input.email.toLowerCase();
  if (!email.endsWith('@alumnos.udg.mx')) {
    throw new AppError(400, 'Solo se permiten cuentas institucionales @alumnos.udg.mx', 'INVALID_EMAIL_DOMAIN');
  }
  const credHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    email,
    credHash,
    fullName: input.fullName,
  });
  await UserAvailability.create({ userId: user._id, isAvailable: false });
  return { userId: user.id, email: user.email };
}

export async function login(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+credHash');
  const passwordMatches = user?.credHash
    ? await bcrypt.compare(input.password, user.credHash)
    : false;
  if (!user || !passwordMatches) {
    throw new AppError(401, 'Correo o contraseña incorrectos', 'INVALID_CREDENTIALS');
  }
  return authResponse({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    profilePictureUrl: user.profilePictureUrl,
    role: user.role,
  });
}

export async function signInWithGoogle(idToken: string) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError(401, 'El token de Google no es válido', 'INVALID_GOOGLE_TOKEN');
  }

  const email = payload?.email?.toLowerCase();
  if (!payload?.email_verified || !email || !email.endsWith('@alumnos.udg.mx') || !payload.sub) {
    throw new AppError(400, 'Solo se permiten cuentas institucionales @alumnos.udg.mx', 'INVALID_EMAIL_DOMAIN');
  }

  const existing = await User.findOne({ email }).select('profilePictureUrl');
  const user = await User.findOneAndUpdate(
    { email },
    {
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
        role: Role.STUDENT,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  if (!user) throw new AppError(500, 'No se pudo crear el perfil de Google', 'GOOGLE_SIGN_IN_FAILED');
  await UserAvailability.updateOne(
    { userId: user._id },
    { $setOnInsert: { isAvailable: false } },
    { upsert: true },
  );
  return authResponse({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    profilePictureUrl: user.profilePictureUrl,
    role: user.role,
  });
}
