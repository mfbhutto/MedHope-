'use client';

import { motion } from 'framer-motion';

const services = [
  {
    title: 'Medicine',
    description: 'Get access to essential medicines for your treatment. Our verified donors help provide life-saving medications to those in need.',
    icon: '💊',
  },
  {
    title: 'Laboratory',
    description: 'Access diagnostic tests and lab services. We connect patients with partnered laboratories for critical medical tests.',
    icon: '🔬',
  },
  {
    title: 'Chronic Disease',
    description: 'Specialized support for chronic conditions. Long-term medication and treatment assistance for ongoing health needs.',
    icon: '🏥',
  },
];

export default function Services() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Our Services
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card text-center"
            >
              <div className="text-6xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

