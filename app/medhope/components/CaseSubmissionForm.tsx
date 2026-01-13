'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { karachiDistricts, karachiAreas, diseaseLabTests } from '@/lib/karachiData';

interface CaseSubmissionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CaseSubmissionForm({ onClose, onSuccess }: CaseSubmissionFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [marriedStatus, setMarriedStatus] = useState('');
  const [numChildren, setNumChildren] = useState(0);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [medicineImage, setMedicineImage] = useState<File | null>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [electricityBillFile, setElectricityBillFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Step 1: Personal Info
  const handleStep1 = (data: any) => {
    if (!selectedDistrict || !selectedArea) {
      toast.error('Please select district and area');
      return;
    }
    if (!data.phone) {
      toast.error('Please provide a phone number');
      return;
    }
    setStep(2);
  };

  // Step 2: Financial Info
  const handleStep2 = (data: any) => {
    if (!marriedStatus) {
      toast.error('Please select marital status');
      return;
    }
    if (marriedStatus === 'married' && numChildren > 0 && (!data.firstChildAge || !data.lastChildAge)) {
      toast.error('Please enter children ages');
      return;
    }
    setStep(3);
  };

  // Step 3: Patient Info & Final Submit
  const handleStep3 = async (data: any) => {
    if (!selectedDisease) {
      toast.error('Please enter disease name');
      return;
    }
    if (!medicineImage && !prescriptionFile) {
      toast.error('Please upload medicine image or prescription');
      return;
    }
    if (!electricityBillFile) {
      toast.error('Please upload electricity bill');
      return;
    }
    if (!data.amount || parseFloat(data.amount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }
    
    if (!data.diseaseDate) {
      toast.error('Please select date from which patient is suffering');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Personal Info
      formData.append('patientName', data.patientName);
      formData.append('cnic', data.cnic);
      formData.append('district', selectedDistrict);
      formData.append('area', selectedArea);
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      
      // Financial Info
      formData.append('salary', data.salary || '');
      formData.append('job', data.job || '');
      const jobTypeData = Array.isArray(data.jobType)
        ? data.jobType
        : data.jobType
          ? [data.jobType]
          : [];
      formData.append('jobType', jobTypeData.join(','));
      formData.append('isZakatEligible', data.zakatEligible || 'false');
      formData.append('maritalStatus', marriedStatus);
      formData.append('numChildren', numChildren.toString());
      formData.append('firstChildAge', data.firstChildAge || '');
      formData.append('lastChildAge', data.lastChildAge || '');
      
      // Patient Info
      formData.append('diseaseName', selectedDisease);
      formData.append('diseaseDate', data.diseaseDate);
      formData.append('description', data.description);
      formData.append('amount', data.amount);
      
      // Files
      if (medicineImage) formData.append('medicineImage', medicineImage);
      if (prescriptionFile) formData.append('prescription', prescriptionFile);
      formData.append('electricityBill', electricityBillFile);
      
      // Lab Tests
      if (selectedTests.length > 0) {
        formData.append('labTests', JSON.stringify(selectedTests));
      }

      // Build required items
      const requiredItems = [];
      const totalAmount = parseFloat(data.amount);
      
      if (selectedTests.length > 0 && medicineImage) {
        // Both tests and medicine
        const medicineCost = totalAmount * 0.7;
        const testCost = totalAmount * 0.3 / selectedTests.length;
        requiredItems.push({
          name: 'Medicine',
          type: 'medicine',
          quantity: 1,
          estimatedCost: medicineCost,
        });
        selectedTests.forEach(test => {
          requiredItems.push({
            name: test,
            type: 'lab_test',
            quantity: 1,
            estimatedCost: testCost,
          });
        });
      } else if (selectedTests.length > 0) {
        // Only tests
        const testCost = totalAmount / selectedTests.length;
        selectedTests.forEach(test => {
          requiredItems.push({
            name: test,
            type: 'lab_test',
            quantity: 1,
            estimatedCost: testCost,
          });
        });
      } else if (medicineImage || prescriptionFile) {
        // Only medicine
        requiredItems.push({
          name: 'Medicine',
          type: 'medicine',
          quantity: 1,
          estimatedCost: totalAmount,
        });
      } else {
        // Default
        requiredItems.push({
          name: 'Medical Treatment',
          type: 'medicine',
          quantity: 1,
          estimatedCost: totalAmount,
        });
      }
      
      formData.append('requiredItems', JSON.stringify(requiredItems));

      const response = await api.post('/cases', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Case submitted successfully!');
      reset();
      setStep(1);
      setSelectedDistrict('');
      setSelectedArea('');
      setMarriedStatus('');
      setNumChildren(0);
      setSelectedDisease('');
      setSelectedTests([]);
      setMedicineImage(null);
      setPrescriptionFile(null);
      setElectricityBillFile(null);
      onSuccess();
    } catch (error: any) {
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

  useEffect(() => {
    setSelectedTests([]);
  }, [selectedDisease]);

  const normalizedDiseaseKey = Object.keys(diseaseLabTests).find(
    key => key.toLowerCase() === selectedDisease.trim().toLowerCase()
  );
  const availableTests = normalizedDiseaseKey
    ? diseaseLabTests[normalizedDiseaseKey]
    : diseaseLabTests['General'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-large">
        <div className="p-6 md:p-8">
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all ${
                step >= 1 
                  ? 'bg-gradient-primary text-white shadow-soft' 
                  : 'bg-gray-soft text-gray-400'
              }`}>
                1
              </div>
              <div className={`h-1 w-12 ${step >= 2 ? 'bg-gradient-primary' : 'bg-gray-soft'} rounded-full transition-all`}></div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all ${
                step >= 2 
                  ? 'bg-gradient-primary text-white shadow-soft' 
                  : 'bg-gray-soft text-gray-400'
              }`}>
                2
              </div>
              <div className={`h-1 w-12 ${step >= 3 ? 'bg-gradient-primary' : 'bg-gray-soft'} rounded-full transition-all`}></div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-all ${
                step >= 3 
                  ? 'bg-gradient-primary text-white shadow-soft' 
                  : 'bg-gray-soft text-gray-400'
              }`}>
                3
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-xl bg-gray-soft hover:bg-gray-300 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <form onSubmit={handleSubmit(handleStep1)} className="space-y-6">
              <h2 className="heading-md text-primary mb-6">Step 1: Personal Information</h2>
              
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                  <input
                    type="text"
                    {...register('patientName', { required: 'Patient name is required' })}
                    className="input-field"
                    placeholder="Full Name"
                  />
                  {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Number *</label>
                  <input
                    type="text"
                    {...register('cnic', { required: 'CNIC is required' })}
                    className="input-field"
                    placeholder="42101-1234567-8"
                  />
                  {errors.cnic && <p className="text-red-500 text-sm mt-1">{errors.cnic.message as string}</p>}
                </div>
              </div>

              {/* Row 2: Phone and District */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone is required' })}
                    className="input-field"
                    placeholder="+92 300 1234567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedArea('');
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">Select District</option>
                    {karachiDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="input-field"
                    required
                    disabled={!selectedDistrict}
                  >
                    <option value="">Select Area</option>
                    {selectedDistrict && karachiAreas[selectedDistrict]?.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  {...register('address', { required: 'Address is required' })}
                  className="input-field"
                  rows={3}
                  placeholder="House/Street details"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message as string}</p>}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Save and Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Financial Information */}
          {step === 2 && (
            <form onSubmit={handleSubmit(handleStep2)} className="space-y-6">
              <h2 className="heading-md text-primary mb-6">Step 2: Financial Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary (PKR)</label>
                  <input
                    type="number"
                    {...register('salary')}
                    className="input-field"
                    placeholder="Monthly salary"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job</label>
                  <input
                    type="text"
                    {...register('job')}
                    className="input-field"
                    placeholder="Job title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('jobType')}
                      value="government"
                      className="rounded"
                    />
                    <span>Government</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register('jobType')}
                      value="private"
                      className="rounded"
                    />
                    <span>Private</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zakat Eligible *</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      {...register('zakatEligible', { required: true })}
                      value="true"
                      className="rounded"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      {...register('zakatEligible', { required: true })}
                      value="false"
                      className="rounded"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status *</label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="maritalStatus"
                      value="married"
                      checked={marriedStatus === 'married'}
                      onChange={(e) => {
                        setMarriedStatus(e.target.value);
                      }}
                      className="rounded"
                    />
                    <span>Married</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="maritalStatus"
                      value="unmarried"
                      checked={marriedStatus === 'unmarried'}
                      onChange={(e) => {
                        setMarriedStatus(e.target.value);
                        setNumChildren(0);
                      }}
                      className="rounded"
                    />
                    <span>Unmarried</span>
                  </label>
                </div>
              </div>

              {marriedStatus === 'married' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Children</label>
                    <input
                      type="number"
                      value={numChildren}
                      onChange={(e) => setNumChildren(parseInt(e.target.value) || 0)}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  {numChildren > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Child Age</label>
                        <input
                          type="number"
                          {...register('firstChildAge')}
                          className="input-field"
                          placeholder="Age"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Child Age</label>
                        <input
                          type="number"
                          {...register('lastChildAge')}
                          className="input-field"
                          placeholder="Age"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Save and Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Patient Information */}
          {step === 3 && (
            <form onSubmit={handleSubmit(handleStep3)} className="space-y-6">
              <h2 className="heading-md text-primary mb-6">Step 3: Patient Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disease Name *</label>
                  <input
                    type="text"
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Diabetes, Hypertension"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date From (Suffering Since) *</label>
                  <input
                    type="date"
                    {...register('diseaseDate', { required: 'Date is required' })}
                    className="input-field"
                    required
                  />
                  {errors.diseaseDate && <p className="text-red-500 text-sm mt-1">{errors.diseaseDate.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  className="input-field"
                  rows={4}
                  placeholder="Describe the patient's condition and medical needs"
                  required
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMedicineImage(e.target.files?.[0] || null)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prescription (Image)</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
                    className="input-field"
                  />
                </div>
              </div>

              {selectedDisease && availableTests.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Related Lab Tests (Select if needed)</label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {availableTests.map(test => (
                        <label key={test} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedTests.includes(test)}
                            onChange={() => handleTestToggle(test)}
                            className="rounded"
                          />
                          <span className="text-sm">{test}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Electricity Bill (Image) *</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => setElectricityBillFile(e.target.files?.[0] || null)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount Required (PKR) *</label>
                <input
                  type="number"
                  {...register('amount', { required: 'Amount is required', min: 1 })}
                  className="input-field"
                  placeholder="Enter total amount"
                  min="1"
                  step="0.01"
                  required
                />
                {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message as string}</p>}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Submitting...' : 'Submit Case'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
