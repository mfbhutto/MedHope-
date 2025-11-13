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
    
    // Fetch donor profile data
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setProfileData(response.data.user || currentUser);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Use stored user data if API fails
        setProfileData(currentUser);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white-off">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Donor Profile</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <p className="text-gray-900 font-semibold">{profileData?.name || user?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900">{profileData?.email || user?.email || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <p className="text-gray-900">{profileData?.phone || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-gray-900">{profileData?.address || 'N/A'}</p>
              </div>
            </div>

            {/* Donation Statistics */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Donation Statistics</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-primary">{profileData?.totalDonations || 0}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount Donated</p>
                <p className="text-2xl font-bold text-green-600">
                  PKR {profileData?.totalAmountDonated?.toLocaleString() || '0'}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Cases Helped</p>
                <p className="text-2xl font-bold text-purple-600">{profileData?.casesHelped || 0}</p>
              </div>
            </div>
          </div>

          {/* Recent Donations */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Donations</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-center">No donations yet. Start donating to help those in need!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

