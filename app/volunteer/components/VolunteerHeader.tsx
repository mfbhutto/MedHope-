'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { clearAuthData, getStoredUser } from '@/lib/auth';

export default function VolunteerHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* Desktop Menu - Logout only */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-primary transition-colors font-medium relative group"
            >
              Logout
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-soft">
            <div className="flex flex-col space-y-2 pt-4">
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-primary transition-colors font-medium py-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

