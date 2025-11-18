'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/medhope/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { KeyRound, Mail, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'sadmin@medhope.com',
    newPassword: 'admin123',
    confirmPassword: 'admin123',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.newPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/reset-password', {
        email: formData.email,
        newPassword: formData.newPassword,
      });

      toast.success('Password reset successfully!');
      toast.success('You can now login with the new password');
      
      // Redirect to admin login after 2 seconds
      setTimeout(() => {
        router.push('/auth/admin-login');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      <div className="flex items-center justify-center pt-32 pb-12 px-4">
        <div className="max-w-md w-full">
          <div className="glass-card">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
                Reset Admin Password
              </h2>
              <p className="text-gray-600 text-sm">Fix password for existing admin account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Admin Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="sadmin@medhope.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="input-field"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input-field"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Reset Password
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-soft">
              <Link
                href="/auth/admin-login"
                className="text-sm text-gray-600 hover:text-primary transition-colors text-center block"
              >
                ← Back to admin login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

