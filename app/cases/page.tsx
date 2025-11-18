'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/app/medhope/components/Navbar';
import PatientCases from '@/app/medhope/components/PatientCases';
import Footer from '@/app/medhope/components/Footer';
import { getStoredUser } from '@/lib/auth';
import api from '@/lib/api';

export default function CasesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceType = searchParams.get('service') || '';
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getStoredUser();
    
    if (!currentUser) {
      // Redirect to login with return URL
      router.push(`/auth/login?redirect=/cases${serviceType ? '?service=' + serviceType : ''}`);
      return;
    }

    if (currentUser.role !== 'donor') {
      // Redirect to appropriate profile
      if (currentUser.role === 'accepter') {
        router.push('/medhope/pages/needyprofile');
      } else {
        router.push('/auth/login');
      }
      return;
    }

    setUser(currentUser);
    fetchCases();
  }, [serviceType, router]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      // Build API URL with service filter
      let url = '/cases';
      if (serviceType) {
        url += `?service=${serviceType}`;
      }
      
      const response = await api.get(url);
      setCases(response.data.cases || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  // Get service title for display
  const getServiceTitle = () => {
    switch (serviceType) {
      case 'medicine':
        return 'Medicine Cases';
      case 'laboratory':
        return 'Laboratory Cases';
      case 'chronic':
        return 'Chronic Disease Cases';
      default:
        return 'All Cases';
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="pt-24 pb-8">
        <div className="section-container">
          <h1 className="heading-lg text-center mb-4">{getServiceTitle()}</h1>
          <p className="text-center text-gray-600 mb-8">
            {serviceType === 'medicine' && 'Cases requiring medicine and medication support'}
            {serviceType === 'laboratory' && 'Cases requiring laboratory tests and diagnostics'}
            {serviceType === 'chronic' && 'Cases related to chronic diseases requiring long-term care'}
            {!serviceType && 'Browse all available cases and make a difference'}
          </p>
        </div>
      </div>
      <PatientCases cases={cases} loading={loading} showDonationModal={true} />
      <Footer />
    </div>
  );
}

