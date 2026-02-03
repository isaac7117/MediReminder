import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validationMiddleware } from '../middleware/validation.middleware.js';
import { validateEmail, validatePassword } from '../utils/validators.utils.js';

const router = Router();

router.post('/register',
  validationMiddleware([
    { field: 'email', required: true, type: 'string', custom: validateEmail },
    { field: 'password', required: true, type: 'string', custom: validatePassword },
    { field: 'confirmPassword', required: true, type: 'string' },
    { field: 'fullName', required: true, type: 'string', minLength: 2 }
  ]),
  register
);

router.post('/login',
  validationMiddleware([
    { field: 'email', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string' }
  ]),
  login
);

router.get('/me', authMiddleware, getCurrentUser);

router.put('/profile', authMiddleware, updateProfile);

export default router;
