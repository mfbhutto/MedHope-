'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/medhope/components/Navbar';
import Footer from '@/app/medhope/components/Footer';
import { motion } from 'framer-motion';
import { FileText, Scale, AlertTriangle, CheckCircle, UserCheck, CreditCard, Ban, Gavel, Mail, Phone, MapPin, ChevronRight, Shield } from 'lucide-react';

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms', icon: FileText },
  { id: 'accounts', title: 'User Accounts', icon: UserCheck },
  { id: 'usage', title: 'Use of Platform', icon: CheckCircle },
  { id: 'cases', title: 'Medical Cases', icon: FileText },
  { id: 'donations', title: 'Donations', icon: CreditCard },
  { id: 'intellectual', title: 'Intellectual Property', icon: Shield },
  { id: 'disclaimers', title: 'Disclaimers', icon: AlertTriangle },
  { id: 'termination', title: 'Termination', icon: Ban },
  { id: 'changes', title: 'Changes to Terms', icon: FileText },
  { id: 'governing', title: 'Governing Law', icon: Gavel },
  { id: 'contact', title: 'Contact', icon: Mail },
];

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('acceptance');
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
      
      setTimeout(() => setIsScrolling(false), 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <Navbar />
      
      <div className="pt-32 pb-20 px-4 relative z-10">
        <div className="section-container max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Contents
                  </h3>
                  <nav className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                            activeSection === section.id
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-gray-600 hover:bg-secondary/50 hover:text-primary'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{section.title}</span>
                          {activeSection === section.id && (
                            <ChevronRight className="w-4 h-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </motion.div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl mb-6 shadow-soft"
                >
                  <Scale className="w-12 h-12 text-primary" />
                </motion.div>
                <h1 className="heading-lg mb-4">Terms of Service</h1>
                <div className="inline-flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full">
                  <span className="text-sm text-gray-600">Last updated:</span>
                  <span className="text-sm font-semibold text-dark">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </motion.div>

              {/* Content Sections */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Section 1 */}
                <motion.section
                  id="acceptance"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">1. Acceptance of Terms</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    By accessing or using MedHope ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access or use our services.
                  </p>
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20">
                    <p className="text-gray-700 leading-relaxed">
                      MedHope is a medical donation platform that connects donors with individuals and families in need of medical assistance in Karachi, Pakistan.
                    </p>
                  </div>
                </motion.section>

                {/* Section 2 */}
                <motion.section
                  id="accounts"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">2. User Accounts and Registration</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
                      <h3 className="text-xl font-semibold text-dark mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        2.1 Eligibility
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        You must be at least 18 years old and have the legal capacity to enter into agreements to use our platform. By registering, you represent and warrant that you meet these requirements.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 rounded-xl border border-accent/20">
                      <h3 className="text-xl font-semibold text-dark mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-accent" />
                        2.2 Account Responsibilities
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        {[
                          'Maintain confidentiality of your account credentials',
                          'Provide accurate, current, and complete information',
                          'Promptly update your information if it changes',
                          'Responsible for all activities under your account',
                          'Notify us immediately of unauthorized use',
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 p-6 rounded-xl border border-gray-soft">
                      <h3 className="text-xl font-semibold text-dark mb-3">2.3 Account Types</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/80 p-4 rounded-lg border border-primary/20">
                          <h4 className="font-semibold text-primary mb-2">Donor Accounts</h4>
                          <p className="text-gray-600 text-sm">For individuals who wish to make donations to medical cases</p>
                        </div>
                        <div className="bg-white/80 p-4 rounded-lg border border-accent/20">
                          <h4 className="font-semibold text-accent mb-2">Needy Person Accounts</h4>
                          <p className="text-gray-600 text-sm">For individuals or families seeking medical assistance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Section 3 */}
                <motion.section
                  id="usage"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">3. Use of the Platform</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-dark mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        3.1 Permitted Use
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">You may use the Platform to:</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          'Browse and view medical cases',
                          'Submit medical cases (for needy persons)',
                          'Make donations to verified cases',
                          'Communicate with our support team',
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold text-dark mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        3.2 Prohibited Activities
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">You agree NOT to:</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          'Submit false or fraudulent information',
                          'Impersonate any person or entity',
                          'Use platform for illegal purposes',
                          'Gain unauthorized access',
                          'Interfere with platform operation',
                          'Use automated systems without permission',
                          'Harass, abuse, or harm users',
                          'Violate applicable laws',
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                            <Ban className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Section 4 */}
                <motion.section
                  id="cases"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">4. Medical Case Submissions</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20">
                      <h3 className="text-xl font-semibold text-dark mb-3">4.1 Case Verification</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        All medical case submissions are subject to verification. MedHope reserves the right to:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        {[
                          'Request additional documentation or information',
                          'Verify authenticity of medical documents',
                          'Verify identity and financial situation',
                          'Reject or remove cases that do not meet criteria',
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-5 rounded-xl border border-accent/20">
                      <h3 className="text-xl font-semibold text-dark mb-3">4.2 Case Information</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        By submitting a medical case, you agree that:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        {[
                          'All information provided is accurate and truthful',
                          'You have the right to share the medical information',
                          'Case information may be displayed publicly (without personal identifiers)',
                          'You will update us if circumstances change',
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.section>

                {/* Section 5 */}
                <motion.section
                  id="donations"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">5. Donations</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20">
                      <h3 className="text-xl font-semibold text-dark mb-3">5.1 Donation Process</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">When making a donation:</p>
                      <ul className="space-y-2 text-gray-700">
                        {[
                          'Donations are processed through secure payment gateways',
                          'All donations are final and non-refundable unless required by law',
                          'Donations are allocated to the specific case you select',
                          'You will receive a confirmation receipt',
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-5 rounded-xl border border-accent/20">
                      <h3 className="text-xl font-semibold text-dark mb-3">5.2 Zakat Donations</h3>
                      <p className="text-gray-700 leading-relaxed">
                        If you mark a donation as Zakat, it will only be allocated to Zakat-eligible cases. MedHope verifies Zakat eligibility based on the financial and social circumstances of the case.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Section 6 */}
                <motion.section
                  id="intellectual"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">6. Intellectual Property</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    All content on the MedHope platform, including text, graphics, logos, images, and software, is the property of MedHope or its content suppliers and is protected by copyright and other intellectual property laws.
                  </p>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      You may not reproduce, distribute, modify, or create derivative works from any content on the platform without our express written permission.
                    </p>
                  </div>
                </motion.section>

                {/* Section 7 */}
                <motion.section
                  id="disclaimers"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">7. Disclaimers and Limitations</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: '7.1 Medical Information', desc: 'MedHope does not provide medical advice. All medical information on the platform is provided by case submitters. We do not verify the accuracy of medical diagnoses or treatment recommendations.' },
                      { title: '7.2 Platform Availability', desc: 'We strive to keep the platform available 24/7, but we do not guarantee uninterrupted access. The platform may be unavailable due to maintenance, technical issues, or circumstances beyond our control.' },
                      { title: '7.3 Limitation of Liability', desc: 'To the maximum extent permitted by law, MedHope shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.' },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-secondary/30 to-transparent p-5 rounded-xl border-l-4 border-primary">
                        <h3 className="font-semibold text-dark mb-2">{item.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Section 8 */}
                <motion.section
                  id="termination"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Ban className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">8. Termination</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                    We reserve the right to suspend or terminate your account at any time, with or without notice, for:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {[
                      'Violation of these Terms of Service',
                      'Fraudulent or illegal activity',
                      'Misrepresentation of information',
                      'Any other reason we deem necessary',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-red-50 border border-red-200 p-3 rounded-lg">
                        <Ban className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <p className="text-gray-700">
                      You may also terminate your account at any time by contacting us at <a href="mailto:support@medhope.com" className="text-primary hover:underline font-semibold">support@medhope.com</a>.
                    </p>
                  </div>
                </motion.section>

                {/* Section 9 */}
                <motion.section
                  id="changes"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">9. Changes to Terms</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the platform after changes become effective constitutes acceptance of the new Terms.
                  </p>
                </motion.section>

                {/* Section 10 */}
                <motion.section
                  id="governing"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gavel className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">10. Governing Law</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    These Terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising from these Terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Karachi, Pakistan.
                  </p>
                </motion.section>

                {/* Section 11 - Contact */}
                <motion.section
                  id="contact"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all bg-gradient-to-br from-primary/5 to-accent/5"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">11. Contact Information</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    If you have questions about these Terms of Service, please contact us:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/80 p-5 rounded-xl border border-primary/20 hover:shadow-soft transition-all">
                      <Mail className="w-8 h-8 text-primary mb-3" />
                      <h4 className="font-semibold text-dark mb-1">Email</h4>
                      <a href="mailto:support@medhope.com" className="text-primary hover:underline text-sm">
                        support@medhope.com
                      </a>
                    </div>
                    <div className="bg-white/80 p-5 rounded-xl border border-primary/20 hover:shadow-soft transition-all">
                      <Phone className="w-8 h-8 text-primary mb-3" />
                      <h4 className="font-semibold text-dark mb-1">Phone</h4>
                      <a href="tel:+923001234567" className="text-primary hover:underline text-sm">
                        +92 300 1234567
                      </a>
                    </div>
                    <div className="bg-white/80 p-5 rounded-xl border border-primary/20 hover:shadow-soft transition-all">
                      <MapPin className="w-8 h-8 text-primary mb-3" />
                      <h4 className="font-semibold text-dark mb-1">Address</h4>
                      <p className="text-gray-600 text-sm">Karachi, Pakistan</p>
                    </div>
                  </div>
                </motion.section>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

