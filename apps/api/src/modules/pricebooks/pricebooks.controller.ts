import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { PriceBooksService } from './pricebooks.service';

export const getPriceBooks = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const filters = req.query;
    const priceBooks = await PriceBooksService.getPriceBooks(companyId, filters);
    res.json(priceBooks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPriceBookById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const priceBook = await PriceBooksService.getPriceBookById(companyId, id);
    res.json(priceBook);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createPriceBook = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const priceBook = await PriceBooksService.createPriceBook(companyId, req.body);
    res.status(201).json(priceBook);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePriceBook = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const priceBook = await PriceBooksService.updatePriceBook(companyId, id, req.body);
    res.json(priceBook);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePriceBook = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await PriceBooksService.deletePriceBook(companyId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};