import { Request, Response } from 'express';
import { createUser, loginUser, getUserById, updateUserProfile } from '../services/token.service.js';
import { validateEmail, validatePassword } from '../utils/validators.utils.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, fullName, timezone } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ message: 'Full name must be at least 2 characters' });
    }

    const user = await createUser(email, password, fullName, timezone);

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, timezone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginUser(email, password);

    // Actualizar timezone del usuario si se proporciona
    if (timezone) {
      try {
        await updateUserProfile(result.user.id, { timezone });
      } catch (e) { /* ignore */ }
    }

    res.json({
      message: 'Login successful',
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
