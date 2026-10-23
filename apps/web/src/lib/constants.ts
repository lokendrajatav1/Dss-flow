// ======================================================
// CRM SYSTEM CONSTANTS & STATUS DICTIONARY
// ======================================================

// ------------------------------------------------------
// 1. LEADS & ACQUISITION
// ------------------------------------------------------

export const LEAD_SOURCES = [
  'Facebook',
  'Meta Ads (Facebook/Instagram)',
  'Google Sheets',
  'Google Form',
  'IndiaMart',
  'WordPress',
  'Pabbly',
  'Wix',
  'Google Lead',
  'Click Funnels',
  'Webhooks',
  '99acres',
  'Magicbricks',
  'Housing',
  'SquareYards',
  'Sulekha',
  'importCsv',
  'Tradeindia',
  'Website',
  'JustDial',
  'Whatsapp'
];

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost'
];

export const LEAD_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];

export const LEAD_TYPES = [
  'lead',
  'client',
  'deal'
];

export const CUSTOMER_TYPES = [
  'Business',
  'Individual'
];

export const CUSTOMER_STATUSES = [
  'Active',
  'Inactive',
  'Lead',
  'Churned'
];

export const CONTACT_STATUSES = [
  'New',
  'Active',
  'Inactive'
];

// ------------------------------------------------------
// 2. CALLS & TELEPHONY
// ------------------------------------------------------

export const CALL_STATUSES = [
  'Untouched',
  'Busy',
  'Call Back Later',
  'Callback Scheduled',
  'Connected',
  'Customer Query Resolved',
  'Disconnected',
  'Do Not Call Request',
  'Follow-up Required',
  'Information Sent',
  'Interested',
  'Invalid Number',
  'Lead Converted',
  'Left Message',
  'Meeting Scheduled',
  'Not Answered',
  'Not Connected',
  'Not Interested',
  'Other',
  'Proposal Submitted',
  'Voicemail Left',
  'Wrong Contact Person',
  'Wrong Number'
];

export const CALL_OUTCOMES = [
  '-None-',
  'Interested',
  'Not interested',
  'No response/Busy',
  'Requested more info',
  'Requested call back',
  'Invalid number'
];

export const CALL_RESULTS = CALL_OUTCOMES;

export const CALL_DIRECTIONS = [
  'Inbound',
  'Outbound',
  'Missed'
];

export const CALL_TYPES = CALL_DIRECTIONS;

export const CALL_PRIORITIES = [
  'Normal',
  'High',
  'Urgent'
];

// ------------------------------------------------------
// 3. TASKS & CALENDAR REMINDERS
// ------------------------------------------------------

export const TASK_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled'
];

export const TASK_PRIORITIES = [
  'Low',
  'Medium',
  'High'
];

export const MEETING_STATUSES = [
  'Scheduled',
  'Completed',
  'Cancelled',
  'Rescheduled'
];

export const MEETING_PLATFORMS = [
  'Google Meet',
  'Zoom',
  'MS Teams',
  'In-Person'
];

export const MEETING_DURATIONS = [
  '15 mins',
  '30 mins',
  '45 mins',
  '60 mins',
  '90 mins'
];

export const CALENDAR_EVENT_STATUSES = [
  'confirmed',
  'cancelled',
  'tentative'
];

// ------------------------------------------------------
// 4. PIPELINES & DEALS
// ------------------------------------------------------

export const DEAL_STATUSES = [
  'Open',
  'Won',
  'Lost',
  'Abandoned'
];

export const DEAL_PRIORITIES = [
  'Low',
  'Medium',
  'High'
];

export const DEAL_STAGES = [
  'Deal Raised',
  'Negotiation',
  'Awaiting Approval',
  'Proposal Sent',
  'Deal Won',
  'Deal Lost'
];

export const PIPELINE_TYPES = [
  'LEAD',
  'DEAL'
];

// ------------------------------------------------------
// 5. CASES & KNOWLEDGE BASE (HELP DESK)
// ------------------------------------------------------

export const CASE_CATEGORIES = [
  'Technical Support',
  'Billing & Invoicing',
  'Integration & API',
  'Feature Request',
  'Bug Report',
  'Account & Access'
];

export const CASE_PRIORITIES = [
  'Urgent',
  'High',
  'Medium',
  'Low'
];

export const CASE_STATUSES = [
  'New',
  'Open',
  'In Progress',
  'Pending Customer',
  'Escalated',
  'Closed'
];

export const TICKET_STATUSES = [
  'Open',
  'In Progress',
  'Pending',
  'Closed'
];

export const TICKET_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent'
];

export const SOLUTION_CATEGORIES = [
  'General & Getting Started',
  'WhatsApp Automation',
  'Email & IMAP Sync',
  'Leads & Pipelines',
  'Invoicing & Payments',
  'Integrations & Webhooks',
  'Account & Permissions'
];

export const SOLUTION_STATUSES = [
  'Published',
  'Draft',
  'Under Review'
];

// ------------------------------------------------------
// 6. OMNICHANNEL & COMMUNICATIONS
// ------------------------------------------------------

export const CONVERSATION_CHANNELS = [
  'whatsapp',
  'email',
  'instagram',
  'facebook'
];

export const CONVERSATION_STATUSES = [
  'open',
  'closed',
  'snoozed',
  'pending'
];

