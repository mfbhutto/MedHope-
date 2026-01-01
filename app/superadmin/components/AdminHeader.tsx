'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { clearAuthData, getStoredUser } from '@/lib/auth';
import NotificationIcon from '@/app/medhope/components/NotificationIcon';

export default function AdminHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-soft">
      <div className="section-container">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center group ml-2 md:ml-4">
            <div className="relative w-24 h-24 md:w-28 md:h-28 group-hover:scale-110 transition-transform">
              <Image
                src="/logo.png"
                alt="MedHope Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Menu - Logout and Notification */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
            >
              Logout
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </button>
            {user && user._id && (
              <NotificationIcon 
                userId={user._id} 
                userModel={(user.role === 'admin' || user.role === 'superadmin') ? 'Admin' : 'Donor'} 
              />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 p-2 hover:bg-gray-soft rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
