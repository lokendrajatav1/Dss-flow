import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { prisma } from '../../lib/db';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Use arrow functions to bind 'this' automatically
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, companyName, phone } = req.body;
      if (!name || !email || !password || !companyName) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const result = await this.authService.registerCompanyAndUser(name, email, password, companyName, phone);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
      }

      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  verifyIdentifier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identifier } = req.body;
      if (!identifier) {
        return res.status(400).json({ success: false, error: 'Identifier (Email/Phone) is required' });
      }

      const result = await this.authService.verifyIdentifier(identifier);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  loginOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, otpCode } = req.body;
      if (!phone || !otpCode) {
        return res.status(400).json({ success: false, error: 'Phone and OTP code are required' });
      }

      const result = await this.authService.loginWithOtp(phone, otpCode);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, phone: true, companyId: true, roleId: true, role: true }
      });

      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      const roleName = user.role?.name?.toLowerCase().replace(/[\s_-]/g, '');
      const role = roleName === 'superadmin' || user.email === 'admin@platform.com'
        ? 'superadmin'
        : (roleName === 'employee' ? 'employee' : 'companyadmin');

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            companyId: user.companyId,
            role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
      }

      const result = await this.authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otpCode, newPassword } = req.body;
      if (!email || !otpCode || !newPassword) {
        return res.status(400).json({ success: false, error: 'Email, OTP code, and new password are required' });
      }

      const result = await this.authService.resetPassword(email, otpCode, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
