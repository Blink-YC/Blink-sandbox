'use client';

import { useState } from 'react';
import { Container } from './Container';
import { SectionHeader, StepCard } from '@/components/ui';

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'employers' | 'workers'>('employers');

  return (
    <section id="how-it-works" className="pt-20 pb-10 bg-white">
      <Container>
        <SectionHeader
          title="How It Works"
          description="Simple, fast, and effective. Get started in minutes."
          className="mb-12"
        />
        
        {/* Tabs */}
        <div className="flex justify-center mb-20">
          <div className="inline-flex bg-gray-100/50 rounded-full p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('employers')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeTab === 'employers'
                  ? 'bg-blue-600/10 text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For Employers
            </button>
            <button
              onClick={() => setActiveTab('workers')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeTab === 'workers'
                  ? 'bg-orange-500/10 text-orange-500 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For Workers
            </button>
          </div>
        </div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[320px]">
          {activeTab === 'employers' ? (
            <>
              <StepCard
                variant="primary-light"
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="Create Your Profile"
                description="Sign up and tell us about your company and hiring needs in minutes."
              />
              
              <StepCard
                variant="primary-light"
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                title="Post Jobs & Find Talent"
                description="Post jobs and browse pre-verified workers matched to your requirements."
              />
              
              <StepCard
                variant="primary-light"
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
                title="Connect & Interview"
                description="Chat directly with candidates and schedule interviews seamlessly."
              />
              
              <StepCard
                variant="primary-light"
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title="Hire & Track"
                description="Make offers and track lives with built-in onboarding tools."
              />
            </>
          ) : (
            <>
              <StepCard
                variant="accent-light"
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                title="Build Your Profile"
                description="Create a profile showcasing your skills, certifications, and experience."
              />
              
              <StepCard
                variant="accent-light"
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Get Matched"
                description="Our algorithm finds you the best job and with employers instantly."
              />
              
              <StepCard
                variant="accent-light"
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                }
                title="Apply & Connect"
                description="Apply with one tap and chat with employers directly."
              />
              
              <StepCard
                variant="accent-light"
                icon={
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                }
                title="Get Hired"
                description="Accept offers and build your reputation with every job."
              />
            </>
          )}
        </div>
      </Container>
    </section>
  );
}

