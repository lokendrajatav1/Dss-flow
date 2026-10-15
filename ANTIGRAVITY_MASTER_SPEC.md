# ANTIGRAVITY MASTER SPEC

## AI SALES CRM & AUTOMATION SaaS

### Master Development Specification --- Production-Ready Multi-Tenant B2B SaaS

**Document status:** Master specification\
**Purpose:** This document is the primary implementation guide for an AI
coding agent such as Antigravity.\
**Source of truth:** The original 108-section SRS remains authoritative.
Nothing from the SRS is intentionally removed. This document adds
implementation rules, architecture, contracts, acceptance criteria, and
agent operating instructions.

------------------------------------------------------------------------

# 1. PROJECT MISSION

Build a commercial, multi-tenant B2B SaaS platform that combines:

-   CRM
-   Lead management
-   Customer management
-   Sales pipeline
-   WhatsApp communication
-   Sales automation
-   AI assistance
-   Tasks and follow-ups
-   Quotations
-   Invoices
-   Payments
-   Reports and analytics
-   Subscription billing
-   Usage metering
-   Super Admin controls
-   Industry-specific configuration

Core positioning:

> Capture every lead, manage every conversation and automate every
> follow-up from one platform.

Secondary positioning:

> CRM + WhatsApp + AI + Sales Automation

The product must be designed as **one configurable SaaS platform**, not
as separate applications for every industry.

------------------------------------------------------------------------

# 2. NON-NEGOTIABLE PRODUCT PRINCIPLES

Antigravity MUST follow these rules:

1.  Multi-tenancy is mandatory.
2.  Every tenant-owned database record must be scoped by `companyId`.
3.  Never trust `companyId` supplied by the browser.
4.  Tenant/company identity must come from authenticated server-side
    context.
5.  Protected APIs require authentication.
6.  Protected operations require permission checks.
7.  Resource access must be tenant-scoped.
8.  Subscription entitlement must be checked where applicable.
9.  Usage limits must be enforced server-side.
10. Payment success must never be trusted from the frontend alone.
11. Razorpay/provider webhooks must be verified.
12. WhatsApp webhooks must verify provider signatures where applicable.
13. Long-running work must use background queues.
14. Use Redis + BullMQ for asynchronous processing.
15. Start with a modular monolith, not microservices.
16. Keep integrations behind provider abstractions.
17. Do not hard-code business logic into UI components.
18. Use TypeScript strictly.
19. Use PostgreSQL + Prisma.
20. API versioning starts at `/api/v1`.
21. Important state changes must be auditable.
22. Secrets must never be committed or logged.
23. Do not expose API keys, access tokens, passwords or payment secrets.
24. Do not delete working functionality just to simplify implementation.
25. Do not introduce packages without a clear reason.
26. Do not implement future phases prematurely.
27. Do not rewrite the entire repository for a small feature.
28. Before modifying existing code, inspect the existing architecture.
29. After every implementation phase, run typecheck, lint, tests and
    build.
30. Update documentation when architecture or API behavior changes.

------------------------------------------------------------------------

# 3. TARGET INDUSTRIES

The core platform must support configurable workflows for:

-   Real estate
-   Education/coaching
-   Digital agencies
-   B2B/distributors
-   Service businesses
-   Automobile
-   Clinics
-   Packers/movers
-   Travel/hospitality
-   Gyms
-   Salons
-   Consultants
-   Manufacturing
-   Retail/D2C
-   Home/repair services
-   Construction/interior
-   Recruitment
-   Insurance/financial services

Industry behavior must be configuration-driven.

Examples:

### Real estate

Property → Lead → Site Visit → Negotiation → Booking

### Education

Student → Course → Counselling → Application → Admission

### Agency

Lead → Client → Project → Renewal

Do not create separate codebases for each industry.

------------------------------------------------------------------------

# 4. RECOMMENDED TECHNOLOGY STACK

## Frontend

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   TanStack Query
-   Zustand
-   React Hook Form
-   Zod
-   TanStack Table
-   Recharts
-   date-fns
-   Axios or centralized fetch abstraction

## Backend

-   Node.js
-   Express
-   TypeScript
-   Prisma
-   PostgreSQL

## Async / infrastructure

-   Redis
-   BullMQ
-   Docker
-   Nginx
-   GitHub Actions
-   Sentry
-   Scheduled workers
-   Database backups

## External integrations

-   WhatsApp Business Platform
-   Meta APIs
-   AI/LLM API
-   Razorpay
-   Email provider such as Resend/SES
-   Google APIs
-   S3-compatible storage or Cloudinary

------------------------------------------------------------------------

# 5. ARCHITECTURE

Use:

**Modular Monolith + Background Workers**

Do not begin with microservices.

Initial architecture:

``` text
Internet
   |
 Nginx
   |
   +-------------------+
   |                   |
React Web           Express API
                       |
          +------------+-------------+
          |            |             |
      PostgreSQL      Redis       Integrations
          |            |             |
        Prisma      BullMQ       WhatsApp/AI/Payment
                       |
                    Workers
```

Future scale:

``` text
Load Balancer
      |
 +----+----+
 |         |
API 1    API 2
 |         |
 +----+----+
      |
 PostgreSQL
      |
    Redis
      |
   Workers
```

------------------------------------------------------------------------

# 6. MONOREPO

Use:

``` text
saas-platform/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   └── config/
├── prisma/
├── docker/
├── docs/
├── .github/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

If the repository already exists, inspect it first and adapt without
unnecessary restructuring.

------------------------------------------------------------------------

# 7. FRONTEND STRUCTURE

Recommended:

``` text
apps/web/src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   └── tables/
├── modules/
│   ├── auth/
│   ├── dashboard/
│   ├── leads/
│   ├── customers/
│   ├── pipeline/
│   ├── whatsapp/
│   ├── automation/
│   ├── ai/
│   ├── quotations/
│   ├── invoices/
│   ├── payments/
│   ├── reports/
│   └── settings/
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
└── utils/
```

The frontend MUST be built as a Progressive Web App (PWA) or follow a strict mobile-first design, ensuring field sales executives can fully operate the CRM from their mobile browsers without needing a laptop.

------------------------------------------------------------------------

# 7A. UI/UX DESIGN SYSTEM (THEME & AESTHETICS)

To ensure the CRM feels "Premium" and "Enterprise-grade", the frontend must adhere to the following design system:

1. **Typography (Fonts):**
   - Use modern, clean Google Fonts like **Inter**, **Outfit**, or **Plus Jakarta Sans**.
   - No generic system defaults.

2. **Color Palette:**
   - **Primary:** Deep Indigo or Electric Blue (gives a trustworthy B2B tech feel).
   - **Backgrounds:** Off-white/slate for light mode, and deep charcoal (`#0F172A`) for Dark Mode.
   - **Status Colors:** Use vibrant but accessible colors (Green for Won, Red for Lost/Rotting, Orange for Pending).

3. **Modern Styling:**
   - Implement **Glassmorphism** for modals, floating menus, and dropdowns (slight blur and transparency).
   - Use subtle **Micro-animations** (hover effects on buttons, smooth row expansions, skeleton loaders) to make the UI feel alive and fast.
   - Support both **Light Mode and Dark Mode** toggle natively.

4. **Component Library:**
   - We will use Shadcn UI + Tailwind CSS to achieve this highly customizable, modern look.

------------------------------------------------------------------------

# 8. BACKEND STRUCTURE

Recommended:

``` text
apps/api/src/
├── config/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── companies/
│   ├── leads/
│   ├── customers/
│   ├── deals/
│   ├── pipeline/
│   ├── tasks/
│   ├── activities/
│   ├── whatsapp/
│   ├── conversations/
│   ├── automation/
│   ├── ai/
│   ├── quotations/
│   ├── invoices/
│   ├── payments/
│   ├── subscriptions/
│   ├── reports/
│   ├── notifications/
│   └── audit-logs/
├── jobs/
├── workers/
├── integrations/
│   ├── whatsapp/
│   ├── payment/
│   ├── email/
│   ├── ai/
│   ├── google/
│   └── meta/
├── lib/
├── utils/
└── app.ts
```

Each major module should have clear boundaries.
Controllers, services, repositories, routes, validators and types
live inside their module folder — not at the root level.

