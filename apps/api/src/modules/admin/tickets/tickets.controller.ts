import { Request, Response } from 'express';
import { TicketsService } from './tickets.service';

export const getTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await TicketsService.getTickets();
        res.json(tickets);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTicketById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ticket = await TicketsService.getTicketById(id);
        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const ticket = await TicketsService.updateTicketStatus(id, status);
        res.json(ticket);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addMessageToTicket = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content, fromMe = false } = req.body;
        const message = await TicketsService.addMessageToTicket(id, content, fromMe);
        res.json(message);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};