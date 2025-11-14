"use client";

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { BlinkLogo } from "@/components/ui";

// Minimal Google Maps types
type GMapsPlace = { formatted_address?: string };
type GMapsAutocomplete = {
  addListener: (eventName: "place_changed", handler: () => void) => void;
  getPlace: () => GMapsPlace | undefined;
};
type GMapsAutocompleteCtor = new (
  input: HTMLInputElement,
  opts?: { types?: string[] }
) => GMapsAutocomplete;
type GoogleMaps = { maps?: { places?: { Autocomplete: GMapsAutocompleteCtor } } };
type GoogleWindow = { google?: GoogleMaps };

export function WorkerOnboarding() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [travelRadius, setTravelRadius] = useState("");
  const [availability, setAvailability] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Validation errors
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const locationInputRef = useRef<HTMLInputElement | null>(null);

  // Load data from localStorage or auth when component mounts
  useEffect(() => {
    async function loadExistingData() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      // Get email from auth user
      if (user.email) {
        setEmail(user.email);
      }

      // Try to load from localStorage first (client-side storage)
      const savedData = localStorage.getItem('worker_onboarding_step1');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          console.log('Loading worker data from localStorage:', parsed);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.location) setLocation(parsed.location);
          if (parsed.travelRadius) setTravelRadius(parsed.travelRadius);
          if (parsed.availability) setAvailability(parsed.availability);
          return; // Use localStorage data, don't load from DB
        } catch (e) {
          console.error('Error parsing localStorage data:', e);
        }
      }

      // If no localStorage data, load from database (for returning users)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, city')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: workerProfile } = await supabase
        .from('worker_profiles')
        .select('travel_radius, availability')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) setFullName(profile.full_name);
        if (profile.phone) setPhone(profile.phone);
        if (profile.city) setLocation(profile.city);
      }
      if (workerProfile) {
        if (workerProfile.travel_radius) setTravelRadius(workerProfile.travel_radius);
        if (workerProfile.availability) setAvailability(workerProfile.availability);
      }
    }

    loadExistingData();
  }, []);

  // Validation functions
  const validatePhone = (value: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  };

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    
    if (formatted && !validatePhone(formatted)) {
      setPhoneError("Please enter a valid phone number");
    } else {
      setPhoneError("");
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validatePhone(phone)) {
      setPhoneError("Please enter a valid phone number");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setSubmitting(true);

    // Save form data to localStorage (client-side only, not database yet)
    const formData = {
      fullName,
      phone,
      email,
      location,
      travelRadius,
      availability,
    };
    
    localStorage.setItem('worker_onboarding_step1', JSON.stringify(formData));
    console.log('Saved worker Step 1 data to localStorage');

    setSubmitting(false);
    router.replace("/setup-profile?role=worker");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Google Places script for location autocomplete */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          const g = (window as unknown as GoogleWindow).google;
          const Autocomplete = g?.maps?.places?.Autocomplete;
          if (!Autocomplete || !locationInputRef.current) return;

          const ac = new Autocomplete(locationInputRef.current, { types: ["(cities)"] });
          ac.addListener("place_changed", () => {
            const place = ac.getPlace();
            if (place?.formatted_address) setLocation(place.formatted_address);
          });
        }}
      />
      
      {/* Google Places Autocomplete Styling */}
      <style jsx global>{`
        .pac-container {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          margin-top: 4px;
          font-family: inherit;
          z-index: 1000;
        }
        .pac-item {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
          border: none;
        }
        .pac-item:hover {
          background-color: #f3f4f6;
        }
        .pac-item-selected,
        .pac-item-selected:hover {
          background-color: #fed7aa;
        }
        .pac-item-query {
          color: #1f2937;
          font-weight: 500;
        }
        .pac-matched {
          font-weight: 600;
          color: #f97316;
        }
        .pac-icon {
          display: none;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BlinkLogo size="md" textSize="xl" />
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Progress Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Blink!</h1>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step 1 of 2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's set up your profile</h2>
          <p className="text-gray-600 mb-8">
            Basic information to help employers find and contact you.
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                required
                className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 ${
                  phoneError 
                    ? 'border-red-300 focus:ring-red-600' 
                    : 'border-gray-200 focus:ring-orange-500'
                }`}
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1.5">{phoneError}</p>
              )}
              {!phoneError && phone && (
                <p className="text-xs text-gray-500 mt-1.5">Employers will use this to contact you</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="john@email.com"
                required
                className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 ${
                  emailError 
                    ? 'border-red-300 focus:ring-red-600' 
                    : 'border-gray-200 focus:ring-orange-500'
                }`}
              />
              {emailError && (
                <p className="text-xs text-red-600 mt-1.5">{emailError}</p>
              )}
            </div>

            {/* City, State */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                City, State <span className="text-red-500">*</span>
              </label>
              <input
                ref={locationInputRef}
                type="text"
                value={location}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                placeholder="Dallas, TX"
                required
                autoComplete="off"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Travel Radius */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                How far are you willing to travel for work? <span className="text-red-500">*</span>
              </label>
              <select
                value={travelRadius}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setTravelRadius(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select radius</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
                <option value="any">Any distance</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Availability <span className="text-red-500">*</span>
              </label>
              <select
                value={availability}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setAvailability(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select availability</option>
                <option value="immediate">Available immediately</option>
                <option value="1-week">Available in 1 week</option>
                <option value="2-weeks">Available in 2 weeks</option>
                <option value="1-month">Available in 1 month</option>
                <option value="full-time">Full-time only</option>
                <option value="part-time">Part-time only</option>
                <option value="flexible">Flexible schedule</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors"
            >
              {submitting ? "Saving..." : "Next"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

