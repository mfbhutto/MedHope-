// Donation Model
// Represents a donation made by a donor to a needy person case

export interface Donation {
  _id?: string;
  donorId: string; // Reference to Donor _id
  caseId: string; // Reference to NeedyPerson _id
  amount: number;
  paymentMethod: 'stripe' | 'jazzcash' | 'easypaisa';
  paymentId?: string; // Payment gateway transaction ID
  transactionId?: string; // Additional transaction reference
  isZakatDonation: boolean;
  status: 'pending' | 'completed' | 'failed';
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

