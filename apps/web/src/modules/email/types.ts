export interface EmailAccount {
    id: string;
    companyId: string;
    provider: string;
    email: string;
    status: string;
    syncEnabled: boolean;
    lastSyncAt: string | null;
    createdAt: string;
}

export interface EmailMessage {
    id: string;
    companyId: string;
    emailAccountId: string;
    messageId: string | null;
    subject: string;
    from: string;
    fromName: string | null;
    to: string[];
    cc: string[];
    bcc: string[];
    body: string | null;
    snippet: string | null;
    direction: string;
    read: boolean;
    starred: boolean;
    folder: string;
    receivedAt: string | null;
    sentAt: string | null;
    attachments: any;
    leadId: string | null;
    customerId: string | null;
    dealId: string | null;
    createdAt: string;
    updatedAt: string;
    emailAccount?: EmailAccount;
    lead?: any;
    customer?: any;
    deal?: any;
}
