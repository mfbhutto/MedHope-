'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Users, TrendingUp } from 'lucide-react';
import SectionHeading from './SectionHeading';

const features = [
  {
    icon: Shield,
    title: 'Secure & Verified',
    description: 'All cases are thoroughly verified before being published. Your donations go directly to verified medical needs.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Eye,
    title: 'Transparent',
    description: 'Complete transparency in how donations are used. Track your impact and see real results.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join a community of compassionate donors making a real difference in people\'s lives across Karachi.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'Growing Impact',
    description: 'Our platform continues to grow, helping more families access essential medical care every day.',
    color: 'bg-orange-100 text-orange-600',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-gradient-to-br from-white via-secondary/30 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.1]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #0A5E63 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-20 w-52 h-52 bg-primary/12 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-20 w-60 h-60 bg-accent/12 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -25, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-1/4 w-40 h-40 bg-primary-light/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/3 left-1/4 w-36 h-36 bg-accent-light/8 rounded-full blur-2xl"
        />
      </div>

      <div className="section-container relative z-10">
        <SectionHeading
          title="Why Choose MedHope"
          subtitle="Trusted by donors and families across Karachi for transparent, impactful medical assistance"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card card-hover group"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="heading-md mb-3 text-primary">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

