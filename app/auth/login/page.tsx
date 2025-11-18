'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
// import { setAuthData } from '@/lib/auth'; // Token logic commented out
import Navbar from '@/app/medhope/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || null;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const user = response.data.user;
      
      // Debug: Log user object to check structure
      console.log('Login response user:', user);
      
      if (!user) {
        toast.error('Invalid response from server');
        return;
      }
      
      // Store user data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      toast.success('Login successful!');
      
      // If there's a redirect URL, use it (for donors accessing service-filtered cases)
      if (redirectUrl && user.role === 'donor') {
        window.location.href = redirectUrl;
        return;
      }
      
      // Route based on user role - use window.location for reliable navigation
      const role = user.role;
      console.log('Routing user with role:', role);
      
      if (role === 'admin') {
        window.location.href = '/superadmin/dashboard';
      } else if (role === 'donor') {
        window.location.href = '/medhope/pages/donorprofile';
      } else if (role === 'accepter') {
        window.location.href = '/medhope/pages/needyprofile';
      } else {
        console.warn('Unknown role:', role, 'User object:', user);
        toast.error('Unknown user role. Please contact support.');
        // Fallback to home
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      console.error('Login error:', error);
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
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
              Login to MedHope
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

