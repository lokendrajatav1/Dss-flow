import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Upload } from 'lucide-react';

interface FilesTabProps {
  lead: any;
}

export function FilesTab({ lead }: FilesTabProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/leads/${lead.id}/files`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFiles(res.data);
      } catch (err) {
        console.error('Error fetching files:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (lead?.id) fetchFiles();
  }, [lead?.id]);

  const handleSimulateUpload = async () => {
    // This simulates an upload. In reality, you'd upload to S3 first, then save the URL here.
    try {
      const token = localStorage.getItem('token');
      const newFile = {
        fileName: 'contract_draft.pdf',
        fileType: 'application/pdf',
        fileSize: 1048576, // 1MB
        url: 'https://example.com/dummy.pdf'
      };
      
      const res = await api.post(`/leads/${lead.id}/files`, newFile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles([res.data, ...files]);
    } catch (err) {
      console.error('Failed to upload file', err);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading files...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleSimulateUpload}
          className="flex items-center gap-2 bg-[#1877f2] hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">NAME</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">SIZE</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">FILE EXTENSION</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">DATE</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide text-right">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-[14px] text-gray-500 font-medium">
                No files found in timeline.
              </td>
            </tr>
          ) : (
            files.map(file => (
              <tr key={file.id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-[14px] text-gray-900 font-medium">{file.fileName}</td>
                <td className="py-3 px-4 text-[14px] text-gray-600">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                <td className="py-3 px-4 text-[14px] text-gray-600">{file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</td>
                <td className="py-3 px-4 text-[14px] text-gray-600">
                  {new Date(file.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[12px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    View / Download
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
