'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/app/medhope/components/Navbar';
import Hero from '@/app/medhope/components/Hero';
import Services from '@/app/medhope/components/Services';
import PatientCases from '@/app/medhope/components/PatientCases';
import Footer from '@/app/medhope/components/Footer';
import HowItWorks from '@/app/medhope/components/HowItWorks';
import WhyChooseUs from '@/app/medhope/components/WhyChooseUs';
import api from '@/lib/api';

// Root home page - Public, no login required
export default function HomePage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch verified cases for public view
    const fetchCases = async () => {
      try {
        const response = await api.get('/cases');
        setCases(response.data.cases || []);
      } catch (error) {
        console.error('Error fetching cases:', error);
        // If API fails, use empty array (handled in PatientCases component)
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Services />
      <WhyChooseUs />
      <PatientCases cases={cases} loading={loading} />
      <Footer />
    </div>
  );
}

