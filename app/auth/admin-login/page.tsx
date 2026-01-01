'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/medhope/components/Navbar';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main login page
    router.push('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      <div className="flex items-center justify-center pt-32 pb-12 px-4">
        <div className="max-w-md w-full">
          <div className="glass-card text-center">
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

