'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { diseaseLabTests } from '@/lib/karachiData';
import { X, FileText, Hospital, User, DollarSign, Upload, CheckCircle2, AlertCircle, Heart, TestTube, Pill, Stethoscope } from 'lucide-react';

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

const medicineDiseases = [
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
  'Infections',
  'Fractures',
  'Surgery Required',
  'Cancer Treatment',
  'Accident Recovery',
  'Pregnancy Complications',
  'Child Illness',
  'Fever',
  'Cough & Cold',
  'Gastrointestinal Issues',
  'Skin Conditions',
  'Eye Problems',
  'Dental Issues',
  'Other',
];

export default function NewCaseForm({ onClose, onSuccess, userProfile }: NewCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [caseType, setCaseType] = useState<'medicine' | 'test' | ''>('');
  const [diseaseType, setDiseaseType] = useState<'chronic' | 'other' | ''>('');
  const [chronicDisease, setChronicDisease] = useState('');
  const [otherDisease, setOtherDisease] = useState('');
  const [manualDisease, setManualDisease] = useState('');
  const [medicineDisease, setMedicineDisease] = useState('');
  const [medicineManualDisease, setMedicineManualDisease] = useState('');
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
    // Validate case type selection
    if (!caseType) {
      toast.error('Please select case type (Medicine or Test)');
      return;
    }

    // Validation for Test type
    if (caseType === 'test') {
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

      if (selectedTests.length === 0) {
        toast.error('Please select at least one test');
        return;
      }
    }

    // Validation for Medicine type
    if (caseType === 'medicine') {
      if (!medicineDisease) {
        toast.error('Please select or enter a disease');
        return;
      }

      if (medicineDisease === 'Other' && !medicineManualDisease) {
        toast.error('Please specify the disease');
        return;
      }

      if (!data.description) {
        toast.error('Please provide a description');
        return;
      }

      if (!data.hospitalName) {
        toast.error('Please enter hospital name');
        return;
      }

      if (!data.doctorName) {
        toast.error('Please enter doctor name');
        return;
      }

      if (!data.amountNeeded || parseFloat(data.amountNeeded) <= 0) {
        toast.error('Please enter a valid amount needed');
        return;
      }
    }

    // Validate document
    if (!documentFile) {
      toast.error('Please upload medical document');
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

      // Case type
      formData.append('caseType', caseType);
      
      // New disease information
      if (caseType === 'test') {
        formData.append('diseaseType', diseaseType);
        if (diseaseType === 'chronic') {
          formData.append('chronicDisease', chronicDisease);
        } else {
          formData.append('otherDisease', otherDisease === 'Other' ? 'Other' : otherDisease);
          if (otherDisease === 'Other') {
            formData.append('manualDisease', manualDisease);
          }
        }
        formData.append('testNeeded', 'true');
        if (selectedTests.length > 0) {
          formData.append('selectedTests', JSON.stringify(selectedTests));
        }
        // For test cases, description is optional but can include notes
        formData.append('description', data.description || 'Test request');
        // Hospital and doctor for test cases (can be lab/clinic)
        formData.append('hospitalName', data.hospitalName || 'Not specified');
        formData.append('doctorName', data.doctorName || 'Not specified');
        // Amount for tests
        formData.append('amountNeeded', data.amountNeeded || '0');
      } else {
        // Medicine type
        formData.append('diseaseType', 'medicine'); // Special type for medicine
        formData.append('medicineDisease', medicineDisease === 'Other' ? 'Other' : medicineDisease);
        if (medicineDisease === 'Other') {
          formData.append('medicineManualDisease', medicineManualDisease);
        }
        formData.append('testNeeded', 'false');
        formData.append('description', data.description);
        formData.append('hospitalName', data.hospitalName);
        formData.append('doctorName', data.doctorName);
        formData.append('amountNeeded', data.amountNeeded);
      }

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

  // Test options including Ultrasound and X-ray
  const testOptions = [
    'Ultrasound',
    'X-Ray',
    ...(selectedDiseaseName 
      ? (diseaseLabTests[getTestCategory(selectedDiseaseName)] || diseaseLabTests['General'] || [])
      : (diseaseLabTests['General'] || [])
    )
  ];
  
  // Remove duplicates from test options
  const uniqueTestOptions = Array.from(new Set(testOptions));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="glass-card max-w-3xl w-full mx-4 my-4 md:my-8 shadow-large max-h-[95vh] md:max-h-[90vh] overflow-y-auto rounded-xl md:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-soft">
              <div className="flex items-start gap-3 md:gap-4 flex-1">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="heading-md text-dark mb-1 md:mb-2 text-base sm:text-lg md:text-xl">Submit New Case</h2>
                  <p className="text-gray-600 text-xs sm:text-sm">Add a new medical case using your existing profile information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 sm:w-10 sm:h-10 rounded-xl bg-gray-soft hover:bg-gray-300 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all hover:scale-110 flex-shrink-0 self-end sm:self-start"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSubmitCase)} className="space-y-4 sm:space-y-6">
              {/* Case Type Selection */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-6 rounded-xl border border-primary/20">
                <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary flex-shrink-0" />
                  Case Type <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all flex-1 ${
                    caseType === 'medicine'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-gray-soft hover:border-primary/50'
                  }`}>
                    <input
                      type="radio"
                      name="caseType"
                      value="medicine"
                      checked={caseType === 'medicine'}
                      onChange={(e) => {
                        setCaseType('medicine');
                        setDiseaseType('');
                        setChronicDisease('');
                        setOtherDisease('');
                        setManualDisease('');
                        setMedicineDisease('');
                        setMedicineManualDisease('');
                        setSelectedTests([]);
                      }}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <Pill className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Medicine</span>
                        <p className="text-xs text-gray-600 mt-0.5">Request for medicines and treatment</p>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all flex-1 ${
                    caseType === 'test'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-gray-soft hover:border-primary/50'
                  }`}>
                    <input
                      type="radio"
                      name="caseType"
                      value="test"
                      checked={caseType === 'test'}
                      onChange={(e) => {
                        setCaseType('test');
                        setSelectedTests([]);
                      }}
                      className="w-5 h-5 text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <TestTube className="w-5 h-5" />
                      <div>
                        <span className="font-semibold">Test</span>
                        <p className="text-xs text-gray-600 mt-0.5">Request for lab tests and diagnostics</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Test Type Fields - Only shown when Test is selected */}
              <AnimatePresence>
                {caseType === 'test' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Disease Type Section for Tests */}
                    <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-4 sm:p-6 rounded-xl border border-accent/20">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-accent flex-shrink-0" />
                        Disease Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={diseaseType}
                        onChange={(e) => {
                          setDiseaseType(e.target.value as 'chronic' | 'other' | '');
                          setChronicDisease('');
                          setOtherDisease('');
                          setManualDisease('');
                          setSelectedTests([]);
                        }}
                        className="input-field bg-white w-full text-sm sm:text-base"
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
                    className="bg-gradient-to-br from-accent/5 to-accent/10 p-4 sm:p-6 rounded-xl border border-accent/20"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      Chronic Disease <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={chronicDisease}
                      onChange={(e) => setChronicDisease(e.target.value)}
                      className="input-field bg-white w-full text-sm sm:text-base"
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
                    className="bg-gradient-to-br from-accent/5 to-accent/10 p-4 sm:p-6 rounded-xl border border-accent/20"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      Other Disease <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={otherDisease}
                      onChange={(e) => setOtherDisease(e.target.value)}
                      className="input-field bg-white w-full text-sm sm:text-base"
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
                          className="input-field bg-white w-full mt-3 text-sm sm:text-base"
                          placeholder="Specify disease manually"
                          required
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Test Selection - Only shown when disease is selected */}
                    {selectedDiseaseName && (
                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-6 rounded-xl border border-primary/20">
                        <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <TestTube className="w-5 h-5 text-primary flex-shrink-0" />
                          Select Required Tests <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {uniqueTestOptions.map((test) => (
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
                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary flex-shrink-0"
                              />
                              <span className="text-sm text-gray-700 break-words">{test}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description for tests - Optional */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        {...register('description')}
                        className="input-field bg-white w-full min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                        rows={4}
                        placeholder="Any additional information about the test request..."
                      />
                    </div>

                    {/* Hospital and Doctor for tests - Optional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Hospital className="w-5 h-5 text-primary flex-shrink-0" />
                          Lab/Clinic Name (Optional)
                        </label>
                        <input
                          type="text"
                          {...register('hospitalName')}
                          className="input-field bg-white w-full text-sm sm:text-base"
                          placeholder="e.g., Chughtai Lab"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <User className="w-5 h-5 text-primary flex-shrink-0" />
                          Doctor's Name (Optional)
                        </label>
                        <input
                          type="text"
                          {...register('doctorName')}
                          className="input-field bg-white w-full text-sm sm:text-base"
                          placeholder="e.g., Dr. Ali Khan"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Medicine Type Fields - Only shown when Medicine is selected */}
              <AnimatePresence>
                {caseType === 'medicine' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Disease Selection for Medicine */}
                    <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-4 sm:p-6 rounded-xl border border-accent/20">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                        Disease <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={medicineDisease}
                        onChange={(e) => setMedicineDisease(e.target.value)}
                        className="input-field bg-white w-full text-sm sm:text-base"
                        required
                      >
                        <option value="">Select Disease</option>
                        {medicineDiseases.map((disease) => (
                          <option key={disease} value={disease}>
                            {disease}
                          </option>
                        ))}
                      </select>
                      <AnimatePresence>
                        {medicineDisease === 'Other' && (
                          <motion.input
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            type="text"
                            value={medicineManualDisease}
                            onChange={(e) => setMedicineManualDisease(e.target.value)}
                            className="input-field bg-white w-full mt-3 text-sm sm:text-base"
                            placeholder="Specify disease manually"
                            required
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                        Describe your condition <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register('description', { required: 'Description is required' })}
                        className="input-field bg-white w-full min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                        rows={4}
                        placeholder="Briefly describe your medical condition and how MedHope can help..."
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {errors.description.message as string}
                        </p>
                      )}
                    </div>

                    {/* Hospital and Doctor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Hospital className="w-5 h-5 text-primary flex-shrink-0" />
                          Hospital Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('hospitalName', { required: 'Hospital name is required' })}
                          className="input-field bg-white w-full text-sm sm:text-base"
                          placeholder="e.g., Aga Khan Hospital"
                        />
                        {errors.hospitalName && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            {errors.hospitalName.message as string}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <User className="w-5 h-5 text-primary flex-shrink-0" />
                          Doctor's Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('doctorName', { required: 'Doctor\'s name is required' })}
                          className="input-field bg-white w-full text-sm sm:text-base"
                          placeholder="e.g., Dr. Ali Khan"
                        />
                        {errors.doctorName && (
                          <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            {errors.doctorName.message as string}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Amount and Document - Shown for both types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
                    Amount Needed (PKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('amountNeeded', {
                      required: 'Amount needed is required',
                      min: { value: 1, message: 'Amount must be at least 1 PKR' }
                    })}
                    className="input-field bg-white w-full text-sm sm:text-base"
                    placeholder="e.g., 50000"
                  />
                  {errors.amountNeeded && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.amountNeeded.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary flex-shrink-0" />
                    Medical Documents <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      id="document-upload"
                      onChange={handleFileChange}
                      required
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all bg-white"
                    >
                      <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {documentFileName ? (
                          <p className="text-sm text-gray-700 font-medium break-words truncate">{documentFileName}</p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            {caseType === 'test' ? 'Upload test prescription/requisition' : 'Choose file or drag here'}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG formats only</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-soft">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 btn-secondary order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
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
