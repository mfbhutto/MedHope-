'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, CreditCard, Heart, DollarSign, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { getStoredUser } from '@/lib/auth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface DonationModalProps {
  caseItem: any;
  onClose: () => void;
  onSuccess: () => void;
}

const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

function DonationForm({ caseItem, onClose, onSuccess }: DonationModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'jazzcash' | 'easypaisa'>('stripe');
  const [isZakatDonation, setIsZakatDonation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'stripe') {
        if (!stripe || !elements) {
          toast.error('Stripe not loaded');
          setLoading(false);
          return;
        }

        // Create payment intent
        const { data } = await api.post('/donations/create-payment-intent', {
          amount: parseFloat(amount),
          caseId: caseItem._id,
        });

        // Confirm payment
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          toast.error('Card element not found');
          setLoading(false);
          return;
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: cardElement,
            },
          }
        );

        if (error) {
          toast.error(error.message || 'Payment failed');
          setLoading(false);
          return;
        }

        // Get current user (donor)
        const currentUser = getStoredUser();
        if (!currentUser || !currentUser.email) {
          toast.error('Please log in to make a donation');
          setLoading(false);
          return;
        }

        // Create donation record
        console.log('Creating donation with data:', {
          caseId: caseItem._id,
          amount: parseFloat(amount),
          paymentMethod: 'stripe',
          donorEmail: currentUser.email,
        });
        
        console.log('About to call POST /api/donations (Stripe)');
        const donationResponse = await api.post('/donations', {
          caseId: caseItem._id,
          amount: parseFloat(amount),
          paymentMethod: 'stripe',
          paymentId: paymentIntent?.id,
          isZakatDonation,
          donorEmail: currentUser.email,
        }).catch((error) => {
          console.error('API call failed:', error);
          throw error;
        });

        console.log('Donation response received:', donationResponse);
        console.log('Donation response data:', donationResponse.data);
        toast.success('Donation successful!');
        // Small delay to ensure database is updated
        setTimeout(() => {
          onSuccess();
        }, 1000); // Increased delay to 1 second
      } else {
        // Get current user (donor)
        const currentUser = getStoredUser();
        if (!currentUser || !currentUser.email) {
          toast.error('Please log in to make a donation');
          setLoading(false);
          return;
        }

        // For JazzCash and EasyPaisa (sandbox mode - auto complete)
        const paymentId = `test_${Date.now()}`;
        console.log('Creating donation with data:', {
          caseId: caseItem._id,
          amount: parseFloat(amount),
          paymentMethod,
          donorEmail: currentUser.email,
        });
        
        console.log('About to call POST /api/donations');
        const donationResponse = await api.post('/donations', {
          caseId: caseItem._id,
          amount: parseFloat(amount),
          paymentMethod,
          paymentId,
          transactionId: paymentId,
          isZakatDonation,
          donorEmail: currentUser.email,
        }).catch((error) => {
          console.error('API call failed:', error);
          throw error;
        });

        console.log('Donation response received:', donationResponse);
        console.log('Donation response data:', donationResponse.data);
        toast.success('Donation successful!');
        // Small delay to ensure database is updated
        setTimeout(() => {
          onSuccess();
        }, 1000); // Increased delay to 1 second
      }
    } catch (error: any) {
      console.error('=== DONATION ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error data:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Donation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const totalNeeded = caseItem.estimatedTotalCost || 0;
  const donationAmount = parseFloat(amount) || 0;
  const remainingAmount = Math.max(0, totalNeeded - donationAmount);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Donation Amount */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Donation Amount (PKR) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field bg-white text-lg font-semibold pr-12"
            placeholder="Enter amount"
            min="1"
            step="0.01"
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">PKR</span>
        </div>
        
        {/* Quick Amount Buttons */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Quick Select:</p>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAmount(quickAmount)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  amount === quickAmount.toString()
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-secondary text-gray-700 hover:bg-primary/10 hover:text-primary border border-gray-soft'
                }`}
              >
                {quickAmount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {donationAmount > 0 && totalNeeded > 0 && (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-primary">
              {Math.min(100, Math.round((donationAmount / totalNeeded) * 100))}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (donationAmount / totalNeeded) * 100)}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
            />
          </div>
          {remainingAmount > 0 && (
            <p className="text-xs text-gray-600 mt-2">
              <span className="font-semibold">PKR {remainingAmount.toLocaleString()}</span> still needed
            </p>
          )}
          {donationAmount >= totalNeeded && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              This donation will fully cover the case!
            </p>
          )}
        </div>
      )}

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'stripe', label: 'Stripe', icon: '💳' },
            { value: 'jazzcash', label: 'JazzCash', icon: '📱' },
            { value: 'easypaisa', label: 'EasyPaisa', icon: '📱' },
          ].map((method) => (
            <button
              key={method.value}
              type="button"
              onClick={() => setPaymentMethod(method.value as any)}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === method.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-soft bg-white hover:border-primary/50 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-1">{method.icon}</div>
              <div className="text-sm font-semibold">{method.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stripe Card Element */}
      <AnimatePresence>
        {paymentMethod === 'stripe' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-4 rounded-xl border-2 border-primary/20"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-lg p-3 bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zakat Checkbox */}
      {caseItem.isZakatEligible && (
        <div className="bg-gradient-to-br from-accent/5 to-accent/10 p-4 rounded-xl border border-accent/20">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isZakatDonation}
              onChange={(e) => setIsZakatDonation(e.target.checked)}
              className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent"
            />
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-gray-700">This is a Zakat donation</span>
            </div>
          </label>
          <p className="text-xs text-gray-600 mt-2 ml-8">
            Your donation will be allocated to Zakat-eligible cases only
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || (paymentMethod === 'stripe' && !stripe)}
          className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Donate Now
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function DonationModal({ caseItem, onClose, onSuccess }: DonationModalProps) {
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
          className="glass-card max-w-md w-full shadow-large"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-soft">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="heading-md text-dark mb-2">Donate to Case #{caseItem.caseNumber}</h2>
                  <p className="text-sm text-gray-600">Make a difference in someone's life</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-xl bg-gray-soft hover:bg-gray-300 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount Needed */}
            <div className="mb-6 p-5 bg-gradient-to-br from-primary-light/10 via-primary/10 to-primary-light/10 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Amount Needed
                </p>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">
                PKR {caseItem.estimatedTotalCost?.toLocaleString() || '0'}
              </p>
            </div>

            {/* Donation Form */}
            <Elements stripe={stripePromise}>
              <DonationForm caseItem={caseItem} onClose={onClose} onSuccess={onSuccess} />
            </Elements>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
