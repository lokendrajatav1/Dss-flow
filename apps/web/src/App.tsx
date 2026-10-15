import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { RegisterPage } from './modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from './modules/auth/pages/ForgotPasswordPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { ContactsPage } from './modules/contacts/pages/ContactsPage';
import { CreateContactPage } from './modules/contacts/pages/CreateContactPage';
import { SettingsPage } from './modules/settings/pages/SettingsPage';
import { CompanyProfilePage } from './modules/settings/pages/CompanyProfilePage';
import { DealsListPage } from './modules/deals/pages/DealsListPage';
import { TasksPage } from './modules/tasks/pages/TasksPage';
import { MeetingsPage } from './modules/meetings/pages/MeetingsPage';
import { CallsPage } from './modules/calls/pages/CallsPage';
import { ReportsPage } from './modules/reports/pages/ReportsPage';
import { WhatsAppPage } from './modules/whatsapp/pages/WhatsAppPage';
import { AutomationPage } from './modules/automation/pages/AutomationPage';
import { LeadsPage } from './modules/leads/pages/LeadsPage';
import { ClientDetailsPage } from './modules/leads/pages/ClientDetailsPage';
import { LeadsPipelinePage } from './modules/leads/pages/LeadsPipelinePage';
import { GroupsPage } from './modules/leads/pages/GroupsPage';
import { FunnelsPage } from './modules/leads/pages/FunnelsPage';
import { LeadsPipelineBoardPage } from './modules/leads/pages/LeadsPipelineBoardPage';

import { DealsPipelinePage } from './modules/deals/pages/DealsPipelinePage';
import { DealsPipelineBoardPage } from './modules/deals/pages/DealsPipelineBoardPage';
import { AIPage } from './modules/ai/pages/AIPage';
import { QuotationsPage } from './modules/quotations/pages/QuotationsPage';
import { CreateQuotationPage } from './modules/quotations/pages/CreateQuotationPage';
import { ViewQuotationPage } from './modules/quotations/pages/ViewQuotationPage';
import { PaymentsPage } from './modules/payments/pages/PaymentsPage';
import { InvoicesPage } from './modules/invoices/pages/InvoicesPage';
import { CreateInvoicePage } from './modules/invoices/pages/CreateInvoicePage';
import { ViewInvoicePage } from './modules/invoices/pages/ViewInvoicePage';
import { CalendarPage } from './modules/calendar/pages/CalendarPage';
import { EmailPage } from './modules/email/pages/EmailPage';
import { DocumentsPage } from './modules/documents/pages/DocumentsPage';
import { InboxPage } from './modules/inbox/pages/InboxPage';
import { ConfigureChannelsPage } from './modules/inbox/pages/ConfigureChannelsPage';
import { IntegrationsPage } from './modules/integrations/pages/IntegrationsPage';
import { ConfigureFacebookPage } from './modules/integrations/pages/ConfigureFacebookPage';
import { ConfigureJustdialPage } from './modules/integrations/pages/ConfigureJustdialPage';
import { ConfigureIndiamartPage } from './modules/integrations/pages/ConfigureIndiamartPage';
import { ConfigureSulekhaPage } from './modules/integrations/pages/ConfigureSulekhaPage';
import { ConfigureTradeIndiaPage } from './modules/integrations/pages/ConfigureTradeIndiaPage';
import { ConfigureGenericWebhookPage } from './modules/integrations/pages/ConfigureGenericWebhookPage';
import { ConfigureGoogleSheetsPage } from './modules/integrations/pages/ConfigureGoogleSheetsPage';
import { ConfigureImportCSVPage } from './modules/integrations/pages/ConfigureImportCSVPage';
import { ProductsPage } from './modules/products/pages/ProductsPage';
import { CreateProductPage } from './modules/products/pages/CreateProductPage';
import { ViewProductPage } from './modules/products/pages/ViewProductPage';
import { PriceBooksPage } from './modules/pricebooks/pages/PriceBooksPage';
import { CreatePriceBookPage } from './modules/pricebooks/pages/CreatePriceBookPage';
import { ViewPriceBookPage } from './modules/pricebooks/pages/ViewPriceBookPage';
import { SalesOrdersPage } from './modules/salesorders/pages/SalesOrdersPage';
import { CreateSalesOrderPage } from './modules/salesorders/pages/CreateSalesOrderPage';
import { ViewSalesOrderPage } from './modules/salesorders/pages/ViewSalesOrderPage';
import { PurchaseOrdersPage } from './modules/purchaseorders/pages/PurchaseOrdersPage';
import { CreatePurchaseOrderPage } from './modules/purchaseorders/pages/CreatePurchaseOrderPage';
import { ViewPurchaseOrderPage } from './modules/purchaseorders/pages/ViewPurchaseOrderPage';
import { VendorsPage } from './modules/vendors/pages/VendorsPage';
import { CreateVendorPage } from './modules/vendors/pages/CreateVendorPage';
import { TicketsPage } from './modules/tickets/pages/TicketsPage';
import { CasesPage } from './modules/cases/pages/CasesPage';
import { SolutionsPage } from './modules/solutions/pages/SolutionsPage';
import { WorkflowsPage } from './modules/workflows/pages/WorkflowsPage';
import { BillingPage } from './modules/billing/pages/BillingPage';
import { SuperAdminPage } from './modules/admin/pages/SuperAdminPage';
import { SuperAdminLoginPage } from './modules/admin/pages/SuperAdminLoginPage';
import { TenantsPage } from './modules/admin/pages/TenantsPage';
import { SubscriptionsPage } from './modules/admin/pages/SubscriptionsPage';
import { UsageMetricsPage } from './modules/admin/pages/UsageMetricsPage';
import { AdminHelpdeskPage } from './modules/admin/pages/AdminHelpdeskPage';
import { AdvancedBIPage } from './modules/admin/pages/AdvancedBIPage';
import { PlatformAdminsPage } from './modules/admin/pages/PlatformAdminsPage';
import { FeatureFlagsPage } from './modules/admin/pages/FeatureFlagsPage';
import { AnnouncementsPage } from './modules/admin/pages/AnnouncementsPage';
import { SystemSettingsPage } from './modules/admin/pages/SystemSettingsPage';
import { AuditLogsPage } from './modules/admin/pages/AuditLogsPage';
import { PermissionsPage } from './modules/permissions/pages/PermissionsPage';
import { PipelinePage } from './modules/pipeline/pages/PipelinePage';
import { AdminLayout } from './components/layout/AdminLayout';

