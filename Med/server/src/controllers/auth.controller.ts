import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { createUser, loginUser, getUserById, updateUserProfile, findOrCreateGoogleUser, completeOnboarding, getCareProfiles, createCareProfile } from '../services/token.service.js';
import { validateEmail, validatePassword } from '../utils/validators.utils.js';

const googleClient = new OAuth2Client();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, fullName, timezone } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Formato de correo inválido' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 8 caracteres con mayúscula, minúscula y números'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ message: 'El nombre completo debe tener al menos 2 caracteres' });
    }

    const user = await createUser(email, password, fullName, timezone);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El correo ya existe' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, timezone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    const result = await loginUser(email, password);

    // Actualizar timezone del usuario si se proporciona
    if (timezone) {
      try {
        await updateUserProfile(result.user.id, { timezone });
      } catch (e) { /* ignore */ }
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      ...result
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential, timezone } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Token de Google requerido' });
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ message: 'Google OAuth no está configurado en el servidor' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Token de Google inválido' });
    }

    const result = await findOrCreateGoogleUser(
      payload.email,
      payload.name || payload.email.split('@')[0],
      timezone
    );

    res.json({
      message: 'Inicio de sesión con Google exitoso',
      ...result
    });
  } catch (error: any) {
    console.error('[Auth] Error en Google OAuth:', error.message);
    res.status(401).json({ message: 'Error al verificar con Google' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { fullName, phoneNumber, dateOfBirth, profileImage } = req.body;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (profileImage) updateData.profileImage = profileImage;

    const user = await updateUserProfile(userId, updateData);

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const onboardingComplete = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const { gender, role, careProfiles } = req.body;

    if (!gender || !role) {
      return res.status(400).json({ message: 'Género y rol son requeridos' });
    }

    const validGenders = ['male', 'female', 'other'];
    const validRoles = ['personal', 'caregiver'];

    if (!validGenders.includes(gender)) {
      return res.status(400).json({ message: 'Género inválido' });
    }
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    if (role === 'caregiver' && (!careProfiles || careProfiles.length === 0)) {
      return res.status(400).json({ message: 'Debe agregar al menos una persona a cuidar' });
    }

    const user = await completeOnboarding(userId, { gender, role, careProfiles });

    res.json({
      message: 'Onboarding completado',
      user
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCareProfilesList = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const profiles = await getCareProfiles(userId);
    res.json({ careProfiles: profiles });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addCareProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const { name, relationship } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'El nombre del paciente es requerido' });
    }
    if (!relationship) {
      return res.status(400).json({ message: 'La relación es requerida' });
    }

    const profile = await createCareProfile(userId, { name, relationship });
    res.status(201).json({ message: 'Paciente agregado', careProfile: profile });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