Example:

``` text
modules/leads/
├── lead.controller.ts
├── lead.service.ts
├── lead.repository.ts
├── lead.schema.ts
├── lead.routes.ts
└── lead.types.ts
```

------------------------------------------------------------------------

# 8A. EVENT BUS

Modules must not call each other directly for side effects.
Use an internal event bus to keep modules loosely coupled.

Architecture:

``` text
Lead Module
    ↓ emits 'lead.created'
    ↓
Event Bus (in-process)
    ↓
    +── Automation Module (listens)
    +── Notification Module (listens)
    +── Audit Log Module (listens)
    +── AI Module (listens)
    +── Webhook Module (listens)
```

Implementation:

Use Node.js `EventEmitter` for synchronous in-process events.
Use BullMQ for events that require async/delayed processing.

Every domain event payload must include:

``` text
eventName
companyId
userId
entityType
entityId
data
timestamp
```

Core domain events:

``` text
lead.created
lead.updated
lead.assigned
lead.status_changed
lead.converted
customer.created
customer.updated
deal.created
deal.stage_changed
deal.won
deal.lost
message.received
message.sent
task.created
task.overdue
automation.triggered
automation.completed
automation.failed
invoice.created
payment.received
subscription.created
subscription.expired
user.invited
user.activated
```

Rules:

-   A module emits events after its own work succeeds.
-   A module subscribes to events it cares about.
-   Event handlers must not break the emitting module on failure.
-   Async event handlers must use BullMQ queues.
-   Every event must carry `companyId` for tenant context.
-   Adding a new feature = subscribe to existing events. No changes to
    existing modules required.

------------------------------------------------------------------------

# 8B. MODULE REGISTRY

Each backend module must export a standard definition that the
application loader discovers and registers automatically.

Module definition:

``` text
name
routes
permissions
featureFlag
events (subscriptions)
queues (if any)
```

Example:

``` text
modules/leads/index.ts

export default {
  name: 'leads',
  basePath: '/leads',
  routes: leadRoutes,
  permissions: [
    'lead.view',
    'lead.create',
    'lead.update',
    'lead.delete',
    'lead.assign',
    'lead.export'
  ],
  featureFlag: null,
  events: {
    'message.received': handleIncomingMessage,
    'automation.assign_lead': handleAutoAssign
  }
}
```

Application bootstrap:

``` text
Discover all modules in modules/
    ↓
For each module:
    ↓
    Register routes at /api/v1/{basePath}
    ↓
    Register permissions in RBAC system
    ↓
    Subscribe event handlers to Event Bus
    ↓
    Initialize queues if defined
```

Benefits:

-   New module = new folder + definition file. Zero changes to app.ts.
-   Permissions auto-registered. No manual list maintenance.
-   Event subscriptions declared alongside the module. Easy to trace.
-   Feature flags checked during registration. Disabled module = routes
    not mounted.

Frontend modules should follow a similar pattern for navigation and
route registration.

------------------------------------------------------------------------

# 8C. OUTGOING WEBHOOKS

Companies should be able to receive event notifications at external
URLs for third-party integration.

This enables Zapier, Make.com, n8n, and custom integration support
without building specific connectors.

Webhook configuration:

``` text
companyId
event
url
secret
active
createdAt
```

Flow:

``` text
Domain Event
    ↓
Event Bus
    ↓
Webhook Module (subscriber)
    ↓
Find active webhooks for company + event
    ↓
Queue webhook delivery (BullMQ)
    ↓
POST to external URL with signed payload
    ↓
Log delivery result
    ↓
Retry on failure (max 3 attempts, exponential backoff)
```

Webhook payload:

``` text
event
companyId
entityType
entityId
data
timestamp
signature
```

Security:

-   Sign payload with company webhook secret (HMAC-SHA256).
-   Log all deliveries.
-   Disable webhook after repeated failures.
-   Rate-limit outgoing webhooks per company.

This is a Phase 2 feature. The Event Bus from Phase 1 makes this
trivial to add later since it is just another event subscriber.

------------------------------------------------------------------------

# 8D. ENTERPRISE SCALE & SAFETY GUIDELINES

To prevent operational failures at scale, the architecture MUST enforce:

1. **Real-Time WebSockets (Redis Pub/Sub):**
   - WebSockets must be backed by Redis Pub/Sub to allow horizontal scaling of Node.js instances without dropping real-time chat messages.

2. **API Rate Limiting (BullMQ):**
   - Third-party APIs (especially Meta WhatsApp Cloud API) must never be hit directly in a loop. All outgoing messages must pass through a BullMQ queue with strict rate-limiting (e.g., max 50 req/sec) to prevent account bans.

3. **Zero-Downtime Database Migrations:**
   - Any schema changes using Prisma (`prisma migrate`) must be non-blocking. Adding columns or tables must not lock the database and cause downtime for tenants.

------------------------------------------------------------------------

# 9. CORE DOMAIN ENTITIES

The core data model includes:

-   User
-   Company
-   Role
-   Permission
-   Team
-   Lead
-   Customer
-   Contact
-   Deal
-   Pipeline
-   PipelineStage
-   Task
-   Activity
-   Note
-   Tag
-   Conversation
-   Message
-   WhatsAppAccount
-   MessageTemplate
-   Automation
-   AutomationTrigger
-   AutomationAction
-   AutomationRun
-   Product
-   Service
-   Quotation
-   Invoice
-   Payment
-   Plan
-   Subscription
-   UsageRecord
-   Integration
-   Notification
-   AuditLog
-   File

Additional configuration entities may include:

-   IndustryConfig
-   CustomFieldDefinition
-   CustomFieldValue
-   FeatureFlag
-   LeadSource
-   LostReason
-   SubscriptionEvent

------------------------------------------------------------------------

# 10. MULTI-TENANCY

Every tenant-owned entity must contain:

``` text
companyId
```

Request flow:

``` text
Authentication
      ↓
Authenticated User
      ↓
Company
      ↓
Role
      ↓
Permission
      ↓
Tenant Scope
      ↓
Business Logic
      ↓
Database
```

Never rely entirely on developers remembering to add `where` clauses. 
To prevent fatal data leakage between tenants, implement **Double-Layer Security**:

1. **Application Layer (Prisma Extension):** 
   Implement a Prisma Client Extension (Global Query Filter) that automatically intercepts all queries and injects `where: { companyId: ctx.companyId }`.

2. **Database Layer (PostgreSQL RLS):**
   Implement Row-Level Security (RLS) on PostgreSQL. Set the session variable (e.g., `set_config('app.current_tenant', companyId)`) before queries, ensuring the database engine natively blocks cross-tenant data access even if the Prisma extension is bypassed.

------------------------------------------------------------------------

# 11. AUTHENTICATION

Required functionality:

-   Register
-   Login
-   Logout
-   Email verification
-   Forgot password
-   Reset password
-   Change password
-   Session management
-   Refresh token
-   Account activation
-   Account suspension

Future:

-   Google login
-   Microsoft login
-   2FA
-   Passkeys

Security requirements:

-   Hash passwords securely.
-   Never store plaintext passwords.
-   Never log credentials.
-   Rate-limit authentication endpoints.
-   Invalidate sessions appropriately.
-   Protect password-reset tokens.
-   Validate email verification tokens.

------------------------------------------------------------------------

# 12. ROLES

## Super Admin

SaaS provider:

-   Companies
-   Plans
-   Subscriptions
-   Payments
-   Usage
-   System settings
-   Feature flags
-   Integrations
-   Support
-   Audit logs

## Company Owner/Admin

-   Company settings
-   Users
-   Roles
-   Leads
-   Customers
-   Integrations
-   Automations
-   Reports
-   Billing

## Sales Manager

-   Team leads
-   Assignment
-   Pipeline
-   Team reports
-   Follow-ups

## Sales Executive

-   Assigned leads
-   Customers
-   Conversations
-   Tasks
-   Follow-ups
-   Deals

## Support User

-   Customer conversations
-   Tickets
-   Customers
-   Support activities

------------------------------------------------------------------------

# 13. RBAC

Permission format:

``` text
module.action
```

Examples:

``` text
lead.view
lead.create
lead.update
lead.delete
lead.assign
lead.export

customer.view
customer.create
customer.update

invoice.view
invoice.create
invoice.send

automation.view
automation.create
automation.update
automation.delete
```

Permissions must be centralized.

Do not scatter role names throughout controllers.

Use a reusable authorization layer.

------------------------------------------------------------------------

# 14. COMPANY ONBOARDING

Flow:

``` text
Register
 ↓
Email Verification
 ↓
Create Company
 ↓
Select Industry
 ↓
Select Plan
 ↓
Create First Admin
 ↓
Invite Team
 ↓
Connect WhatsApp
 ↓
Import Leads
 ↓
Configure Automation
 ↓
Dashboard
```

Create an onboarding/setup wizard.

Track progress.

Example:

``` text
Company Profile       ✓
Team Setup            ✓
WhatsApp              ○
Lead Import           ○
Pipeline              ○
Templates             ○
Automation            ○
```

------------------------------------------------------------------------

# 15. SUPER ADMIN

Dashboard KPIs:

-   Total companies
-   Active companies
-   Trial companies
-   Expired companies
-   MRR
-   ARR
-   New subscriptions
-   Cancellations
-   Active users
-   AI usage
-   WhatsApp usage

Company management:

-   Search
-   Filter
-   View company
-   Suspend
-   Activate
-   Subscription
-   Usage
-   Users
-   Audit logs

Feature flags:

-   WhatsApp
-   AI
-   Automation
-   Invoice
-   Payment
-   Reports
-   API
-   White label

------------------------------------------------------------------------

# 16. COMPANY DASHBOARD

KPIs:

-   Total leads
-   New leads
-   Hot leads
-   Follow-ups due
-   Deals
-   Won deals
-   Lost deals
-   Revenue
-   Pending payments

Charts:

-   Lead source
-   Lead status
-   Conversion
-   Revenue
-   Team performance
-   Pipeline
-   Follow-ups

Dashboard data must be tenant-scoped.

------------------------------------------------------------------------

# 17. LEAD MANAGEMENT

Lead fields:

``` text
id
companyId
name
phone
email
company
source
status
priority
budget
location
requirement
assignedTo
leadScore
tags
notes
createdAt
updatedAt
lastContactAt
nextFollowupAt
```

Sources:

-   Website
-   WhatsApp
-   Facebook
-   Instagram
-   Google Ads
-   Referral
-   Phone
-   Manual
-   API
-   Landing page

Statuses:

-   New
-   Contacted
-   Qualified
-   Proposal
-   Negotiation
-   Follow-up
-   Won
-   Lost

Features:

-   CRUD
-   Archive
-   Search
-   Filter
-   Saved Filters / Smart Views (save favorite filter combinations)
-   Sort
-   Bulk assignment
-   Status update
-   Tags
-   Notes
-   Activity timeline
-   Lead scoring
-   Import
-   Export
-   Duplicate detection
-   Convert to customer
-   Web Forms (embeddable drag-and-drop forms for lead capture)

------------------------------------------------------------------------

# 18. DUPLICATE DETECTION

Primary checks:

``` text
phone
email
```

Optional fuzzy checks:

``` text
name + phone
name + email
```

The duplicate system must be configurable.

Do not silently overwrite existing customers.

------------------------------------------------------------------------

# 19. LEAD ASSIGNMENT

Support:

-   Manual assignment
-   Round robin
-   Location-based
-   Source-based
-   Product-based
-   Team-based

Assignment actions must be auditable.

------------------------------------------------------------------------

# 20. CUSTOMER MANAGEMENT

Customer profile:

-   Basic information
-   Contact information
-   Company information
-   Lead history
-   Deals
-   Conversations
-   Tasks
-   Notes
-   Quotations
-   Invoices
-   Payments
-   Documents
-   Activities

Timeline:

``` text
Lead Created
→ Contacted
→ Qualified
→ Deal Created
→ Quotation
→ Invoice
→ Payment
```

------------------------------------------------------------------------

# 21. SALES PIPELINE

Pipelines must be customizable.

Example:

``` text
New
→ Contacted
→ Qualified
→ Demo
→ Proposal
→ Negotiation
→ Won/Lost
```

Deal fields:

``` text
id
lead
customer
value
stage
probability
expectedClose
assignedUser
products
notes
```

Pipeline stage fields:

-   Name
-   Probability
-   Color
-   Order
-   RottingDays (threshold for deal stagnation alert)

Feature: Deal Rotting Alert
Deals inactive in a stage beyond `RottingDays` must be visually highlighted (e.g., in red) to prompt immediate follow-up.

------------------------------------------------------------------------

# 22. TASKS AND FOLLOW-UPS

Task fields:

``` text
title
description
assignedUser
lead
customer
priority
dueDate
reminder
status
```

Statuses:

-   Pending
-   In Progress
-   Completed
-   Cancelled
-   Overdue

Follow-ups can be:

-   Manual
-   Automated

------------------------------------------------------------------------

# 23. WHATSAPP

Use the official WhatsApp Business Platform/provider integration.

Inbox must support:

-   Conversations
-   Search
-   Filter
-   Assignment
-   Tags
-   Internal notes
-   Customer profile
-   Lead creation
-   Replies
-   Templates
-   Interactive messages (Buttons, Lists, Product Catalogs)
-   Media

Flow:

``` text
Customer
 ↓
WhatsApp
 ↓
Webhook
 ↓
Express API
 ↓
Message Processor
 ↓
PostgreSQL
 ↓
Automation Engine
 ↓
AI if enabled
 ↓
Response
```

Use async processing where appropriate.

------------------------------------------------------------------------

# 24. CONVERSATIONS

Conversation:

``` text
id
companyId
customerId
leadId
channel
status
assignedTo
lastMessageAt
createdAt
```

Message:

``` text
id
conversationId
direction
sender
messageType
content
providerMessageId
status
timestamp
```

Statuses:

-   Sent
-   Delivered
-   Read
-   Failed

------------------------------------------------------------------------

# 25. WHATSAPP TEMPLATES

Examples:

-   Welcome
-   Follow-up
-   Appointment
-   Quotation
-   Payment reminder
-   Thank you
-   Service update

Variables:

``` text
{{customer_name}}
{{company_name}}
{{appointment_date}}
{{amount}}
```

Respect provider approval/policy requirements.

------------------------------------------------------------------------

# 26. AUTOMATION ENGINE

Automation model:

``` text
Trigger
 ↓
Condition
 ↓
Action
 ↓
Delay
 ↓
Condition
 ↓
Action
```

Triggers:

-   Lead created
-   Lead updated
-   Status changed
-   Customer created
-   Message received
-   Deal created
-   Stage changed
-   Deal won
-   Invoice created
-   Payment received
-   Task overdue
-   Subscription event

Conditions:

-   Source
-   Status
-   Priority
-   Lead score
-   Location
-   Assigned user
-   Amount
-   Tags
-   Time
-   Response status

Actions:

-   Assign user
-   Assign team
-   Send WhatsApp
-   Send email
-   Create task
-   Create follow-up
-   Add tag
-   Remove tag
-   Change status
-   Notify manager
-   Add internal note

------------------------------------------------------------------------

# 27. AUTOMATION EXECUTION

Architecture:

``` text
Event
 ↓
Automation Service
 ↓
Job
 ↓
Redis
 ↓
BullMQ
 ↓
Worker
 ↓
Action
 ↓
Automation Log
```

AutomationRun:

``` text
automationRunId
companyId
automationId
trigger
status
startedAt
completedAt
error
```

Statuses:

-   Queued
-   Running
-   Completed
-   Failed
-   Cancelled

Automation failures must be observable and retryable where safe.

------------------------------------------------------------------------

# 28. AI SYSTEM

Initial AI must be assistive rather than unrestricted autonomous
operation.

Capabilities:

-   Lead extraction
-   Conversation summary
-   Reply assistant
-   Lead qualification
-   Knowledge-base answers

Reply assistant:

``` text
Conversation
 ↓
AI generates suggestion
 ↓
Salesperson reviews
 ↓
Salesperson sends
```

Do not automatically send unrestricted AI-generated messages in the
first version.

------------------------------------------------------------------------

# 29. AI KNOWLEDGE BASE