function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/login" element={<SuperAdminLoginPage />} />

      {/* Protected: All logged-in users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/create" element={<CreateContactPage />} />
          <Route path="/contacts/edit/:id" element={<CreateContactPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/company-profile" element={<CompanyProfilePage />} />
          <Route path="/lead-manager" element={<LeadsPage />} />
          <Route path="/clients/:id" element={<ClientDetailsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/funnels" element={<FunnelsPage />} />
          <Route path="/leads-pipelines" element={<LeadsPipelinePage />} />
          <Route path="/leads/pipeline-board/:id" element={<LeadsPipelineBoardPage />} />
          <Route path="/deals-pipelines" element={<DealsPipelinePage />} />
          <Route path="/deals/pipeline-board/:id" element={<DealsPipelineBoardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/calls" element={<CallsPage />} />
          <Route path="/whatsapp" element={<WhatsAppPage />} />
          <Route path="/automation" element={<AutomationPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/quotations" element={<QuotationsPage />} />
          <Route path="/quotations/create" element={<CreateQuotationPage />} />
          <Route path="/quotations/edit/:id" element={<CreateQuotationPage />} />
          <Route path="/quotations/view/:id" element={<ViewQuotationPage />} />

          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/create" element={<CreateInvoicePage />} />
          <Route path="/invoices/edit/:id" element={<CreateInvoicePage />} />
          <Route path="/invoices/view/:id" element={<ViewInvoicePage />} />

          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/email" element={<EmailPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/channels" element={<ConfigureChannelsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/configure-facebook" element={<ConfigureFacebookPage />} />
          <Route path="/configure-justdial" element={<ConfigureJustdialPage />} />
          <Route path="/configure-indiamart" element={<ConfigureIndiamartPage />} />
          <Route path="/configure-sulekha" element={<ConfigureSulekhaPage />} />
          <Route path="/configure-tradeindia" element={<ConfigureTradeIndiaPage />} />
          <Route path="/configure-webhooks" element={<ConfigureGenericWebhookPage />} />
          <Route path="/configure-google-sheets" element={<ConfigureGoogleSheetsPage />} />
          <Route path="/import-csv" element={<ConfigureImportCSVPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/create" element={<CreateProductPage />} />
          <Route path="/products/edit/:id" element={<CreateProductPage />} />
          <Route path="/products/view/:id" element={<ViewProductPage />} />
          <Route path="/products/:id" element={<ViewProductPage />} />
          <Route path="/price-books" element={<PriceBooksPage />} />
          <Route path="/price-books/create" element={<CreatePriceBookPage />} />
          <Route path="/price-books/edit/:id" element={<CreatePriceBookPage />} />
          <Route path="/price-books/view/:id" element={<ViewPriceBookPage />} />
          <Route path="/price-books/:id" element={<ViewPriceBookPage />} />

          <Route path="/sales-orders" element={<SalesOrdersPage />} />
          <Route path="/sales-orders/create" element={<CreateSalesOrderPage />} />
          <Route path="/sales-orders/edit/:id" element={<CreateSalesOrderPage />} />
          <Route path="/sales-orders/view/:id" element={<ViewSalesOrderPage />} />

          <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="/purchase-orders/create" element={<CreatePurchaseOrderPage />} />
          <Route path="/purchase-orders/edit/:id" element={<CreatePurchaseOrderPage />} />
          <Route path="/purchase-orders/view/:id" element={<ViewPurchaseOrderPage />} />

          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendors/create" element={<CreateVendorPage />} />
          <Route path="/vendors/edit/:id" element={<CreateVendorPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
        </Route>
      </Route>

      {/* Protected: Company Admin + Super Admin only */}
      <Route element={<ProtectedRoute allowedRoles={['superadmin', 'companyadmin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
        </Route>
      </Route>

      {/* Protected: Super Admin only (Uses separate AdminLayout) */}
      <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<SuperAdminPage />} />
          <Route path="/admin/tenants" element={<TenantsPage />} />
          <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/admin/usage" element={<UsageMetricsPage />} />
          <Route path="/admin/analytics" element={<AdvancedBIPage />} />
          <Route path="/admin/support" element={<AdminHelpdeskPage />} />
          <Route path="/admin/team" element={<PlatformAdminsPage />} />
          <Route path="/admin/features" element={<FeatureFlagsPage />} />
          <Route path="/admin/announcements" element={<AnnouncementsPage />} />
          <Route path="/admin/system" element={<SystemSettingsPage />} />
          <Route path="/admin/logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
