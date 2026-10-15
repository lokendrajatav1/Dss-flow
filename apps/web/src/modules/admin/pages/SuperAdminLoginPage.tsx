import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@platform.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/admin/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        login(user);
        navigate('/admin');
      } else {
        setError(response.data.error || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Invalid administrator credentials or access denied'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Top Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Platform Control Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Super Admin Portal
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Restricted access for platform administrators and system operators
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#111827]/90 border border-gray-800/80 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 flex items-start gap-3 text-red-200 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@platform.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1F2937]/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
                Security Passkey
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#1F2937]/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate & Launch Console
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-6 pt-5 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Default bootstrap credentials: <span className="text-indigo-400 font-mono">admin@platform.com</span> / <span className="text-indigo-400 font-mono">admin123</span>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/auth/login"
            className="text-xs text-gray-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
          >
            ← Back to Standard Tenant Login
          </Link>
        </div>
      </div>
    </div>
  );
}
