import React, { useState } from 'react';
import { Zap, GitBranch, Play, Pause, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Swal from 'sweetalert2';

export function AutomationPage() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    trigger: 'New Lead Created',
    actions: 'Assign to Sales Rep',
    status: 'Active'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire('Validation Error', 'Rule name is required', 'warning');
      return;
    }

    const newRule = {
      id: Date.now(),
      name: formData.name,
      trigger: formData.trigger,
      actions: formData.actions,
      status: formData.status,
      runs: 0
    };

    setAutomations(prev => [newRule, ...prev]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      trigger: 'New Lead Created',
      actions: 'Assign to Sales Rep',
      status: 'Active'
    });
    Swal.fire({
      icon: 'success',
      title: 'Automation Rule Created',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const toggleStatus = (id: number) => {
    setAutomations(prev =>
      prev.map(a => a.id === id ? { ...a, status: a.status === 'Active' ? 'Inactive' : 'Active' } : a)
    );
  };

  const handleDelete = (id: number) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
          <p className="text-gray-500 text-xs mt-1">Configure workflow triggers and automatic actions for leads and sales.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9"
        >
          <Zap className="w-4 h-4 mr-1.5" />
          New Automation
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] font-bold text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3.5">Automation Rule</th>
              <th className="px-6 py-3.5">Trigger</th>
              <th className="px-6 py-3.5">Actions</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Executions</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {automations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                  <Zap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">No automation rules configured</p>
                  <p className="text-xs text-gray-500 mt-0.5">Click "New Automation" to set up rules to automate lead assignment and status updates.</p>
                </td>
              </tr>
            ) : (
              automations.map((wf) => (
                <tr key={wf.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-gray-900 flex items-center gap-2.5">
                    <div className={`p-1.5 rounded ${wf.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      <GitBranch className="w-3.5 h-3.5" />
                    </div>
                    <span>{wf.name}</span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-700 mr-1.5">WHEN</span>
                    {wf.trigger}
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">
                    <span className="bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-semibold text-blue-700 mr-1.5">THEN</span>
                    {wf.actions}
                  </td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => toggleStatus(wf.id)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer ${
                        wf.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {wf.status === 'Active' ? <Play className="w-2.5 h-2.5 mr-1" /> : <Pause className="w-2.5 h-2.5 mr-1" />}
                      {wf.status}
                    </button>
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono font-medium text-gray-700">
                    {wf.runs}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(wf.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                      title="Delete rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">New Automation Rule</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rule Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lead Auto-Assign"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Trigger Event</label>
                <select
                  value={formData.trigger}
                  onChange={e => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full h-9 rounded-md border border-gray-200 px-3 text-xs bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="New Lead Created">New Lead Created</option>
                  <option value="Deal Stage Changed">Deal Stage Changed</option>
                  <option value="Quotation Accepted">Quotation Accepted</option>
                  <option value="Invoice Overdue">Invoice Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Action to Execute</label>
                <select
                  value={formData.actions}
                  onChange={e => setFormData({ ...formData, actions: e.target.value })}
                  className="w-full h-9 rounded-md border border-gray-200 px-3 text-xs bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Assign to Sales Rep">Assign to Sales Rep</option>
                  <option value="Send Email Notification">Send Email Notification</option>
                  <option value="Send WhatsApp Message">Send WhatsApp Message</option>
                  <option value="Create Task for Follow-up">Create Task for Follow-up</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 text-xs font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Save Automation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
