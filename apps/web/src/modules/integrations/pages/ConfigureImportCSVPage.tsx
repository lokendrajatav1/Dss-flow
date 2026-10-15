import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '@/lib/api';
import { LEAD_SOURCES, CALL_STATUSES } from '@/lib/constants';

export function ConfigureImportCSVPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState('importCsv');
  const [status, setStatus] = useState('Untouched');
  const [group, setGroup] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<{ created: number, updated: number, total: number } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/leads/groups');
        setGroups(res.data);
      } catch (err) {
        console.error('Failed to load groups', err);
      }
    };
    fetchGroups();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      Swal.fire('Error', 'Please select a CSV file first.', 'error');
      return;
    }

    setIsUploading(true);
    setImportStats(null); // Reset stats before new upload
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 15;
      });
    }, 200);

    // Basic frontend parsing for CSV text (In a real app, use PapaParse or send FormData to backend)
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      // Split into lines
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        clearInterval(progressInterval);
        Swal.fire('Error', 'The CSV file seems to be empty or missing data rows.', 'error');
        setIsUploading(false);
        return;
      }

      // We will just simulate an API call for now or send raw text
      try {
        const res = await api.post('/leads/import-csv', {
          csvData: text,
          source,
          status,
          groupId: group || undefined
        });

        // Set the custom stats UI instead of a popup
        setImportStats({
          created: res.data.createdCount || 0,
          updated: res.data.updatedCount || 0,
          total: res.data.count || 0
        });

        clearInterval(progressInterval);
        setProgress(100);

        setTimeout(() => {
          // Reset form
          setFile(null);
          setSource('importCsv');
          setStatus('Untouched');
          setGroup('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setIsUploading(false);
        }, 500);

      } catch (error: any) {
        clearInterval(progressInterval);
        console.error('Import failed', error);
        const errorMsg = error.response?.data?.message || 'Failed to import leads. Check console for details.';
        Swal.fire('Error', errorMsg, 'error');
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const downloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,display_name,phone,whatsapp,email,status,company_name,job_title,industry,facebook_url,twitter_url,linkedin_url,website_url,address,category\nJohn Doe,John D.,+1 555 9876 5432,+1 555 9876 5432,johndoe@email.com,Connected,ABC Company,Manager,Technology,https://www.facebook.com/john,https://twitter.com/johnd,https://www.linkedin.com/in/john,https://www.abccompany.co,123 Main St,IT Services";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1400px] mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/integrations')}>
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Import Leads from CSV</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">

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

            {/* CSV Icon mock */}
            <div className="relative">
              <svg width="60" height="70" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Document Outline */}
                <path d="M28 2H8C5.79 2 4.02 3.79 4.02 6L4 50C4 52.21 5.79 54 8 54H40C42.21 54 44 52.21 44 50V18L28 2ZM40 50H8V6H26V20H40V50Z" fill="#333333" />
                {/* Document Lines */}
                <rect x="14" y="28" width="8" height="3" fill="#333333" />
                <rect x="26" y="28" width="10" height="3" fill="#333333" />
                <rect x="14" y="36" width="8" height="3" fill="#333333" />
                <rect x="26" y="36" width="10" height="3" fill="#333333" />
                <rect x="14" y="44" width="8" height="3" fill="#333333" />
                <path d="M26 47L28.5 44.5L26 42H28L29.5 43.5L31 42H33L30.5 44.5L33 47H31L29.5 45.5L28 47H26Z" fill="#333333" />
              </svg>
              {/* CSV Badge */}
              <div className="absolute top-2 -left-4 bg-[#b5e353] border-2 border-[#333333] px-2 py-0.5 rounded-sm font-black text-[11px] transform -rotate-2">
                <span className="text-[#333333] tracking-widest">CSV</span>
                {/* Ribbon tail left */}
                <div className="absolute top-[2px] -left-2.5 border-[6px] border-transparent border-r-[#333333] border-b-[#333333]"></div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Import Leads from CSV</h2>

          <p className="text-[15px] text-gray-800 mb-8 font-medium">
            Select the CSV file containing the list of contacts to import to your DSSFlow account.
          </p>

          <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-lg border border-amber-200 mb-8 leading-relaxed">
            <strong>Note:</strong> Upload a CSV or Excel (.xlsx) file (or export from Google Sheets).
            If using Excel, please save as CSV (Comma delimited) (*.csv).
            You can include a status column matching your account's call status names.
            Existing leads matching the phone number will be automatically updated.
          </div>

          {importStats && (
            <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col border border-gray-200 mb-8">
              {/* Top Green Bar */}
              <div className="bg-[#6db370] text-white text-center py-2 text-sm font-medium">
                Done!
              </div>

              {/* Bottom Light Green Content */}
              <div className="bg-[#e4f3e5] p-4 flex items-center text-[#185e2b]">
                <div className="bg-[#185e2b] rounded-full p-0.5 mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[15px]">
                  CSV Processed!
                  {importStats.created > 0 ? ` Imported: ${importStats.created} new lead(s).` : ''}
                  {importStats.updated > 0 ? ` Updated: ${importStats.updated} existing lead(s).` : ''}
                  {importStats.created === 0 && importStats.updated === 0 ? ' No valid leads found.' : ''}
                </span>
              </div>
            </div>
          )}


          <div className="space-y-6 text-left">

            {/* File Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Select File (CSV or Excel)</label>
              {!file ? (
                <label className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer flex flex-col items-center justify-center text-center relative group block">
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <div className="bg-gray-100 group-hover:bg-blue-100 p-3 rounded-full mb-3 text-gray-500 group-hover:text-blue-600 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Click to browse file</p>
                  <p className="text-xs text-gray-500 font-medium">CSV or Excel format</p>
                </label>
              ) : (
                <div className="w-full border border-[#28a745] bg-[#f2fcf4] rounded-xl p-5 flex items-center justify-between shadow-sm">
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <div className="bg-white border border-[#c3e6cb] p-3 rounded-lg text-[#28a745] shadow-sm flex-shrink-0">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-[15px] font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                    title="Remove file"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Lead Source */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Select Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full border border-gray-300 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="importCsv">Import CSV</option>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Select Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Untouched">Select Status (Default: Untouched)</option>
                {CALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Group */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Select Group (Connect Lead Form)</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full border border-gray-300 rounded-lg h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose Group</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              {isUploading && (
                <div className="w-full">
                  <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
                    <span>Importing your leads...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-[#28a745] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={isUploading}
                className="w-full bg-[#28a745] hover:bg-[#218838] text-white font-medium h-11 text-base shadow-sm"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isUploading ? 'Importing...' : 'Import CSV'}
              </Button>

              <button
                onClick={downloadSample}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center hover:underline"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Please download the Sample CSV template and follow the columns & formatting used
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
