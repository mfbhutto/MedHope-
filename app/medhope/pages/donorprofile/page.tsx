'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/medhope/components/Navbar';
import { getStoredUser, isAuthenticated } from '@/lib/auth';
import api from '@/lib/api';

export default function DonorProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);

  // Fetch donor profile data
  const fetchProfile = async () => {
    const currentUser = getStoredUser();
    if (!currentUser || !currentUser.email) return;

    try {
      console.log('Fetching donor profile for:', currentUser.email);
      const response = await api.get(`/users/me?email=${encodeURIComponent(currentUser.email)}`);
      console.log('Profile data received:', response.data.user);
      setProfileData(response.data.user || currentUser);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use stored user data if API fails
      setProfileData(currentUser);
    } finally {
      setLoading(false);
    }
  };

  // Fetch donations
  const fetchDonations = async () => {
    const currentUser = getStoredUser();
    if (!currentUser || !currentUser.email) return;

    setDonationsLoading(true);
    try {
      const response = await api.get(`/donations?donorEmail=${encodeURIComponent(currentUser.email)}`);
      console.log('Donations received:', response.data.donations);
      setDonations(response.data.donations || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  };

  useEffect(() => {
    // Get user from localStorage
    const currentUser = getStoredUser();
    
    // Check authentication - if no user, redirect to login
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    // Check if user is a donor
    if (currentUser.role !== 'donor') {
      // If not a donor, redirect to appropriate profile
      if (currentUser.role === 'accepter') {
        router.push('/medhope/pages/needyprofile');
      } else {
        router.push('/auth/login');
      }
      return;
    }

    setUser(currentUser);
    fetchProfile();
    fetchDonations();
  }, [router]);

  // Refresh profile when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchProfile();
      }
    };

    // Also refresh on focus (when user switches back to tab)
    const handleFocus = () => {
      if (user) {
        fetchProfile();
        fetchDonations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Refresh profile data periodically (every 30 seconds) when on this page
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchProfile();
      fetchDonations();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
        <Navbar />
        <div className="flex items-center justify-center h-screen pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      <div className="section-container pt-32 pb-12">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="heading-lg text-dark mb-2">Donor Profile</h1>
            <p className="text-gray-600">Manage your profile and view your donation history</p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchProfile();
              fetchDonations();
            }}
            className="btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Personal Information Card */}
          <div className="glass-card">
            <h2 className="heading-md text-dark mb-6 pb-4 border-b border-gray-200">Personal Information</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Name</label>
                <p className="text-lg text-dark font-semibold">{profileData?.name || user?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Email</label>
                <p className="text-lg text-dark">{profileData?.email || user?.email || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Phone</label>
                <p className="text-lg text-dark">{profileData?.phone || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Address</label>
                <p className="text-lg text-dark">{profileData?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Donation Statistics Card */}
          <div className="glass-card">
            <h2 className="heading-md text-dark mb-6 pb-4 border-b border-gray-200">Donation Statistics</h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-primary-light/10 to-primary/10 p-6 rounded-xl border border-primary/20 hover:shadow-medium transition-all duration-300">
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Donations</p>
                <p className="text-3xl font-bold text-primary">{profileData?.totalDonations || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 hover:shadow-medium transition-all duration-300">
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Amount Donated</p>
                <p className="text-3xl font-bold text-green-600">
                  PKR {profileData?.totalAmountDonated?.toLocaleString() || '0'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200 hover:shadow-medium transition-all duration-300">
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Cases Helped</p>
                <p className="text-3xl font-bold text-purple-600">{profileData?.casesHelped || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Donations Section */}
        <div className="glass-card">
          <h2 className="heading-md text-dark mb-6 pb-4 border-b border-gray-200">Recent Donations</h2>
          {donationsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-xl border border-gray-200 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg mb-2">No donations yet</p>
                <p className="text-gray-500">Start donating to help those in need and make a difference!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation._id}
                  className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-medium transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-dark">
                            PKR {donation.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Case #{donation.caseNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(donation.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="capitalize">{donation.paymentMethod}</span>
                        {donation.isZakatDonation && (
                          <span className="bg-golden text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Zakat
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {donation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

