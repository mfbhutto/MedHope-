'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Users, Activity, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { getStoredUser } from '@/lib/auth';

// Hero slider items with Lottie animation paths
const heroImages = [
  {
    id: 1,
    title: 'Medical Support',
    description: 'Helping families access essential healthcare',
    animationPath: '/Medical-Support.json',
  },
  {
    id: 2,
    title: 'Community Care',
    description: 'Building a stronger, healthier community',
    animationPath: '/Community.json',
  },
  {
    id: 3,
    title: 'Hope & Healing',
    description: 'Restoring lives through compassion',
    animationPath: '/Medical Care.json',
  },
];

export default function Hero() {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [animations, setAnimations] = useState<{ [key: string]: any }>({});
  const [user, setUser] = useState<any>(null);

  // Check user login status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUser = getStoredUser();
      setUser(currentUser);
    }
  }, []);

  // Load Lottie animations
  useEffect(() => {
    const loadAnimations = async () => {
      const loadedAnimations: { [key: string]: any } = {};
      
      for (const image of heroImages) {
        try {
          const response = await fetch(image.animationPath);
          const data = await response.json();
          loadedAnimations[image.animationPath] = data;
        } catch (error) {
          console.error(`Failed to load animation ${image.animationPath}:`, error);
        }
      }
      
      setAnimations(loadedAnimations);
    };

    loadAnimations();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-gradient-hero pt-24 pb-16 md:pt-28 md:pb-20 px-4 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-32 h-32 bg-primary-light/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"
        />
      </div>

      <div className="section-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4 border border-white/30"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">Trusted by 500+ Donors</span>
            </motion.div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Restoring Lives,
              <br />
              <span className="text-accent-light">One Donation</span> at a Time
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-xl leading-relaxed">
              MedHope connects compassionate donors with families in need of medical assistance. 
              Together, we're building a healthier, more caring community in Karachi.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={() => {
                  // If user is logged in as donor, go to cases page
                  // Otherwise, go to donor registration
                  if (user && user.role === 'donor') {
                    router.push('/cases');
                  } else {
                    router.push('/auth/register/donor');
                  }
                }}
                className="group btn-accent flex items-center justify-center gap-2"
              >
                Donate Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/auth/register/accepter"
                className="btn-outline flex items-center justify-center gap-2"
              >
                Submit a Case
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
              <div>
                <div className="text-3xl font-bold text-accent-light mb-1">500+</div>
                <div className="text-sm text-white/80">Cases Helped</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-light mb-1">200+</div>
                <div className="text-sm text-white/80">Active Donors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent-light mb-1">PKR 5M+</div>
                <div className="text-sm text-white/80">Donated</div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Animated Element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex flex-col items-center justify-center min-h-[400px] lg:min-h-[500px]"
          >
            {/* Auto-sliding Cards */}
            <div className="relative w-full flex-1 flex items-center justify-center">
              {heroImages.map((image, index) => {
                const animationData = animations[image.animationPath];
                return (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{
                      opacity: currentImage === index ? 1 : 0,
                      scale: currentImage === index ? 1 : 0.9,
                      y: currentImage === index ? 0 : 20,
                    }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{
                      pointerEvents: currentImage === index ? 'auto' : 'none',
                    }}
                  >
                    {/* Lottie Animation - Smaller Size */}
                    {animationData && (
                      <div className="flex items-center justify-center mb-6 w-full">
                        <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                          <Lottie
                            animationData={animationData}
                            loop={true}
                            autoplay={true}
                            style={{
                              opacity: currentImage === index ? 1 : 0,
                              transition: 'opacity 0.6s ease-in-out',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Content Below Animation */}
                    <div className="text-center text-white w-full mt-4">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3">{image.title}</h3>
                      <p className="text-white/90 text-lg">{image.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dots Indicator - Below all content */}
            <div className="flex gap-2 mt-8">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentImage === index
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75 w-2'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
