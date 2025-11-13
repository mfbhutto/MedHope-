// Dummy data for testing and demonstration
export interface DummyCase {
  _id: string;
  caseNumber: string;
  priority: 'High' | 'Medium' | 'Low';
  diseaseType?: string;
  diseaseName: string;
  description: string;
  estimatedTotalCost: number;
  isZakatEligible: boolean;
  district: string;
  area: string;
  labTests?: string[];
  requiredItems: Array<{
    name: string;
    type: string;
    quantity: number;
    estimatedCost: number;
  }>;
}

export const dummyCases: DummyCase[] = [
  {
    _id: 'dummy1',
    caseNumber: '0000323',
    priority: 'High',
    diseaseName: 'Diabetes Type 2',
    description: 'Patient requires insulin medication and glucose monitoring supplies for the next 3 months. Family has been struggling financially due to job loss.',
    estimatedTotalCost: 45000,
    isZakatEligible: true,
    district: 'East',
    area: 'Gulshan-e-Iqbal',
    labTests: ['HbA1c', 'Lipid Profile', 'Kidney Function Test'],
    requiredItems: [
      { name: 'Insulin Glargine', type: 'medicine', quantity: 3, estimatedCost: 15000 },
      { name: 'Blood Glucose Strips', type: 'medicine', quantity: 2, estimatedCost: 8000 },
      { name: 'HbA1c Test', type: 'lab_test', quantity: 1, estimatedCost: 22000 },
    ],
  },
  {
    _id: 'dummy2',
    caseNumber: '0000456',
    priority: 'Medium',
    diseaseName: 'Hypertension',
    description: 'Elderly patient needs blood pressure medication for chronic hypertension. Monthly medication required to maintain stable health condition.',
    estimatedTotalCost: 28000,
    isZakatEligible: true,
    district: 'Central',
    area: 'North Nazimabad',
    labTests: ['Blood Pressure Monitoring', 'ECG'],
    requiredItems: [
      { name: 'Amlodipine 5mg', type: 'medicine', quantity: 4, estimatedCost: 12000 },
      { name: 'Lisinopril 10mg', type: 'medicine', quantity: 4, estimatedCost: 16000 },
    ],
  },
  {
    _id: 'dummy3',
    caseNumber: '0000521',
    priority: 'Low',
    diseaseName: 'Asthma',
    description: 'Child with asthma needs inhaler and preventive medication. Family cannot afford regular treatment costs.',
    estimatedTotalCost: 18000,
    isZakatEligible: false,
    district: 'West',
    area: 'Orangi Town',
    labTests: ['Pulmonary Function Test'],
    requiredItems: [
      { name: 'Salbutamol Inhaler', type: 'medicine', quantity: 2, estimatedCost: 8000 },
      { name: 'Budesonide Inhaler', type: 'medicine', quantity: 2, estimatedCost: 10000 },
    ],
  },
  {
    _id: 'dummy4',
    caseNumber: '0000634',
    priority: 'High',
    diseaseName: 'Cancer Treatment',
    description: 'Patient undergoing chemotherapy requires supportive medications to manage side effects and maintain nutrition during treatment.',
    estimatedTotalCost: 75000,
    isZakatEligible: true,
    district: 'South',
    area: 'Clifton',
    labTests: ['Complete Blood Count', 'MRI'],
    requiredItems: [
      { name: 'Ondansetron 4mg', type: 'medicine', quantity: 6, estimatedCost: 18000 },
      { name: 'Folic Acid Supplements', type: 'medicine', quantity: 4, estimatedCost: 12000 },
      { name: 'Complete Blood Count', type: 'lab_test', quantity: 4, estimatedCost: 45000 },
    ],
  },
  {
    _id: 'dummy5',
    caseNumber: '0000712',
    priority: 'Medium',
    diseaseName: 'Heart Disease',
    description: 'Patient with heart condition requires cardiac medications and regular monitoring tests to prevent complications.',
    estimatedTotalCost: 55000,
    isZakatEligible: true,
    district: 'Central',
    area: 'Liaquatabad Town',
    labTests: ['ECG', 'Echocardiogram'],
    requiredItems: [
      { name: 'Atorvastatin 20mg', type: 'medicine', quantity: 3, estimatedCost: 15000 },
      { name: 'Echocardiogram', type: 'lab_test', quantity: 1, estimatedCost: 25000 },
      { name: 'ECG', type: 'lab_test', quantity: 2, estimatedCost: 15000 },
    ],
  },
  {
    _id: 'dummy6',
    caseNumber: '0000823',
    priority: 'High',
    diseaseName: 'Chronic Kidney Disease',
    description: 'Patient with stage 3 CKD needs regular medication and lab tests to monitor kidney function and prevent progression.',
    estimatedTotalCost: 62000,
    isZakatEligible: true,
    district: 'Malir',
    area: 'Malir City',
    labTests: ['Creatinine', 'Blood Urea Nitrogen', 'Urine Analysis'],
    requiredItems: [
      { name: 'ACE Inhibitor', type: 'medicine', quantity: 3, estimatedCost: 18000 },
      { name: 'Creatinine Test', type: 'lab_test', quantity: 3, estimatedCost: 24000 },
      { name: 'Urine Analysis', type: 'lab_test', quantity: 3, estimatedCost: 20000 },
    ],
  },
];

