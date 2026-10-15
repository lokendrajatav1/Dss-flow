import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { PurchaseOrdersService } from './purchaseorders.service';

export const getPurchaseOrders = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const filters = req.query;
        const purchaseOrders = await PurchaseOrdersService.getPurchaseOrders(companyId, filters);
        res.json(purchaseOrders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPurchaseOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const { id } = req.params;
        const purchaseOrder = await PurchaseOrdersService.getPurchaseOrderById(companyId, id);
        res.json(purchaseOrder);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const purchaseOrder = await PurchaseOrdersService.createPurchaseOrder(companyId, req.body);
        res.status(201).json(purchaseOrder);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updatePurchaseOrder = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const { id } = req.params;
        const purchaseOrder = await PurchaseOrdersService.updatePurchaseOrder(companyId, id, req.body);
        res.json(purchaseOrder);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deletePurchaseOrder = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const { id } = req.params;
        await PurchaseOrdersService.deletePurchaseOrder(companyId, id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getNextPurchaseOrderNumber = async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        const nextNumber = await PurchaseOrdersService.getNextNumber(companyId);
        res.json({ success: true, nextNumber });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};