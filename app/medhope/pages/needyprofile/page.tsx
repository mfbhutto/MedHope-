'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/medhope/components/Navbar';
import { getStoredUser, isAuthenticated } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';
import NewCaseForm from '@/app/medhope/components/NewCaseForm';

export default function NeedyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);

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
          api.get(`/users/me?email=${encodeURIComponent(currentUser.email)}`).catch(() => ({ data: { user: currentUser } })),
          api.get(`/cases/my-cases?email=${encodeURIComponent(currentUser.email)}`).catch(() => ({ data: { cases: [] } }))
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

  const handleCaseSubmitSuccess = () => {
    // Refresh cases list
    const fetchCases = async () => {
      try {
        const currentUser = getStoredUser();
        if (currentUser?.email) {
          const casesResponse = await api.get(`/cases/my-cases?email=${encodeURIComponent(currentUser.email)}`).catch(() => ({ data: { cases: [] } }));
          setCases(casesResponse.data.cases || []);
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };
    fetchCases();
  };

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
        <div className="mb-8">
          <h1 className="heading-lg text-dark mb-2">Needy Person Profile</h1>
          <p className="text-gray-600">Manage your profile and track your cases</p>
        </div>

        <div className="glass-card mb-8">
          <h2 className="heading-md text-dark mb-6 pb-4 border-b border-gray-200">Personal Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
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
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">CNIC</label>
                <p className="text-lg text-dark">{profileData?.cnic || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Phone</label>
                <p className="text-lg text-dark">{profileData?.phone || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Address</label>
                <p className="text-lg text-dark">{profileData?.address || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">District</label>
                <p className="text-lg text-dark">{profileData?.district || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Area</label>
                <p className="text-lg text-dark">{profileData?.area || 'N/A'}</p>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-5">
              <h2 className="heading-md text-dark mb-6 pb-4 border-b border-gray-200">Financial Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Age</label>
                <p className="text-lg text-dark">{profileData?.age || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Marital Status</label>
                <p className="text-lg text-dark capitalize">{profileData?.maritalStatus || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Salary Range</label>
                <p className="text-lg text-dark">{profileData?.salaryRange || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">House Ownership</label>
                <p className="text-lg text-dark capitalize">{profileData?.houseOwnership || 'N/A'}</p>
              </div>

              {profileData?.houseOwnership === 'rent' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Rent Amount</label>
                  <p className="text-lg text-dark">PKR {profileData?.rentAmount?.toLocaleString() || 'N/A'}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">House Size</label>
                <p className="text-lg text-dark">{profileData?.houseSize || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Zakat Eligible</label>
                <p className="text-lg text-dark">
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
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">My Cases</h2>
            <button
              onClick={() => setShowNewCaseForm(true)}
              className="btn-primary"
            >
              Submit New Case
            </button>
          </div>

          {cases.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600 mb-4">No cases submitted yet.</p>
              <button
                onClick={() => setShowNewCaseForm(true)}
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

      {/* New Case Form Modal */}
      {showNewCaseForm && profileData && (
        <NewCaseForm
          onClose={() => setShowNewCaseForm(false)}
          onSuccess={handleCaseSubmitSuccess}
          userProfile={profileData}
        />
      )}
    </div>
  );
}

