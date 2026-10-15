import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { QuotationsService } from './quotations.service';

export const getQuotations = async (req: AuthRequest, res: Response) => {
  try {
    const companiesId = req.user!.companyId;
    const filters = req.query;
    const quotations = await QuotationsService.getQuotations(companiesId, filters);
    res.json(quotations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuotationById = async (req: AuthRequest, res: Response) => {
  try {
    const companiesId = req.user!.companyId;
    const { id } = req.params;
    const quotation = await QuotationsService.getQuotationById(companiesId, id);
    res.json(quotation);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const companiesId = req.user!.companyId;
    const quotation = await QuotationsService.createQuotation(companiesId, req.body);
    res.status(201).json(quotation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const companiesId = req.user!.companyId;
    const { id } = req.params;
    const quotation = await QuotationsService.updateQuotation(companiesId, id, req.body);
    res.json(quotation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const companiesId = req.user!.companyId;
    const { id } = req.params;
    await QuotationsService.deleteQuotation(companiesId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getNextQuotationNumber = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const nextNumber = await QuotationsService.getNextNumber(companyId);
    res.json({ success: true, nextNumber });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};