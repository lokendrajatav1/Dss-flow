import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import companyRoutes from './modules/companies/companies.routes';
import dealsRoutes from './modules/deals/deals.routes';
import leadsRoutes from './modules/leads/leads.routes';
import customFieldsRoutes from './modules/custom-fields/custom-fields.routes';
import formLayoutsRoutes from './modules/form-layouts/form-layouts.routes';
import pipelineRoutes from './modules/pipeline/pipeline.routes';
import integrationsRoutes from './modules/integrations/integrations.routes';
import customersRoutes from './modules/customers/customers.routes';
import whatsappRoutes from './modules/whatsapp/whatsapp.routes';
import webhooksRoutes from './modules/webhooks/webhooks.routes';
import tasksRoutes from './modules/tasks/tasks.routes';
import activitiesRoutes from './modules/activities/activities.routes';
import callsRoutes from './modules/calls/calls.routes';
import meetingsRoutes from './modules/meetings/meetings.routes';
import filesRoutes from './modules/files/files.routes';
import invoicesRoutes from './modules/invoices/invoices.routes';
import quotationsRoutes from './modules/quotations/quotations.routes';
import productsRoutes from './modules/products/products.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import emailRoutes from './modules/email/email.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import workflowsRoutes from './modules/workflows/workflows.routes';
import reportsRoutes from './modules/reports/reports.routes';
import aiRoutes from './modules/ai/ai.routes';
import adminRoutes from './modules/admin/admin.routes';
import casesRoutes from './modules/cases/cases.routes';
import solutionsRoutes from './modules/solutions/solutions.routes';
import pricebooksRoutes from './modules/pricebooks/pricebooks.routes';
import salesordersRoutes from './modules/salesorders/salesorders.routes';
import purchaseordersRoutes from './modules/purchaseorders/purchaseorders.routes';
import vendorsRoutes from './modules/vendors/vendors.routes';
import settingsRoutes from './modules/settings/settings.routes';
import companiesRoutes from './modules/companies/companies.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import rolesRoutes from './modules/roles/roles.routes';
import categoriesRoutes from './modules/categories/categories.routes';

// Force recompile to bust ts-node-dev cache
console.log('App initializing...');

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json({
  limit: '50mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes Registration
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/deals', dealsRoutes);
app.use('/api/v1/leads', leadsRoutes);
app.use('/api/v1/custom-fields', customFieldsRoutes);
app.use('/api/v1/form-layouts', formLayoutsRoutes);
app.use('/api/v1/pipelines', pipelineRoutes);
app.use('/api/v1/integrations', integrationsRoutes);
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/contacts', customersRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/webhooks', webhooksRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/activities', activitiesRoutes);
app.use('/api/v1/calls', callsRoutes);
app.use('/api/v1/meetings', meetingsRoutes);
app.use('/api/v1/files', filesRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/invoices', invoicesRoutes);
app.use('/api/v1/quotations', quotationsRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/workflows', workflowsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/dashboard', reportsRoutes);
app.use('/api/dashboard', reportsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/cases', casesRoutes);
app.use('/api/v1/solutions', solutionsRoutes);
app.use('/api/v1/price-books', pricebooksRoutes);
app.use('/api/v1/sales-orders', salesordersRoutes);
app.use('/api/v1/purchase-orders', purchaseordersRoutes);
app.use('/api/v1/vendors', vendorsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/companies', companiesRoutes);
app.use('/api/v1/company', companiesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/api/v1/categories', categoriesRoutes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

export default app;