Support:

-   FAQs
-   Products
-   Services
-   Pricing
-   Policies
-   Terms
-   Documents

Future:

-   RAG
-   Embeddings
-   Vector database

AI usage must be metered per company.

------------------------------------------------------------------------

# 30. AI TOOL SECURITY

AI must not have unrestricted database access.

Controlled tools may include:

``` text
getLead()
getCustomer()
getProduct()
createTask()
createFollowup()
sendApprovedTemplate()
```

Sensitive actions require confirmation.

AI must respect:

-   company scope
-   user permissions
-   subscription limits
-   action restrictions

------------------------------------------------------------------------

# 31. TEAM MANAGEMENT

Company admin can:

-   Invite users
-   Deactivate users
-   Assign roles
-   Create teams
-   Assign managers
-   Configure permissions
-   Review activity

Invitation flow must be secure and expiring.

------------------------------------------------------------------------

# 32. QUOTATIONS

Features:

-   Create quotation
-   Customer
-   Items
-   Quantity
-   Price
-   Discount
-   Tax
-   Total
-   Terms
-   Validity
-   PDF
-   Email
-   WhatsApp

Statuses:

-   Draft
-   Sent
-   Viewed
-   Accepted
-   Rejected
-   Expired

------------------------------------------------------------------------

# 33. INVOICES

Support:

-   Invoice numbering
-   Tax calculation (GST Engine: CGST/SGST/IGST based on State)
-   HSN/SAC Codes
-   Discount
-   Items
-   Customer
-   Due date
-   Payment status
-   PDF
-   Email
-   WhatsApp

Statuses:

-   Unpaid
-   Partially Paid
-   Paid
-   Overdue
-   Cancelled

------------------------------------------------------------------------

# 34. PAYMENTS

Initial provider:

**Razorpay**

Flow:

``` text
Invoice
 ↓
Payment Link
 ↓
Customer
 ↓
Razorpay
 ↓
Webhook
 ↓
Backend Verification
 ↓
Payment Update
 ↓
Invoice Update
```

Never trust only frontend payment success.

Use verified webhooks and server-side state transitions.

Use database transactions for critical billing operations.

------------------------------------------------------------------------

# 35. SUBSCRIPTIONS

Plan fields:

``` text
name
price
billingCycle
userLimit
leadLimit
aiLimit
storageLimit
features
```

Billing cycles:

-   Monthly
-   Yearly

States:

-   Trial
-   Active
-   Past Due
-   Cancelled
-   Expired
-   Suspended

------------------------------------------------------------------------

# 36. ENTITLEMENT ENGINE

An operation is allowed only when:

``` text
User Permission
AND
Subscription Feature
AND
Usage Limit
```

Example:

``` text
automation.create = true
automation feature = false
```

Result:

``` text
DENIED
```

All entitlement checks must happen server-side.

------------------------------------------------------------------------

# 37. USAGE TRACKING

Track:

-   Users
-   Leads
-   Customers
-   Messages
-   AI requests
-   Automation runs
-   Storage
-   API calls

Usage should be queryable by:

-   Company
-   Billing period
-   Feature

------------------------------------------------------------------------

# 38. NOTIFICATIONS

Events:

-   New lead
-   Lead assignment
-   Customer reply
-   Follow-up due
-   Task overdue
-   Deal won
-   Payment received
-   Subscription expiring

Channels:

-   In-app
-   Email
-   WhatsApp where applicable
-   Push in future

Users need notification preferences.

------------------------------------------------------------------------

# 39. REPORTS

Reports:

-   Lead report
-   Sales report
-   Team report
-   Automation report

Lost lead reasons:

-   Price
-   Competitor
-   No response
-   Not interested
-   Wrong requirement
-   Timing
-   Other

------------------------------------------------------------------------

# 40. GLOBAL SEARCH

Search:

-   Leads
-   Customers
-   Phone
-   Email
-   Deals
-   Conversations
-   Invoices
-   Quotations

Every search must remain tenant-scoped.

------------------------------------------------------------------------

# 41. IMPORT / EXPORT

CSV import:

``` text
Upload
 ↓
Map fields
 ↓
Validate (Smart validation with line-by-line error reporting)
 ↓
Duplicate check
 ↓
Preview (Show the user exactly which lines have errors before committing)
 ↓
Import (Process via BullMQ background queue for large files)
```

Exports:

-   Leads
-   Customers
-   Deals
-   Reports
-   Payments

Large exports must run asynchronously.

------------------------------------------------------------------------

# 42. AUDIT LOGS

Audit:

-   Login
-   User creation
-   Permission changes
-   Lead changes
-   Customer changes
-   Integration connections
-   Subscription events
-   Payment events
-   Data exports
-   AI actions where appropriate

Log:

``` text
user
action
entity
entityId
oldValue
newValue
time
companyId
```

Do not log secrets.

------------------------------------------------------------------------

# 43. FILE MANAGEMENT

Use object storage:

-   S3-compatible storage
-   Cloudinary

DB stores metadata only.

Possible files:

-   Customer documents
-   Quotations
-   Invoices
-   Company documents

Secure uploads:

-   Validate type
-   Validate size
-   Generate safe filenames
-   Restrict access
-   Avoid executable uploads

------------------------------------------------------------------------

# 44. API DESIGN

Base:

``` text
/api/v1
```

Routes:

``` text
/auth
/users
/companies
/roles
/permissions
/teams
/leads
/customers
/deals
/pipelines
/tasks
/activities
/conversations
/messages
/whatsapp
/automations
/automation-runs
/ai
/quotations
/invoices
/payments
/reports
/integrations
/plans
/subscriptions
/usage
/notifications
/audit-logs
/files
/search
```

------------------------------------------------------------------------

# 45. API SECURITY PIPELINE

Protected request:

``` text
Authentication
 ↓
Company Context
 ↓
Role
 ↓
Permission
 ↓
Resource Ownership
 ↓
Subscription Entitlement
 ↓
Validation
 ↓
Business Logic
 ↓
Database
```

Never bypass this pipeline.

------------------------------------------------------------------------

# 46. API ERROR FORMAT

Standardize:

``` json
{
  "success": false,
  "message": "Lead not found",
  "code": "LEAD_NOT_FOUND"
}
```

Use consistent HTTP status codes.

------------------------------------------------------------------------

# 47. RATE LIMITING

Apply rate limits to:

-   Login
-   OTP
-   Password reset
-   Public APIs
-   AI
-   Webhooks
-   Message sending
-   Bulk operations

Use stricter limits for expensive operations.

------------------------------------------------------------------------

# 48. WEBHOOK SECURITY

For every provider webhook:

1.  Verify signature.
2.  Validate event.
3.  Validate provider ID.
4.  Identify company/integration.
5.  Check duplicate event/idempotency.
6.  Process safely.
7.  Record event.
8.  Return correct response.

Webhook handlers must be idempotent.

------------------------------------------------------------------------

# 49. INTEGRATION ARCHITECTURE

Use provider abstraction:

``` text
integrations/
├── whatsapp/
├── payment/
├── email/
├── sms/
├── ai/
├── google/
├── calendar/
└── meta/
```

Do not make business modules directly depend on a specific vendor
wherever avoidable.

Example:

``` ts
interface WhatsAppProvider {
  sendMessage(...): Promise<...>
  sendTemplate(...): Promise<...>
  verifyWebhook(...): Promise<...>
}
```

------------------------------------------------------------------------

# 50. COMPANY INTEGRATION SETUP

Flow:

``` text
Settings
 ↓
Integrations
 ↓
Provider
 ↓
Connect
 ↓
OAuth/provider authentication
 ↓
Permissions
 ↓
Connected
```

Store:

``` text
companyId
integrationId
provider
status
encryptedCredentials
```

Never expose encrypted credentials to the frontend.

------------------------------------------------------------------------

# 51. EMAIL

Possible providers:

-   Resend
-   SES
-   Other provider through abstraction

Emails:

-   Welcome
-   Verification
-   Password reset
-   Invitation
-   Lead notification
-   Task reminder
-   Invoice
-   Payment confirmation
-   Subscription notification

------------------------------------------------------------------------

# 52. BACKGROUND JOBS

Queues:

