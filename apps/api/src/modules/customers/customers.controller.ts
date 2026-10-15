import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { CustomersService } from './customers.service';

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const search = req.query.search as string | undefined;
    const customers = await CustomersService.getCustomers(companyId, search);
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const customer = await CustomersService.getCustomerById(companyId, id);
    if (!customer) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { name, email, phone, companyName, jobTitle, industry, website, address, status, customData, customerType } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const newCustomer = await CustomersService.createCustomer(companyId, { 
      name, email, phone, companyName, jobTitle, industry, website, address, status, customData, customerType
    });
    res.status(201).json(newCustomer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const data = req.body;
    const updated = await CustomersService.updateCustomer(companyId, id, data);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    await CustomersService.deleteCustomer(companyId, id);
    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
