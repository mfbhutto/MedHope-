'use client';

import { motion } from 'framer-motion';
import { Pill, TestTube, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';

const services = [
  {
    title: 'Medicine',
    serviceType: 'medicine',
    description: 'Get access to essential medicines for your treatment. Our verified donors help provide life-saving medications to those in need.',
    icon: Pill,
    color: 'bg-blue-100 text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Laboratory',
    serviceType: 'laboratory',
    description: 'Access diagnostic tests and lab services. We connect patients with partnered laboratories for critical medical tests.',
    icon: TestTube,
    color: 'bg-green-100 text-green-600',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Chronic Disease',
    serviceType: 'chronic',
    description: 'Specialized support for chronic conditions. Long-term medication and treatment assistance for ongoing health needs.',
    icon: Heart,
    color: 'bg-red-100 text-red-600',
    gradient: 'from-red-500 to-pink-500',
  },
];

export default function Services() {
  const router = useRouter();
  const user = getStoredUser();

  const handleServiceClick = (serviceType: string) => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/auth/login?redirect=/cases?service=' + serviceType);
      return;
    }
    
    // If user is not a donor, redirect to appropriate page
    if (user.role !== 'donor') {
      router.push('/auth/login?redirect=/cases?service=' + serviceType);
      return;
    }
    
    // Navigate to cases page with service filter
    router.push('/cases?service=' + serviceType);
  };
  return (
    <section className="section-padding bg-gradient-to-br from-secondary via-secondary/50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.1]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #17A2A4 1px, transparent 0)',
          backgroundSize: '60px 60px',
        }}></div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-primary-light/8 via-transparent to-accent/8"></div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -35, 0], x: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-20 w-56 h-56 bg-primary-light/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 35, 0], x: [0, -30, 0], scale: [1, 1.25, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-20 w-64 h-64 bg-accent/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-1/3 w-44 h-44 bg-primary/10 rounded-full blur-2xl"
        />
      </div>

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="heading-lg mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive medical assistance designed to support families through their healthcare journey
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card card-hover text-center group cursor-pointer"
                onClick={() => handleServiceClick(service.serviceType)}
              >
                <div className={`w-20 h-20 ${service.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                  <Icon className="w-10 h-10" />
                </div>
                <h3 className="heading-md mb-4 text-primary">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
                <div className="mt-4">
                  <span className="text-primary font-semibold text-sm group-hover:underline">
                    View Cases →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
