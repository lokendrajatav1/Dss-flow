import { Request, Response } from 'express';
import { WorkflowService } from './workflows.service';

export const getWorkflows = async (req: Request, res: Response) => {
    try {
        const workflows = WorkflowService.findAll();
        res.json({ success: true, data: workflows });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createWorkflow = async (req: Request, res: Response) => {
    try {
        const newWorkflow = WorkflowService.create(req.body);
        res.status(201).json({ success: true, data: newWorkflow });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateWorkflow = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updated = WorkflowService.update(id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteWorkflow = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = WorkflowService.delete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        res.json({ success: true, message: 'Workflow deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const executeWorkflowTest = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const options = {
            ...(req.body || {}),
            companyId: req.user?.companyId
        };
        const result = await WorkflowService.executeTest(id, options);
        if (!result) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getWorkflowLogs = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const logs = WorkflowService.getLogs(id);
        res.json({ success: true, data: logs });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

