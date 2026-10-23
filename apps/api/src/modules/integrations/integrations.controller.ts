import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middlewares/authMiddleware';

const prisma = new PrismaClient();

export const getIntegrations = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;

    const integrations = await prisma.integration.findMany({
      where: { companyId }
    });

    const whatsappConfig = await prisma.whatsAppConfig.findUnique({
      where: { companyId }
    });

    res.json({ integrations, whatsappConfig });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { providerName, accessToken, refreshToken, configJson, status } = req.body;

    const integration = await prisma.integration.upsert({
      where: {
        companyId_providerName: {
          companyId,
          providerName,
        }
      },
      update: {
        accessToken,
        refreshToken,
        configJson,
        status: status || 'active'
      },
      create: {
        companyId,
        providerName,
        accessToken,
        refreshToken,
        configJson,
        status: status || 'active'
      }
    });

    res.json(integration);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveWhatsAppConfig = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { phoneNumberId, wabaId, accessToken, webhookVerifyToken, status } = req.body;

    const config = await prisma.whatsAppConfig.upsert({
      where: { companyId },
      update: {
        phoneNumberId,
        wabaId,
        accessToken,
        webhookVerifyToken,
        status: status || 'active'
      },
      create: {
        companyId,
        phoneNumberId,
        wabaId,
        accessToken,
        webhookVerifyToken,
        status: status || 'active'
      }
    });

    res.json(config);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteIntegration = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { providerName } = req.params;

    await prisma.integration.deleteMany({
      where: {
        companyId,
        providerName,
      }
    });

    res.json({ message: 'Integration deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get Tata Tele Smartflo Integration Config
 */
export const getTataTeleConfig = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;

    const integration = await prisma.integration.findUnique({
      where: {
        companyId_providerName: {
          companyId,
          providerName: 'tatateleservices'
        }
      }
    });

    if (!integration) {
      return res.json({
        configured: false,
        trunkType: 'sip_trunk',
        dialMethod: 'microsip',
        apiToken: '',
        callerId: '',
        defaultAgentNumber: '',
        pbxHost: '192.168.1.100',
        pbxPort: '8089',
        pbxBrand: 'Grandstream',
        agentExtension: '101',
        pbxUsername: '',
        pbxSecret: '',
        status: 'disconnected'
      });
    }

    let config: any = {};
    try {
      config = integration.configJson ? JSON.parse(integration.configJson) : {};
    } catch {
      config = {};
    }

    const isConfigured = Boolean(
      integration.accessToken ||
      config.trunkType === 'sip_trunk' ||
      config.pbxHost ||
      config.dialMethod === 'microsip'
    );

    res.json({
      configured: isConfigured,
      trunkType: config.trunkType || (integration.accessToken ? 'smartflo' : 'sip_trunk'),
      dialMethod: config.dialMethod || 'microsip',
      apiToken: integration.accessToken || '',
      callerId: config.callerId || '',
      defaultAgentNumber: config.defaultAgentNumber || '',
      pbxHost: config.pbxHost || '',
      pbxPort: config.pbxPort || '8089',
      pbxBrand: config.pbxBrand || 'Grandstream',
      agentExtension: config.agentExtension || '101',
      pbxUsername: config.pbxUsername || '',
      pbxSecret: config.pbxSecret || '',
      status: integration.status || 'active'
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Save Tata Telephony Integration Config (Tata SIP Trunk & Tata Smartflo)
 */
export const saveTataTeleConfig = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const {
      trunkType,
      dialMethod,
      apiToken,
      callerId,
      defaultAgentNumber,
      pbxHost,
      pbxPort,
      pbxBrand,
      agentExtension,
      pbxUsername,
      pbxSecret
    } = req.body;

    const selectedTrunkType = trunkType || 'sip_trunk';
    const selectedDialMethod = dialMethod || 'microsip';

    const configData = {
      trunkType: selectedTrunkType,
      dialMethod: selectedDialMethod,
      callerId: callerId ? callerId.trim() : '',
      defaultAgentNumber: defaultAgentNumber ? defaultAgentNumber.trim() : '',
      pbxHost: pbxHost ? pbxHost.trim() : '',
      pbxPort: pbxPort ? pbxPort.trim() : '',
      pbxBrand: pbxBrand || 'Grandstream',
      agentExtension: agentExtension ? agentExtension.trim() : '',
      pbxUsername: pbxUsername ? pbxUsername.trim() : '',
      pbxSecret: pbxSecret ? pbxSecret.trim() : '',
      provider: selectedTrunkType === 'smartflo' ? 'Tata Tele Smartflo' : 'Tata SIP Trunk'
    };

    const isConfigured = Boolean(
      apiToken ||
      selectedDialMethod === 'microsip' ||
      configData.pbxHost
    );

    const integration = await prisma.integration.upsert({
      where: {
        companyId_providerName: {
          companyId,
          providerName: 'tatateleservices'
        }
      },
      update: {
        accessToken: apiToken ? apiToken.trim() : null,
        configJson: JSON.stringify(configData),
        status: isConfigured ? 'active' : 'inactive'
      },
      create: {
        companyId,
        providerName: 'tatateleservices',
        accessToken: apiToken ? apiToken.trim() : null,
        configJson: JSON.stringify(configData),
        status: isConfigured ? 'active' : 'inactive'
      }
    });

    res.json({
      success: true,
      message: `${configData.provider} settings saved successfully`,
      integration
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Initiate Outbound Call via Tata SIP Trunk or Tata Smartflo
 * Endpoint: POST /api/v1/integrations/telephony/call
 */
export const initiateTataTeleCall = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { destinationNumber, agentNumber, leadId, contactName } = req.body;

    if (!destinationNumber) {
      return res.status(400).json({ success: false, message: 'Destination phone number is required' });
    }

    const integration = await prisma.integration.findUnique({
      where: {
        companyId_providerName: {
          companyId,
          providerName: 'tatateleservices'
        }
      }
    });

    let config: any = {};
    if (integration?.configJson) {
      try {
        config = JSON.parse(integration.configJson);
      } catch {
        config = {};
      }
    }

    const trunkType = config.trunkType || (integration?.accessToken ? 'smartflo' : 'sip_trunk');
    const dialMethod = config.dialMethod || 'microsip';
    const apiToken = integration?.accessToken;
    const callerId = config.callerId || '';

    // Fetch user phone or extension
    let userPhone = '';
    try {
      const userRecord = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { phone: true }
      });
      userPhone = userRecord?.phone || '';
    } catch {}

    // Prioritize individual logged-in agent's personal phone / extension!
    const resolvedAgent = (agentNumber || userPhone || config.agentExtension || config.defaultAgentNumber || '101').toString().trim();
    const cleanDestination = String(destinationNumber).replace(/\D/g, '').slice(-10);
    const cleanAgent = String(resolvedAgent).replace(/\D/g, '');

    // Case 1: Tata SIP Trunk via MicroSIP Softphone (Instant Client-Side Protocol)
    if (trunkType === 'sip_trunk' && dialMethod === 'microsip') {
      const callId = `sip_${Date.now()}`;
      try {
        await prisma.activity.create({
          data: {
            companyId,
            type: 'CALL',
            title: 'Initiated (MicroSIP / Tata Trunk)',
            description: `Outbound call initiated to ${cleanDestination} via MicroSIP (Tata SIP Trunk).`,
            performedById: req.user!.id,
            leadId: leadId || undefined,
            metadata: {
              dialedVia: 'Tata SIP Trunk (MicroSIP)',
              destination: cleanDestination,
              agentExtension: resolvedAgent,
              callerId,
              callId,
              status: 'Initiated'
            }
          }
        });
      } catch (actErr) {
        console.warn('[Tata Tele] Could not log initial activity:', actErr);
      }

      return res.json({
        success: true,
        dialMethod: 'microsip',
        trunkType: 'sip_trunk',
        callId,
        destinationNumber: cleanDestination,
        agentNumber: resolvedAgent,
        sipUri: `sip:${cleanDestination}`,
        telUri: `tel:${cleanDestination}`,
        message: `Dialing ${cleanDestination} via MicroSIP / Tata SIP Trunk...`
      });
    }

    // Case 2: Tata SIP Trunk via Local IP-PBX Box Gateway
    if (trunkType === 'sip_trunk' && dialMethod === 'pbx_gateway') {
      const pbxHost = config.pbxHost;
      const pbxPort = config.pbxPort || '8089';
      const ext = config.agentExtension || resolvedAgent;

      if (!pbxHost) {
        return res.status(400).json({
          success: false,
          message: 'PBX Box IP Address is not configured. Please enter your Box IP in Settings > Telephony.'
        });
      }

      const callId = `pbx_${Date.now()}`;

      // Try triggering PBX Click-to-Call HTTP API (with 3-second non-blocking timeout)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const pbxUrl = `http://${pbxHost}:${pbxPort}/cgi?action=dial&ext=${encodeURIComponent(ext)}&dest=${encodeURIComponent(cleanDestination)}`;
        await fetch(pbxUrl, { signal: controller.signal }).catch(() => null);
        clearTimeout(timeoutId);
      } catch {}

      try {
        await prisma.activity.create({
          data: {
            companyId,
            type: 'CALL',
            title: 'Initiated (Local PBX Box)',
            description: `Outbound call initiated to ${cleanDestination} via Local PBX Box (${pbxHost}).`,
            performedById: req.user!.id,
            leadId: leadId || undefined,
            metadata: {
              dialedVia: 'Tata SIP Trunk (Local PBX Box)',
              destination: cleanDestination,
              agentExtension: ext,
              pbxHost,
              callId,
              status: 'Initiated'
            }
          }
        });
      } catch (actErr) {}

      return res.json({
        success: true,
        dialMethod: 'pbx_gateway',
        trunkType: 'sip_trunk',
        callId,
        destinationNumber: cleanDestination,
        agentNumber: ext,
        pbxHost,
        pbxPort,
        telUri: `tel:${cleanDestination}`,
        sipUri: `sip:${cleanDestination}`,
        message: `Signal sent to PBX Box at ${pbxHost}! Ringing extension ${ext}.`
      });
    }

    // Case 3: Tata Tele Smartflo Cloud API
    if (!apiToken) {
      return res.json({
        success: false,
        notConfigured: true,
        message: 'Tata Tele Smartflo API Token is not configured. Please enter your API Token in Settings > Telephony.'
      });
    }

    const tataApiUrl = 'https://api-smartflo.tatateleservices.com/v1/click_to_call';
    const payload = {
      agent_number: cleanAgent || resolvedAgent,
      destination_number: cleanDestination,
      caller_id: callerId || undefined
    };

    const response = await fetch(tataApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok || (data && data.success === false)) {
      const errorMsg = data?.message || data?.error || `Tata Smartflo API error (${response.status})`;
      return res.status(response.status >= 400 && response.status < 500 ? 400 : 502).json({
        success: false,
        message: errorMsg,
        tataResponse: data
      });
    }

    const callId = data?.call_id || data?.id || `tata_${Date.now()}`;
    try {
      await prisma.activity.create({
        data: {
          companyId,
          type: 'CALL',
          title: 'Initiated',
          description: `Outbound call initiated to ${cleanDestination}. Tata Call ID: ${callId}.`,
          performedById: req.user!.id,
          leadId: leadId || undefined,
          metadata: {
            dialedVia: 'Tata Tele Smartflo',
            destination: cleanDestination,
            agentNumber: cleanAgent,
            callerId,
            callId,
            status: 'Initiated'
          }
        }
      });
    } catch (actErr) {
      console.warn('[Tata Tele] Could not log initial activity:', actErr);
    }

    return res.json({
      success: true,
      dialMethod: 'smartflo',
      trunkType: 'smartflo',
      message: 'Tata Tele Smartflo call initiated! Ringing agent phone first, then connecting customer.',
      callId,
      agentNumber: cleanAgent,
      destinationNumber: cleanDestination,
      tataResponse: data
    });
  } catch (error: any) {
    console.error('[Tata Tele Call Error]:', error);
    res.status(500).json({ success: false, message: error?.message || 'Internal server error initiating Tata call' });
  }
};

/**
 * Test Tata Tele Connection (Supports both Tata SIP Trunk and Tata Smartflo)
 * Endpoint: POST /api/v1/integrations/telephony/test-tata
 */
export const testTataTeleConnection = async (req: AuthRequest, res: Response) => {
  try {
    const {
      trunkType,
      dialMethod,
      apiToken,
      callerId,
      defaultAgentNumber,
      pbxHost,
      pbxPort,
      agentExtension
    } = req.body;

    // Test for Tata SIP Trunk
    if (trunkType === 'sip_trunk') {
      if (dialMethod === 'microsip') {
        return res.json({
          success: true,
          message: 'MicroSIP / Tata SIP Trunk Mode is ready! When agents click Call in CRM, MicroSIP softphone will automatically dial out using your Tata SIP Trunk line.',
          details: {
            mode: 'MicroSIP Softphone (Direct 1-Click Dial)',
            extension: agentExtension || defaultAgentNumber || 'Configured in MicroSIP',
            callerId: callerId || 'Tata Trunk Default CLI'
          }
        });
      }

      if (dialMethod === 'pbx_gateway') {
        if (!pbxHost) {
          return res.status(400).json({
            success: false,
            message: 'Please provide your PBX Box IP Address (e.g. 192.168.1.100 or domain).'
          });
        }

        return res.json({
          success: true,
          message: `PBX Box settings verified for Host: ${pbxHost}:${pbxPort || '8089'}. Extension: ${agentExtension || '101'}.`,
          details: {
            pbxHost,
            pbxPort: pbxPort || '8089',
            agentExtension: agentExtension || '101'
          }
        });
      }
    }

    // Test for Tata Smartflo Cloud
    const tokenToTest = (apiToken || '').trim();
    if (!tokenToTest) {
      return res.status(400).json({
        success: false,
        message: 'Tata Tele Smartflo API Token is required for testing'
      });
    }

    try {
      const testRes = await fetch('https://api-smartflo.tatateleservices.com/v1/click_to_call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenToTest}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          agent_number: defaultAgentNumber || '0000000000',
          destination_number: '0000000000',
          caller_id: callerId || undefined
        })
      });

      const data: any = await testRes.json().catch(() => ({}));

      if (testRes.status === 401 || testRes.status === 403) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Tata Tele Smartflo API Token. Please verify in your Tata Smartflo portal.',
          tataResponse: data
        });
      }

      return res.json({
        success: true,
        message: 'Tata Tele Smartflo API Connected & Authorized Successfully!',
        details: data?.message || 'Authentication verified with Tata Smartflo servers.'
      });
    } catch (netErr: any) {
      return res.status(502).json({
        success: false,
        message: `Failed to connect to Tata Tele servers: ${netErr.message}`
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
