'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface DonationModalProps {
  caseItem: any;
  onClose: () => void;
  onSuccess: () => void;
}

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

        // Create donation record
        await api.post('/donations', {
          caseId: caseItem._id,
          amount: parseFloat(amount),
          paymentMethod: 'stripe',
          paymentId: paymentIntent?.id,
          isZakatDonation,
        });

        toast.success('Donation successful!');
        onSuccess();
      } else {
        // For JazzCash and EasyPaisa (sandbox mode - auto complete)
        const paymentId = `test_${Date.now()}`;
        await api.post('/donations', {
          caseId: caseItem._id,
          amount: parseFloat(amount),
          paymentMethod,
          paymentId,
          transactionId: paymentId,
          isZakatDonation,
        });

        toast.success('Donation successful!');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Donation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Donation Amount (PKR)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
          placeholder="Enter amount"
          min="1"
          step="0.01"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          className="input-field"
        >
          <option value="stripe">Stripe</option>
          <option value="jazzcash">JazzCash</option>
          <option value="easypaisa">EasyPaisa</option>
        </select>
      </div>

      {paymentMethod === 'stripe' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement />
          </div>
        </div>
      )}

      {caseItem.isZakatEligible && (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isZakatDonation}
            onChange={(e) => setIsZakatDonation(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">This is a Zakat donation</span>
        </label>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading || !stripe}
          className="btn-primary flex-1"
        >
          {loading ? 'Processing...' : 'Donate'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function DonationModal({ caseItem, onClose, onSuccess }: DonationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Donate to Case #{caseItem.caseNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Estimated Cost:</p>
          <p className="text-2xl font-bold text-gray-900">
            PKR {caseItem.estimatedTotalCost.toLocaleString()}
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <DonationForm caseItem={caseItem} onClose={onClose} onSuccess={onSuccess} />
        </Elements>
      </div>
    </div>
  );
}

