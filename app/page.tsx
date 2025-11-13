'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/app/medhope/components/Navbar';
import Hero from '@/app/medhope/components/Hero';
import Services from '@/app/medhope/components/Services';
import PatientCases from '@/app/medhope/components/PatientCases';
import Footer from '@/app/medhope/components/Footer';
import api from '@/lib/api';

// Home page - Main public site with header, footer, and all cards
export default function Home() {
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
        // If API fails, use dummy data (handled in PatientCases component)
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <PatientCases cases={cases} loading={loading} />
      <Footer />
    </div>
  );
}
