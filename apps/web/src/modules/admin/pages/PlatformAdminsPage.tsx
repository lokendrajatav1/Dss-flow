import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Search,
  Mail,
  Phone,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  X,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  company?: string;
  companyPlan?: string;
  lastActive?: string;
}

export function PlatformAdminsPage() {
  const [admins, setAdmins] = useState<PlatformAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // New admin form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'superadmin',
    password: ''
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/platform-admins');
      if (res.data && Array.isArray(res.data)) {
        setAdmins(res.data);
      } else {
        setAdmins([]);
      }
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/platform-admins', formData);
      const createdAdmin = res.data?.data || {
        id: `admin-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: 'Active',
        company: 'Platform Administration',
        lastActive: new Date().toISOString()
      };

      setAdmins(prev => [createdAdmin, ...prev]);
      setFormSuccess('Administrator successfully added');
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', role: 'superadmin', password: '' });
        setFormSuccess(null);
      }, 1000);
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.message || 'Failed to create administrator');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch =
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase()) ||
      (admin.phone && admin.phone.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'all' || admin.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const totalAdmins = admins.length;
  const superAdminsCount = admins.filter(a => a.role?.toLowerCase() === 'superadmin').length;
  const activeAdminsCount = admins.filter(a => a.status?.toLowerCase() === 'active').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Platform Team & Admins
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage super administrators and internal platform team members with global system access.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdmins}
            disabled={loading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Administrator
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Administrators</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalAdmins}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Super Admins (Root)</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{superAdminsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Status</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{activeAdminsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table & Filter Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="h-9 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
            Loading platform administrators...
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No administrators found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Administrator</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Active</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdmins.map(admin => {
                  const isSuper = admin.role?.toLowerCase() === 'superadmin';
                  const initials = admin.name
                    ? admin.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'PA';

                  return (
                    <tr key={admin.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                              isSuper
                                ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{admin.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{admin.company || 'Platform Core'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{admin.email}</span>
                        </div>
                        {admin.phone && (
                          <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{admin.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isSuper
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : admin.role?.toLowerCase() === 'admin'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {admin.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            admin.status?.toLowerCase() === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              admin.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {admin.status || 'Active'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">
                        {admin.lastActive ? new Date(admin.lastActive).toLocaleDateString() : 'Never'}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Administrator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Add Platform Administrator</h3>
                  <p className="text-[11px] text-gray-500">Create an admin account with platform privileges</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <Input
                  type="email"
                  required
                  placeholder="admin@platform.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (Optional)</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-9 px-3 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="superadmin">Super Admin (All permissions & root access)</option>
                  <option value="admin">Admin (System settings & tenant management)</option>
                  <option value="support">Support (Helpdesk & read operations)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Temporary Password</label>
                <Input
                  type="password"
                  placeholder="Defaults to admin123"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
