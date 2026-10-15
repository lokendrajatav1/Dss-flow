import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { CustomFieldsService } from './custom-fields.service';

export const getFields = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { entityType } = req.query;

    if (!entityType || typeof entityType !== 'string') {
      return res.status(400).json({ message: 'entityType query parameter is required' });
    }

    const fields = await CustomFieldsService.getFields(companyId, entityType);
    res.json(fields);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createField = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { entityType, name, key, type, options, isRequired, order } = req.body;

    if (!entityType || !name || !key || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newField = await CustomFieldsService.createField(companyId, { entityType, name, key, type, options, isRequired, order });
    res.status(201).json(newField);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateField = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    
    const updatedField = await CustomFieldsService.updateField(companyId, id, req.body);
    res.json(updatedField);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteField = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;

    await CustomFieldsService.deleteField(companyId, id);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
