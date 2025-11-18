'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getStoredUser, clearAuthData, isAuthenticated } from '@/lib/auth';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getStoredUser());
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white shadow-soft' 
        : 'bg-white'
    }`}>
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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/services" 
              className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
            >
              Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/superadmin/dashboard"
                    className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
                  >
                    Admin Dashboard
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                {user.role === 'donor' && (
                  <Link
                    href="/medhope/pages/needypersons"
                    className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
                  >
                    Needy Persons
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                {user.role !== 'admin' && (
                  <Link
                    href={user.role === 'donor' ? '/medhope/pages/donorprofile' : '/medhope/pages/needyprofile'}
                    className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
                  >
                    Profile
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
                >
                  Logout
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary transition-colors font-medium"
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
            className="md:hidden text-gray-700 p-2 hover:bg-gray-soft rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-6 space-y-3 border-t border-gray-soft">
            <Link 
              href="/" 
              className="block text-gray-700 hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="block text-gray-700 hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/services" 
              className="block text-gray-700 hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="/contact" 
              className="block text-gray-700 hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/superadmin/dashboard"
                    className="block text-gray-700 hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user.role === 'donor' && (
                  <Link
                    href="/medhope/pages/needypersons"
                    className="block text-gray-700 hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Needy Persons
                  </Link>
                )}
                {user.role !== 'admin' && (
                  <Link
                    href={user.role === 'donor' ? '/medhope/pages/donorprofile' : '/medhope/pages/needyprofile'}
                    className="block text-gray-700 hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-primary transition-colors font-medium py-2 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="block text-gray-700 hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block btn-primary text-center"
                  onClick={() => setMenuOpen(false)}
                >
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