``` text
emailQueue
whatsappQueue
aiQueue
automationQueue
notificationQueue
reportQueue
fileQueue
billingQueue
importExportQueue
```

Use:

-   Retries
-   Backoff
-   Dead-letter/failure handling where appropriate
-   Idempotency
-   Logging
-   Monitoring

------------------------------------------------------------------------

# 53. SCHEDULED JOBS

Examples:

-   Follow-ups
-   Subscription reminders
-   Trial expiry
-   Invoice reminders
-   Automation delays
-   Report generation

Use BullMQ workers.

------------------------------------------------------------------------

# 54. FRONTEND UI SYSTEM

shadcn/ui components:

-   Button
-   Input
-   Form
-   Dialog
-   Drawer
-   Sheet
-   Table
-   Tabs
-   Select
-   Dropdown
-   Command
-   Calendar
-   Date Picker
-   Badge
-   Card
-   Alert
-   Toast
-   Tooltip
-   Sidebar

Requirements:

-   Light mode
-   Dark mode
-   Responsive
-   Accessible
-   Keyboard navigation
-   Consistent spacing
-   Loading states
-   Empty states
-   Error states
-   Confirmation dialogs

------------------------------------------------------------------------

# 55. PRIMARY NAVIGATION

Suggested company navigation:

``` text
Dashboard
Leads
Customers
Pipeline
Tasks
WhatsApp
Automation
AI Assistant
Quotations
Invoices
Payments
Reports
Team
Settings
```

Super Admin:

``` text
Dashboard
Companies
Plans
Subscriptions
Payments
Usage
Users
Feature Flags
Integrations
Audit Logs
System Settings
```

Navigation must respect permissions and feature entitlements.

------------------------------------------------------------------------

# 56. RESPONSIVE STRATEGY

MVP:

-   Desktop
-   Laptop
-   Tablet
-   Mobile browser

Complex CRM screens can prioritize desktop usability.

Phase 3:

-   React Native or Flutter mobile application

Mobile app priority:

-   Leads
-   WhatsApp
-   Follow-ups
-   Tasks
-   Notifications
-   Dashboard

------------------------------------------------------------------------

# 57. CUSTOM FIELDS

Types:

-   Text
-   Number
-   Date
-   Dropdown
-   Multi-select
-   Boolean
-   Currency

Custom fields must be tenant-specific.

Do not hard-code every industry field into the base Lead table.

------------------------------------------------------------------------

# 58. CUSTOM PIPELINES

Company can define:

``` text
Pipeline name
Stage name
Probability
Color
Order
```

Different teams or industries may use different pipelines.

------------------------------------------------------------------------

# 59. INDUSTRY CONFIGURATION

Core:

``` text
CRM Engine
```

Configuration:

``` text
Industry
Custom Fields
Pipeline
Stages
Labels
Templates
Automation presets
```

This allows one product to serve many industries.

------------------------------------------------------------------------

# 60. WHITE LABEL

Future feature:

-   Logo
-   Custom domain
-   Brand colors
-   Email branding
-   Login branding
-   Favicon

Do not build full white-label infrastructure during MVP unless required.

------------------------------------------------------------------------

# 61. PLAN MATRIX

Example:

### Starter --- ₹999/month

-   CRM
-   Leads
-   Customers
-   Pipeline
-   Tasks
-   Follow-ups
-   Dashboard
-   CSV
-   3 users
-   1,000 leads

No:

-   WhatsApp
-   AI
-   Invoice
-   Payment
-   API

Basic automation may be included.

### Business --- ₹2,499/month

-   Core CRM
-   WhatsApp
-   Automation
-   Team management
-   Advanced reports
-   Quotations
-   Invoices
-   Payment links
-   Custom fields
-   Lead assignment
-   Priority support
-   10 users
-   5,000 leads
-   25 automations

### Growth / AI --- ₹4,999/month

-   Advanced WhatsApp
-   Advanced automation
-   AI lead qualification
-   Conversation summaries
-   AI reply assistant
-   AI knowledge base
-   Advanced analytics
-   API
-   Advanced reports
-   Custom pipelines
-   Custom fields
-   Advanced permissions
-   25 users
-   20,000 leads

### Enterprise

Illustrative custom range:

``` text
₹25,000–₹1,00,000+/month
```

May include:

-   50--500+ users
-   Large lead limits
-   Dedicated infrastructure
-   Private/on-premise
-   SSO
-   Custom integrations
-   Custom domain
-   White label
-   SLA
-   Dedicated support

Pricing must remain configurable from Super Admin.

------------------------------------------------------------------------

# 62. ADD-ONS

Examples:

-   Extra user: ₹199/user/month
-   Extra 5,000 leads: ₹499
-   +25 workflows: ₹499
-   Advanced automation: ₹999
-   +25 GB storage: ₹299
-   +100 GB storage: ₹799
-   AI credit packs
-   WhatsApp usage
-   API usage

These prices are product examples and must be configurable.

------------------------------------------------------------------------

# 63. AI CREDIT MODEL

Illustrative:

Business:

``` text
500 AI credits
```

Growth:

``` text
2,000 AI credits
```

Extra AI packs can be sold.

Actual AI cost must be tracked internally.

------------------------------------------------------------------------

# 64. SETUP SERVICES

Illustrative:

-   Basic setup: ₹2,999
-   Professional: ₹7,500--₹15,000
-   Enterprise: ₹25,000--₹2,00,000+

Services:

-   Configuration
-   Migration
-   Integrations
-   Training

------------------------------------------------------------------------

# 65. DATA MIGRATION

Illustrative:

-   Basic CSV: ₹2,999
-   Advanced: ₹7,500
-   Large migration: ₹25,000+

Migration must include:

-   Mapping
-   Validation
-   Duplicate detection
-   Preview
-   Import report

------------------------------------------------------------------------

# 66. ON-PREMISE

Future enterprise offering:

-   One-time license: ₹50,000--₹3,00,000+
-   Annual maintenance: ₹25,000--₹2,00,000+
-   Or annual enterprise license

Do not build this into MVP architecture as a separate codebase.

------------------------------------------------------------------------

# 67. REVENUE STREAMS

Potential revenue:

1.  Monthly subscriptions
2.  Annual subscriptions
3.  Extra users
4.  WhatsApp usage
5.  AI credits
6.  Automation add-ons
7.  Setup fees
8.  Data migration
9.  Enterprise/on-premise
10. White label
11. Custom integrations
12. API premium

Illustrative 100-company scenario:

``` text
40 × ₹999
40 × ₹2,499
15 × ₹4,999
5 × ₹25,000
```

Illustrative result:

``` text
₹339,905/month
```

This is a planning example, not a guaranteed revenue forecast.

------------------------------------------------------------------------

# 68. TRIAL

Example:

``` text
14-day trial
```

Reminders:

-   Day 7
-   Day 12
-   Day 14

After expiry:

``` text
Grace Period
 ↓
Read-only
 ↓
Subscription Required
```

Do not immediately delete company data.

Trial duration must be configurable.

------------------------------------------------------------------------

# 69. SUBSCRIPTION EXPIRY

Recommended behavior:

``` text
Expired
 ↓
Grace Period
 ↓
Read-only
 ↓
Subscription Required
```

Data remains protected.

------------------------------------------------------------------------

# 70. DATA RETENTION

Define policies for:

-   Deleted leads
-   Deleted customers
-   Cancelled companies
-   Expired subscriptions
-   Audit logs
-   Messages
-   AI logs

Use soft deletion where appropriate.

Retention periods should be configurable.

------------------------------------------------------------------------

# 71. PRIVACY

Prepare for:

-   Privacy policy
-   Terms
-   Consent
-   Data export
-   Account deletion
-   Retention controls
-   Access logs

For India-specific legal compliance, obtain appropriate legal review
before launch.

------------------------------------------------------------------------

# 72. BACKUPS

Required:

-   Daily full backup
-   Point-in-time recovery where supported
-   Off-server backup
-   Retention policy
-   Restore testing

Never rely only on a backup stored on the same VPS.

------------------------------------------------------------------------

# 73. SECURITY

Required:

