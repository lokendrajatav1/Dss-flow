import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { PaymentsService } from './payments.service';

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const filters = req.query;
    const payments = await PaymentsService.getPayments(companyId, filters);
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const payment = await PaymentsService.getPaymentById(companyId, id);
    res.json(payment);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const payment = await PaymentsService.createPayment(companyId, req.body);
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const payment = await PaymentsService.updatePayment(companyId, id, req.body);
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePayment = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await PaymentsService.deletePayment(companyId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};