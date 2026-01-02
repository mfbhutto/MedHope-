'use client';

import { motion } from 'framer-motion';
import { UserPlus, FileText, Heart, CheckCircle } from 'lucide-react';
import SectionHeading from './SectionHeading';

const steps = [
  {
    number: '01',
    title: 'Register',
    description: 'Sign up as a donor or submit your medical case. Quick and easy registration process.',
    icon: UserPlus,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    number: '02',
    title: 'Submit Case',
    description: 'Needy persons can submit their medical cases with required documentation for verification.',
    icon: FileText,
    color: 'bg-green-100 text-green-600',
  },
  {
    number: '03',
    title: 'Donate',
    description: 'Donors browse verified cases and contribute to help those in need with medical assistance.',
    icon: Heart,
    color: 'bg-red-100 text-red-600',
  },
  {
    number: '04',
    title: 'Impact',
    description: 'Track your impact and see how your donations are making a real difference in people\'s lives.',
    icon: CheckCircle,
    color: 'bg-purple-100 text-purple-600',
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding bg-gradient-to-br from-secondary/40 via-white to-secondary/40 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.1]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #17A2A4 1px, transparent 0)',
          backgroundSize: '60px 60px',
        }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-transparent to-primary-light/6"></div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -25, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-48 h-48 bg-primary/12 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-56 h-56 bg-accent/12 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/4 w-36 h-36 bg-primary-light/10 rounded-full blur-2xl"
        />
      </div>

      <div className="section-container relative z-10">
        <SectionHeading
          title="How It Works"
          subtitle="A simple, transparent process to connect donors with those in need"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="glass-card text-center h-full flex flex-col items-center card-hover">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-14 h-14 bg-gradient-primary text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-medium">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-soft`}>
                    <Icon className="w-10 h-10" />
                  </div>

                  {/* Content */}
                  <h3 className="heading-md mb-3 text-primary">{step.title}</h3>
                  <p className="text-gray-600 flex-grow leading-relaxed">{step.description}</p>
                </div>

                {/* Connector Line (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-primary transform -translate-y-1/2 z-0" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

