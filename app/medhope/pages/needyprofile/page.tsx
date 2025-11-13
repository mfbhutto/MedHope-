'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/medhope/components/Navbar';
import { getStoredUser, isAuthenticated } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';

export default function NeedyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    // Get user from localStorage
    const currentUser = getStoredUser();
    
    // Check authentication - if no user, redirect to login
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    // Check if user is an accepter
    if (currentUser.role !== 'accepter') {
      // If not an accepter, redirect to appropriate profile
      if (currentUser.role === 'donor') {
        router.push('/medhope/pages/donorprofile');
      } else {
        router.push('/auth/login');
      }
      return;
    }

    setUser(currentUser);
    
    // Fetch profile data and cases
    const fetchData = async () => {
      try {
        const [profileResponse, casesResponse] = await Promise.all([
          api.get('/users/me').catch(() => ({ data: { user: currentUser } })),
          api.get('/cases/my-cases').catch(() => ({ data: { cases: [] } }))
        ]);
        
        setProfileData(profileResponse.data.user || currentUser);
        setCases(casesResponse.data.cases || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setProfileData(currentUser);
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Needy Person Profile</h1>
          
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
                <label className="block text-sm font-medium text-gray-600 mb-1">CNIC</label>
                <p className="text-gray-900">{profileData?.cnic || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <p className="text-gray-900">{profileData?.phone || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-gray-900">{profileData?.address || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
                <p className="text-gray-900">{profileData?.district || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Area</label>
                <p className="text-gray-900">{profileData?.area || 'N/A'}</p>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                <p className="text-gray-900">{profileData?.age || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Marital Status</label>
                <p className="text-gray-900 capitalize">{profileData?.maritalStatus || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Salary Range</label>
                <p className="text-gray-900">{profileData?.salaryRange || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">House Ownership</label>
                <p className="text-gray-900 capitalize">{profileData?.houseOwnership || 'N/A'}</p>
              </div>

              {profileData?.houseOwnership === 'rent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Rent Amount</label>
                  <p className="text-gray-900">PKR {profileData?.rentAmount?.toLocaleString() || 'N/A'}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">House Size</label>
                <p className="text-gray-900">{profileData?.houseSize || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Zakat Eligible</label>
                <p className="text-gray-900">
                  {profileData?.zakatEligible ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-gray-600">No</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Cases */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">My Cases</h2>
            <button
              onClick={() => {
                // TODO: Open case submission modal or navigate to case submission page
                alert('Case submission feature coming soon!');
              }}
              className="btn-primary"
            >
              Submit New Case
            </button>
          </div>

          {cases.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600 mb-4">No cases submitted yet.</p>
              <button
                onClick={() => {
                  // TODO: Open case submission modal or navigate to case submission page
                  alert('Case submission feature coming soon!');
                }}
                className="btn-primary"
              >
                Submit Your First Case
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((caseItem: any) => (
                <div key={caseItem._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Case #{caseItem.caseNumber}</h3>
                      <p className="text-sm text-gray-600 mt-1">{caseItem.diseaseName || caseItem.disease || 'Medical Case'}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Amount Needed: PKR {caseItem.estimatedTotalCost?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        caseItem.status === 'verified' ? 'bg-green-100 text-green-800' :
                        caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {caseItem.status || 'pending'}
                      </span>
                      {caseItem.totalDonations > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Received: PKR {caseItem.totalDonations.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/medhope/cases/${caseItem._id}`}
                    className="text-primary hover:underline text-sm mt-2 inline-block"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

