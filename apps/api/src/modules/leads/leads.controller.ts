import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { LeadsService } from './leads.service';

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const leads = await LeadsService.getLeads(companyId, req.query);
    res.json(leads);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const lead = await LeadsService.getLeadById(companyId, id);
    res.json(lead);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    if (!req.body.name) {
      return res.status(400).json({ message: 'Lead name is required' });
    }

    const newLead = await LeadsService.createLead(companyId, req.body);
    res.status(201).json(newLead);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLeadStatus = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const updatedLead = await LeadsService.updateLeadStatus(companyId, id, status);
    res.json(updatedLead);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const updatedLead = await LeadsService.updateLead(companyId, id, req.body);
    res.json(updatedLead);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;

    await LeadsService.deleteLead(companyId, id);
    res.json({ message: 'Lead deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const convertLead = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { createCustomer } = req.body;

    const result = await LeadsService.convertLead(companyId, id, { createCustomer: !!createCustomer });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


export const importCsvLeads = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    if (!req.body.csvData) {
      return res.status(400).json({ message: 'csvData is required' });
    }
    const result = await LeadsService.importCsvLeads(companyId, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const scoreLead = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const result = await LeadsService.scoreLead(companyId, id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const qualifyLead = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const result = await LeadsService.qualifyLead(companyId, id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
