import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">BC</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-gray-900 font-semibold text-lg">BlueCollar</span>
                <span className="text-gray-500 text-sm ml-1">MVP</span>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Find Work</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Find Workers</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">How It Works</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Pricing</a>
            </nav>
            
            {/* Right Side Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 whitespace-nowrap">
                Sign In
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Platform Demo Banner */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">BlueCollar Platform Demo</h2>
            <p className="text-gray-600 text-sm">
              Explore different pages of the blue-collar platform. Click the buttons below to navigate between different user experiences.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            <Button className="bg-blue-600 text-white px-6 py-2 rounded whitespace-nowrap">Landing Page</Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-2 rounded whitespace-nowrap">Worker Profile</Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-2 rounded whitespace-nowrap">Employer Dashboard</Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-2 rounded whitespace-nowrap">Job Marketplace</Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="max-w-xl">
              <div className="inline-block bg-blue-100 text-blue-600 text-xs font-medium px-3 py-1 rounded-full mb-6">
                Now in Beta
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                The Professional Platform for Blue-Collar Workers
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect skilled tradespeople with employers instantly. Build your professional profile, showcase your certifications, and find your next job—all in one platform.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 mb-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 whitespace-nowrap w-full sm:w-auto">
                  I Need Something Fixed
                </Button>
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 px-8 py-3 whitespace-nowrap w-full sm:w-auto">
                  I'm Looking for Work
                </Button>
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 px-8 py-3 whitespace-nowrap w-full sm:w-auto">
                  I Need Workers
                </Button>
              </div>
              
              {/* Feature Icons */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm text-gray-600">Verified Professionals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">$</span>
                  </div>
                  <span className="text-sm text-gray-600">Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⚡</span>
                  </div>
                  <span className="text-sm text-gray-600">Real-time Matching</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Image */}
            <div className="relative">
              <div className="w-full h-96 bg-gray-300 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                  <span className="text-white text-lg">Construction Site Image</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Skilled Workers Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">For Skilled Workers</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build your professional reputation and find steady work with top employers in your area.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
                <CardTitle className="text-xl">Build Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Showcase your skills, certifications, work history, and portfolio to stand out from the crowd.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-xl">📅</span>
                </div>
                <CardTitle className="text-xl">Set Your Availability</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Toggle your 'Ready Now' status and manage your calendar to get matched with jobs instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-xl">💰</span>
                </div>
                <CardTitle className="text-xl">Get Paid Securely</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Receive payments through our secure escrow system with automatic release upon job completion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Anyone Who Needs Help Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">For Anyone Who Needs Help</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From fixing a leaky faucet to installing new electrical outlets, find qualified tradespeople for any job, big or small.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="relative">
              <div className="w-full h-80 bg-gray-300 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                  <span className="text-white text-lg">Blueprint & Tools Image</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-lg">🔧</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick & Easy Booking</h3>
                  <p className="text-gray-600">
                    Describe your problem and get matched with available professionals in your area instantly.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 text-lg">⭐</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Professionals</h3>
                  <p className="text-gray-600">
                    All workers are background-checked, licensed, and rated by previous customers.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-lg">⏰</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Same-Day Service</h3>
                  <p className="text-gray-600">
                    Need it fixed today? Many of our professionals offer same-day emergency services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-4xl font-bold text-gray-900">For Businesses</h2>
              <span className="ml-4 bg-purple-100 text-purple-600 text-xs font-medium px-3 py-1 rounded-full">
                Premium Plan
              </span>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scale your operations with our comprehensive business dashboard designed for contractors, construction companies, and facility managers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
                <CardTitle className="text-xl">Workforce Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Manage multiple projects, track worker performance, and handle payroll all in one dashboard.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-xl">📅</span>
                </div>
                <CardTitle className="text-xl">Advanced Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Schedule crews across multiple job sites with automated notifications and calendar integration.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 text-xl">📊</span>
                </div>
                <CardTitle className="text-xl">Business Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Track costs, productivity metrics, and generate reports to optimize your operations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">2,500+</div>
              <div className="text-gray-300">Skilled Workers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1,200+</div>
              <div className="text-gray-300">Jobs Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4.8★</div>
              <div className="text-gray-300">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">&lt;2hrs</div>
              <div className="text-gray-300">Average Match Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of skilled professionals and satisfied customers who trust our platform for their needs.
          </p>
          
          <div className="flex flex-col gap-4 justify-center max-w-4xl mx-auto">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 whitespace-nowrap w-full sm:w-auto">
              I Need Something Fixed
            </Button>
            <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 px-8 py-3 whitespace-nowrap w-full sm:w-auto">
              Sign Up as Worker
            </Button>
            <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 px-8 py-3 whitespace-nowrap w-full sm:w-auto">
              I Need Workers
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">
            © 2024 BlueCollar Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
