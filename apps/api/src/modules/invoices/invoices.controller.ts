import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { InvoicesService } from './invoices.service';

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const filters = req.query;
    const invoices = await InvoicesService.getInvoices(companyId, filters);
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const invoice = await InvoicesService.getInvoiceById(companyId, id);
    res.json(invoice);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const invoice = await InvoicesService.createInvoice(companyId, req.body);
    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const invoice = await InvoicesService.updateInvoice(companyId, id, req.body);
    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await InvoicesService.deleteInvoice(companyId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getNextInvoiceNumber = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const nextNumber = await InvoicesService.getNextNumber(companyId);
    res.json({ success: true, nextNumber });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
