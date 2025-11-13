'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-light to-primary py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            MedHope
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Restoring lives, one prescription at a time
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register/accepter" className="btn-golden text-lg px-8 py-3">
              Submit a Case
            </Link>
            <Link href="/auth/register/donor" className="bg-white text-primary hover:bg-white-off font-semibold text-lg px-8 py-3 rounded-lg transition-colors duration-200">
              Donate Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

