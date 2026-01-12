'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { setAuthData } from '@/lib/auth';
import Navbar from '@/app/medhope/components/Navbar';

interface VolunteerFormData {
  name: string;
  email: string;
  address: string;
  phone: string;
  cnic: string;
  password: string;
  confirmPassword: string;
}

export default function VolunteerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cnicFrontPreview, setCnicFrontPreview] = useState<string | null>(null);
  const [cnicBackPreview, setCnicBackPreview] = useState<string | null>(null);
  const [cnicFrontFile, setCnicFrontFile] = useState<File | null>(null);
  const [cnicBackFile, setCnicBackFile] = useState<File | null>(null);
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue
  } = useForm<VolunteerFormData>();

  const password = watch('password');
  const cnic = watch('cnic');

  // Handle CNIC input formatting
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 13) value = value.slice(0, 13);
    
    // Format: 12345-1234567-1
    let formatted = '';
    if (value.length > 0) {
      formatted = value.slice(0, 5);
      if (value.length > 5) {
        formatted += '-' + value.slice(5, 12);
        if (value.length > 12) {
          formatted += '-' + value.slice(12, 13);
        }
      }
    }
    
    // Update the form value
    setValue('cnic', formatted, { shouldValidate: true });
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Set file and preview
    if (type === 'front') {
      setCnicFrontFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCnicFrontPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCnicBackFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCnicBackPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: VolunteerFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!cnicFrontFile || !cnicBackFile) {
      toast.error('Please upload both CNIC front and back images');
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData for registration with files
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      formData.append('cnic', data.cnic);
      formData.append('password', data.password);
      formData.append('role', 'volunteer');
      formData.append('cnicFront', cnicFrontFile);
      formData.append('cnicBack', cnicBackFile);
      
      const response = await fetch('/api/auth/register/volunteer', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json() as { message?: string; user?: unknown };

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      // Store user data
      if (typeof window !== 'undefined' && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      toast.success('Registration successful! Welcome, Volunteer!');
      router.push('/volunteer/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      <div className="flex items-center justify-center pt-32 pb-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="glass-card p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Volunteer Registration
              </h2>
              <p className="text-gray-600">
                Join us in making a difference. Register as a volunteer to help verify cases and make an impact.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className="input-field"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('address', { 
                    required: 'Address is required',
                    minLength: { value: 10, message: 'Please provide a complete address' }
                  })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Enter your complete address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
                      message: 'Invalid phone number format'
                    },
                    validate: {
                      minDigits: (value: string) => {
                        const digitsOnly = value.replace(/\D/g, '');
                        if (digitsOnly.length < 10) {
                          return 'Phone number must contain at least 10 digits';
                        }
                        return true;
                      },
                      maxDigits: (value: string) => {
                        const digitsOnly = value.replace(/\D/g, '');
                        if (digitsOnly.length > 15) {
                          return 'Phone number cannot exceed 15 digits';
                        }
                        return true;
                      },
                      noLetters: (value: string) => {
                        if (/[a-zA-Z]/.test(value)) {
                          return 'Phone number cannot contain letters';
                        }
                        return true;
                      }
                    }
                  })}
                  className="input-field"
                  placeholder="+92 300 1234567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* CNIC Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CNIC Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('cnic', { 
                    required: 'CNIC is required',
                    pattern: {
                      value: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
                      message: 'CNIC format: 12345-1234567-1'
                    }
                  })}
                  className="input-field"
                  placeholder="12345-1234567-1"
                  maxLength={15}
                  onChange={handleCnicChange}
                />
                {errors.cnic && (
                  <p className="text-red-500 text-sm mt-1">{errors.cnic.message}</p>
                )}
              </div>

              {/* CNIC Images Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CNIC Images <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CNIC Front */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      CNIC Front Side
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, 'front')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer"
                    />
                    {cnicFrontPreview && (
                      <div className="mt-2">
                        <img
                          src={cnicFrontPreview}
                          alt="CNIC Front Preview"
                          className="w-full h-48 object-contain border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* CNIC Back */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      CNIC Back Side
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, 'back')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer"
                    />
                    {cnicBackPreview && (
                      <div className="mt-2">
                        <img
                          src={cnicBackPreview}
                          alt="CNIC Back Preview"
                          className="w-full h-48 object-contain border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Please upload clear images of both sides of your CNIC. Maximum file size: 5MB
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="input-field"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: (value) => 
                      value === password || 'Passwords do not match'
                  })}
                  className="input-field"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Save & Register'
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

