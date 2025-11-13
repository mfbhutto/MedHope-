'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getStoredUser, clearAuthData, isAuthenticated } from '@/lib/auth';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getStoredUser());
    }
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">MedHope</span>
            <span className="text-sm text-gray-600">Restoring lives</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
            {user ? (
              <>
                {user.role === 'donor' && (
                  <Link
                    href="/medhope/pages/needypersons"
                    className="text-gray-700 hover:text-primary transition-colors"
                  >
                    Needy Persons
                  </Link>
                )}
                <Link
                  href={user.role === 'donor' ? '/medhope/pages/donorprofile' : '/medhope/pages/needyprofile'}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link href="/" className="block text-gray-700 hover:text-primary">
              Home
            </Link>
            {user ? (
              <>
                {user.role === 'donor' && (
                  <Link
                    href="/medhope/pages/needypersons"
                    className="block text-gray-700 hover:text-primary"
                  >
                    Needy Persons
                  </Link>
                )}
                <Link
                  href={user.role === 'donor' ? '/medhope/pages/donorprofile' : '/medhope/pages/needyprofile'}
                  className="block text-gray-700 hover:text-primary"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-gray-700 hover:text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-gray-700 hover:text-primary">
                  Login
                </Link>
                <Link href="/auth/register" className="block btn-primary text-center">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

