'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/medhope/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Shield, User, Mail, Lock } from 'lucide-react';

export default function CreateAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Super Admin',
    email: 'sadmin@medhope.com', // Changed to match what user is trying
    password: 'admin123',
    confirmPassword: 'admin123',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/admin/create', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success('Admin created successfully!');
      toast.success('You can now login at /auth/admin-login');
      
      // Redirect to admin login after 2 seconds
      setTimeout(() => {
        router.push('/auth/admin-login');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create admin';
      const existingEmail = error.response?.data?.existingEmail;
      
      if (existingEmail) {
        toast.error(`${errorMessage} (Existing: ${existingEmail})`);
        toast.info('Try using a different email or delete the existing admin first');
      } else {
        toast.error(errorMessage);
      }
      console.error('Create admin error:', error);
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
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
                Create Superadmin
              </h2>
              <p className="text-gray-600 text-sm">One-time setup to create admin account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Super Admin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="admin@medhope.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="Enter password"
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
                  placeholder="Confirm password"
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Create Admin Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-soft">
              <p className="text-xs text-gray-500 text-center">
                After creating the admin, you can login at{' '}
                <Link href="/auth/admin-login" className="text-primary hover:underline">
                  /auth/admin-login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

