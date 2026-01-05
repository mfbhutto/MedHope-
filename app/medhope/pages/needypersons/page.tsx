'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/app/medhope/components/Navbar';
import { getStoredUser } from '@/lib/auth';
import api from '@/lib/api';

interface NeedyPerson {
  _id: string;
  name: string;
  caseNumber: string;
  district: string;
  area: string;
  age: number;
  diseaseType: 'chronic' | 'other';
  chronicDisease?: string;
  otherDisease?: string;
  manualDisease?: string;
  description: string;
  amountNeeded: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'accepted' | 'rejected';
  zakatEligible: boolean;
  hospitalName: string;
  doctorName: string;
  selectedTests?: string[];
  totalDonations?: number;
}

export default function NeedyPersonsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [needyPersons, setNeedyPersons] = useState<NeedyPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [donatedCaseIds, setDonatedCaseIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    priority: '' as string,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if user is logged in and is a donor
    const currentUser = getStoredUser();
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    if (currentUser.role !== 'donor') {
      router.push('/medhope/pages/donorprofile');
      return;
    }

    setUser(currentUser);
    fetchNeedyPersons();
    fetchDonatedCases();
  }, [router, filters]);

  const fetchDonatedCases = async () => {
    const currentUser = getStoredUser();
    if (!currentUser || !currentUser.email || currentUser.role !== 'donor') {
      return;
    }

    try {
      // Fetch all donations for this donor
      const response = await api.get(`/donations?donorEmail=${encodeURIComponent(currentUser.email)}`);
      const donations = response.data.donations || [];
      
      // Get case IDs where donor has completed donations
      const donatedIds = new Set(
        donations
          .filter((donation: any) => donation.status === 'completed')
          .map((donation: any) => String(donation.caseId))
      );
      
      setDonatedCaseIds(donatedIds);
    } catch (error) {
      console.error('Error fetching donated cases:', error);
      // Don't show error, just continue without donation status
    }
  };

  const fetchNeedyPersons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.priority) params.append('priority', filters.priority);

      const response = await api.get(`/needypersons?${params.toString()}`);
      setNeedyPersons(response.data.needyPersons || []);
    } catch (error) {
      console.error('Error fetching needy persons:', error);
      setNeedyPersons([]);
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseName = (person: NeedyPerson): string => {
    if (person.diseaseType === 'chronic') {
      return person.chronicDisease || 'Chronic Disease';
    } else {
      if (person.otherDisease === 'Other') {
        return person.manualDisease || 'Other Disease';
      }
      return person.otherDisease || 'Other Disease';
    }
  };

  // Filter needy persons by search query
  const filteredNeedyPersons = needyPersons.filter((person) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      person.caseNumber.toLowerCase().includes(query) ||
      person.district.toLowerCase().includes(query) ||
      person.area.toLowerCase().includes(query) ||
      getDiseaseName(person).toLowerCase().includes(query) ||
      person.hospitalName.toLowerCase().includes(query) ||
      person.description.toLowerCase().includes(query)
    );
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      <div className="section-container pt-32 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="heading-lg text-dark mb-2">Needy Persons</h1>
          <p className="text-gray-600">Browse and help those in need of medical assistance</p>
        </div>

        {/* Search Bar and Priority Filter */}
        <div className="glass-card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by case number, disease, location, hospital..."
                className="input-field w-full"
              />
            </div>
            {/* Priority Filter */}
            <div className="md:w-48">
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="input-field w-full"
              >
                <option value="">All Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading needy persons...</p>
          </div>
        ) : filteredNeedyPersons.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg mb-2">No needy persons found.</p>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search query.' : 'Try adjusting your filters or check back later.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeedyPersons.map((person, index) => (
              <motion.div
                key={person._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card card-hover overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-primary via-primary to-primary-dark p-5 text-white rounded-t-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Case #{person.caseNumber}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        person.priority === 'High' ? 'bg-red-500 text-white' :
                        person.priority === 'Medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {person.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white flex flex-col flex-grow">
                  {/* Disease Information */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Disease</p>
                    <p className="text-base font-bold text-gray-900">
                      {getDiseaseName(person)}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</p>
                    <p className="text-sm font-medium text-gray-800">
                      {person.area}, {person.district}
                    </p>
                  </div>

                  {/* Age */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Age</p>
                    <p className="text-sm font-medium text-gray-800">{person.age} years</p>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                      {person.description}
                    </p>
                  </div>

                  {/* Hospital & Doctor */}
                  <div className="mb-4 space-y-3 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hospital</p>
                      <p className="text-sm font-medium text-gray-800">{person.hospitalName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Doctor</p>
                      <p className="text-sm font-medium text-gray-800">{person.doctorName}</p>
                    </div>
                  </div>

                  {/* Tests (if any) */}
                  {person.selectedTests && person.selectedTests.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required Tests</p>
                      <div className="flex flex-wrap gap-2">
                        {person.selectedTests.slice(0, 3).map((test, idx) => (
                          <span key={idx} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-lg border border-primary/20">
                            {test}
                          </span>
                        ))}
                        {person.selectedTests.length > 3 && (
                          <span className="text-xs text-gray-600 font-medium">
                            +{person.selectedTests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amount Needed */}
                  <div className="mb-4 pb-4 border-b-2 border-primary/20">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amount Needed</p>
                    <p className="text-2xl font-bold text-primary">
                      PKR {person.amountNeeded.toLocaleString()}
                    </p>
                    {person.totalDonations && person.totalDonations > 0 ? (
                      <p className="text-xs text-green-600 font-medium mt-2">
                        ✓ Received: PKR {person.totalDonations.toLocaleString()}
                      </p>
                    ) : null}
                  </div>

                  {/* Status & Zakat Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      person.status === 'accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                      person.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
                    </span>
                    {person.zakatEligible && person.status !== 'rejected' && (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                        Zakat Eligible
                      </span>
                    )}
                  </div>

                  {/* Check if user has donated to this case - Push to bottom with mt-auto */}
                  <div className="mt-auto">
                    {(() => {
                      const hasDonatedToCase = donatedCaseIds.has(String(person._id));
                      
                      if (hasDonatedToCase) {
                        // Show message for donated cases (similar to rejected)
                        return (
                          <div className="text-center py-4 px-4 bg-green-50 border-2 border-green-200 rounded-xl">
                            <p className="text-sm text-green-800 font-semibold mb-1">You have already donated to this case</p>
                            <p className="text-xs text-green-600">Thank you for your generosity!</p>
                          </div>
                        );
                      }
                      
                      if (person.status === 'rejected') {
                        // Show message for rejected cases
                        return (
                          <div className="text-center py-4 px-4 bg-red-50 border-2 border-red-200 rounded-xl">
                            <p className="text-sm text-red-800 font-semibold mb-1">This case has been rejected</p>
                            <p className="text-xs text-red-600">Donations are not available for this case</p>
                          </div>
                        );
                      }
                      
                      // Show button for cases that haven't been donated to and aren't rejected
                      return (
                        <Link
                          href={`/medhope/pages/needypersons/${person._id}`}
                          className="btn-primary w-full text-center block font-semibold"
                        >
                          View Details & Donate
                        </Link>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredNeedyPersons.length > 0 && (
          <div className="mt-6 text-center text-gray-600 text-sm">
            Showing {filteredNeedyPersons.length} of {needyPersons.length} needy person{filteredNeedyPersons.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

