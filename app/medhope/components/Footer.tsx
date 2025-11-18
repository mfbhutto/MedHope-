'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Shield, CheckCircle, Eye, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const trustBadges = [
  {
    icon: Shield,
    text: 'Secure',
    description: '100% Secure Platform',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: CheckCircle,
    text: 'Verified',
    description: 'All Cases Verified',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Eye,
    text: 'Transparent',
    description: 'Full Transparency',
    color: 'bg-purple-100 text-purple-600',
  },
];

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Contact', href: '/contact' },
];

const userLinks = [
  { name: 'Login', href: '/auth/login' },
  { name: 'Register', href: '/auth/register' },
  { name: 'Submit Case', href: '/auth/register/accepter' },
  { name: 'Become Donor', href: '/auth/register/donor' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}></div>
      </div>

      {/* Trust Badges Section */}
      <div className="border-b border-gray-700/50 py-8 relative z-10">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-6">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 justify-center md:justify-start"
                >
                  <div className={`w-14 h-14 ${badge.color} rounded-xl flex items-center justify-center shadow-soft`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">{badge.text}</div>
                    <div className="text-sm text-gray-400">{badge.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12 px-4 relative z-10">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div>
              <div className="mb-4 ml-2 md:ml-4">
                <div className="relative w-24 h-24 md:w-28 md:h-28">
                  <Image
                    src="/logo-footer.png"
                    alt="MedHope Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Restoring lives, one prescription at a time. A secure, intelligent, and 
                charity-based medicine donation system serving Karachi.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary-light transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Get Started</h4>
              <ul className="space-y-2">
                {userLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-primary-light transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary-light mt-0.5 flex-shrink-0" />
                  <a
                    href="mailto:support@medhope.com"
                    className="text-gray-400 hover:text-primary-light transition-colors"
                  >
                    support@medhope.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary-light mt-0.5 flex-shrink-0" />
                  <a
                    href="https://wa.me/923001234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-light transition-colors"
                  >
                    +92 300 1234567
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-light mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">
                    Karachi, Pakistan
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 py-6 px-4 relative z-10">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} MedHope. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy-policy" className="hover:text-primary-light transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-primary-light transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
