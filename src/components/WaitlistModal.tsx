'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleClose = () => {
    onClose();
    // Reset state after modal is closed
    setTimeout(() => {
      setSuccess(false);
      setError('');
      setPhoneError('');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        notes: '',
      });
    }, 300); // Small delay to ensure smooth closing animation
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone || phone.trim() === '') return true; // Allow empty
    
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it has 10-15 digits (international format)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return false;
    }
    
    // Basic pattern check: allows formats like +1-234-567-8900, (123) 456-7890, 123.456.7890, etc.
    const phonePattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,6}$/;
    return phonePattern.test(phone);
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });
    
    // Validate as user types (only if they've entered something)
    if (value && value.trim() !== '') {
      if (!validatePhoneNumber(value)) {
        setPhoneError('Please enter a valid phone number');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate phone number if provided
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setError('Please enter a valid phone number or leave it blank.');
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Get user agent and IP (IP will be null on client-side, but that's okay)
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null;
      
      const { error: submitError } = await supabase
        .from('waitlist_submissions')
        .insert({
          name: formData.name || null,
          email: formData.email,
          phone: formData.phone || null,
          role: formData.role || null,
          source: 'landing_page',
          notes: formData.notes || null,
          user_agent: userAgent,
        });

      if (submitError) {
        if (submitError.code === '23505') {
          setError('You have already joined the waitlist with this email and role.');
        } else {
          setError('Failed to submit. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setIsSubmitting(false);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Join the Waitlist</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          {success ? (
            <div className="py-8 text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <p className="text-lg font-semibold text-gray-900">Thank you for joining!</p>
              <p className="text-gray-600 mt-2">We&apos;ll send you an email when we launch.</p>
              <button
                onClick={handleClose}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    phoneError 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  I&apos;m interested as a...
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a role</option>
                  <option value="customer">Customer (Need something fixed)</option>
                  <option value="worker">Worker (Looking for work)</option>
                  <option value="business">Business (Need workers)</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us more about your needs..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

