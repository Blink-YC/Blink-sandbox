'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BlinkLogo } from '@/components/ui';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  pay_rate: number;
  posted_at: string;
  match_score: number;
};

export default function WorkerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'applied' | 'active'>('available');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workerProfile, setWorkerProfile] = useState({
    initials: 'JS',
    name: 'John Smith',
    location: 'Dallas, TX',
    reliabilityScore: 4.7,
    jobsCompleted: 12,
    skills: ['Forklift Operation', 'Inventory Management', 'Warehouse Safety'],
    badges: ['Top Rated', 'Quick Responder', 'OSHA Certified'],
    profileCompleteness: 85,
  });

  // Mock data for demo (replace with actual Supabase queries later)
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Warehouse Associate',
      company: 'ABC Logistics',
      location: 'Arlington, TX (12 miles)',
      pay_rate: 22,
      posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      match_score: 95,
    },
  ];


  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user) {
        router.push('/auth/sign-in');
        return;
      }

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, city')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      // Fetch worker profile data
      const { data: workerProfileData } = await supabase
        .from('worker_profiles')
        .select('trades, years_experience_range, rate_cents, job_type_preference, travel_radius, availability')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      // Update worker profile state with real data
      if (profile || workerProfileData) {
        const initials = profile?.full_name 
          ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
          : 'JS';
        
        setWorkerProfile({
          initials,
          name: profile?.full_name || 'John Smith',
          location: profile?.city || 'Dallas, TX',
          reliabilityScore: 4.7, // TODO: Calculate from reviews
          jobsCompleted: 12, // TODO: Get from job history
          skills: Array.isArray(workerProfileData?.trades) ? workerProfileData.trades : ['Forklift Operation', 'Inventory Management', 'Warehouse Safety'],
          badges: ['Top Rated', 'Quick Responder', 'OSHA Certified'], // TODO: Calculate from achievements
          profileCompleteness: calculateProfileCompleteness(profile, workerProfileData),
        });
      }

      // For now, use mock data for jobs
      setJobs(mockJobs);
      setLoading(false);
    }

    loadData();
  }, [router]);

  function calculateProfileCompleteness(profile: {full_name?: string, phone?: string, city?: string} | null, workerProfile: {trades?: string[], years_experience_range?: string, rate_cents?: number, job_type_preference?: string, travel_radius?: string, availability?: string} | null): number {
    let completeness = 0;
    const fields = [
      profile?.full_name,
      profile?.phone,
      profile?.city,
      workerProfile?.trades && workerProfile.trades.length > 0,
      workerProfile?.years_experience_range,
      workerProfile?.rate_cents,
      workerProfile?.job_type_preference,
      workerProfile?.travel_radius,
      workerProfile?.availability,
    ];
    
    const filledFields = fields.filter(Boolean).length;
    completeness = Math.round((filledFields / fields.length) * 100);
    
    return completeness;
  }

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
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-indigo-700">{workerProfile.initials}</span>
              </div>

              {/* Profile Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{workerProfile.name}</h2>
                
                {/* Location, Score, Jobs */}
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{workerProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-900">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-sm font-semibold">{workerProfile.reliabilityScore} Reliability Score</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{workerProfile.jobsCompleted} Jobs Completed</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {workerProfile.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {workerProfile.badges.map((badge) => (
                    <span key={badge} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Profile Completeness */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Profile Completeness</span>
              <span className="text-sm font-bold text-gray-900">{workerProfile.profileCompleteness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all" 
                style={{ width: `${workerProfile.profileCompleteness}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Add certifications to reach 100%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-lg p-1 inline-flex mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-2 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'available'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Available Jobs
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`px-6 py-2 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'applied'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Applications
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'active'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Jobs
          </button>
          <button
            className="px-6 py-2 rounded-md font-medium transition-colors text-sm text-gray-600 hover:text-gray-900"
          >
            Completed Jobs
          </button>
        </div>

        {/* Jobs Section Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Jobs Matched to Your Skills</h3>
          <p className="text-gray-600 text-sm">Showing jobs within 25 miles of {workerProfile.location}</p>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Job Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                  {job.match_score}% match
                </span>
              </div>

              {/* Job Details */}
              <div className="flex items-center gap-4 text-gray-600 text-sm mb-5">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Full-time</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatTimeAgo(job.posted_at)}</span>
                </div>
              </div>

              {/* Required Skills */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-900 mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm">
                    Forklift Operation
                  </span>
                  <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm">
                    Inventory Management
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
                  Apply Now
                </button>
                <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

