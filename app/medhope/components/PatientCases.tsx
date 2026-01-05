'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, MapPin, AlertCircle } from 'lucide-react';
import DonationModal from './DonationModal';
import { getStoredUser } from '@/lib/auth';
import api from '@/lib/api';

interface Case {
  _id: string;
  caseNumber: string;
  estimatedTotalCost: number;
  isZakatEligible: boolean;
  priority: string;
  status?: string;
  requiredItems?: any[];
  prescription?: string;
  diseaseType?: string;
  diseaseName?: string;
  description?: string;
  district?: string;
  area?: string;
  labTests?: string[];
}

interface PatientCasesProps {
  cases: Case[];
  loading: boolean;
  showDonationModal?: boolean; // If true, show modal instead of navigating
}

export default function PatientCases({ cases, loading, showDonationModal = false }: PatientCasesProps) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [donatedCaseIds, setDonatedCaseIds] = useState<Set<string>>(new Set());
  
  // Only use real cases from database - no dummy data fallback
  const displayCases = cases || [];

  // Fetch donated cases for logged-in users
  useEffect(() => {
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

    fetchDonatedCases();
  }, []);

  const handleDonateClick = (caseItem: Case) => {
    if (showDonationModal) {
      setSelectedCase(caseItem);
      setShowModal(true);
    }
    // If showDonationModal is false, the Link will handle navigation
  };

  if (loading) {
    return (
      <section className="section-padding bg-gradient-to-br from-secondary via-white to-secondary/50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #0A5E63 1px, transparent 0)',
            backgroundSize: '50px 50px',
          }}></div>
        </div>
        <div className="section-container relative z-10">
          <h2 className="heading-lg text-center mb-12">
            Patient Cases
          </h2>
          <div className="text-center">
            <p className="text-gray-600">Loading cases...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-gradient-to-br from-secondary via-white to-secondary/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #0A5E63 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-10 w-56 h-56 bg-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary-light/8 rounded-full blur-2xl"
        />
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="heading-lg mb-4">
            Patient Cases
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse verified cases and make a difference in someone's life today
          </p>
        </motion.div>

        {displayCases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No verified cases available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon for new cases that need your help.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {displayCases.slice(0, 6).map((caseItem, index) => (
              <motion.div
                key={caseItem._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card card-hover group flex flex-col h-full"
              >
                {/* Card Header - Case Number and Priority */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-1">
                      Case #{caseItem.caseNumber}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    caseItem.priority === 'High' 
                      ? 'bg-red-100 text-red-700 border border-red-200' :
                    caseItem.priority === 'Medium' 
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {caseItem.priority}
                  </span>
                </div>

                {/* Disease Type */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <p className="text-sm text-gray-500">Disease Type</p>
                  </div>
                  <p className="text-lg font-semibold text-dark">
                    {caseItem.diseaseName || caseItem.diseaseType || 'General Medical'}
                  </p>
                </div>

                {(caseItem.district || caseItem.area) && (
                  <div className="mb-4 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="text-sm text-gray-700">
                        {[caseItem.area, caseItem.district].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 line-clamp-3 overflow-hidden">
                    {caseItem.description || 'Patient requires medical assistance for treatment and medication.'}
                  </p>
                </div>

                {(caseItem.labTests && caseItem.labTests.length > 0) || ((caseItem as any).selectedTests && (caseItem as any).selectedTests.length > 0) ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Recommended Tests</p>
                    <div className="flex flex-wrap gap-2">
                      {(caseItem.labTests || (caseItem as any).selectedTests || []).slice(0, 3).map((test: string, idx: number) => (
                        <span key={idx} className="bg-secondary text-gray-700 text-xs px-2 py-1 rounded-lg border border-gray-soft">
                          {test}
                        </span>
                      ))}
                      {(caseItem.labTests || (caseItem as any).selectedTests || []).length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{(caseItem.labTests || (caseItem as any).selectedTests || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Total Amount */}
                <div className="mb-4 pb-4 border-b border-gray-soft">
                  <p className="text-sm text-gray-500 mb-1">Total Amount Required</p>
                  <p className="text-2xl font-bold text-primary">
                    PKR {caseItem.estimatedTotalCost.toLocaleString()}
                  </p>
                </div>

                {/* Zakat Badge (if eligible) */}
                {caseItem.isZakatEligible && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 bg-accent/10 text-accent-dark text-xs font-semibold px-3 py-1 rounded-full border border-accent/20">
                      <Heart className="w-3 h-3 fill-current" />
                      Zakat Eligible
                    </span>
                  </div>
                )}

                {/* Status Badge */}
                {caseItem.status === 'rejected' && (
                  <div className="mb-4">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                      Rejected
                    </span>
                  </div>
                )}

                {/* Donate Button or Status Message - Push to bottom */}
                <div className="mt-auto pt-4">
                  {(() => {
                    const hasDonatedToCase = donatedCaseIds.has(String(caseItem._id));
                    
                    if (hasDonatedToCase) {
                      // Show message for donated cases
                      return (
                        <div className="text-center py-4 px-4 bg-green-50 border-2 border-green-200 rounded-xl">
                          <p className="text-sm text-green-800 font-semibold mb-1">You have already donated to this case</p>
                          <p className="text-xs text-green-600">Thank you for your generosity!</p>
                        </div>
                      );
                    }
                    
                    if (caseItem.status === 'rejected') {
                      // Show message for rejected cases
                      return (
                        <div className="text-center py-4 px-4 bg-red-50 border-2 border-red-200 rounded-xl">
                          <p className="text-sm text-red-800 font-semibold mb-1">This case has been rejected</p>
                          <p className="text-xs text-red-600">Donations are not available for this case</p>
                        </div>
                      );
                    }
                    
                    // Show button for cases that haven't been donated to and aren't rejected
                    return showDonationModal ? (
                      <button
                        onClick={() => handleDonateClick(caseItem)}
                        className="btn-primary w-full text-center block group-hover:shadow-glow transition-all"
                      >
                        Donate Now
                      </button>
                    ) : (
                      <Link
                        href={`/medhope/pages/needypersons/${caseItem._id}`}
                        className="btn-primary w-full text-center block group-hover:shadow-glow transition-all"
                      >
                        Donate Now
                      </Link>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {showModal && selectedCase && (
        <DonationModal
          caseItem={selectedCase}
          onClose={() => {
            setShowModal(false);
            setSelectedCase(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setSelectedCase(null);
            // Optionally refresh cases
            window.location.reload();
          }}
        />
      )}
    </section>
  );
}
