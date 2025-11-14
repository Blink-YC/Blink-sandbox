'use client';

import { useState } from 'react';
import { Container } from './Container';
import { Button, BookDemoModal, BlinkLogo } from '@/components/ui';

export function NavigationHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <BlinkLogo size="md" textSize="xl" />
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Features
            </a>
            <a href="#for-employers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              For Employers
            </a>
            <a href="#for-workers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              For Workers
            </a>
          </nav>
          
          {/* Right Side Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              href="/auth/role-select"
              className="text-gray-700 hover:text-gray-900"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </Container>
    </header>

    {/* Book Demo Modal */}
    <BookDemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

