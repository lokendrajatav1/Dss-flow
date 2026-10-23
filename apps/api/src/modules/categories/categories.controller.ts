import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { CategoriesService } from './categories.service';

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const search = req.query.search as string | undefined;
    const categories = await CategoriesService.getCategories(companyId, search);
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const category = await CategoriesService.getCategoryById(companyId, id);
    res.json(category);
  } catch (error: any) {
    res.status(404).json({ message: error.message || 'Category not found' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { name, description } = req.body;
    const category = await CategoriesService.createCategory(companyId, { name, description });
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create category' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { name, description } = req.body;
    const category = await CategoriesService.updateCategory(companyId, id, { name, description });
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update category' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await CategoriesService.deleteCategory(companyId, id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to delete category' });
  }
};
