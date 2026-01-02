'use client';

import { motion } from 'framer-motion';
import Navbar from '@/app/medhope/components/Navbar';
import Footer from '@/app/medhope/components/Footer';
import SectionHeading from '@/app/medhope/components/SectionHeading';
import { Pill, TestTube, Heart, DollarSign, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: Pill,
    title: 'Medicine Donations',
    description: 'Access essential medications for chronic diseases, acute conditions, and ongoing treatments. Our verified system ensures medicines reach those who need them most.',
    color: 'bg-blue-100 text-blue-600',
    hoverColor: 'hover:bg-blue-600 hover:text-white',
  },
  {
    icon: TestTube,
    title: 'Disease / Lab Test Support',
    description: 'Get financial assistance for diagnostic tests, lab work, and medical screenings. We connect patients with affordable testing options and donor support.',
    color: 'bg-green-100 text-green-600',
    hoverColor: 'hover:bg-green-600 hover:text-white',
  },
  {
    icon: Heart,
    title: 'Emergency Medical Aid',
    description: 'Rapid response support for urgent medical situations. Quick verification and fast-track assistance for emergency medical needs.',
    color: 'bg-red-100 text-red-600',
    hoverColor: 'hover:bg-red-600 hover:text-white',
  },
  {
    icon: DollarSign,
    title: 'Financial Assistance',
    description: 'Direct financial support for medical expenses including hospital bills, treatment costs, and related medical expenses.',
    color: 'bg-purple-100 text-purple-600',
    hoverColor: 'hover:bg-purple-600 hover:text-white',
  },
  {
    icon: Users,
    title: 'Donor Community Services',
    description: 'Join our community of donors. Access donor dashboard, track your impact, manage donations, and connect with other compassionate contributors.',
    color: 'bg-orange-100 text-orange-600',
    hoverColor: 'hover:bg-orange-600 hover:text-white',
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-hero pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}></div>
        </div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="heading-xl text-white mb-6"
            >
              Our Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/90"
            >
              Comprehensive medical assistance for families in need
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-section-soft">
        <div className="section-container">
          <SectionHeading
            title="How We Help"
            subtitle="A range of services designed to support families through their medical journey"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`glass-card card-hover h-full flex flex-col group ${service.hoverColor}`}
                >
                  <div className={`w-20 h-20 ${service.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                    <Icon className="w-10 h-10" />
                  </div>

                  <h3 className="heading-md mb-4 text-primary group-hover:text-white transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-6 flex-grow group-hover:text-white/90 transition-colors leading-relaxed">
                    {service.description}
                  </p>

                  <div className="flex items-center text-primary font-semibold group-hover:text-white transition-colors">
                    <span>Learn more</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-primary">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="heading-lg text-white mb-6">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join our community of donors or submit your medical case today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register/donor"
                  className="btn-accent"
                >
                  Become a Donor
                </Link>
                <Link
                  href="/auth/register/accepter"
                  className="btn-outline"
                >
                  Submit a Case
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