export const CONVERSATION_CATEGORIES = [
  'GENERAL',
  'LEAD',
  'SUPPORT',
  'SALES',
  'URGENT'
];

export const CONVERSATION_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH'
];

export const MESSAGE_STATUSES = [
  'pending',
  'sent',
  'delivered',
  'read',
  'failed'
];

export const SYNC_STATUSES = [
  'connected',
  'disconnected',
  'error'
];

export const EMAIL_PROVIDERS = [
  'gmail',
  'outlook'
];

// ------------------------------------------------------
// 7. WORKFLOWS & AUTOMATION
// ------------------------------------------------------

export const WORKFLOW_STATUSES = [
  'active',
  'draft',
  'inactive'
];

export const WORKFLOW_EXECUTION_STATUSES = [
  'pending',
  'running',
  'success',
  'failed',
  'partial'
];

export const ACTIVITY_TYPES = [
  'NOTE',
  'CALL',
  'EMAIL',
  'MEETING',
  'STATUS_CHANGE',
  'TASK',
  'WHATSAPP',
  'SYSTEM'
];

// ------------------------------------------------------
// 8. PRODUCTS & INVENTORY
// ------------------------------------------------------

export const PRODUCT_STATUSES = [
  'Active',
  'Inactive',
  'Low Stock',
  'Archived'
];

export const PRODUCT_TYPES = [
  'Goods',
  'Service'
];

export const PRODUCT_UNITS = [
  'Unit',
  'Pieces',
  'Hours',
  'Days',
  'Licenses',
  'Months',
  'Years',
  'Kg',
  'Boxes',
  'Set',
  'Meter',
  'Pack'
];

export const PRODUCT_STOCK_STATUSES = [
  'Unlimited',
  'In Stock',
  'Low Stock',
  'Out of Stock',
  'On Order'
];

export const CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'CAD',
  'AUD',
  'SGD'
];

export const TAX_RATES = [
  0,
  5,
  12,
  18,
  28
];

export const PRODUCT_TAX_RATE_OPTIONS = [
  { label: '0% (Exempt / Nil Tax)', value: '0' },
  { label: '5% (GST 5%)', value: '5' },
  { label: '12% (GST 12%)', value: '12' },
  { label: '18% (Standard GST 18%)', value: '18' },
  { label: '28% (Luxury / Cess 28%)', value: '28' }
];

export const PRODUCT_STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Inactive: 'bg-gray-100 text-gray-800',
  'Low Stock': 'bg-amber-100 text-amber-800',
  Archived: 'bg-zinc-100 text-zinc-700'
};

// ------------------------------------------------------
// 9. PRICE BOOKS
// ------------------------------------------------------

export const PRICEBOOK_STATUSES = [
  'Active',
  'Inactive'
];

export const PRICEBOOK_ITEM_TYPES = [
  'product',
  'service',
  'package'
];

export const PRICEBOOK_STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Expired: 'bg-rose-100 text-rose-800'
};

// ------------------------------------------------------
// 10. QUOTATIONS
// ------------------------------------------------------

export const QUOTATION_STATUSES = [
  'draft',
  'sent',
  'accepted',
  'rejected'
];

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected'
};

export const QUOTATION_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800'
};

// ------------------------------------------------------
// 11. INVOICES
// ------------------------------------------------------

export const INVOICE_STATUSES = [
  'unpaid',
  'paid',
  'overdue'
];

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  overdue: 'Overdue'
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  unpaid: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  overdue: 'bg-red-100 text-red-800 border-red-200'
};

// ------------------------------------------------------
// 12. SALES ORDERS
// ------------------------------------------------------

export const SALES_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled'
];

export const SALES_ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export const SALES_ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  shipped: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

// ------------------------------------------------------
// 13. PURCHASE ORDERS
// ------------------------------------------------------

export const PURCHASE_ORDER_STATUSES = [
  'pending',
  'approved',
  'ordered',
  'received',
  'cancelled'
];

export const PURCHASE_ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  ordered: 'Ordered',
  received: 'Received',
  cancelled: 'Cancelled'
};

export const PURCHASE_ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  ordered: 'bg-blue-100 text-blue-800 border-blue-200',
  received: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

// ------------------------------------------------------
// 14. VENDORS & SUPPLIERS
// ------------------------------------------------------

export const VENDOR_STATUSES = [
  'Active',
  'Inactive'
];

export const VENDOR_STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Inactive: 'bg-gray-100 text-gray-800'
};

// ------------------------------------------------------
// 15. PAYMENTS & TRANSACTIONS
// ------------------------------------------------------

export const PAYMENT_STATUSES = [
  'Pending',
  'Completed',
  'Failed',
  'Refunded'
];

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Failed: 'bg-red-100 text-red-800',
  Refunded: 'bg-purple-100 text-purple-800'
};

export const PAYMENT_TYPES = [
  'in',
  'out'
];

export const PAYMENT_METHODS = [
  'Bank Transfer',
  'UPI',
  'Credit Card',
  'Cash',
  'Cheque',
  'Stripe',
  'PayPal'
];

export const formatToLocalDateTime = (date: Date = new Date()): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const parseToLocalDateTime = (val?: string | Date | null): string => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return formatToLocalDateTime(d);
};
