import { Request, Response } from 'express';
import { createUser, loginUser, getUserById, updateUserProfile } from '../services/token.service.js';
import { validateEmail, validatePassword } from '../utils/validators.utils.js';

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
