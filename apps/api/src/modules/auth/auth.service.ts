import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { AppError } from '../../middlewares/errorHandler';
import { hashPassword, comparePassword, generateToken } from './auth.utils';
import { sendEmail } from '../../utils/email.service';
import { authTemplates } from '../../utils/templates';

export class AuthService {
  
  async registerCompanyAndUser(name: string, email: string, password: string, companyName: string, phone?: string) {
    // 1. Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });
    
    if (existingUser) {
      throw new AppError('Email or phone already registered', 400);
    }

    // 2. Hash password
    const passwordHash = await hashPassword(password);

    // 3. Create Company and User in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const company = await tx.company.create({
        data: { name: companyName, plan: 'trial' }
      });

      const userData: any = {
        name,
        email,
        passwordHash,
        companyId: company.id
      };
      if (phone) userData.phone = phone;

      const user = await tx.user.create({
        data: userData
      });

      // Create default pipeline and stages
      await tx.pipeline.create({
        data: {
          companyId: company.id,
          name: 'Standard Pipeline',
          stages: {
            create: [
              { name: 'Lead In', order: 1 },
              { name: 'Contact Made', order: 2 },
              { name: 'Requirements Gathered', order: 3 },
              { name: 'Proposal Sent', order: 4 },
              { name: 'Negotiation', order: 5 },
              { name: 'Won', order: 6 },
              { name: 'Lost', order: 7 }
            ]
          }
        }
      });

      return { user, company };
    });

    // 4. Generate token
    const token = generateToken({ userId: result.user.id, companyId: result.company.id });

    return {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        companyId: result.company.id
      }
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken({ userId: user.id, companyId: user.companyId });

    const roleName = user.role?.name?.toLowerCase().replace(/[\s_-]/g, '');
    const role = roleName === 'superadmin' || user.email === 'admin@platform.com'
      ? 'superadmin'
      : (roleName === 'employee' ? 'employee' : 'companyadmin');

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        companyId: user.companyId,
        role
      }
    };
  }

  async verifyIdentifier(identifier: string) {
    const isEmail = identifier.includes('@');
    
    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({ where: { email: identifier } });
    } else {
      user = await prisma.user.findUnique({ where: { phone: identifier } });
    }
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    if (!isEmail) {
      // It's a phone, generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode, otpExpiresAt }
      });
      
      // LOG TO CONSOLE as requested in plan
      console.log(`\n\n=========================================`);
      console.log(`[DEVELOPMENT ONLY] OTP for ${identifier} is: ${otpCode}`);
      console.log(`=========================================\n\n`);
      
      return { type: 'phone', message: 'OTP sent successfully' };
    }
    
    return { type: 'email', message: 'Proceed to password' };
  }
  
  async loginWithOtp(phone: string, otpCode: string) {
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { role: true }
    });
    
    if (!user || !user.otpCode || user.otpCode !== otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new AppError('Invalid or expired OTP', 401);
    }
    
    // Clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null }
    });
    
    const token = generateToken({ userId: user.id, companyId: user.companyId });
    
    const roleName = user.role?.name?.toLowerCase().replace(/[\s_-]/g, '');
    const role = roleName === 'superadmin' || user.email === 'admin@platform.com'
      ? 'superadmin'
      : (roleName === 'employee' ? 'employee' : 'companyadmin');

    return {
      token,
      user: {
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        companyId: user.companyId,
        role
      }
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found for security reasons
      return { success: true, message: 'If email exists, OTP sent successfully.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt }
    });

    const emailContent = authTemplates.forgotPassword(otpCode, user.name);

    const emailSent = await sendEmail(
      email, 
      emailContent.subject, 
      emailContent.text,
      emailContent.html
    );

    if (!emailSent) {
      throw new AppError('Failed to send OTP email', 500);
    }

    return { success: true, message: 'OTP sent successfully to email.' };
  }

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.otpCode || user.otpCode !== otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash, 
        otpCode: null, 
        otpExpiresAt: null 
      }
    });

    return { success: true, message: 'Password reset successfully.' };
  }
}
