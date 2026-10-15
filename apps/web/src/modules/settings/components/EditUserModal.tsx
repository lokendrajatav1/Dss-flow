import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user: any;
}

export function EditUserModal({ isOpen, onClose, onSubmit, user }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleName: 'Sales Rep'
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        roleName: user.role?.name || 'Sales Rep'
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...formData, id: user.id });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Edit Team Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-gray-400 text-xs font-normal">(Leave blank to keep current)</span>
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="New password"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.roleName}
                onChange={e => setFormData({ ...formData, roleName: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Sales Rep">Sales Rep</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-md">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
