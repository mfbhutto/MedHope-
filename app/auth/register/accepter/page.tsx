'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { setAuthData } from '@/lib/auth';
import Navbar from '@/app/medhope/components/Navbar';
import { karachiDistricts, karachiAreas, diseaseLabTests } from '@/lib/karachiData';
import areaData from '@/karachi-areas-list.json';

interface Step1Data {
  name: string;
  email: string;
  cnic: string;
  district: string;
  area: string;
  manualArea?: string;
  manualAddress: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface Step2Data {
  age: string;
  maritalStatus: 'single' | 'married';
  numberOfChildren?: string;
  firstChildAge?: string;
  lastChildAge?: string;
  salaryRange: string;
  houseOwnership: 'own' | 'rent';
  rentAmount?: string;
  houseSize: string;
  utilityBill: FileList | null;
  zakatEligible: boolean;
}

interface Step3Data {
  diseaseType: 'chronic' | 'other';
  chronicDisease?: string;
  otherDisease?: string;
  manualDisease?: string;
  testNeeded: boolean;
  selectedTests?: string[];
  description: string;
  hospitalName: string;
  doctorName: string;
  amountNeeded: string;
  document: FileList | null;
}

const chronicDiseases = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Chronic Kidney Disease',
  'Arthritis',
  'COPD (Chronic Obstructive Pulmonary Disease)',
  'Epilepsy',
  'Thyroid Disorders',
  'Mental Health Conditions',
];

const otherDiseases = [
  'Infections',
  'Fractures',
  'Surgery Required',
  'Cancer Treatment',
  'Accident Recovery',
  'Pregnancy Complications',
  'Child Illness',
  'Other',
];

const salaryRanges = [
  'Below 20,000',
  '20,000 - 30,000',
  '30,000 - 50,000',
  '50,000 - 75,000',
  '75,000 - 100,000',
  'Above 100,000',
];

const houseSizes = [
  '40 yards',
  '60 yards',
  '80 yards',
  '120 yards',
  '240 yards',
  'Above 240 yards',
];

