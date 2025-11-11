'use client';

import { useState } from 'react';
import { Container } from './Container';
import { Card, IconContainer, Button, BookDemoModal } from '@/components/ui';

export function ForEmployersWorkersSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="py-20 bg-white">
        <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Employers */}
          <div id="for-employers" className="bg-gradient-to-br from-blue-600/5 to-blue-600/10 border-2 border-blue-600/20 hover:border-blue-600/40 rounded-2xl p-10 transition-all shadow-sm">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 text-gray-900">For Employers</h2>
            <p className="text-gray-600 mb-8 text-lg">
                Stop wasting time with unqualified applicants. Find vetted, reliable blue-collar workers who show up and get the job done right.
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-blue-600/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700">Post jobs in under 2 minutes</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-blue-600/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700">Access to pre-screened, verified candidates</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-blue-600/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700">Hire 10x faster than traditional methods</span>
              </li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-lg"
              >
                Book a Demo
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a 
                href="#how-it-works"
                className="inline-flex items-center justify-center border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors text-lg"
              >
                Get Started Free
              </a>
            </div>
          </div>
          
          {/* For Workers */}
          <div id="for-workers" className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-2 border-orange-500/20 hover:border-orange-500/40 rounded-2xl p-10 transition-all shadow-sm">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 text-gray-900">For Workers</h2>
            <p className="text-gray-600 mb-8 text-lg">
                Find steady, well-paying work that matches your skills. Build your reputation and take control of your career.
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-orange-500 text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700">Apply to jobs with one tap</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-orange-500 text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700">Get matched to local opportunities instantly</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-orange-500 text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700">Build your digital portfolio and reputation</span>
              </li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={`/auth/sign-up?next=${encodeURIComponent('/onboarding?role=worker')}`}
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-lg"
              >
                Get Started
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a 
                href="#how-it-works"
                className="inline-flex items-center justify-center border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg transition-colors text-lg"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>

    {/* Book Demo Modal */}
    <BookDemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

