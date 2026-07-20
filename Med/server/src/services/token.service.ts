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
) => {
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
      fullName: user.fullName,
      onboardingCompleted: user.onboardingCompleted,
      gender: user.gender,
      role: user.role
    }
  };
};

export const findOrCreateGoogleUser = async (
  email: string,
  fullName: string,
  timezone?: string
) => {
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
      fullName: user.fullName,
      onboardingCompleted: user.onboardingCompleted,
      gender: user.gender,
      role: user.role
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
      profileImage: true,
      onboardingCompleted: true,
      gender: true,
      role: true
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
    gender?: string;
    role?: string;
    onboardingCompleted?: boolean;
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
      profileImage: true,
      onboardingCompleted: true,
      gender: true,
      role: true
    }
  });
};

export const completeOnboarding = async (
  userId: string,
  data: {
    gender: string;
    role: string;
    careProfiles?: { name: string; relationship: string }[];
  }
) => {
  // Update user profile
  await prisma.user.update({
    where: { id: userId },
    data: {
      gender: data.gender,
      role: data.role,
      onboardingCompleted: true
    }
  });

  // Create care profiles if caregiver
  if (data.role === 'caregiver' && data.careProfiles && data.careProfiles.length > 0) {
    await prisma.careProfile.createMany({
      data: data.careProfiles.map((cp, index) => ({
        userId,
        name: cp.name,
        relationship: cp.relationship,
        isDefault: index === 0
      }))
    });
  } else if (data.role === 'personal') {
    // Create a default "self" care profile for personal use
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    await prisma.careProfile.create({
      data: {
        userId,
        name: user?.fullName || 'Yo',
        relationship: 'self',
        isDefault: true
      }
    });
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      onboardingCompleted: true,
      gender: true,
      role: true
    }
  });
};

export const getCareProfiles = async (userId: string) => {
  return prisma.careProfile.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  });
};

export const createCareProfile = async (
  userId: string,
  data: { name: string; relationship: string }
) => {
  const existingCount = await prisma.careProfile.count({ where: { userId } });
  return prisma.careProfile.create({
    data: {
      userId,
      name: data.name.trim(),
      relationship: data.relationship,
      isDefault: existingCount === 0
    }
  });
};
