import { Router } from 'express';
import { AuthController } from './auth.controller';
import { protect } from '../../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();

// We map routes directly to controller methods
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-identifier', authController.verifyIdentifier);
router.post('/login-otp', authController.loginOtp);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
