import { prisma } from '../../lib/db';

export class AIService {
  /**
   * Get overall AI Analytics, Lead Tiers, and Conversion Predictors
   */
  static async getOverview(companyId: string) {
    const leads = await prisma.lead.findMany({
      where: { companyId },
      include: {
        assignedTo: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalLeads = leads.length;
    const scoredLeadsList = leads.filter(l => l.leadScore !== null && l.leadScore !== undefined);
    const scoredCount = scoredLeadsList.length;

    let totalScoreSum = 0;
    let hotCount = 0;
    let warmCount = 0;
    let coldCount = 0;
    let qualifiedCount = 0;
    let hotPipelineValue = 0;

    for (const lead of leads) {
      if (lead.isQualified) qualifiedCount++;

      const score = lead.leadScore || 0;
      if (lead.leadScore !== null) {
        totalScoreSum += score;
      }

      if (score >= 75) {
        hotCount++;
        hotPipelineValue += lead.estimatedValue || 0;
      } else if (score >= 45) {
        warmCount++;
      } else {
        coldCount++;
      }
    }

    const avgScore = scoredCount > 0 ? Math.round(totalScoreSum / scoredCount) : 0;
    const topLeads = [...leads]
      .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
      .slice(0, 6)
      .map(lead => ({
        id: lead.id,
        name: lead.name,
        companyName: lead.companyName || 'Independent',
        phone: lead.phone,
        email: lead.email,
        score: lead.leadScore || 0,
        tier: (lead.leadScore || 0) >= 75 ? 'Hot' : (lead.leadScore || 0) >= 45 ? 'Warm' : 'Cold',
        status: lead.status,
        estimatedValue: lead.estimatedValue || 0,
        isQualified: lead.isQualified || false,
        assignedTo: lead.assignedTo?.name || 'Unassigned',
        nextBestAction: (lead.leadScore || 0) >= 75
          ? 'Urgent: Schedule Demo Call & Send Pricing Deck'
          : (lead.leadScore || 0) >= 45
          ? 'Follow up on WhatsApp with Case Study'
          : 'Send automated email nurture drip'
      }));

    return {
      totalLeads,
      scoredCount,
      unscoredCount: totalLeads - scoredCount,
      avgScore,
      tierDistribution: {
        hot: hotCount,
        warm: warmCount,
        cold: coldCount
      },
      qualifiedCount,
      hotPipelineValue,
      hoursSavedEstimate: Math.round(scoredCount * 0.45 * 10) / 10,
      predictedWinRate: hotCount > 0 ? 82 : 45,
      topLeads
    };
  }

  /**
   * Directly call live Google Gemini API or OpenAI API if key is configured in .env
   */
  static async generateWithLiveLLM(prompt: string, systemPrompt?: string): Promise<string | null> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined
            })
          }
        );
        const data: any = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local template:', err);
      }
    }

    if (openAiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ]
          })
        });
        const data: any = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text) return text.trim();
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to local template:', err);
      }
    }

    return null;
  }

  /**
   * AI Sales Copilot Generator (WhatsApp Pitch, Email Pitch, Objection Handling, Lead Summary)
   */
  static async generateCopilot(companyId: string, payload: {
    type: 'whatsapp_pitch' | 'email_pitch' | 'objection_handler' | 'lead_summary';
    leadId?: string;
    customContext?: string;
    tone?: string;
    objectionType?: string;
  }) {
    let lead: any = null;
    if (payload.leadId) {
      lead = await prisma.lead.findFirst({
        where: { id: payload.leadId, companyId },
        include: { assignedTo: { select: { name: true } } }
      });
    }

    const tone = payload.tone || 'Friendly & Professional';
    const contactName = lead?.name || 'Valued Customer';
    const company = lead?.companyName || 'your esteemed organization';
    const valueStr = lead?.estimatedValue ? `₹${lead.estimatedValue.toLocaleString('en-IN')}` : 'our customized solution';

    // 1. Try Live LLM model first if API key is in .env
    const livePrompt = `Create a high-converting ${payload.type.replace('_', ' ')} for customer ${contactName} (${company}). Deal value: ${valueStr}. Tone: ${tone}. Objection (if applicable): ${payload.objectionType || 'None'}. Output only the clean ready-to-send message text.`;
    const liveResult = await this.generateWithLiveLLM(
      livePrompt, 
      `You are an elite enterprise B2B sales assistant. Write crisp, personalized messages ready for WhatsApp/Email.`
    );

    if (liveResult) {
      return {
        type: payload.type,
        leadId: payload.leadId,
        leadName: contactName,
        title: `Live AI Generated Message for ${contactName}`,
        content: liveResult,
        recommendations: [
          'Generated in real-time by Live AI Model',
          'Review details before sending to client',
          'Includes personalized lead context'
        ],
        timestamp: new Date().toISOString()
      };
    }

    let title = '';
    let content = '';
    let recommendations: string[] = [];

    switch (payload.type) {
      case 'whatsapp_pitch':
        title = `Tailored WhatsApp Message for ${contactName}`;
        if (tone === 'Urgent Sales Closer') {
          content = `Namaste ${contactName} ji! 👋\n\nI noticed high interest in our CRM solutions for ${company}. We have an exclusive onboarding offer valid till this Friday that saves your team 25% on annual setup.\n\nCould we jump on a quick 7-minute call today at 4:30 PM to show you the live ROI? Let me know! 🚀`;
        } else if (tone === 'Warm & Consultative') {
          content = `Hi ${contactName}, hope you're having a productive week! 😊\n\nI was reviewing the workflow requirements for ${company}. Many teams in your industry struggle with lead leakages and slow WhatsApp follow-ups.\n\nI've prepared a 2-minute video walkthrough tailored for ${company}. Would you like me to share the link here?`;
        } else {
          content = `Hello ${contactName}! 👋\n\nThank you for reaching out regarding our CRM Automation platform. We help teams automate WhatsApp follow-ups, lead scoring, and pipeline tracking seamlessly.\n\nWhen would be a good time for a brief 10-minute demo to see how it can boost conversions for ${company}?`;
        }
        recommendations = [
          'Best sent between 10:30 AM - 1:00 PM for maximum reply rate',
          'Mention previous interaction or pain point',
          'Include 1 clear Call to Action link'
        ];
        break;

      case 'email_pitch':
        title = `Personalized Pitch Email for ${contactName} (${company})`;
        content = `Subject: Quick question regarding sales automation at ${company}\n\nHi ${contactName},\n\nI came across your profile and noticed the great work ${company} is doing. In today's fast-paced sales cycle, responding to incoming leads within 5 minutes increases conversion rates by over 300%.\n\nOur platform integrates WhatsApp Cloud API, predictive AI lead scoring, and automated pipeline triggers in one unified dashboard.\n\nGiven your focus, would you be open to a 10-minute discovery chat this Thursday at 3 PM to explore if this is a strategic fit for ${company}?\n\nBest regards,\nSales Team`;
        recommendations = [
          'Keep subject line under 9 words',
          'Personalize first paragraph with industry specifics',
          'Follow up within 48 hours if no response'
        ];
        break;

      case 'objection_handler':
        const objType = payload.objectionType || 'Price / Budget';
        title = `AI Rebuttal Guide: ${objType}`;
        if (objType.includes('Price') || objType.includes('Budget')) {
          content = `Key Framing Strategy: Shift from Cost to Lost Revenue\n\n"I completely understand ${contactName}. Budget allocation is critical. Let's look at this differently: if your team misses just 3 hot leads a month due to delayed follow-ups, how much potential revenue is lost? Our platform typically pays for itself within the first 14 days by converting those exact leads."\n\nFollow-up Action: Offer a phased pilot or quarterly payment option.`;
        } else if (objType.includes('Competitor') || objType.includes('Already Using')) {
          content = `Key Framing Strategy: Native WhatsApp + Local Automation Advantage\n\n"That's great that you already have a tool in place. Many of our current clients migrated because other CRMs charge exorbitant per-conversation fees and lack native WhatsApp multi-agent routing. We'd love to run a side-by-side comparison on your current workflow."`;
        } else {
          content = `Key Framing Strategy: Urgency & Low Friction Commitment\n\n"Totally understand you're busy right now, ${contactName}. That's exactly why we designed the onboarding to take less than 15 minutes without disrupting your daily operations. How about we just set up the automated WhatsApp reply today, and you test it on 5 leads?"`;
        }
        recommendations = [
          'Acknowledge and validate before countering',
          'Use concrete numbers and ROI examples',
          'Propose low-risk micro-commitment (e.g. 7-day trial)'
        ];
        break;

      case 'lead_summary':
      default:
        title = `Executive Lead Summary: ${contactName}`;
        const score = lead?.leadScore || 65;
        const tier = score >= 75 ? '🔥 High Intent (Hot)' : score >= 45 ? '⚡ Engaging (Warm)' : '❄️ Low Activity (Cold)';
        content = `Lead Health & Status Overview:\n• Name: ${contactName} | Company: ${company}\n• Phone: ${lead?.phone || 'N/A'} | Email: ${lead?.email || 'N/A'}\n• Current Status: ${lead?.status || 'New'} | Priority: ${lead?.priority || 'Medium'}\n• Estimated Value: ${valueStr}\n• AI Score: ${score}/100 (${tier})\n\nExecutive Insight:\nContact has completed verified verification points. Primary opportunity is closing deal cycle before week-end. High engagement probability on WhatsApp.`;
        recommendations = [
          'Ensure primary agent Anita Patel is assigned',
          'Send personalized demo link within 2 hours',
          'Move status to Proposal once interest is confirmed'
        ];
        break;
    }

    return {
      type: payload.type,
      leadId: payload.leadId,
      leadName: contactName,
      title,
      content,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Batch calculate AI scores for all leads in company
   */
  static async batchScoreAll(companyId: string) {
    const leads = await prisma.lead.findMany({
      where: { companyId }
    });

    let updatedCount = 0;

    for (const lead of leads) {
      let score = 0;
      if (lead.email) score += 20;
      if (lead.phone) score += 20;
      if (lead.companyName) score += 10;
      if (lead.jobTitle) score += 10;
      if (lead.source === 'WhatsApp' || lead.source === 'Website') score += 15;
      else if (lead.source) score += 5;

      const statusWeights: Record<string, number> = {
        'New': 25,
        'Contacted': 30,
        'Qualified': 35,
        'Proposal': 40,
        'Negotiation': 45,
        'Won': 50,
        'Lost': 5
      };
      score += statusWeights[lead.status] || 15;

      if (lead.priority === 'High') score += 15;
      else if (lead.priority === 'Medium') score += 10;

      if (lead.estimatedValue && lead.estimatedValue > 0) {
        score += Math.min(Math.round(lead.estimatedValue / 2000), 20);
      }

      // Cap at 100
      const finalScore = Math.min(score, 100);
      const isQualified = finalScore >= 65;

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          leadScore: finalScore,
          isQualified,
          qualificationReason: isQualified
            ? 'Auto-qualified by AI: High intent and verified contact details'
            : 'Pending qualification: Additional discovery required',
          qualifiedAt: isQualified ? new Date() : null
        }
      });
      updatedCount++;
    }

    return {
      message: `Successfully scored ${updatedCount} leads`,
      updatedCount
    };
  }
}
