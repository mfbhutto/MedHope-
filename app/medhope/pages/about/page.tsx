'use client';

import { motion } from 'framer-motion';
import Navbar from '@/app/medhope/components/Navbar';
import Footer from '@/app/medhope/components/Footer';
import SectionHeading from '@/app/medhope/components/SectionHeading';
import { Heart, Target, Users, TrendingUp, Award, Clock } from 'lucide-react';

const stats = [
  { number: '500+', label: 'Cases Helped', icon: Heart, color: 'bg-red-100 text-red-600' },
  { number: '200+', label: 'Active Donors', icon: Users, color: 'bg-blue-100 text-blue-600' },
  { number: 'PKR 5M+', label: 'Total Donated', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
  { number: '50+', label: 'Verified Cases', icon: Award, color: 'bg-purple-100 text-purple-600' },
];

const timeline = [
  {
    year: '2024',
    title: 'Platform Launch',
    description: 'MedHope launched to connect donors with families in need across Karachi.',
    color: 'bg-primary',
  },
  {
    year: '2024',
    title: 'First 100 Cases',
    description: 'Reached our first milestone of helping 100 families access medical care.',
    color: 'bg-primary-light',
  },
  {
    year: '2024',
    title: 'Community Growth',
    description: 'Expanded our donor network to over 200 active contributors.',
    color: 'bg-accent',
  },
  {
    year: '2024',
    title: 'Ongoing Impact',
    description: 'Continuing to make a difference in the lives of families every day.',
    color: 'bg-primary',
  },
];

export default function AboutPage() {
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
              About MedHope
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-white/90"
            >
              Connecting compassion with need, one medical case at a time
            </motion.p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section-padding bg-section-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Who We Are"
              subtitle="A dedicated platform bridging the gap between medical needs and compassionate donors"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="prose prose-lg max-w-none text-gray-700"
            >
              <p className="text-lg leading-relaxed mb-4">
                MedHope is a charity-based medical assistance platform designed to help families in Karachi 
                access essential healthcare services. We understand that medical emergencies and ongoing treatments 
                can place significant financial strain on families, and we're here to help.
              </p>
              <p className="text-lg leading-relaxed">
                Our platform connects verified medical cases with compassionate donors who want to make a real 
                difference. Every case is carefully reviewed to ensure authenticity, and every donation goes 
                directly to verified medical needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="section-padding bg-section-soft">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Our Mission"
              subtitle="To ensure no family goes without essential medical care due to financial constraints"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card bg-gradient-primary text-white p-8 md:p-10"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
              </div>
              <p className="text-lg leading-relaxed mb-4">
                Our mission is to create a transparent, secure, and efficient platform that connects 
                families in need with compassionate donors. We believe that access to healthcare is a 
                fundamental right, and we're committed to making it accessible to everyone.
              </p>
              <p className="text-lg leading-relaxed">
                Through technology and community support, we're building a network of care that extends 
                across Karachi, helping families access medicines, lab tests, and medical treatments 
                when they need it most.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why MedHope Exists */}
      <section className="section-padding bg-section-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Why MedHope Exists"
              subtitle="Addressing a critical need in our community"
            />
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card"
              >
                <h3 className="heading-md mb-3 text-primary">The Challenge</h3>
                <p className="text-gray-700 leading-relaxed">
                  Many families in Karachi struggle to afford essential medical care. Whether it's 
                  chronic disease medications, emergency treatments, or diagnostic tests, the cost 
                  can be overwhelming. This financial burden often forces families to make difficult 
                  choices between healthcare and other basic needs.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card"
              >
                <h3 className="heading-md mb-3 text-primary">Our Solution</h3>
                <p className="text-gray-700 leading-relaxed">
                  MedHope provides a secure, transparent platform where families can submit verified 
                  medical cases, and donors can contribute directly to specific needs. Our verification 
                  process ensures that every case is legitimate, and our transparent system allows 
                  donors to see exactly how their contributions are making a difference.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-gradient-primary">
        <div className="section-container">
          <SectionHeading
            title="Our Impact"
            subtitle="Numbers that reflect our commitment to making a difference"
            center={true}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card bg-white/10 backdrop-blur-md text-center text-white border border-white/20"
                >
                  <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-white/90">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline/Impact Section */}
      <section className="section-padding bg-section-soft">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Our Journey"
              subtitle="Milestones in our mission to help families access healthcare"
            />
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-20 h-20 ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-medium`}>
                      {item.year.split(' ')[0].slice(-2)}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-1 h-full bg-gradient-primary mx-auto mt-2 rounded-full" />
                    )}
                  </div>
                  <div className="flex-grow pb-8">
                    <div className="glass-card">
                      <h3 className="heading-md mb-2 text-primary">{item.title}</h3>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="section-padding bg-section-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="What People Say"
              subtitle="Stories from our community"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card text-center"
            >
              <div className="w-16 h-16 bg-gray-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-600 mb-4 text-lg">
                Testimonials section coming soon. We're collecting stories from donors and families 
                who have been helped through MedHope.
              </p>
              <p className="text-sm text-gray-500">
                If you'd like to share your story, please contact us.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

