import { Router, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { SolutionsController } from './solutions.controller';

const prisma = new PrismaClient();
const router = Router();

const solutionsAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.use(solutionsAuth);

router.get('/', SolutionsController.getSolutions);
router.get('/:id', SolutionsController.getSolutionById);
router.post('/', SolutionsController.createSolution);
router.put('/:id', SolutionsController.updateSolution);
router.delete('/:id', SolutionsController.deleteSolution);
router.post('/:id/helpful', SolutionsController.voteHelpfulSolution);

export default router;
