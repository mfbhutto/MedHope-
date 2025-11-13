'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { dummyCases } from '@/lib/dummyData';

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
}

export default function PatientCases({ cases, loading }: PatientCasesProps) {
  // Use dummy data if no real cases are available
  const displayCases = cases.length > 0 ? cases : dummyCases;

  if (loading) {
    return (
      <section className="py-20 px-4 bg-white-off">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
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
    <section className="py-20 px-4 bg-white-off">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Patient Cases
        </h2>
        {displayCases.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No verified cases available at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon for new cases that need your help.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCases.slice(0, 6).map((caseItem, index) => (
              <motion.div
                key={caseItem._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Card Header - Case Number and Priority */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-primary">
                    Case #{caseItem.caseNumber}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    caseItem.priority === 'High' ? 'bg-red-100 text-red-800' :
                    caseItem.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {caseItem.priority}
                  </span>
                </div>

                {/* Disease Type */}
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">Disease Type</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {caseItem.diseaseName || caseItem.diseaseType || 'General Medical'}
                  </p>
                </div>

                {(caseItem.district || caseItem.area) && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-sm text-gray-700">
                      {[caseItem.area, caseItem.district].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 line-clamp-3 overflow-hidden">
                    {caseItem.description || 'Patient requires medical assistance for treatment and medication.'}
                  </p>
                </div>

                {caseItem.labTests && caseItem.labTests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Recommended Tests</p>
                    <div className="flex flex-wrap gap-2">
                      {caseItem.labTests.slice(0, 3).map(test => (
                        <span key={test} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {test}
                        </span>
                      ))}
                      {caseItem.labTests.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{caseItem.labTests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Total Amount Required</p>
                  <p className="text-2xl font-bold text-primary">
                    PKR {caseItem.estimatedTotalCost.toLocaleString()}
                  </p>
                </div>

                {/* Zakat Badge (if eligible) */}
                {caseItem.isZakatEligible && (
                  <div className="mb-4">
                    <span className="bg-golden text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Zakat Eligible
                    </span>
                  </div>
                )}

                {/* Donate Button */}
                <Link
                  href={caseItem._id.startsWith('dummy') ? '/register?role=donor' : `/cases/${caseItem._id}`}
                  className="btn-primary w-full text-center block"
                >
                  Donate Now
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

