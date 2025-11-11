'use client';

import { Modal } from './Modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title = "Request Received!",
  message = "Thank you for your interest. We'll reach out to you shortly to schedule your demo."
}: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full">
      <div className="p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </Modal>
  );
}

