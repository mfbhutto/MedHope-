'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Navbar from '@/app/medhope/components/Navbar';

export default function UpdatePrioritiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpdate = async () => {
    if (!confirm('Are you sure you want to update priorities for all existing cases? This will recalculate priorities based on the karachi-areas-list.json file.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/cases/update-priorities');
      setResult(response.data);
      toast.success(`Updated ${response.data.updated} cases successfully!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update priorities';
      toast.error(errorMessage);
      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card">
            <h1 className="heading-lg mb-4">Update Case Priorities</h1>
            <p className="text-gray-600 mb-6">
              This utility will update priorities for all existing cases based on the area classification 
              from the <code className="bg-gray-100 px-2 py-1 rounded">karachi-areas-list.json</code> file.
              <br />
              <br />
              <strong>Priority Mapping:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Lower Class → High Priority</li>
                <li>Middle Class → Medium Priority</li>
                <li>Elite Class → Low Priority</li>
              </ul>
            </p>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="btn-primary w-full mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Priorities...' : 'Update All Priorities'}
            </button>

            {result && (
              <div className={`p-4 rounded-lg ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                {result.error ? (
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Error</h3>
                    <p className="text-red-700">{result.error}</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Update Complete</h3>
                    <div className="space-y-1 text-green-700">
                      <p><strong>Total Cases:</strong> {result.total}</p>
                      <p><strong>Updated:</strong> {result.updated}</p>
                      <p><strong>Errors:</strong> {result.errors}</p>
                      <p><strong>Unchanged:</strong> {result.total - result.updated - result.errors}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.back()}
                className="btn-secondary w-full"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

