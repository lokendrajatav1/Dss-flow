import { LeadsService } from './src/modules/leads/leads.service';

async function test() {
  try {
    const csvData = "name,display_name,phone,whatsapp,email,status,company_name,job_title,industry,facebook_url,twitter_url,linkedin_url,website_url,address,category\nJohn Doe,John D.,+1 555 9876 5432,+1 555 9876 5432,johndoe@email.com,Connected,ABC Company,Manager,Technology,https://www.facebook.com/john,https://twitter.com/johnd,https://www.linkedin.com/in/john,https://www.abccompany.co,123 Main St,IT Services";
    
    // We need a valid companyId, let's just mock it or grab one from DB
    const { prisma } = require('./src/lib/db');
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('No company found to test with.');
      return;
    }

    const res = await LeadsService.importCsvLeads(company.id, {
      csvData,
      source: 'importCsv',
      status: 'New'
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error occurred:", err);
  }
}
test();