-   HTTPS
-   Secure cookies/tokens
-   Password hashing
-   Validation
-   ORM parameterization
-   XSS protection
-   CSRF considerations
-   Rate limiting
-   Tenant isolation
-   RBAC
-   Secret management
-   Encrypted integration tokens
-   Secure file uploads
-   Audit logs
-   Backups
-   Dependency updates

------------------------------------------------------------------------

# 74. PERFORMANCE

Use:

-   Pagination
-   Lazy loading
-   Server-side filtering
-   Server-side sorting
-   DB indexes
-   Query optimization
-   Redis caching where useful
-   Background jobs
-   CDN
-   Compression
-   Request deduplication

Important indexes should include:

``` text
companyId
phone
email
status
assignedTo
createdAt
updatedAt
```

Use composite indexes according to real query patterns.

------------------------------------------------------------------------

# 75. OBSERVABILITY

Monitor:

-   API errors
-   API latency
-   DB health
-   Queue health
-   CPU
-   Memory
-   Disk
-   Failed jobs
-   Webhook failures
-   Payment failures
-   Integration failures

Use Sentry or equivalent for application errors.

------------------------------------------------------------------------

# 76. LOGGING

Structured fields:

``` text
timestamp
level
requestId
companyId
userId
module
action
status
duration
error
```

Never log:

-   Passwords
-   API keys
-   Access tokens
-   Payment secrets
-   Full sensitive customer data unnecessarily

------------------------------------------------------------------------

# 77. TESTING

## Unit tests

Test:

-   Services
-   Validators
-   Permissions
-   Automation logic
-   Billing logic

## Integration tests

Test:

-   Database
-   APIs
-   Webhooks
-   Payment events

## E2E

Critical flow:

``` text
Signup
 ↓
Company
 ↓
Invite user
 ↓
Create lead
 ↓
Assign lead
 ↓
Follow-up
 ↓
Message
 ↓
Customer
 ↓
Deal
 ↓
Invoice
 ↓
Payment
```

------------------------------------------------------------------------

# 78. API DOCUMENTATION

Use Swagger/OpenAPI.

Document:

-   Auth
-   Request body
-   Response body
-   Error responses
-   Permissions
-   Webhooks
-   Authentication requirements

------------------------------------------------------------------------

# 79. ENVIRONMENT VARIABLES

Expected categories:

``` text
NODE_ENV
PORT
DATABASE_URL
REDIS_URL

JWT_SECRET
JWT_REFRESH_SECRET

APP_URL
API_URL

WHATSAPP_*
META_*

RAZORPAY_*

AI_*
OPENAI_API_KEY or provider equivalent

EMAIL_*

S3_*
CLOUDINARY_*

SENTRY_*
```

Never commit `.env`.

Provide `.env.example` with placeholder values only.

------------------------------------------------------------------------

# 80. DEV ENVIRONMENT

Required developer setup:

``` text
Node.js
Package manager
PostgreSQL
Redis
Docker
Git
```

Recommended commands:

``` bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Exact scripts may adapt to repository conventions.

------------------------------------------------------------------------

# 81. DOCKER

Development/production containers may include:

``` text
web
api
postgres
redis
worker
nginx
```

Keep infrastructure configuration under:

``` text
docker/
```

Do not unnecessarily containerize external managed services.

------------------------------------------------------------------------

# 82. CI/CD

GitHub Actions should eventually run:

``` text
Install
 ↓
Lint
 ↓
Typecheck
 ↓
Unit tests
 ↓
Build
 ↓
Integration tests
 ↓
Deploy
```

Production deployment must require passing checks.

------------------------------------------------------------------------

# 83. DATABASE MIGRATIONS

Use Prisma migrations.

Rules:

-   Never manually modify production DB schema without migration.
-   Review destructive migrations.
-   Back up before major migrations.
-   Seed development/demo data separately.
-   Keep migrations committed.

------------------------------------------------------------------------

# 84. SEED DATA

Development seed should include:

-   Super Admin
-   Demo company
-   Company Admin
-   Sales Manager
-   Sales Executive
-   Support user
-   Sample leads
-   Customers
-   Deals
-   Pipeline
-   Tasks
-   Templates
-   Automations
-   Products
-   Sample invoices
-   Sample plans

Never use real customer information.

------------------------------------------------------------------------

# 85. FRONTEND DATA FLOW

Use TanStack Query for server state.

Use Zustand only for appropriate client/global UI state.

Avoid duplicating server state into Zustand unnecessarily.

API calls must go through a centralized service/client abstraction.

------------------------------------------------------------------------

# 86. FORM VALIDATION

Use:

``` text
React Hook Form
+
Zod
```

Validation should exist:

-   Frontend for UX
-   Backend for security/correctness

Never trust frontend validation alone.

------------------------------------------------------------------------

# 87. TABLE UX

Large CRM tables must support:

-   Pagination
-   Search
-   Filters
-   Sort
-   Column visibility
-   Bulk selection
-   Bulk action
-   Loading state
-   Empty state
-   Error state

Do not load thousands of records unnecessarily.

------------------------------------------------------------------------

# 88. ERROR / LOADING / EMPTY STATES

Every major screen must have:

``` text
Loading
Empty
Error
Success
```

Example:

``` text
No leads found.

Create your first lead or import leads from CSV.
```

Avoid blank screens.

------------------------------------------------------------------------

# 89. UX CONSISTENCY

Use shared patterns for:

-   Page headers
-   Breadcrumbs
-   Filters
-   Modals
-   Forms
-   Toasts
-   Confirmations
-   Tables
-   Detail panels
-   Timelines

Do not create a unique UI pattern for every module.

------------------------------------------------------------------------

# 90. AUTOMATION BUILDER UX

Builder should visually represent:

``` text
Trigger
 ↓
Condition
 ↓
Action
 ↓
Delay
 ↓
Condition
 ↓
