'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { diseaseLabTests } from '@/lib/karachiData';
import { X, FileText, Hospital, User, DollarSign, Upload, CheckCircle2, AlertCircle, Heart, TestTube } from 'lucide-react';

interface NewCaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
  userProfile: any; // User's existing profile data
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

export default function NewCaseForm({ onClose, onSuccess, userProfile }: NewCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [diseaseType, setDiseaseType] = useState<'chronic' | 'other' | ''>('');
  const [chronicDisease, setChronicDisease] = useState('');
  const [otherDisease, setOtherDisease] = useState('');
  const [manualDisease, setManualDisease] = useState('');
  const [testNeeded, setTestNeeded] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentFileName, setDocumentFileName] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const selectedDiseaseName = diseaseType === 'chronic' 
    ? chronicDisease 
    : (otherDisease === 'Other' ? manualDisease : otherDisease);

  // Map other diseases to test categories
  const getTestCategory = (disease: string | undefined): string => {
    if (!disease) return 'General';
    
    if (disease === 'Cancer Treatment') return 'Cancer';
    if (disease === 'Infections') return 'General';
    if (disease === 'Fractures') return 'General';
    if (disease === 'Surgery Required') return 'General';
    if (disease === 'Accident Recovery') return 'General';
    if (disease === 'Pregnancy Complications') return 'General';
    if (disease === 'Child Illness') return 'General';
    
    return diseaseLabTests[disease] ? disease : 'General';
  };

  const handleSubmitCase = async (data: any) => {
    // Validate disease selection
    if (!diseaseType) {
      toast.error('Please select disease type');
      return;
    }

    if (diseaseType === 'chronic' && !chronicDisease) {
      toast.error('Please select a chronic disease');
      return;
    }

    if (diseaseType === 'other' && !otherDisease) {
      toast.error('Please select or enter a disease');
      return;
    }

    if (diseaseType === 'other' && otherDisease === 'Other' && !manualDisease) {
      toast.error('Please specify the disease');
      return;
    }

    // Validate document
    if (!documentFile) {
      toast.error('Please upload medical document');
      return;
    }

    // Validate test selection if test needed
    if (testNeeded && selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Use existing user's personal info (from profile)
      formData.append('name', userProfile.name);
      formData.append('email', userProfile.email);
      formData.append('cnic', userProfile.cnic);
      formData.append('district', userProfile.district);
      formData.append('area', userProfile.area || userProfile.manualArea || '');
      if (userProfile.manualArea) {
        formData.append('manualArea', userProfile.manualArea);
      }
      formData.append('address', userProfile.address);
      formData.append('phone', userProfile.phone);
      formData.append('password', 'dummy'); // Not used for existing users, but required by API

      // Use existing user's financial info (from profile)
      formData.append('age', userProfile.age.toString());
      formData.append('maritalStatus', userProfile.maritalStatus);
      if (userProfile.maritalStatus === 'married') {
        formData.append('numberOfChildren', (userProfile.numberOfChildren || 0).toString());
        if (userProfile.firstChildAge) {
          formData.append('firstChildAge', userProfile.firstChildAge.toString());
        }
        if (userProfile.lastChildAge) {
          formData.append('lastChildAge', userProfile.lastChildAge.toString());
        }
      }
      formData.append('salaryRange', userProfile.salaryRange);
      formData.append('houseOwnership', userProfile.houseOwnership);
      if (userProfile.houseOwnership === 'rent' && userProfile.rentAmount) {
        formData.append('rentAmount', userProfile.rentAmount.toString());
      }
      formData.append('houseSize', userProfile.houseSize);
      formData.append('zakatEligible', userProfile.zakatEligible ? 'true' : 'false');
      // Use existing utility bill if available
      if (userProfile.utilityBill) {
        formData.append('utilityBill', userProfile.utilityBill);
      }

      // New disease information
      formData.append('diseaseType', diseaseType);
      if (diseaseType === 'chronic') {
        formData.append('chronicDisease', chronicDisease);
      } else {
        formData.append('otherDisease', otherDisease === 'Other' ? 'Other' : otherDisease);
        if (otherDisease === 'Other') {
          formData.append('manualDisease', manualDisease);
        }
      }
      formData.append('testNeeded', testNeeded ? 'true' : 'false');
      if (testNeeded && selectedTests.length > 0) {
        formData.append('selectedTests', JSON.stringify(selectedTests));
      }
      formData.append('description', data.description);
      formData.append('hospitalName', data.hospitalName);
      formData.append('doctorName', data.doctorName);
      formData.append('amountNeeded', data.amountNeeded);

      // Handle document file upload - send file to API
      if (documentFile) {
        formData.append('document', documentFile);
      }

      // Submit case
      const response = await api.post('/cases/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Case submitted successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Case submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit case');
    } finally {
      setLoading(false);
    }
  };

  const handleTestToggle = (test: string) => {
    setSelectedTests(prev =>
      prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setDocumentFile(files[0]);
      setDocumentFileName(files[0].name);
    } else {
      setDocumentFile(null);
      setDocumentFileName('');
    }
  };

  const availableTests = testNeeded && selectedDiseaseName
    ? (diseaseLabTests[getTestCategory(selectedDiseaseName)] || diseaseLabTests['General'])
    : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="glass-card max-w-3xl w-full my-8 shadow-large max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-soft">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="heading-md text-dark mb-2">Submit New Case</h2>
                  <p className="text-gray-600 text-sm">Add a new medical case using your existing profile information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-soft hover:bg-gray-300 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSubmitCase)} className="space-y-6">
              {/* Disease Type Section */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20">
                <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Disease Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={diseaseType}
                  onChange={(e) => {
                    setDiseaseType(e.target.value as 'chronic' | 'other' | '');
                    setChronicDisease('');
                    setOtherDisease('');
                    setManualDisease('');
                  }}
                  className="input-field bg-white"
                  required
                >
                  <option value="">Select Disease Type</option>
                  <option value="chronic">Chronic Disease</option>
                  <option value="other">Other Disease</option>
                </select>
              </div>

              {/* Chronic Disease Selection */}
              <AnimatePresence>
                {diseaseType === 'chronic' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 rounded-xl border border-accent/20"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-accent" />
                      Chronic Disease <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={chronicDisease}
                      onChange={(e) => setChronicDisease(e.target.value)}
                      className="input-field bg-white"
                      required
                    >
                      <option value="">Select Chronic Disease</option>
                      {chronicDiseases.map((disease) => (
                        <option key={disease} value={disease}>
                          {disease}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Other Disease Selection */}
              <AnimatePresence>
                {diseaseType === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-accent/5 to-accent/10 p-6 rounded-xl border border-accent/20"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-accent" />
                      Other Disease <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={otherDisease}
                      onChange={(e) => setOtherDisease(e.target.value)}
                      className="input-field bg-white"
                      required
                    >
                      <option value="">Select Other Disease</option>
                      {otherDiseases.map((disease) => (
                        <option key={disease} value={disease}>
                          {disease}
                        </option>
                      ))}
                    </select>
                    <AnimatePresence>
                      {otherDisease === 'Other' && (
                        <motion.input
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          type="text"
                          value={manualDisease}
                          onChange={(e) => setManualDisease(e.target.value)}
                          className="input-field bg-white mt-3"
                          placeholder="Specify disease manually"
                          required
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Describe your condition <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  className="input-field bg-white min-h-[120px]"
                  rows={4}
                  placeholder="Briefly describe your medical condition and how MedHope can help..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              {/* Hospital and Doctor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Hospital className="w-5 h-5 text-primary" />
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('hospitalName', { required: 'Hospital name is required' })}
                    className="input-field bg-white"
                    placeholder="e.g., Aga Khan Hospital"
                  />
                  {errors.hospitalName && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.hospitalName.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Doctor's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('doctorName', { required: 'Doctor\'s name is required' })}
                    className="input-field bg-white"
                    placeholder="e.g., Dr. Ali Khan"
                  />
                  {errors.doctorName && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.doctorName.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Test Needed */}
              <div className="bg-secondary/30 p-4 rounded-xl border border-gray-soft">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testNeeded}
                    onChange={(e) => setTestNeeded(e.target.checked)}
                    className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-gray-700">Lab Tests Needed</span>
                  </div>
                </label>
              </div>

              {/* Test Selection */}
              <AnimatePresence>
                {testNeeded && selectedDiseaseName && availableTests.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/20"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <TestTube className="w-5 h-5 text-primary" />
                      Select Required Tests <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableTests.map((test) => (
                        <label
                          key={test}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedTests.includes(test)
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-white border-gray-soft hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(test)}
                            onChange={() => handleTestToggle(test)}
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">{test}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Amount and Document */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Amount Needed (PKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('amountNeeded', {
                      required: 'Amount needed is required',
                      min: { value: 1, message: 'Amount must be at least 1 PKR' }
                    })}
                    className="input-field bg-white"
                    placeholder="e.g., 50000"
                  />
                  {errors.amountNeeded && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.amountNeeded.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Medical Documents <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      id="document-upload"
                      onChange={handleFileChange}
                      required
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all bg-white"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        {documentFileName ? (
                          <p className="text-sm text-gray-700 font-medium">{documentFileName}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Choose file or drag here</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Photo/PDF</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-soft">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Submit Case
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
