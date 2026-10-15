import React, { useState } from 'react';
import { Folder, FileText, Download, Trash2, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

export function DocumentsPage() {
  const [files, setFiles] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const newFiles = Array.from(uploadedFiles).map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: file.name,
      type: file.type.includes('pdf') || file.type.includes('image') ? 'file' : 'file',
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }));

    setFiles(prev => [...newFiles, ...prev]);
    Swal.fire({
      icon: 'success',
      title: `${newFiles.length} file(s) uploaded`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDelete = (id: string, name: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    Swal.fire({
      icon: 'success',
      title: 'Document Removed',
      text: `${name} has been removed.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-xs mt-1">Store and manage your business contracts, quotes, and files.</p>
        </div>
        <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition">
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] font-bold text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Date Modified</th>
              <th className="px-6 py-3.5">Size</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">No documents uploaded yet</p>
                  <p className="text-xs text-gray-500 mt-0.5">Click "Upload File" to add contracts, tax documents, or company files.</p>
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-3.5 font-medium text-gray-900 flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>{file.name}</span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-500">{file.date}</td>
                  <td className="px-6 py-3.5 text-gray-500 font-mono">{file.size}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(file.id, file.name)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
