import { Container } from './Container';
import { Button, Badge } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-workers.jpg" 
          alt="Professional blue-collar workers"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60" />
      </div>
      
      {/* Content */}
      <Container className="relative z-10 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <Badge
            variant="primary"
            icon={
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
            }
            className="mb-6"
          >
            Now in Beta - Join Early Access
          </Badge>
          
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 leading-tight">
            Blue-Collar Jobs Matched in a{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Blink
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
            Instantly connect skilled workers with great opportunities. 
            No agencies. No delays. Just lightning-fast matches.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              variant="primary"
              size="lg"
              href={`/auth/sign-up?next=${encodeURIComponent('/onboarding?role=business')}`}
              className="shadow-lg hover:shadow-xl"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              For Employers
            </Button>
            <Button
              variant="outline"
              size="lg"
              href={`/auth/sign-up?next=${encodeURIComponent('/onboarding?role=worker')}`}
              className="bg-white"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              For Workers
            </Button>
          </div>
          
          {/* Feature Icons */}
          <div className="flex flex-wrap items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <span>Verified Skills</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <span>Fast Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <span>Local Jobs</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

