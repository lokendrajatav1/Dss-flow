-- Create tables for email and calendar sync
CREATE TABLE "EmailAccount" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncInterval" INTEGER NOT NULL DEFAULT 300,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "emailAccountId" TEXT NOT NULL,
    "messageId" TEXT,
    "subject" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "fromName" TEXT,
    "to" TEXT[] NOT NULL,
    "cc" TEXT[] NOT NULL,
    "bcc" TEXT[] NOT NULL,
    "body" TEXT,
    "snippet" TEXT,
    "direction" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "folder" TEXT NOT NULL DEFAULT 'inbox',
    "receivedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "attachments" TEXT,
    "leadId" TEXT,
    "customerId" TEXT,
    "dealId" TEXT,
    "activityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "CalendarSync" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "calendarId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncEvents" BOOLEAN NOT NULL DEFAULT true,
    "syncTasks" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "calendarSyncId" TEXT NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "attendees" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE;
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount" ("id") ON DELETE CASCADE;
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE;
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE;
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE CASCADE;
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE CASCADE;

ALTER TABLE "CalendarSync" ADD CONSTRAINT "CalendarSync_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE;

ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE;
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_calendarSyncId_fkey" FOREIGN KEY ("calendarSyncId") REFERENCES "CalendarSync" ("id") ON DELETE CASCADE;

-- Add indexes
CREATE INDEX "EmailMessage_companyId_emailAccountId_idx" ON "EmailMessage" ("companyId", "emailAccountId");
CREATE INDEX "EmailMessage_companyId_direction_idx" ON "EmailMessage" ("companyId", "direction");
CREATE INDEX "EmailMessage_companyId_receivedAt_idx" ON "EmailMessage" ("companyId", "receivedAt");
CREATE INDEX "EmailMessage_messageId_idx" ON "EmailMessage" ("messageId");

CREATE INDEX "CalendarSync_companyId_provider_idx" ON "CalendarSync" ("companyId", "provider");

CREATE INDEX "CalendarEvent_companyId_calendarSyncId_idx" ON "CalendarEvent" ("companyId", "calendarSyncId");
CREATE INDEX "CalendarEvent_eventId_idx" ON "CalendarEvent" ("eventId");

-- Add reverse relations to Company
ALTER TABLE "Company" ADD COLUMN "emailAccounts" TEXT[];
ALTER TABLE "Company" ADD COLUMN "emailMessages" TEXT[];
ALTER TABLE "Company" ADD COLUMN "calendarSyncs" TEXT[];
ALTER TABLE "Company" ADD COLUMN "calendarEvents" TEXT[];

-- Add reverse relations to Customer
ALTER TABLE "Customer" ADD COLUMN "emails" TEXT[];

-- Add reverse relations to Deal
ALTER TABLE "Deal" ADD COLUMN "emails" TEXT[];
ALTER TABLE "Deal" ADD COLUMN "events" TEXT[];

-- Add reverse relations to Task
ALTER TABLE "Task" ADD COLUMN "events" TEXT[];

-- Remove events from Lead and Customer (since CalendarEvent doesn't directly link to them)
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "events";
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "events";