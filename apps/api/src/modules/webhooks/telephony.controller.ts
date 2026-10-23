import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Normalizes duration in seconds or "mm:ss" format into a clean "mm:ss" string.
 */
function formatDuration(rawDuration: any): string {
  if (!rawDuration) return '00:00';
  if (typeof rawDuration === 'string' && rawDuration.includes(':')) {
    return rawDuration;
  }
  const totalSecs = parseInt(String(rawDuration), 10);
  if (isNaN(totalSecs) || totalSecs <= 0) return '00:00';
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Universal Telephony Webhook Handler
 * Supports: Tata Tele Smartflo, MyOperator, Zadarma, Exotel, Asterisk / FreePBX, and Generic CDR APIs
 * Endpoint: POST /api/v1/webhooks/telephony/:companyId
 */
export const handleTelephonyWebhook = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID is required in URL parameter' });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true }
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const data = req.method === 'GET' ? req.query : req.body;

    // 1. Extract Customer Phone (Supports Tata, MyOperator, Zadarma, Exotel, Generic field names)
    const rawCustomerPhone =
      data.customer ||
      data.customer_number ||
      data.client_number ||
      data.destination ||
      data.to ||
      data.phone ||
      data.mobile ||
      data.caller_id ||
      data.number ||
      '';

    const customerDigits = String(rawCustomerPhone).replace(/\D/g, '');
    const clean10Digits = customerDigits.slice(-10);

    // 2. Extract Agent / Extension / Caller Number
    const rawAgentNumber =
      data.agent ||
      data.agent_number ||
      data.extension ||
      data.agent_id ||
      data.source ||
      data.from ||
      data.caller ||
      '';

    // 3. Extract Recording URL
    const recordingUrl =
      data.recording_url ||
      data.recording ||
      data.record_url ||
      data.audio_url ||
      data.audio ||
      data.recording_file ||
      data.file_url ||
      data.call_recording ||
      null;

    // 4. Extract Duration & Status
    const rawDuration = data.duration || data.call_duration || data.talk_time || data.billsec || data.duration_seconds || 0;
    const formattedDuration = formatDuration(rawDuration);

    const rawStatus = (data.status || data.disposition || data.call_status || data.state || 'Completed').toString();
    const direction = (data.direction || data.call_type || 'Outbound').toString();
    const providerName = (data.provider || data.telephony_provider || 'Cloud VoIP').toString();
    const callId = (data.call_id || data.uniqueid || data.session_id || data.id || '').toString();

    // Map provider status to standard CRM status
    let callStatus = 'Connected / Answered';
    let outcome = 'Follow-up Needed';

    const upperStatus = rawStatus.toUpperCase();
    if (upperStatus.includes('NOANSWER') || upperStatus.includes('NO ANSWER') || upperStatus.includes('RINGING')) {
      callStatus = 'No Answer / Ringing';
      outcome = 'Callback Requested';
    } else if (upperStatus.includes('BUSY') || upperStatus.includes('ENGAGED')) {
      callStatus = 'Busy / Engaged';
      outcome = 'Callback Requested';
    } else if (upperStatus.includes('DROP') || upperStatus.includes('CANCEL')) {
      callStatus = 'Call Dropped';
    } else if (upperStatus.includes('ANSWER') || upperStatus.includes('SUCCESS') || upperStatus.includes('CONNECTED')) {
      callStatus = 'Connected / Answered';
      outcome = 'Call Completed';
    }

    // 5. Match or Auto-create Lead in CRM
    let lead: any = null;

    if (clean10Digits) {
      lead = await prisma.lead.findFirst({
        where: {
          companyId,
          phone: { contains: clean10Digits }
        }
      });
    }

    // If no lead found, auto-create one so the call recording is never lost
    if (!lead && clean10Digits) {
      const fullPhoneNumber = customerDigits.length === 10
        ? `+91${customerDigits}`
        : (customerDigits.length === 12 && customerDigits.startsWith('91'))
          ? `+${customerDigits}`
          : `+${customerDigits}`;
      lead = await prisma.lead.create({
        data: {
          companyId,
          name: `Call: ${fullPhoneNumber}`,
          phone: fullPhoneNumber,
          source: `${providerName} Telephony`,
          leadType: direction.toLowerCase().includes('in') ? 'Inbound' : 'Outbound',
          status: 'New',
          callStatus: callStatus,
          notes: `Auto-created from ${providerName} incoming/outgoing call webhook.`
        }
      });
      console.log(`[Telephony Webhook] Created new lead ${lead.id} for phone ${fullPhoneNumber}`);
    }

    // 6. Match Agent User if extension is configured
    let agentUser: any = null;
    if (rawAgentNumber) {
      const agentStr = String(rawAgentNumber).trim();
      const cleanAgentDigits = agentStr.replace(/\D/g, '');

      // Prioritize exact phone number match, then name/email matching
      agentUser = await prisma.user.findFirst({
        where: {
          AND: [
            { companyId },
            {
              OR: [
                // Exact phone match (most reliable)
                { phone: { equals: agentStr } },
                { phone: { endsWith: cleanAgentDigits } },
                // Name matching as fallback
                { name: { contains: agentStr } },
                { email: { startsWith: agentStr } }
              ]
            }
          ]
        },
        select: { id: true, name: true, phone: true }
      });
    }

    // 7. Create Activity with Recording
    const activity = await prisma.activity.create({
      data: {
        companyId,
        leadId: lead ? lead.id : null,
        performedById: agentUser ? agentUser.id : null,
        type: 'CALL',
        title: outcome || callStatus,
        description: `Automated call recording synced from ${providerName} (${direction}). Status: ${callStatus}, Duration: ${formattedDuration}.`,
        metadata: {
          phone: lead ? lead.phone : (customerDigits ? `+${customerDigits}` : rawCustomerPhone),
          dialedVia: providerName,
          duration: formattedDuration,
          durationSeconds: parseInt(String(rawDuration), 10) || 0,
          status: callStatus,
          outcome: outcome,
          recordingUrl: recordingUrl ? String(recordingUrl).trim() : null,
          agentNumber: rawAgentNumber || 'Agent Extension',
          direction: direction,
          callId: callId,
          rawWebhook: data,
          activityDate: new Date().toISOString()
        }
      }
    });

    // Update lead's last call status
    if (lead?.id) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          callStatus: callStatus,
          updatedAt: new Date()
        }
      });
    }

    console.log(`[Telephony Webhook] Activity created: ${activity.id} for lead ${lead?.id || 'none'}. Recording: ${recordingUrl || 'none'}`);

    return res.status(200).json({
      success: true,
      message: 'Telephony call recording synced successfully',
      activityId: activity.id,
      leadId: lead ? lead.id : null,
      recordingUrl: recordingUrl
    });

  } catch (error: any) {
    console.error('[Telephony Webhook] Error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error processing telephony webhook'
    });
  }
};