Action
```

Users should be able to:

-   Add node
-   Edit node
-   Delete node
-   Reorder where supported
-   Test automation
-   Enable/disable
-   View execution history

Validate automation before activation.

------------------------------------------------------------------------

# 91. WHATSAPP INBOX UX

Layout:

``` text
Conversation List | Chat | Customer/Lead Details
```

Conversation list:

-   Search
-   Filters
-   Unread
-   Assigned
-   Tags

Chat:

-   Messages
-   Template selector
-   Media
-   Reply
-   Internal note

Details:

-   Lead/customer
-   Tasks
-   Tags
-   Pipeline
-   Recent activity

------------------------------------------------------------------------

# 92. LEAD DETAIL UX

Suggested tabs:

``` text
Overview
Activity
Conversations
Tasks
Notes
Deals
Quotations
Invoices
Documents
```

Show important fields prominently.

------------------------------------------------------------------------

# 93. BILLING UX

Company billing page:

-   Current plan
-   Usage
-   Renewal date
-   Payment method where supported
-   Invoices
-   Upgrade
-   Downgrade
-   Cancel
-   Add-ons

Super Admin billing:

-   Plans
-   Subscriptions
-   Payments
-   Revenue
-   Usage

------------------------------------------------------------------------

# 94. CUSTOMER SELF-SERVICE

Future:

-   Upgrade
-   Downgrade
-   Invoice history
-   Payment history
-   Billing details
-   Cancel
-   Users
-   Usage

------------------------------------------------------------------------

# 95. MOBILE ROADMAP

Do not block MVP on native mobile.

Phase 1:

Responsive web.

Phase 3:

Flutter or React Native.

Priority:

``` text
Dashboard
Leads
WhatsApp
Follow-ups
Tasks
Notifications
```

------------------------------------------------------------------------

# 96. DEVELOPMENT PHASES

## Phase 0 --- Validation

Estimated:

``` text
1–2 weeks
```

Activities:

-   Customer interviews
-   Industry validation
-   Requirement validation
-   Competitor research
-   Pricing validation
-   Wireframes

## Phase 1 --- Foundation

Estimated:

``` text
1–2 weeks
```

Build:

-   Repository
-   React/Vite
-   Express
-   PostgreSQL
-   Prisma
-   Auth
-   Multi-tenancy
-   RBAC
-   CI/CD
-   Docker

## Phase 2 --- CRM

Estimated:

``` text
2–3 weeks
```

Build:

-   Companies
-   Users
-   Leads
-   Customers
-   Pipeline
-   Tasks
-   Activities
-   Search
-   Filters
-   Import/export

## Phase 3 --- WhatsApp

Estimated:

``` text
1–2 weeks
```

## Phase 4 --- Automation

Estimated:

``` text
2–3 weeks
```

## Phase 5 --- AI

Estimated:

``` text
1–2 weeks
```

## Phase 6 --- Billing

Estimated:

``` text
1–2 weeks
```

## Phase 7 --- Reports

Estimated:

``` text
1 week
```

## Phase 8 --- Production

Estimated:

``` text
1–2 weeks
```

------------------------------------------------------------------------

# 97. MVP SCOPE

MVP must include:

-   Authentication
-   Multi-tenancy
-   RBAC
-   Company management
-   Leads
-   Customers
-   Pipeline
-   Tasks
-   Follow-ups
-   WhatsApp
-   Basic automation
-   Team management
-   Dashboard
-   Reports
-   Subscription

------------------------------------------------------------------------

# 98. DO NOT BUILD IN MVP

Do not initially build:

-   Native mobile app
-   Full white-label infrastructure
-   Complex autonomous AI agent
-   20+ third-party integrations
-   Microservices
-   Advanced accounting
-   Full ERP
-   Marketplace
-   Enterprise on-premise complexity

------------------------------------------------------------------------

# 99. V2

Potential:

-   AI lead qualification
-   AI reply assistant
-   Advanced automation
-   Quotations
-   Invoices
-   Payments
-   Meta Lead Ads
-   Google Lead integration
-   Calendar
-   Custom fields
-   Custom pipelines

------------------------------------------------------------------------

# 100. V3

Potential:

-   Mobile app
-   White label
-   Enterprise on-premise
-   Public API
-   Marketplace
-   Advanced analytics
-   Industry templates
-   Advanced AI agents
-   Dedicated enterprise infrastructure

------------------------------------------------------------------------

# 101. MVP ACCEPTANCE CRITERIA

A customer must be able to:

1.  Register.
2.  Verify email.
3.  Create company.
4.  Select industry.
5.  Select plan/trial.
6.  Invite employees.
7.  Assign roles.
8.  Create/import lead.
9.  Assign lead.
10. Search/filter lead.
11. Contact lead.
12. Receive WhatsApp conversation where configured.
13. Create follow-up.
14. Automate follow-up.
15. Move lead through pipeline.
16. Convert lead to customer.
17. Create deal.
18. Create quotation where enabled.
19. Create invoice where enabled.
20. Receive/record payment where enabled.
21. View reports.
22. View usage.
23. Manage subscription.

------------------------------------------------------------------------

# 102. AGENT WORKING PROTOCOL --- CRITICAL

Antigravity MUST follow this sequence.

## Step 1 --- Inspect

Before coding:

-   Inspect repository.
-   Inspect package.json.
-   Inspect existing folders.
-   Inspect database configuration.
-   Inspect environment files without exposing secrets.
-   Inspect existing routes.
-   Inspect existing components.
-   Inspect tests.
-   Inspect README/docs.

## Step 2 --- Plan

Create an implementation plan.

Do not immediately generate the entire application.

## Step 3 --- Confirm architecture

Use this specification as the architectural source of truth.

If existing code conflicts with the specification:

-   Identify conflict.
-   Explain it internally through implementation notes.
-   Prefer the least disruptive migration path.
-   Do not destroy working functionality without reason.

## Step 4 --- Implement one phase

Complete only the current phase.

## Step 5 --- Validate

Run:

``` bash
lint
typecheck
test
build
```

Fix failures before moving forward.

## Step 6 --- Document

Update:

-   README
-   API docs
-   Architecture docs
-   Migration notes
-   Environment variables
-   Feature documentation

## Step 7 --- Continue

Only then proceed to the next phase.

------------------------------------------------------------------------

# 103. AGENT RULES --- NEVER VIOLATE

### Never

-   Invent undocumented APIs.
-   Invent database relationships without checking schema.
-   Trust frontend `companyId`.
-   Trust frontend payment success.
-   Send unrestricted AI actions.
-   Put secrets in source code.
-   Put secrets in logs.
-   Skip permission checks.
-   Skip tenant checks.
-   Put long-running operations in HTTP request handlers.
-   Build microservices prematurely.
-   Replace PostgreSQL with another database without explicit approval.
-   Replace Redis/BullMQ without explicit approval.
-   Replace React/Vite/TypeScript without explicit approval.
-   Add a dependency merely for convenience.
-   Rewrite unrelated modules.
-   Delete tests to make builds pass.
-   Disable TypeScript strictness to hide errors.
-   Disable lint rules without justification.
-   Disable security checks to make development easier.

------------------------------------------------------------------------

# 104. AGENT DECISION RULES

When requirements are ambiguous:

1.  Prefer the current SRS.
2.  Prefer this Master Spec.
3.  Prefer existing repository conventions.
4.  Prefer secure behavior.
5.  Prefer tenant-safe behavior.
6.  Prefer backward-compatible behavior.
7.  Prefer simple modular architecture.
8.  Ask for clarification only when the ambiguity can materially change
    architecture, security, money, data loss or user-visible behavior.

Do not stop for trivial decisions.

------------------------------------------------------------------------

# 105. SECURITY CHECKLIST BEFORE FEATURE COMPLETION

For every protected feature verify:

``` text
[ ] Authentication
[ ] companyId derived server-side
[ ] Permission check
[ ] Resource ownership
[ ] Subscription entitlement if applicable
[ ] Usage limit
[ ] Input validation
[ ] Rate limiting where applicable
[ ] Audit log where appropriate
[ ] No secret exposure
[ ] Error handling
[ ] Tests
```

------------------------------------------------------------------------

# 106. PRODUCTION READINESS CHECKLIST

``` text
[ ] HTTPS
[ ] Secure environment variables
[ ] PostgreSQL backups
[ ] Redis configured
[ ] Worker process
[ ] Nginx
[ ] CI/CD
[ ] Error monitoring
[ ] Structured logs
[ ] Rate limiting
[ ] Webhook verification
[ ] Payment verification
[ ] WhatsApp verification
[ ] Tenant isolation tests
[ ] RBAC tests
[ ] Billing tests
[ ] Restore test
[ ] Swagger/OpenAPI
[ ] Health checks
[ ] Database migrations
[ ] Seed/demo environment
```

------------------------------------------------------------------------

# 107. FINAL SYSTEM MAP

``` text
SUPER ADMIN
    |
    +── SaaS Control
    +── Billing
    +── Plans
    +── Usage
    +── Companies
    +── Feature Flags
    |
COMPANY
    |
    +── Company Admin
    |      |
    |      +── Team
    |      +── Roles
    |      +── Integrations
    |      +── Billing
    |
    +── CRM
    |      |
    |      +── Leads
    |      +── Customers
    |      +── Contacts
    |      +── Pipeline
    |      +── Deals
    |      +── Tasks
    |      +── Activities
    |
    +── COMMUNICATION
    |      |
    |      +── WhatsApp
    |      +── Conversations
    |      +── Messages
    |      +── Templates
    |
    +── AUTOMATION
    |      |
    |      +── Triggers
    |      +── Conditions
    |      +── Actions
    |      +── Delays
    |      +── Runs
    |
    +── AI
    |      |
    |      +── Lead Qualification
    |      +── Summary
    |      +── Reply Assistant
    |      +── Knowledge Base
    |
    +── SALES
    |      |
    |      +── Quotations
    |      +── Invoices
    |      +── Payments
    |
    +── REPORTS
    |
    +── SUBSCRIPTION
           |
           +── Plan
           +── Usage
           +── Entitlements
```

------------------------------------------------------------------------

# 108. ORIGINAL SRS PRESERVATION RULE

The original 108-section SRS supplied for this product is the detailed
business/product source of truth.

**Nothing from that SRS should be deleted merely because this Master
Spec reorganizes or restates the requirements.**

When this Master Spec is maintained alongside the original SRS:

``` text
Original SRS
    ↓
Business Requirements
    ↓
Master Specification
    ↓
Architecture
    ↓
Database/API/UI Design
    ↓
Implementation
    ↓
Testing
    ↓
