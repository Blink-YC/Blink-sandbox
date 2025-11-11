'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { SuccessModal } from './SuccessModal';
import { createClient } from '@/lib/supabase/client';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    industry: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Insert demo request into Supabase
      const { error: insertError } = await supabase
        .from('demo_requests')
        .insert({
          company_name: formData.companyName,
          contact_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          industry: formData.industry,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error submitting demo request:', insertError);
        setError('Failed to submit request. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success! Close form modal and show success modal
      onClose();
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        companyName: '',
        name: '',
        email: '',
        phone: '',
        industry: '',
      });
    } catch (err) {
      console.error('Error submitting demo request:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl w-full max-h-[95vh] overflow-y-auto">
      <div className="flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Image */}
        <div className="hidden md:block md:w-1/2 relative overflow-hidden rounded-l-2xl">
          <img
            src="/images/demo-image.jpeg"
            alt="Business meeting"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 lg:p-8 relative flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book a Demo</h2>
            <p className="text-base text-gray-600">
              See how Blink can help you find reliable workers faster.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="ABC Construction"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Your Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@abcconstruction.com"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Industry */}
              <div>
                <label htmlFor="industry" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all appearance-none cursor-pointer text-sm"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                <option value="">Select your industry</option>
                <option value="construction">Construction</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="transportation">Transportation & Logistics</option>
                <option value="hospitality">Hospitality</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail</option>
                <option value="warehouse">Warehouse & Distribution</option>
                  <option value="facilities">Facilities Management</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center mt-auto"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Request Demo'
              )}
            </button>
          </form>
        </div>
      </div>
    </Modal>

    {/* Success Modal */}
    <SuccessModal 
      isOpen={showSuccess} 
      onClose={handleSuccessClose}
      title="Request Received!"
      message="Thank you for your interest in Blink. We'll reach out to you shortly to schedule your personalized demo."
    />
    </>
  );
}

