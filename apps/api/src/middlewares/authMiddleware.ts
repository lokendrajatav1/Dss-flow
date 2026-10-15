import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    companyId: string;
    roleId?: string | null;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ success: false, error: 'JWT_SECRET not configured' });
      }
      const decoded = jwt.verify(token, secret) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, companyId: true, roleId: true }
      });

      if (!user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

export const authenticate = protect;
