import crypto from 'crypto';
import { generateToken } from '../utils/jwt.utils.js';
import { hashPassword, verifyPassword } from '../utils/hash.utils.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TokenPayload {
  token: string;
  expiresIn: string;
}

export const createUser = async (
  email: string,
  password: string,
  fullName: string,
  timezone?: string
): Promise<{ id: string; email: string; fullName: string }> => {
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: fullName.trim(),
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City'
    }
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName
  };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<TokenPayload & { user: { id: string; email: string; fullName: string } }> => {
  const normalizedEmail = email.trim();

  // Compatibilidad para cuentas antiguas con correo guardado en mayúsculas/minúsculas mixtas.
  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: normalizedEmail,
        mode: 'insensitive'
      }
    }
  });

  if (!user) {
    throw new Error('No existe una cuenta con ese correo');
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Contraseña incorrecta');
  }

  const token = generateToken(user.id);

  return {
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    }
  };
};

export const findOrCreateGoogleUser = async (
  email: string,
  fullName: string,
  timezone?: string
): Promise<TokenPayload & { user: { id: string; email: string; fullName: string } }> => {
  const normalizedEmail = email.toLowerCase().trim();

  let user = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
  });

  if (!user) {
    // Crear una contraseña aleatoria segura para usuarios de Google
    const randomPassword = crypto.randomUUID() + 'Aa1!';
    const hashedPassword = await hashPassword(randomPassword);

    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        fullName: fullName.trim(),
        timezone: timezone || 'America/Mexico_City'
      }
    });
  } else if (timezone) {
    try {
      await prisma.user.update({ where: { id: user.id }, data: { timezone } });
    } catch (_) { /* ignore */ }
  }

  const token = generateToken(user.id);

  return {
    token,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    }
  };
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      dateOfBirth: true,
      phoneNumber: true,
      profileImage: true
    }
  });
};

export const updateUserProfile = async (
  userId: string,
  data: {
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    profileImage?: string;
    timezone?: string;
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      fullName: true,
      dateOfBirth: true,
      phoneNumber: true,
      profileImage: true
    }
  });
};
