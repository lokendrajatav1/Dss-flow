import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { ProductsService } from './products.service';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const filters = req.query;
    const products = await ProductsService.getProducts(companyId, filters);
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const product = await ProductsService.getProductById(companyId, id);
    res.json(product);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const product = await ProductsService.createProduct(companyId, req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const product = await ProductsService.updateProduct(companyId, id, req.body);
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await ProductsService.deleteProduct(companyId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};