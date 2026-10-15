import { Router, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { CasesController } from './cases.controller';

const prisma = new PrismaClient();
const router = Router();

const casesAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, companyId: true, roleId: true }
      });
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Token invalid or expired, continue with default company
    }
  }

  if (!req.user) {
    req.user = { id: 'default-user', companyId: 'default' };
  }
  next();
};

router.use(casesAuth);

router.get('/', CasesController.getCases);
router.post('/bulk-delete', CasesController.bulkDeleteCases);
router.get('/:id', CasesController.getCaseById);
router.post('/', CasesController.createCase);
router.put('/:id', CasesController.updateCase);
router.delete('/:id', CasesController.deleteCase);
router.post('/:id/comments', CasesController.addCaseComment);

export default router;
