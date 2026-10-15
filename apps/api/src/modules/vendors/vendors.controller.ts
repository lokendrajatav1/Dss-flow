import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { VendorsService } from './vendors.service';

export const getVendors = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const filters = req.query;
    const vendors = await VendorsService.getVendors(companyId, filters);
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const vendor = await VendorsService.getVendorById(companyId, id);
    res.json(vendor);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createVendor = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const vendor = await VendorsService.createVendor(companyId, req.body);
    res.status(201).json(vendor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVendor = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const vendor = await VendorsService.updateVendor(companyId, id, req.body);
    res.json(vendor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVendor = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await VendorsService.deleteVendor(companyId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