export default function AccepterRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showManualArea, setShowManualArea] = useState(false);
  
  const step1Form = useForm<Step1Data>();
  const step2Form = useForm<Step2Data>();
  const step3Form = useForm<Step3Data>({
    defaultValues: {
      testNeeded: false,
      selectedTests: [],
    }
  });

  const { watch: watchStep1 } = step1Form;
  const { watch: watchStep2 } = step2Form;
  const { watch: watchStep3 } = step3Form;

  const maritalStatus = watchStep2('maritalStatus');
  const diseaseType = watchStep3('diseaseType');
  const chronicDisease = watchStep3('chronicDisease');
  const otherDisease = watchStep3('otherDisease');
  const testNeeded = watchStep3('testNeeded');
  const selectedTests = watchStep3('selectedTests') || [];

  // Get the selected disease name
  const selectedDiseaseName = diseaseType === 'chronic' 
    ? chronicDisease 
    : (otherDisease === 'Other' ? step3Form.watch('manualDisease') : otherDisease);

  // Map other diseases to test categories
  const getTestCategory = (disease: string | undefined): string => {
    if (!disease) return 'General';
    
    // Map other disease categories to test categories
    if (disease === 'Cancer Treatment') return 'Cancer';
    if (disease === 'Infections') return 'General';
    if (disease === 'Fractures') return 'General';
    if (disease === 'Surgery Required') return 'General';
    if (disease === 'Accident Recovery') return 'General';
    if (disease === 'Pregnancy Complications') return 'General';
    if (disease === 'Child Illness') return 'General';
    
    // Return the disease name if it exists in diseaseLabTests, otherwise General
    return diseaseLabTests[disease] ? disease : 'General';
  };

  // Get tests for the selected disease
  const testCategory = getTestCategory(selectedDiseaseName);
  const availableTests = diseaseLabTests[testCategory] || diseaseLabTests['General'] || [];

  const handleStep1Next = async (data: Step1Data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Next = async (data: Step2Data) => {
    // Validate utility bill
    if (!data.utilityBill || data.utilityBill.length === 0) {
      step2Form.setError('utilityBill', { 
        type: 'required', 
        message: 'Utility bill is required' 
      });
      return;
    }
    setCurrentStep(3);
  };

  // Function to get areas for a specific district from JSON
  const getAreasForDistrict = (district: string): string[] => {
    if (!district) return [];
    const areas = areaData
      .filter((item: any) => item.District.toLowerCase() === district.toLowerCase())
      .map((item: any) => item.AreasName)
      .sort();
    return Array.from(new Set(areas)); // Remove duplicates
  };

  // Function to determine priority based on area class
  const getPriorityFromArea = (district: string, area: string): string => {
    if (!district || !area) {
      return 'Medium'; // Default priority if area not found
    }

    // Normalize strings for comparison
    const normalizeString = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');

    // Find matching area in the JSON data
    const matchedArea = areaData.find((item: any) => {
      const districtMatch = normalizeString(item.District) === normalizeString(district);
      const areaName = normalizeString(item.AreasName);
      const userArea = normalizeString(area);
      
      // Exact match or partial match
      const areaMatch = areaName === userArea ||
                       areaName.includes(userArea) ||
                       userArea.includes(areaName) ||
                       areaName.startsWith(userArea) ||
                       userArea.startsWith(areaName);
      
      return districtMatch && areaMatch;
    });

    if (matchedArea) {
      // Map class to priority: Lower → High, Middle → Medium, Elite → Low
      const classToPriority: { [key: string]: string } = {
        'Lower': 'High',
        'Middle': 'Medium',
        'Elite': 'Low',
      };
      return classToPriority[matchedArea.Class] || 'Medium';
    }

    // If area not found in list, default to Medium
    return 'Medium';
  };

  const handleStep3Submit = async (data: Step3Data) => {
    // Validate document
    if (!data.document || data.document.length === 0) {
      step3Form.setError('document', { 
        type: 'required', 
        message: 'Medical document is required' 
      });
      return;
    }

    setLoading(true);
    try {
      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();
      
      // Get the area name (either from dropdown or manual input)
      const areaName = step1Data.area || step1Data.manualArea || '';
      
      // Determine priority based on area class
      const priority = getPriorityFromArea(step1Data.district, areaName);
      
      // Log priority assignment for debugging
      console.log(`Area: ${areaName}, District: ${step1Data.district}, Priority: ${priority}`);
      
      // Prepare form data
      const formData = new FormData();
      
      // Step 1 data
      formData.append('name', step1Data.name);
      formData.append('email', step1Data.email);
      formData.append('cnic', step1Data.cnic);
      formData.append('district', step1Data.district);
      formData.append('area', areaName);
      formData.append('address', step1Data.manualAddress);
      formData.append('phone', step1Data.phone);
      formData.append('password', step1Data.password);
      formData.append('role', 'accepter');
      formData.append('priority', priority);
      
      // Step 2 data
      formData.append('age', step2Data.age);
      formData.append('maritalStatus', step2Data.maritalStatus);
      if (step2Data.maritalStatus === 'married') {
        formData.append('numberOfChildren', step2Data.numberOfChildren || '0');
        formData.append('firstChildAge', step2Data.firstChildAge || '');
        formData.append('lastChildAge', step2Data.lastChildAge || '');
      }
      formData.append('salaryRange', step2Data.salaryRange);
      formData.append('houseOwnership', step2Data.houseOwnership);
      if (step2Data.houseOwnership === 'rent') {
        formData.append('rentAmount', step2Data.rentAmount || '');
      }
      formData.append('houseSize', step2Data.houseSize);
      formData.append('zakatEligible', step2Data.zakatEligible ? 'true' : 'false');
      if (step2Data.utilityBill && step2Data.utilityBill.length > 0 && step2Data.utilityBill[0]) {
        formData.append('utilityBill', step2Data.utilityBill[0]);
      }
      
      // Step 3 data
      formData.append('diseaseType', data.diseaseType);
      if (data.diseaseType === 'chronic') {
        formData.append('disease', data.chronicDisease || '');
      } else {
        formData.append('disease', data.otherDisease === 'Other' ? (data.manualDisease || '') : (data.otherDisease || ''));
      }
      formData.append('testNeeded', data.testNeeded ? 'true' : 'false');
      if (data.testNeeded && data.selectedTests) {
        formData.append('selectedTests', JSON.stringify(data.selectedTests));
      }
      formData.append('description', data.description);
      formData.append('hospitalName', data.hospitalName);
      formData.append('doctorName', data.doctorName);
      formData.append('amountNeeded', data.amountNeeded);
      if (data.document && data.document.length > 0 && data.document[0]) {
        formData.append('document', data.document[0]);
      }
      
      const response = await api.post('/auth/register/accepter', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Store user data (no token for now)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      toast.success('Registration successful! Welcome!');
      router.push('/medhope/pages/needyprofile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Get areas from JSON file for selected district
  const availableAreas = selectedDistrict ? getAreasForDistrict(selectedDistrict) : [];
  const hasAreas = availableAreas.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary/50">
      <Navbar />
      <div className="flex items-center justify-center pt-32 pb-12 px-4">
        <div className="w-full max-w-[64%]">
          <div className="glass-card p-6 md:p-8">
            {/* Headings */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Needy Person Registration
              </h1>
              <p className="text-gray-600">
                Register to get help with medical expenses and receive support from our community
              </p>
            </div>

            {/* Progress Indicator - Full Width */}
            <div className="mb-6 w-full">
              <div className="flex items-center w-full">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep >= step 
                        ? 'bg-primary border-primary text-white' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > step ? '✓' : step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-primary' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600 w-full">
                <span className={currentStep === 1 ? 'font-semibold text-primary' : ''}>Personal Info</span>
                <span className={currentStep === 2 ? 'font-semibold text-primary' : ''}>Financial Info</span>
                <span className={currentStep === 3 ? 'font-semibold text-primary' : ''}>Disease Info</span>
              </div>
            </div>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <form onSubmit={step1Form.handleSubmit(handleStep1Next)} className="space-y-4">
                {/* Row 1: Name and Email (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...step1Form.register('name', { required: 'Name is required' })}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                    {step1Form.formState.errors.name && (
                      <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...step1Form.register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="input-field"
                      placeholder="your.email@example.com"
                    />
                    {step1Form.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: CNIC and Phone (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CNIC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...step1Form.register('cnic', { 
                        required: 'CNIC is required',
                        pattern: {
                          value: /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/,
                          message: 'CNIC format: 12345-1234567-1'
                        }
                      })}
                      className="input-field"
                      placeholder="12345-1234567-1"
                      maxLength={15}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Remove all non-numeric characters
                        let digits = inputValue.replace(/\D/g, '');
                        
                        // Limit to 13 digits (5-7-1 format)
                        if (digits.length > 13) {
                          digits = digits.slice(0, 13);
                        }
                        
                        // Format with dashes: 12345-1234567-1
                        let formatted = digits;
                        if (digits.length > 12) {
                          // Format: 12345-1234567-1 (5-7-1)
                          formatted = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12);
                        } else if (digits.length > 5) {
                          // Format: 12345-1234567 (5-7, no last digit yet)
                          formatted = digits.slice(0, 5) + '-' + digits.slice(5);
                        }
                        // If 5 or fewer digits, no dash needed
                        
                        // Update the form value and input
                        step1Form.setValue('cnic', formatted, { shouldValidate: true });
                        e.target.value = formatted;
                      }}
                    />
                    {step1Form.formState.errors.cnic && (
                      <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.cnic.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      {...step1Form.register('phone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: 'Invalid phone number format'
                        },
                        minLength: { value: 10, message: 'Phone number must be at least 10 digits' }
                      })}
                      className="input-field"
                      placeholder="+92 300 1234567"
                    />
                    {step1Form.formState.errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: District and Area (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      District of Karachi <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...step1Form.register('district', { required: 'District is required' })}
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        step1Form.setValue('district', e.target.value);
                        step1Form.setValue('area', '');
                        setShowManualArea(false);
                      }}
                      className="input-field"
                    >
                      <option value="">Select District</option>
                      {karachiDistricts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {step1Form.formState.errors.district && (
                      <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.district.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Area <span className="text-red-500">*</span>
                    </label>
                    {hasAreas ? (
                      <>
                        <select
                          {...step1Form.register('area', { 
                            required: !showManualArea ? 'Area is required' : false
                          })}
                          className="input-field mb-2"
                          onChange={(e) => {
                            if (e.target.value === 'manual') {
                              setShowManualArea(true);
                              step1Form.setValue('area', '');
                            } else {
                              setShowManualArea(false);
                              step1Form.setValue('area', e.target.value);
                              step1Form.setValue('manualArea', '');
                            }
                          }}
                          disabled={showManualArea}
                        >
                          <option value="">Select Area</option>
                          {availableAreas.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                          <option value="manual">Enter Manually</option>
                        </select>
                        {showManualArea && (
                          <input
                            type="text"
                            {...step1Form.register('manualArea', { 
                              required: showManualArea ? 'Area is required' : false
                            })}
                            className="input-field"
                            placeholder="Enter area manually"
                          />
                        )}
                      </>
                    ) : (
                      <input
                        type="text"
                        {...step1Form.register('manualArea', { required: 'Area is required' })}
                        className="input-field"
                        placeholder="Enter area manually"
                      />
                    )}
                    {(step1Form.formState.errors.area || step1Form.formState.errors.manualArea) && (
                      <p className="text-red-500 text-xs mt-1">
                        {step1Form.formState.errors.area?.message || step1Form.formState.errors.manualArea?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 4: Complete Address (1 column, but in grid for consistency) */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Complete Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...step1Form.register('manualAddress', { 
                        required: 'Address is required',
                        minLength: { value: 10, message: 'Please provide a complete address' }
                      })}
                      className="input-field resize-none"
                      rows={2}
                      placeholder="Enter your complete address (street, house number, etc.)"
                    />
                    {step1Form.formState.errors.manualAddress && (
                      <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.manualAddress.message}</p>
                    )}
                  </div>
                </div>

                {/* Row 5: Password Fields (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...step1Form.register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      className="input-field"
                      placeholder="••••••••"
                    />
                    {step1Form.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...step1Form.register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: (value) => 
                          value === step1Form.watch('password') || 'Passwords do not match'
                      })}
                      className="input-field"
                      placeholder="••••••••"
                    />
                    {step1Form.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{step1Form.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm"
                >
                  Save and Continue
                </button>
              </form>
            )}

            {/* Step 2: Financial Information */}
            {currentStep === 2 && (
              <form onSubmit={step2Form.handleSubmit(handleStep2Next)} className="space-y-4">
                {/* Row 1: Age and Marital Status (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...step2Form.register('age', { 
                        required: 'Age is required',
                        min: { value: 1, message: 'Age must be valid' },
                        max: { value: 120, message: 'Age must be valid' }
                      })}
                      className="input-field"
                      placeholder="Enter your age"
                    />
                    {step2Form.formState.errors.age && (
                      <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.age.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Marital Status <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...step2Form.register('maritalStatus', { required: 'Marital status is required' })}
                          value="single"
                          className="mr-2"
                        />
                        <span className="text-sm">Single</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...step2Form.register('maritalStatus')}
                          value="married"
                          className="mr-2"
                        />
                        <span className="text-sm">Married</span>
                      </label>
                    </div>
                    {step2Form.formState.errors.maritalStatus && (
                      <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.maritalStatus.message}</p>
                    )}
                  </div>
                </div>

                {/* Children Info (if married) */}
                {maritalStatus === 'married' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Children
                      </label>
                      <input
                        type="number"
                        {...step2Form.register('numberOfChildren', { 
                          min: { value: 0, message: 'Must be 0 or more' }
                        })}
                        className="input-field"
                        placeholder="0"
                      />
                    </div>
                    {parseInt(step2Form.watch('numberOfChildren') || '0') > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            First Child Age
                          </label>
                          <input
                            type="number"
                            {...step2Form.register('firstChildAge', { 
                              min: { value: 0, message: 'Must be valid age' }
                            })}
                            className="input-field"
                            placeholder="Age"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Last Child Age
                          </label>
                          <input
                            type="number"
                            {...step2Form.register('lastChildAge', { 
                              min: { value: 0, message: 'Must be valid age' }
                            })}
                            className="input-field"
                            placeholder="Age"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Row 2: Salary Range and House Ownership (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salary Range (PKR) <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...step2Form.register('salaryRange', { required: 'Salary range is required' })}
                      className="input-field"
                    >
                      <option value="">Select Salary Range</option>
                      {salaryRanges.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                    {step2Form.formState.errors.salaryRange && (
                      <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.salaryRange.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      House Ownership <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...step2Form.register('houseOwnership', { required: 'House ownership is required' })}
                          value="own"
                          className="mr-2"
                        />
                        <span className="text-sm">Own</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...step2Form.register('houseOwnership')}
                          value="rent"
                          className="mr-2"
                        />
                        <span className="text-sm">Rent</span>
                      </label>
                    </div>
                    {step2Form.formState.errors.houseOwnership && (
                      <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.houseOwnership.message}</p>
                    )}
                  </div>
                </div>

                {/* Rent Amount (if rent) and House Size */}
                {step2Form.watch('houseOwnership') === 'rent' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rent Amount (PKR) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        {...step2Form.register('rentAmount', { 
                          required: step2Form.watch('houseOwnership') === 'rent' ? 'Rent amount is required' : false,
                          min: { value: 0, message: 'Rent must be 0 or more' }
                        })}
                        className="input-field"
                        placeholder="Enter monthly rent"
                      />
                      {step2Form.formState.errors.rentAmount && (
                        <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.rentAmount.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        House Size <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...step2Form.register('houseSize', { required: 'House size is required' })}
                        className="input-field"
                      >
                        <option value="">Select House Size</option>
                        {houseSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      {step2Form.formState.errors.houseSize && (
                        <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.houseSize.message}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      House Size <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...step2Form.register('houseSize', { required: 'House size is required' })}
                      className="input-field"
                    >
                      <option value="">Select House Size</option>
                      {houseSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    {step2Form.formState.errors.houseSize && (
                      <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.houseSize.message}</p>
                    )}
                  </div>
                )}

                {/* Utility Bill and Zakat (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Utility Bill (Photo) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="input-field text-xs"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          step2Form.setValue('utilityBill', files, { shouldValidate: true });
                        }
                      }}
                    />
                    {step2Form.formState.errors.utilityBill && (
                      <p className="text-red-500 text-xs mt-1">{step2Form.formState.errors.utilityBill.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Electricity or gas bill</p>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...step2Form.register('zakatEligible')}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Zakat Eligible
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Save and Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Disease Information */}
            {currentStep === 3 && (
              <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-4">
                {/* Row 1: Disease Type and Select Disease (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Disease Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...step3Form.register('diseaseType', { required: 'Disease type is required' })}
                          value="chronic"
                          className="mr-2"
                        />
                        <span className="text-sm">Chronic</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...step3Form.register('diseaseType')}
                          value="other"
                          className="mr-2"
                        />
                        <span className="text-sm">Other</span>
                      </label>
                    </div>
                    {step3Form.formState.errors.diseaseType && (
                      <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.diseaseType.message}</p>
                    )}
                  </div>
                  <div>
                    {diseaseType === 'chronic' && (
                      <>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Chronic Disease <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...step3Form.register('chronicDisease', { 
                            required: diseaseType === 'chronic' ? 'Please select a disease' : false
                          })}
                          className="input-field"
                          onChange={(e) => {
                            step3Form.setValue('chronicDisease', e.target.value);
                            // Clear selected tests when disease changes
                            step3Form.setValue('selectedTests', []);
                          }}
                        >
                          <option value="">Select Disease</option>
                          {chronicDiseases.map(disease => (
                            <option key={disease} value={disease}>{disease}</option>
                          ))}
                        </select>
                        {step3Form.formState.errors.chronicDisease && (
                          <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.chronicDisease.message}</p>
                        )}
                      </>
                    )}
                    {diseaseType === 'other' && (
                      <>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Disease <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...step3Form.register('otherDisease', { 
                            required: diseaseType === 'other' ? 'Please select a disease' : false
                          })}
                          className="input-field"
                          onChange={(e) => {
                            step3Form.setValue('otherDisease', e.target.value);
                            step3Form.setValue('manualDisease', '');
                            // Clear selected tests when disease changes
                            step3Form.setValue('selectedTests', []);
                          }}
                        >
                          <option value="">Select Disease</option>
                          {otherDiseases.map(disease => (
                            <option key={disease} value={disease}>{disease}</option>
                          ))}
                        </select>
                        {step3Form.formState.errors.otherDisease && (
                          <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.otherDisease.message}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Manual Disease Name (if Other is selected) */}
                {diseaseType === 'other' && otherDisease === 'Other' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enter Disease Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...step3Form.register('manualDisease', { 
                        required: otherDisease === 'Other' ? 'Disease name is required' : false
                      })}
                      className="input-field"
                      placeholder="Enter disease name manually"
                      onChange={(e) => {
                        step3Form.setValue('manualDisease', e.target.value);
                        // Clear selected tests when manual disease changes
                        step3Form.setValue('selectedTests', []);
                      }}
                    />
                    {step3Form.formState.errors.manualDisease && (
                      <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.manualDisease.message}</p>
                    )}
                  </div>
                )}

                {/* Test Needed and Test Selection (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        {...step3Form.register('testNeeded')}
                        className="mr-2 w-4 h-4"
                        onChange={(e) => {
                          step3Form.setValue('testNeeded', e.target.checked);
                          if (!e.target.checked) {
                            step3Form.setValue('selectedTests', []);
                          }
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Test Needed
                      </span>
                    </label>
                  </div>
                  <div>
                    {testNeeded && selectedDiseaseName && availableTests.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Tests <span className="text-red-500">*</span>
                        </label>
                        <div className="border border-gray-300 rounded-lg p-2 max-h-48 overflow-y-auto bg-white">
                          {availableTests.map((test) => {
                            const isSelected = selectedTests.includes(test);
                            return (
                              <label
                                key={test}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  const currentTests = selectedTests || [];
                                  if (isSelected) {
                                    step3Form.setValue('selectedTests', currentTests.filter(t => t !== test));
                                  } else {
                                    step3Form.setValue('selectedTests', [...currentTests, test]);
                                  }
                                }}
                              >
                                <span className="text-sm text-gray-700 flex-1">{test}</span>
                                <div className="flex items-center ml-2">
                                  {isSelected ? (
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        {selectedTests.length > 0 && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ {selectedTests.length} test(s) selected
                          </p>
                        )}
                      </div>
                    )}
                    {testNeeded && (!selectedDiseaseName || availableTests.length === 0) && (
                      <div className="mt-6">
                        <p className="text-xs text-gray-500">
                          Please select a disease first to see available tests
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description (1 column) */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...step3Form.register('description', { required: 'Description is required' })}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Describe the medical condition and treatment needed"
                    />
                    {step3Form.formState.errors.description && (
                      <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.description.message}</p>
                    )}
                  </div>
                </div>

                {/* Hospital and Doctor (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hospital Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...step3Form.register('hospitalName', { required: 'Hospital name is required' })}
                      className="input-field"
                      placeholder="Enter hospital name"
                    />
                    {step3Form.formState.errors.hospitalName && (
                      <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.hospitalName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Doctor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...step3Form.register('doctorName', { required: 'Doctor name is required' })}
                      className="input-field"
                      placeholder="Enter doctor name"
                    />
                    {step3Form.formState.errors.doctorName && (
                      <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.doctorName.message}</p>
                    )}
                  </div>
                </div>

                {/* Amount Needed and Document (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount Needed (PKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...step3Form.register('amountNeeded', { 
                        required: 'Amount needed is required',
                        min: { value: 1, message: 'Amount must be greater than 0' }
                      })}
                      className="input-field"
                      placeholder="Enter total amount needed"
                    />
                    {step3Form.formState.errors.amountNeeded && (
                      <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.amountNeeded.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Medical Documents <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="input-field text-xs"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          step3Form.setValue('document', files, { shouldValidate: true });
                        }
                      }}
                    />
                    {step3Form.formState.errors.document && (
                      <p className="text-red-500 text-xs mt-1">{step3Form.formState.errors.document.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Photo/PDF</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
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
                </div>
              </form>
            )}

            {/* Footer Links */}
            {currentStep === 1 && (
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                    Login here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
