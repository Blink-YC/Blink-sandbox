import { Container } from './Container';
import { BlinkLogo } from '@/components/ui';

export function FooterSection() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-16">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Platform */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</a></li>
              <li><a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Resources</a></li>
            </ul>
          </div>
          
          {/* For Employers */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">For Employers</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Post a Job</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Find Talent</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Book a Demo</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Case Studies</a></li>
            </ul>
          </div>
          
          {/* For Workers */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">For Workers</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Find Jobs</a></li>
              <li><a href={`/auth/sign-up?next=${encodeURIComponent('/onboarding?role=worker')}`} className="text-gray-600 hover:text-blue-600 transition-colors">Build Profile</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Get Verified</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Resources</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <BlinkLogo size="md" textSize="md" className="mb-4 md:mb-0" />
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

