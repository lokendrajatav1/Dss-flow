import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Upload, Trash2, FileText, Download, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

interface FilesTabProps {
  lead: any;
}

export function FilesTab({ lead }: FilesTabProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lead?.id) fetchFiles();
  }, [lead?.id]);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/leads/${lead.id}/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data || []);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 10MB in browser
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire('File Too Large', 'Please select a file smaller than 10 MB.', 'warning');
      return;
    }

    setUploading(true);
    try {
      // Read file as base64 data URL
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const token = localStorage.getItem('token');
          const payload = {
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            url: dataUrl
          };

          const res = await api.post(`/leads/${lead.id}/files`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setFiles([res.data, ...files]);
          Swal.fire({
            title: 'File Uploaded',
            text: `Successfully uploaded ${file.name}`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (err: any) {
          console.error('Failed to save file:', err);
          Swal.fire('Upload Failed', err.response?.data?.message || 'Could not save file to server.', 'error');
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      reader.onerror = () => {
        setUploading(false);
        Swal.fire('Error', 'Failed to read file from disk.', 'error');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      console.error('Upload error:', err);
      Swal.fire('Error', 'An unexpected error occurred during upload.', 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileExtension = (name: string, type: string) => {
    if (name && name.includes('.')) {
      return name.split('.').pop()?.toUpperCase() || 'FILE';
    }
    if (type && type.includes('/')) {
      return type.split('/')[1]?.toUpperCase() || 'FILE';
    }
    return 'FILE';
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        Loading files...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500 font-medium">
          Upload proposals, contracts, identity docs or receipts attached to this lead.
        </p>

        {/* Hidden Real File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
        />

        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-xs disabled:opacity-70 cursor-pointer"
        >
          {uploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Real File
            </>
          )}
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-xs bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-700">
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">File Name</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Size</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Uploaded On</th>
              <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {files.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  No files uploaded for this lead yet.
                </td>
              </tr>
            ) : (
              files.map(file => (
                <tr key={file.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate max-w-xs" title={file.fileName}>{file.fileName}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 font-mono">
                    {formatFileSize(file.fileSize)}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 font-medium">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-mono">
                      {getFileExtension(file.fileName, file.fileType)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {new Date(file.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a 
                      href={file.url} 
                      download={file.fileName}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007bff] hover:text-[#0056b3] hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      View / Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
