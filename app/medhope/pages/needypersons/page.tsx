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
  }, [router, filters]);

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

  // Filter needy persons by search query
  const filteredNeedyPersons = needyPersons.filter((person) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      person.name.toLowerCase().includes(query) ||
      person.caseNumber.toLowerCase().includes(query) ||
      person.district.toLowerCase().includes(query) ||
      person.area.toLowerCase().includes(query) ||
      getDiseaseName(person).toLowerCase().includes(query) ||
      person.hospitalName.toLowerCase().includes(query) ||
      person.description.toLowerCase().includes(query)
    );
  });

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
                placeholder="Search by name, case number, disease, location, hospital..."
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
                className="glass-card card-hover overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary to-primary-dark p-4 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">Case #{person.caseNumber}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      person.priority === 'High' ? 'bg-red-500' :
                      person.priority === 'Medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                      {person.priority}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Disease Information */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Disease</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getDiseaseName(person)}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-sm text-gray-700">
                      {person.area}, {person.district}
                    </p>
                  </div>

                  {/* Age */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Age</p>
                    <p className="text-sm text-gray-700">{person.age} years</p>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {person.description}
                    </p>
                  </div>

                  {/* Hospital & Doctor */}
                  <div className="mb-4 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Hospital</p>
                      <p className="text-sm text-gray-700">{person.hospitalName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Doctor</p>
                      <p className="text-sm text-gray-700">{person.doctorName}</p>
                    </div>
                  </div>

                  {/* Tests (if any) */}
                  {person.selectedTests && person.selectedTests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">Required Tests</p>
                      <div className="flex flex-wrap gap-2">
                        {person.selectedTests.slice(0, 3).map((test, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {test}
                          </span>
                        ))}
                        {person.selectedTests.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{person.selectedTests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amount Needed */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Amount Needed</p>
                    <p className="text-2xl font-bold text-primary">
                      PKR {person.amountNeeded.toLocaleString()}
                    </p>
                    {person.totalDonations && person.totalDonations > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Received: PKR {person.totalDonations.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Status & Zakat Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      person.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      person.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {person.status}
                    </span>
                    {person.zakatEligible && (
                      <span className="bg-golden text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Zakat Eligible
                      </span>
                    )}
                  </div>

                  {/* View Details Button */}
                  <Link
                    href={`/medhope/pages/needypersons/${person._id}`}
                    className="btn-primary w-full text-center block"
                  >
                    View Details & Donate
                  </Link>
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