Production
```

If a later requirement changes:

1.  Update the SRS.
2.  Update this Master Spec.
3.  Update affected architecture/contracts.
4.  Update implementation.
5.  Update tests.
6.  Update documentation.

------------------------------------------------------------------------

# 109. ANTIGRAVITY FIRST COMMAND

When this repository is opened for the first time, start by doing the
following:

``` text
You are working on the AI SALES CRM & AUTOMATION SaaS.

Do not start coding immediately.

First:
1. Inspect the complete repository.
2. Read this ANTIGRAVITY_MASTER_SPEC.md.
3. Read the original SRS.
4. Inspect package.json files.
5. Inspect the existing database/schema.
6. Inspect frontend routes and components.
7. Inspect backend modules/routes/services.
8. Inspect environment configuration without exposing secrets.
9. Identify what already exists.
10. Identify missing modules.
11. Identify architectural conflicts.
12. Produce a phased implementation plan.
13. Do not rewrite existing working functionality unnecessarily.
14. Do not implement future phases before the current phase is complete.
15. Wait for the implementation phase to be selected if the project has not already specified one.

Architecture constraints:
React + Vite + TypeScript
Node.js + Express + TypeScript
PostgreSQL + Prisma
Redis + BullMQ
Docker + Nginx
Modular monolith
Multi-tenant architecture
RBAC
Subscription entitlement
WhatsApp integration
AI integration
Razorpay
Provider abstraction

Every tenant-owned database operation must be company-scoped.
Every protected operation must pass authentication, authorization and ownership checks.
Every expensive asynchronous operation should use a queue.
Every payment/webhook flow must be server verified.
Every significant state change should be auditable.

After every phase:
- run lint
- run typecheck
- run tests
- run build
- fix failures
- update docs
- report completed work and remaining work
```

------------------------------------------------------------------------

# 109A. COMMERCIAL ROADMAP (FUTURE)

These features are not required for MVP but are critical for the full commercial success of the CRM in the Indian market. They should be targeted for Phase 2/3:

## 1. Cloud Telephony (Click-to-Call)
- Integration with Exotel, Ozonetel, or Twilio.
- Auto-logging of call duration, recordings, and outcome to the Lead timeline.

## 2. Two-Way Email Sync
- IMAP/Google Workspace integration to sync customer email replies directly into the CRM conversation history.

## 3. Calendar Sync
- 2-way sync with Google Calendar / Outlook so CRM tasks and meetings appear on the rep's personal phone calendar.

## 4. DPDPA 2023 Privacy Compliance
- Consent tracking with timestamps.
- "Right to be forgotten" APIs to safely permanently delete lead/customer data on request.
- Data export functionality (JSON/CSV) for customer requests.

## 5. Sales Goals & Targets
- Activity-based goals for teams (e.g. 50 calls/day, 10 deals won/month).
- Gamification leaderboards to motivate the sales team.

## 6. Helpdesk & Support Ticketing
- Integrated ticketing system for post-sales support.
- SLAs, ticket assignment, and customer support portal.

## 7. Omnichannel Inbox
- Merge Facebook Messenger, Instagram DMs, and Website Live Chat into the same conversational inbox alongside WhatsApp and Email.

## 8. E-Signatures (Digital Sign)
- Integration with DocuSign or Indian E-Sign providers to allow customers to legally sign and accept Quotations/Proposals directly from their mobile phones.

## 9. Voice AI (Call Summarization)
- AI-powered transcription and summarization of Cloud Telephony sales calls.
- Auto-extracts action items and notes to save sales reps from manual data entry.

## 10. CPQ (Configure, Price, Quote)
- Advanced rule-based pricing engine for complex B2B quotations.
- Auto-calculate discounts, bundles, and margin thresholds.

## 11. Commission Management
- Automated calculation of sales rep payouts and commissions based on closed-won deals and custom company rules.

## 12. WhatsApp Drip Campaigns
- Multi-day automated sequence of WhatsApp messages (e.g., Day 1, Day 3, Day 7) for continuous lead nurturing.

## 13. Document Tracking & Analytics (Intelligent Document Processing)
- Track when a customer opens a Quotation/Proposal PDF and view page-by-page analytics (time spent on each page).

## 14. Territory Management
- Advanced routing rules to auto-assign leads based on geography, pin codes, or regions to specific sales managers.

## 15. Social Listening
- Auto-create leads or support tickets in the CRM by tracking brand mentions on LinkedIn, Twitter, and other social platforms.

------------------------------------------------------------------------

# 110. IMPLEMENTATION ORDER

Recommended exact order:

``` text
1. Repository + Monorepo
2. Shared Config
3. PostgreSQL
4. Prisma
5. Redis
6. Express foundation
7. Event Bus + Module Registry
8. React/Vite foundation
9. Test infrastructure (Vitest/Jest setup, first smoke tests)
10. CI/CD (lint + typecheck + test on every push)
11. Authentication
12. Company / Tenant model
13. RBAC
14. User/Team management
15. Dashboard shell
16. Leads
17. Customers
18. Activities
19. Tasks
20. Pipeline
21. Deals
22. Search/filter/import/export
23. WhatsApp integration
24. Conversation inbox
25. Templates
26. Automation engine
27. BullMQ workers
28. Outgoing Webhooks
29. AI assistant
30. Quotations
31. Invoices
32. Razorpay
33. Subscription/Plans
34. Usage/Entitlements
35. Reports
36. Notifications
37. Audit logs
38. Files
39. Industry configuration
40. Security hardening
41. Monitoring
42. Production deployment
43. UAT
44. Launch
```

Tests must be written alongside each feature, not deferred to the end.

------------------------------------------------------------------------

# 111. DEFINITION OF DONE

A feature is NOT complete merely because the UI exists.

A feature is complete only when:

``` text
UI
+
API
+
Validation
+
Database
+
Permissions
+
Tenant isolation
+
Error handling
+
Loading/empty states
+
Tests
+
Documentation
+
Logging/observability where applicable
```

For billing/integrations additionally:

``` text
Webhook
+
Idempotency
+
Security verification
+
Audit trail
```

For AI:

``` text
Usage metering
+
Permission checks
+
Company scope
+
Tool restrictions
+
Failure handling
```

------------------------------------------------------------------------

# 112. FINAL PRODUCT REQUIREMENT

The finished product must feel like a real commercial SaaS platform, not
a demo CRUD project.

It must provide:

-   Strong tenant isolation
-   Professional CRM UX
-   Reliable WhatsApp communication
-   Useful automation
-   Controlled AI assistance
-   Subscription and usage management
-   Secure billing
-   Auditability
-   Production monitoring
-   Scalable architecture
-   Configurable industries
-   Maintainable code
-   Clear API contracts
-   Strong testing
-   Reliable deployment

The architecture should allow the platform to start with a small number
of companies and scale toward a large multi-tenant SaaS without
requiring a complete rewrite.

------------------------------------------------------------------------

# 113. SOURCE-OF-TRUTH HIERARCHY

When resolving requirements, use:

``` text
1. Explicit latest business requirement
2. Original detailed SRS
3. ANTIGRAVITY_MASTER_SPEC.md
4. Existing approved architecture decisions
5. Existing repository conventions
6. Secure engineering best practices
```

If two requirements genuinely conflict on architecture, stop and
identify the conflict rather than silently implementing both
incompatible designs.

------------------------------------------------------------------------

# 114. CHANGE MANAGEMENT

Every significant architecture change should update:

``` text
docs/
├── architecture.md
├── database.md
├── api.md
├── security.md
├── integrations.md
├── automation.md
└── changelog.md
```

For a breaking API change:

-   Increment API version where appropriate.
-   Document migration.
-   Update frontend clients.
-   Update tests.
-   Preserve compatibility when practical.

------------------------------------------------------------------------

# 115. FINAL ANTIGRAVITY INSTRUCTION

**Build this product as a production-grade multi-tenant SaaS platform.**

Do not treat this specification as a prompt for generating a giant
amount of code in one response.

Treat it as the permanent engineering contract.

Work incrementally.

Inspect first.

Plan second.

Implement third.

Validate fourth.

Document fifth.

Then continue.

The goal is not merely to make screens appear.

The goal is to create a secure, maintainable, scalable commercial
product that real businesses can subscribe to and use every day.
