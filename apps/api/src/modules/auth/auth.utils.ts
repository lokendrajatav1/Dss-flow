import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: { userId: string; companyId: string }): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};
