import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../auth/auth.utils';

const prisma = new PrismaClient();

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        company: true,
        role: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const users = await prisma.user.findMany({
      where: { companyId: req.user.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: {
          select: { id: true, name: true, permissions: true }
        }
      }
    });
    
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { name, email, phone, roleName, password, permissions } = req.body;
    
    if (!name || !email || !roleName || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    let role = await prisma.role.findFirst({ 
      where: { 
        name: roleName,
        companyId: req.user.companyId
      } 
    });
    
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleName,
          companyId: req.user.companyId,
          permissions: Array.isArray(permissions) ? permissions : []
        }
      });
    } else if (Array.isArray(permissions) && permissions.length > 0 && role.name.toLowerCase() !== 'admin') {
      role = await prisma.role.update({
        where: { id: role.id },
        data: { permissions }
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone ? phone.trim() : null,
        passwordHash: hashedPassword,
        companyId: req.user.companyId,
        roleId: role.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: {
          select: { name: true }
        }
      }
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { id } = req.params;

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { id } = req.params;
    const { roleName } = req.body;

    if (!roleName) {
      return res.status(400).json({ message: 'Role name is required' });
    }

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToUpdate.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to edit this user' });
    }

    let role = await prisma.role.findFirst({ 
      where: { name: roleName, companyId: req.user.companyId } 
    });
    
    if (!role) {
      role = await prisma.role.create({
        data: { name: roleName, companyId: req.user.companyId, permissions: [] }
      });
    }

    const updatedUser = await prisma.user.update({ 
      where: { id },
      data: { roleId: role.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: { select: { name: true } }
      }
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { id } = req.params;
    const { name, email, phone, roleName, password, permissions } = req.body;

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToUpdate.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to edit this user' });
    }

    // Handle role
    let roleId = userToUpdate.roleId;
    if (roleName) {
      let role = await prisma.role.findFirst({ 
        where: { name: roleName, companyId: req.user.companyId } 
      });
      if (!role) {
        role = await prisma.role.create({
          data: {
            name: roleName,
            companyId: req.user.companyId,
            permissions: Array.isArray(permissions) ? permissions : []
          }
        });
      } else if (Array.isArray(permissions) && role.name.toLowerCase() !== 'admin') {
        role = await prisma.role.update({
          where: { id: role.id },
          data: { permissions }
        });
      }
      roleId = role.id;
    }

    const updateData: any = { name, email, roleId };
    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }
    
    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({ 
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: { select: { name: true } }
      }
    });

    res.status(200).json(updatedUser);
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};
