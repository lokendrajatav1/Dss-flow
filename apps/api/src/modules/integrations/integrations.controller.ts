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
