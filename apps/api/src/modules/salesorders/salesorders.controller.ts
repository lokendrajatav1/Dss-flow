import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { SalesOrdersService } from './salesorders.service';

export const getSalesOrders = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const filters = req.query;
        const salesOrders = await SalesOrdersService.getSalesOrders(companyId, filters);
        res.json(salesOrders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSalesOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const { id } = req.params;
        const salesOrder = await SalesOrdersService.getSalesOrderById(companyId, id);
        res.json(salesOrder);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createSalesOrder = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const salesOrder = await SalesOrdersService.createSalesOrder(companyId, req.body);
        res.status(201).json(salesOrder);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSalesOrder = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const { id } = req.params;
        const salesOrder = await SalesOrdersService.updateSalesOrder(companyId, id, req.body);
        res.json(salesOrder);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSalesOrder = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const { id } = req.params;
        await SalesOrdersService.deleteSalesOrder(companyId, id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getNextSalesOrderNumber = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const nextNumber = await SalesOrdersService.getNextNumber(companyId);
        res.json({ success: true, nextNumber });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};