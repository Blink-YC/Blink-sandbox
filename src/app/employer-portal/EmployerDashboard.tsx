'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BlinkLogo } from '@/components/ui';

type Job = {
  id: string;
  title: string;
  location: string;
  pay_rate: number;
  posted_at: string;
  skills_required: string[];
  match_count: number;
};

export default function EmployerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('ABC Construction');
  const [activeTab, setActiveTab] = useState<'active' | 'matched' | 'filled'>('active');
  const [jobs, setJobs] = useState<Job[]>([]);

  // Mock data for demo (replace with actual Supabase queries later)
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Electrician Helper',
      location: 'Phoenix, AZ',
      pay_rate: 28,
      posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      skills_required: ['Electrical wiring', 'OSHA-10 Certified'],
      match_count: 5,
    },
    {
      id: '2',
      title: 'Warehouse Associate',
      location: 'Arlington, TX',
      pay_rate: 22,
      posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      skills_required: ['Forklift Operation', 'Inventory Management'],
      match_count: 8,
    },
  ];

  const stats = {
    activeJobs: 2,
    totalMatches: 13,
    filledJobs: 2,
    avgTimeToHire: '2.3 days',
  };

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        router.push('/auth/sign-in');
        return;
      }

      // Fetch business profile
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('company_name')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (profile?.company_name) {
        setCompanyName(profile.company_name);
      }

      // For now, use mock data
      setJobs(mockJobs);
      setLoading(false);
    }

    loadData();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  function formatTimeAgo(timestamp: string): string {
    const now = Date.now();
    const posted = new Date(timestamp).getTime();
    const diffHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Posted less than 1 hour ago';
    if (diffHours === 1) return 'Posted 1 hour ago';
    if (diffHours < 24) return `Posted ${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <BlinkLogo size="md" textSize="xl" />
            
            <div className="flex items-center gap-4">
              <button className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Messages
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Employer Dashboard</h1>
            <p className="text-gray-600">{companyName}</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Post a Job
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Jobs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Matches */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMatches}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filled Jobs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Filled Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.filledJobs}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Avg Time to Hire */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Avg. Time to Hire</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgTimeToHire}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-lg p-1 inline-flex mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Jobs
          </button>
          <button
            onClick={() => setActiveTab('matched')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'matched'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Matched Candidates
          </button>
          <button
            onClick={() => setActiveTab('filled')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'filled'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Filled Jobs
          </button>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {job.match_count} matches
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>${job.pay_rate}/hour</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatTimeAgo(job.posted_at)}</span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills:</p>
                    <div className="flex gap-2">
                      {job.skills_required.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
                  View Candidates
                </button>
                <button className="border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Messages
                </button>
                <button className="border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors">
                  Edit Job
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

