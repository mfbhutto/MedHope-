'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/medhope/components/Navbar';
import Footer from '@/app/medhope/components/Footer';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Database, Users, Mail, Phone, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';

const sections = [
  { id: 'introduction', title: 'Introduction', icon: FileText },
  { id: 'information', title: 'Information We Collect', icon: Database },
  { id: 'usage', title: 'How We Use Your Information', icon: Eye },
  { id: 'sharing', title: 'Information Sharing', icon: Users },
  { id: 'security', title: 'Data Security', icon: Lock },
  { id: 'rights', title: 'Your Rights', icon: Shield },
  { id: 'cookies', title: 'Cookies and Tracking', icon: FileText },
  { id: 'children', title: "Children's Privacy", icon: Shield },
  { id: 'changes', title: 'Changes to Policy', icon: FileText },
  { id: 'contact', title: 'Contact Us', icon: Mail },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('introduction');
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
                    <FileText className="w-5 h-5 text-primary" />
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
                  <Shield className="w-12 h-12 text-primary" />
                </motion.div>
                <h1 className="heading-lg mb-4">Privacy Policy</h1>
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
                  id="introduction"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">1. Introduction</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    MedHope ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical donation platform. Please read this policy carefully to understand our practices regarding your personal data.
                  </p>
                </motion.section>

                {/* Section 2 */}
                <motion.section
                  id="information"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">2. Information We Collect</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
                      <h3 className="text-xl font-semibold text-dark mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        2.1 Personal Information
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        When you register on MedHope, we collect personal information including:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        {['Name, email address, and phone number', 'CNIC (Computerized National Identity Card) number for verification', 'Address and location information (district, area)', 'Financial information for donation processing', 'Medical case information (for needy persons)'].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 rounded-xl border border-accent/20">
                      <h3 className="text-xl font-semibold text-dark mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                        2.2 Usage Data
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        We automatically collect information about how you interact with our platform, including:
                      </p>
                      <ul className="space-y-2 text-gray-700">
                        {['IP address and browser type', 'Pages visited and time spent on pages', 'Device information and operating system'].map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
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
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">3. How We Use Your Information</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                    We use the collected information for the following purposes:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Provide and maintain our medical donation services',
                      'Verify user identities and prevent fraud',
                      'Process donations and manage case submissions',
                      'Communicate with you about your account',
                      'Improve our platform and user experience',
                      'Comply with legal obligations and protect our rights',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-secondary/30 p-4 rounded-lg hover:bg-secondary/50 transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Section 4 */}
                <motion.section
                  id="sharing"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">4. Information Sharing and Disclosure</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                    We do not sell your personal information. We may share your information only in the following circumstances:
                  </p>
                  <div className="space-y-3">
                    {[
                      { title: 'With your consent', desc: 'When you explicitly agree to share information' },
                      { title: 'Service providers', desc: 'With trusted third-party services that help us operate our platform' },
                      { title: 'Legal requirements', desc: 'When required by law or to protect our rights and safety' },
                      { title: 'Case information', desc: 'Medical case details (without personal identifiers) may be displayed publicly' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-gradient-to-r from-secondary/30 to-transparent p-4 rounded-lg border-l-4 border-primary">
                        <div>
                          <h4 className="font-semibold text-dark mb-1">{item.title}</h4>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Section 5 */}
                <motion.section
                  id="security"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">5. Data Security</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                    We implement appropriate technical and organizational measures to protect your personal information, including:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {[
                      'Encryption of sensitive data in transit and at rest',
                      'Secure password hashing and authentication',
                      'Regular security audits and updates',
                      'Access controls and employee training',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
                        <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      <strong>Note:</strong> However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                  </div>
                </motion.section>

                {/* Section 6 */}
                <motion.section
                  id="rights"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">6. Your Rights</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                    You have the right to:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Access and review your personal information',
                      'Request correction of inaccurate data',
                      'Request deletion of your account and data',
                      'Opt-out of certain communications',
                      'Withdraw consent for data processing',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-secondary/30 p-3 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-gray-700">
                      To exercise these rights, please contact us at <a href="mailto:support@medhope.com" className="text-primary hover:underline font-semibold">support@medhope.com</a>.
                    </p>
                  </div>
                </motion.section>

                {/* Section 7 */}
                <motion.section
                  id="cookies"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">7. Cookies and Tracking</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist with authentication. You can control cookie preferences through your browser settings.
                  </p>
                </motion.section>

                {/* Section 8 */}
                <motion.section
                  id="children"
                  variants={itemVariants}
                  className="glass-card p-8 hover:shadow-large transition-all"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-dark mb-2">8. Children's Privacy</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                  </p>
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
                      <h2 className="text-2xl font-bold text-dark mb-2">9. Changes to This Policy</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. You are advised to review this policy periodically.
                  </p>
                </motion.section>

                {/* Section 10 - Contact */}
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
                      <h2 className="text-2xl font-bold text-dark mb-2">10. Contact Us</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
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

