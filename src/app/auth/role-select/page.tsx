'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlinkLogo } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function RoleSelectPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };
    checkAuth();
  }, []);

  const handleRoleSelect = async (role: 'employer' | 'worker') => {
    const businessRole = role === 'employer' ? 'business' : 'worker';
    
    if (isAuthenticated) {
      // If authenticated, check if role already exists
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (user) {
        // Check if user already has this role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', businessRole)
          .maybeSingle();

        if (existingRole) {
          // Role already exists - check the stage
          if (existingRole.stage === 'profile_done') {
            // User already completed onboarding, go to portal
            const portalUrl = businessRole === 'business' 
              ? '/employer-portal' 
              : businessRole === 'worker' 
              ? '/worker-portal' 
              : '/portal';
            router.push(portalUrl);
            return;
          } else {
            // User has role but hasn't completed, go to onboarding
            router.push(`/onboarding?role=${businessRole}`);
            return;
          }
        } else {
          // Create new user_roles entry ONLY if it doesn't exist
          await supabase.from('user_roles').insert({
            user_id: user.id,
            role: businessRole,
            stage: 'enabled',
            enabled_at: new Date().toISOString(),
          });
          router.push(`/onboarding?role=${businessRole}`);
          return;
        }
      }

      router.push(`/onboarding?role=${businessRole}`);
    } else {
      // If not authenticated, go to sign-in with role parameter
      router.push(`/auth/sign-in?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <BlinkLogo size="lg" rounded="lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome to Blink</h1>
        <p className="text-base text-gray-600">Choose your account type to continue</p>
      </div>

      {/* Role Selection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl w-full">
        {/* Employer Card */}
        <button
          onClick={() => handleRoleSelect('employer')}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group text-left"
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">I&apos;m an Employer</h2>
          <p className="text-sm text-gray-600 text-center mb-6">Post jobs and find qualified workers</p>

          {/* Features List */}
          <ul className="space-y-2.5 mb-6 flex-grow">
            <li className="flex items-start text-sm text-gray-700">
              <span className="text-blue-600 mr-2 text-xl font-bold leading-none">•</span>
              <span>Post jobs in minutes</span>
            </li>
            <li className="flex items-start text-sm text-gray-700">
              <span className="text-blue-600 mr-2 text-xl font-bold leading-none">•</span>
              <span>View matched candidates</span>
            </li>
            <li className="flex items-start text-sm text-gray-700">
              <span className="text-blue-600 mr-2 text-xl font-bold leading-none">•</span>
              <span>Direct messaging with workers</span>
            </li>
            <li className="flex items-start text-sm text-gray-700">
              <span className="text-blue-600 mr-2 text-xl font-bold leading-none">•</span>
              <span>Track active and filled positions</span>
            </li>
          </ul>

          {/* Button */}
          <div className="w-full bg-blue-600 group-hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-center text-sm">
            Continue as Employer
          </div>
        </button>

        {/* Worker Card */}
        <button
          onClick={() => handleRoleSelect('worker')}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group text-left"
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">I&apos;m a Worker</h2>
          <p className="text-sm text-gray-600 text-center mb-6">Find jobs that match your skills</p>

          {/* Features List */}
          <ul className="space-y-2.5 mb-6 flex-grow">
            <li className="flex items-start text-sm text-gray-700">
              <span className="text-orange-500 mr-2 text-xl font-bold leading-none">•</span>
              <span>Create skill-based profile</span>
            </li>
            <li className="flex items-start text-sm text-gray-700">
              <span className="text-orange-500 mr-2 text-xl font-bold leading-none">•</span>
              <span>Get matched with local jobs</span>
            </li>
            <li className="flex items-start text-sm text-gray-700">
              <span className="text-orange-500 mr-2 text-xl font-bold leading-none">•</span>
              <span>Apply with one tap</span>
            </li>
            <li className="flex items-start text-sm text-gray-700">
              <span className="text-orange-500 mr-2 text-xl font-bold leading-none">•</span>
              <span>Build your reputation</span>
            </li>
          </ul>

          {/* Button */}
          <div className="w-full bg-orange-500 group-hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors text-center text-sm">
            Continue as Worker
          </div>
        </button>
      </div>

      {/* Helper Text */}
      {!isAuthenticated && (
        <p className="text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up here
          </Link>
        </p>
      )}

      {/* Help Button */}
      {/* <button
        className="fixed bottom-8 right-8 w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        aria-label="Help"
      >
        <span className="text-xl">?</span>
      </button> */}
    </div>
  );
}

