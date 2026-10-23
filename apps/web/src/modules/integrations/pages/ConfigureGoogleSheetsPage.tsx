import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle2, Plus, Trash2, ChevronDown, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Swal from 'sweetalert2';

const AVAILABLE_CRM_FIELDS = [
  { value: 'name', label: 'Lead Name (Standard)' },
  { value: 'phone', label: 'Mobile / Phone Number (Standard)' },
  { value: 'email', label: 'Email Address (Standard)' },
  { value: 'city', label: 'City (Standard)' },
  { value: 'company_name', label: 'Company Name (Standard)' },
  { value: 'address', label: 'Address (Standard)' },
  { value: 'budget', label: 'Budget (Custom Value)' },
  { value: 'notes', label: 'Notes (Standard)' },
  { value: 'requirement', label: 'Requirement / Service (Custom Value)' },
  { value: 'are_you_looking_for', label: 'Are You Looking For (CRM Attribute)' },
  { value: 'area', label: 'Area (CRM Attribute)' },
  { value: 'audience_id', label: 'Audience ID (CRM Attribute)' },
  { value: 'batch', label: 'Batch (CRM Attribute)' },
  { value: 'branch_area', label: 'Branch Area (CRM Attribute)' },
  { value: 'branch_locality', label: 'Branch Locality (CRM Attribute)' },
  { value: 'branch_pin', label: 'Branch Pin (CRM Attribute)' },
  { value: 'call_date', label: 'Call Date (CRM Attribute)' },
  { value: 'call_duration', label: 'Call Duration (CRM Attribute)' },
  { value: 'how_to_join', label: 'How To Join (CRM Attribute)' },
  { value: 'locality', label: 'Locality (CRM Attribute)' },
  { value: 'branch_location', label: 'Branch Location (CRM Attribute)' },
  { value: 'service_name', label: 'Service Name (CRM Attribute)' },
  { value: 'when_you_start', label: 'When You Start (CRM Attribute)' },
  { value: 'when_you_want_to_visit', label: 'When You Want to Visit (CRM Attribute)' },
  { value: 'business_type', label: 'Business Type (CRM Attribute)' },
  { value: 'virtual_number', label: 'Virtual Number (CRM Attribute)' },
  { value: 'tag', label: 'Tag (CRM Attribute)' },
  { value: 'option_1', label: 'Option 1 (CRM Attribute)' },
  { value: 'option_2', label: 'Option 2 (CRM Attribute)' },
  { value: 'message', label: 'Message (CRM Attribute)' },
  { value: 'subject', label: 'Subject (CRM Attribute)' },
  { value: 'alternate_number', label: 'Alternate Number (CRM Attribute)' },
  { value: 'whatsapp', label: 'Whatsapp (CRM Attribute)' },
  { value: 'job_title', label: 'Job Position (CRM Attribute)' },
  { value: 'industry', label: 'Industry (CRM Attribute)' },
  { value: 'facebook_url', label: 'Facebook URL (CRM Attribute)' },
  { value: 'twitter_url', label: 'Twitter URL (CRM Attribute)' },
  { value: 'linkedin_url', label: 'LinkedIn URL (CRM Attribute)' },
  { value: 'website_url', label: 'Website URL (CRM Attribute)' },
  { value: 'facebook_page_name', label: 'FB Lead Form (CRM Attribute)' },
  { value: 'category', label: 'Category (CRM Attribute)' },
  { value: 'state', label: 'State (CRM Attribute)' },
  { value: 'last_assign_date', label: 'Assign Date (CRM Attribute)' },
  { value: 'group_id', label: 'Group (CRM Attribute)' },
  { value: 'created_by', label: 'Created By (CRM Attribute)' },
  { value: 'follow_up_date', label: 'Follow Up Date (CRM Attribute)' }
];

export function ConfigureGoogleSheetsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const [groups, setGroups] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [funnels, setFunnels] = useState<any[]>([]);

  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState('');
  const [sheetName, setSheetName] = useState('dssflow_leads');

  const [mappings, setMappings] = useState([{ id: Date.now(), header: 'Name', field: 'name' }]);

  // Test Lead State
  const [testName, setTestName] = useState('Vikas Gupta (Sheets Test)');
  const [testPhone, setTestPhone] = useState('+91 98765 43211');
  const [testEmail, setTestEmail] = useState('vikas.sheets@testlead.com');
  const [testCity, setTestCity] = useState('Delhi');
  const [testBudget, setTestBudget] = useState('50000');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') 
    : 'http://localhost:4000';
  const webhookUrl = `${API_BASE}/webhooks/google-sheets/${user?.companyId || 'YOUR_COMPANY_ID'}`;

  const handleSendTestLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !testPhone) {
      Swal.fire('Required Fields', 'Please enter at least Name and Phone number.', 'warning');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await api.post(`/webhooks/google-sheets/${user?.companyId || 'YOUR_COMPANY_ID'}`, {
        name: testName,
        phone: testPhone,
        email: testEmail,
        city: testCity,
        budget: testBudget,
        groupId: selectedGroup || undefined,
        funnelId: selectedFunnel || undefined,
        assignedTo: selectedTeamMembers.length > 0 ? selectedTeamMembers : undefined
      });

      if (res.data?.success) {
        Swal.fire({
          title: 'Google Sheet Test Lead Created!',
          text: `Lead for ${testName} (${testPhone}) has been captured successfully in your CRM.`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#007bff',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Go to Lead Manager',
          cancelButtonText: 'Stay Here'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/lead-manager');
          }
        });
      } else {
        Swal.fire('Error', res.data?.message || 'Failed to process lead', 'error');
      }
    } catch (err: any) {
      console.error('Failed to send test lead:', err);
      Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to connect to webhook API', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [gRes, uRes, fRes] = await Promise.all([
          api.get('/leads/groups', { headers }),
          api.get('/users', { headers }),
          api.get('/leads/funnels', { headers })
        ]);
        setGroups(gRes.data || []);
        setTeamMembers(uRes.data || []);
        setFunnels(fRes.data || []);
      } catch (err) {
        console.error('Failed to fetch filter data', err);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generateScript());
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const handleTeamMemberToggle = (id: string) => {
    setSelectedTeamMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const addMapping = () => {
    setMappings([...mappings, { id: Date.now(), header: '', field: 'phone' }]);
  };

  const updateMapping = (id: number, key: 'header' | 'field', value: string) => {
    setMappings(mappings.map(m => m.id === id ? { ...m, [key]: value } : m));
  };

  const removeMapping = (id: number) => {
    const newMappings = mappings.filter(m => m.id !== id);
    if (newMappings.length === 0) {
      Swal.fire({
        title: 'Cannot Delete',
        text: 'At least one column mapping must remain.',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });
    } else {
      setMappings(newMappings);
    }
  };

  const generateScript = () => {
    const allowedColsStr = JSON.stringify(mappings.map(m => m.header).filter(Boolean));
    const fieldMapping = mappings.reduce((acc, m) => {
      if (m.header) acc[m.header] = m.field;
      return acc;
    }, {} as any);

    return `function sendLatestDataToApi() {
  const sheetName = '${sheetName}'; // Configured sheet tab name
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  if (!sheet) {
    Logger.log('Sheet "' + sheetName + '" not found in spreadsheet.');
    return;
  }

  // Allowed columns configured for this account - only these columns will be sent
  const allowedColumns = ${allowedColsStr};
  const crmFieldMapping = ${JSON.stringify(fieldMapping, null, 2)};

  // Get the number of columns and rows in the sheet
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  // Exit if no data (only header row exists)
  if (lastRow <= 1) {
    Logger.log('No data records available.');
    return;
  }

  // Get the header keys from the first row
  const rawHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  // Map allowed columns to their respective column indices
  const colIndices = [];
  for (let j = 0; j < rawHeaders.length; j++) {
    const headerName = String(rawHeaders[j]).trim();
    if (allowedColumns.includes(headerName)) {
      colIndices.push({ index: j, header: headerName, crmField: crmFieldMapping[headerName] });
    }
  }

  if (colIndices.length === 0) {
    Logger.log('None of the allowed columns were found in header row.');
    return;
  }

  // Identify phone column index in the sheet
  let phoneColIndex = -1;
  for (let k = 0; k < colIndices.length; k++) {
    if (colIndices[k].crmField === 'phone') {
      phoneColIndex = colIndices[k].index;
      break;
    }
  }

  const maxRecordsToSend = 10;
  const startRow = Math.max(2, lastRow - maxRecordsToSend + 1); 
  const numRowsToProcess = lastRow - startRow + 1;
  const dataRange = sheet.getRange(startRow, 1, numRowsToProcess, lastColumn).getValues();

  let records = [];
  let recordsProcessed = 0;

  for (let i = dataRange.length - 1; i >= 0 && recordsProcessed < maxRecordsToSend; i--) {
    const row = dataRange[i];
    const isEmptyRow = row.every(cell => cell === null || cell === '' || String(cell).trim() === '');
    
    if (isEmptyRow) continue;

    // Do NOT send row if phone number is empty (prevents duplicate entry while typing rows in Google Sheets)
    if (phoneColIndex !== -1) {
      const phoneDigits = String(row[phoneColIndex] || '').replace(/[^0-9]/g, '');
      if (phoneDigits.length < 6) {
        continue; // Skip incomplete row where phone is still empty
      }
    }

    let dataObj = {};
    for (let k = 0; k < colIndices.length; k++) {
      const item = colIndices[k];
      dataObj[item.crmField] = row[item.index];
    }
    records.unshift(dataObj); // Add to beginning to maintain chronological order
    recordsProcessed++;
  }

  if (records.length === 0) return;

  const payload = {
    timestamp: new Date().toISOString(),
    event: 'sheet_update',
    sheet_name: sheetName,
    data: records,
    google_key: '${user?.companyId || 'YOUR_COMPANY_ID'}',
    groupId: '${selectedGroup}',
    funnelId: '${selectedFunnel}',
    assignedTo: ${JSON.stringify(selectedTeamMembers)}
  };

  const webhookUrl = '${webhookUrl}';

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'ngrok-skip-browser-warning': 'true'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    Logger.log('Response: ' + response.getContentText());
  } catch (error) {
    Logger.log('Error: ' + error.toString());
  }
}
// Set up an installable trigger to run this function automatically whenever data is updated.`;
  };

  const highlightCode = (code: string) => {
    let formatted = code
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    formatted = formatted.replace(/(?<!https?:)(\/\/.*)|('.*?'|".*?"|`.*?`)|(\b(?:const|let|var|function|return|if|else|for|try|catch|new|true|false)\b)|(\b[A-Z][a-zA-Z0-9_]*\b)/g, (match, p1, p2, p3, p4) => {
      if (p1) return `<span class="text-[#6a9955] italic">${p1}</span>`;
      if (p2) return `<span class="text-[#ce9178]">${p2}</span>`;
      if (p3) return `<span class="text-[#569cd6] font-semibold">${p3}</span>`;
      if (p4) return `<span class="text-[#4ec9b0]">${p4}</span>`;
      return match;
    });

    return { __html: formatted };
  };

  return (
    <div className="max-w-[1400px] mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/integrations')}>
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Google Sheets Integration</h1>
      </div>

      <div className="max-w-3xl mx-auto space-y-6 pb-20">

        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">

          {/* Visual Graphic Header */}
          <div className="flex justify-center items-center gap-6 mb-8 mt-2">
            {/* DSSFlow Logo */}
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="DSSFlow Logo" className="h-[70px] w-auto object-contain" />
            </div>

            {/* Arrow */}
            <div className="text-gray-400">
              <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.828 10.5L16.192 5.136L14.778 3.722L6.5 12L14.778 20.278L16.192 18.864L10.828 13.5H54V10.5H10.828Z" fill="currentColor" />
              </svg>
            </div>

            {/* Google Sheets Icon mock */}
            <div className="relative">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" alt="Google Sheets" className="w-[60px] h-[60px] object-contain drop-shadow-sm" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Google Sheets Integration</h2>

          <p className="text-[15px] text-gray-800 mb-8 font-medium">
            Send real-time data from your Google Sheet via Apps Script (Account-Wise Column Mapping)
          </p>

          <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-lg border border-amber-200 mb-8 leading-relaxed text-left">
            <strong>Note:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1 font-medium">
              <li>Select a Group and Team Member(s) to automatically assign them to incoming leads.</li>
              <li>Multiple Team Member selections will distribute leads using the Round Robin method.</li>
              <li>After configuring, copy the customized Apps Script below which automatically includes these settings.</li>
            </ul>
          </div>

          <div className="space-y-6 text-left">

            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">1. Connection Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Select Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg h-10 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose Group</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Select Funnel</label>
                <select
                  value={selectedFunnel}
                  onChange={(e) => setSelectedFunnel(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg h-10 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Connect Funnel</option>
                  {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Select Team Member</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                    className="w-full bg-white border border-gray-300 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                  >
                    <span className="truncate text-gray-700">
                      {selectedTeamMembers.length === 0
                        ? 'Select Members'
                        : `${selectedTeamMembers.length} member(s) selected`}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${teamDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {teamDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto p-1.5">
                      {teamMembers.length === 0 ? <div className="text-gray-400 p-2 text-sm text-center">No members found</div> : null}
                      {teamMembers.map(m => (
                        <label key={m.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedTeamMembers.includes(m.id)}
                            onChange={() => handleTeamMemberToggle(m.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="truncate">{m.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Incoming Webhook URL</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-mono text-gray-800 break-all">
                  {webhookUrl}
                </div>
                <Button onClick={copyToClipboard} className="bg-[#28a745] hover:bg-[#218838] text-white h-[46px] px-6 shrink-0 shadow-sm">
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Test Lead Verification Card */}
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Send Test Google Sheet Lead (100% Flow Verification)</h3>
                <p className="text-xs text-gray-500">Test that sheet rows are captured, assigned, and visible in your CRM right now</p>
              </div>
            </div>
            <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
              Ready to Test
            </span>
          </div>

          <form onSubmit={handleSendTestLead} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Name</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g. Vikas Gupta"
                  className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile / Phone</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43211"
                  className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="e.g. vikas@example.com"
                  className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={testCity}
                  onChange={(e) => setTestCity(e.target.value)}
                  placeholder="e.g. Delhi"
                  className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Budget</label>
                <input
                  type="text"
                  value={testBudget}
                  onChange={(e) => setTestBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 gap-3">
              <p className="text-xs text-gray-500">
                Will be ingested with source <span className="font-semibold text-gray-700">Google Sheets</span> and assigned according to connection settings above.
              </p>
              <Button
                type="submit"
                disabled={isSendingTest}
                className="bg-[#007bff] hover:bg-[#0069d9] text-white h-10 px-6 rounded-md font-medium shadow-sm gap-2 shrink-0"
              >
                <Send className="w-4 h-4" />
                {isSendingTest ? 'Sending Test Lead...' : 'Send Test Google Sheet Lead'}
              </Button>
            </div>
          </form>
        </div>

        {/* Mapping Box */}
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-left">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-[#0f9d58]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            <h3 className="text-xl font-bold text-[#1e293b]">Google Sheet Column Mapping (Account-Wise)</h3>
          </div>

          <p className="text-[#64748b] text-[15px] font-medium leading-relaxed mb-1">
            Only the columns mapped below will be added to your CRM account.
          </p>
          <p className="text-[#64748b] text-[15px] font-medium leading-relaxed mb-6">
            Extra/unwanted columns in your sheet will be ignored.
          </p>

          <button
            onClick={() => {
              setMappings([
                { id: Date.now(), header: 'Name', field: 'name' },
                { id: Date.now() + 1, header: 'Mobile Number', field: 'phone' },
                { id: Date.now() + 2, header: 'Budget', field: 'budget' }
              ]);
            }}
            className="flex items-center gap-2 text-[#3b82f6] border border-[#3b82f6] rounded-md px-4 py-2 hover:bg-blue-50 transition-colors text-sm font-semibold mb-6"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            Load Preset: Name, Mobile Number, Budget
          </button>

          <div className="mb-6 max-w-lg">
            <label className="block text-[15px] font-bold text-[#1e293b] mb-2">Google Sheet Tab Name (Sheet Name)</label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md h-11 px-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            />
            <p className="text-[15px] text-[#64748b] mt-2 font-medium">
              Must match the exact sheet tab name at the bottom of your Google Sheet
              <br />(e.g. <span className="bg-red-50 text-[#ef4444] px-1.5 py-0.5 rounded font-mono text-sm mx-1">dssflow_leads</span>).
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-x-auto mb-6 shadow-sm">
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead className="bg-[#f8fafc] border-b border-gray-200 text-[#334155] font-bold">
                <tr>
                  <th className="px-5 py-4 w-[45%] text-[15px] uppercase tracking-wider text-xs">Google Sheet Column Header<br />(Exact)</th>
                  <th className="px-5 py-4 w-[45%] text-[15px] uppercase tracking-wider text-xs">Maps to DSSFlow Field</th>
                  <th className="px-5 py-4 w-[10%] text-center text-[15px] uppercase tracking-wider text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mappings.map((m) => (
                  <tr key={m.id} className="bg-white">
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        placeholder="e.g. City, Requirement, Note"
                        value={m.header}
                        onChange={(e) => updateMapping(m.id, 'header', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm text-[15px] h-11 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={m.field}
                        onChange={(e) => updateMapping(m.id, 'field', e.target.value)}
                        className="w-full border border-gray-300 rounded-md shadow-sm text-[15px] h-11 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        {AVAILABLE_CRM_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => removeMapping(m.id)} className="bg-[#d9534f] hover:bg-[#c9302c] text-white p-2.5 rounded shadow-sm transition-colors flex items-center justify-center w-full max-w-[42px] mx-auto">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={addMapping}
              className="bg-[#5bc0de] hover:bg-[#31b0d5] text-white h-10 px-5 rounded-md font-bold shadow-sm transition-colors flex items-center text-[15px] w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Add Column
            </button>

            <button
              onClick={() => {
                setConfigSaved(true);
                setTimeout(() => setConfigSaved(false), 2000);
              }}
              className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white h-10 px-5 rounded-md font-bold shadow-sm transition-colors flex items-center text-[15px] w-full sm:w-auto min-w-[280px] justify-center"
            >
              {configSaved ? (
                <CheckCircle2 className="w-5 h-5 mr-2 text-white" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
              )}
              {configSaved ? 'Configuration Saved!' : 'Save Configuration & Update Script'}
            </button>
          </div>
        </div>

        {/* Script Box */}
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-left">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">3. Custom Apps Script</h3>
          <p className="text-sm text-gray-600 mb-4 font-medium">Follow these steps to integrate:</p>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 mb-8 font-medium">
            <li>Open your Google Sheet and navigate to <strong>Extensions {'>'} Apps Script</strong>.</li>
            <li>Copy and paste the customized script (shown below) into the script editor.</li>
            <li>Save the project and set up an installable trigger (e.g., <em>onEdit</em> or <em>time-driven</em>) to run <code>sendLatestDataToApi</code> automatically.</li>
            <li>The script is pre-configured with your sheet name and only transmits your selected columns.</li>
          </ol>

          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900 text-sm">Google Apps Script Code (Customized)</h4>
            <Button onClick={copyScript} className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 shadow-sm text-sm">
              {scriptCopied ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
              {scriptCopied ? 'Copied' : 'Copy Script'}
            </Button>
          </div>

          <div className="bg-[#1e1e1e] rounded-lg p-5 overflow-x-auto text-[14px] leading-relaxed font-mono shadow-inner border border-gray-800 text-[#d4d4d4]">
            <pre><code dangerouslySetInnerHTML={highlightCode(generateScript())} /></pre>
          </div>
        </div>

      </div>
    </div>
  );
}
