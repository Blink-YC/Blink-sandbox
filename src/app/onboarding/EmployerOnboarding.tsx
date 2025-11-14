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

export function EmployerOnboarding() {
  const router = useRouter();
  
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Validation errors
  const [phoneError, setPhoneError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  
  const locationInputRef = useRef<HTMLInputElement | null>(null);

  // Load data from localStorage or database when component mounts
  useEffect(() => {
    async function loadExistingData() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      // Try to load from localStorage first (client-side storage)
      const savedData = localStorage.getItem('employer_onboarding_step1');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          console.log('Loading employer data from localStorage:', parsed);
          if (parsed.companyName) setCompanyName(parsed.companyName);
          if (parsed.industry) setIndustry(parsed.industry);
          if (parsed.location) setLocation(parsed.location);
          if (parsed.companySize) setCompanySize(parsed.companySize);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.website) setWebsite(parsed.website);
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

      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('company_name, industry, company_size, primary_location, website')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        if (profile.phone) setPhone(profile.phone);
      }
      if (businessProfile) {
        if (businessProfile.company_name) setCompanyName(businessProfile.company_name);
        if (businessProfile.industry) setIndustry(businessProfile.industry);
        if (businessProfile.company_size) setCompanySize(businessProfile.company_size);
        if (businessProfile.primary_location) setLocation(businessProfile.primary_location);
        if (businessProfile.website) setWebsite(businessProfile.website);
      }
    }

    loadExistingData();
  }, []);

  // Validation functions
  const validatePhone = (value: string): boolean => {
    // US phone number format: (123) 456-7890, 123-456-7890, 1234567890
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  };

  const validateURL = (value: string): boolean => {
    if (!value) return true; // Optional field
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
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

  const handleWebsiteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWebsite(value);
    
    if (value && !validateURL(value)) {
      setWebsiteError("Please enter a valid URL (e.g., https://example.com)");
    } else {
      setWebsiteError("");
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
    
    if (website && !validateURL(website)) {
      setWebsiteError("Please enter a valid URL");
      return;
    }
    
    setSubmitting(true);

    // Save form data to localStorage (client-side only, not database yet)
    const formData = {
      companyName,
      industry,
      location,
      companySize,
      phone,
      website,
    };
    
    localStorage.setItem('employer_onboarding_step1', JSON.stringify(formData));
    console.log('Saved employer Step 1 data to localStorage');

    setSubmitting(false);
    router.replace("/setup-profile?role=business");
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
          background-color: #dbeafe;
        }
        .pac-item-query {
          color: #1f2937;
          font-weight: 500;
        }
        .pac-matched {
          font-weight: 600;
          color: #2563eb;
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
            <div className="bg-gray-900 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your company</h2>
          <p className="text-gray-600 mb-8">
            This information helps us match you with the right workers and build trust with candidates.
          </p>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                placeholder="e.g. ABC Construction LLC"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Type of Work */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Type of Work <span className="text-red-500">*</span>
              </label>
              <select
                value={industry}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setIndustry(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select your industry</option>
                <option value="construction">Construction</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="transportation">Transportation & Logistics</option>
                <option value="hospitality">Hospitality</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail</option>
                <option value="warehouse">Warehouse & Distribution</option>
                <option value="facilities">Facilities Management</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Primary Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Primary Location <span className="text-red-500">*</span>
              </label>
              <input
                ref={locationInputRef}
                type="text"
                value={location}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                placeholder="e.g. Phoenix, AZ"
                required
                autoComplete="off"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-2">
                This is where most of your jobs will be posted
              </p>
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Company Size <span className="text-red-500">*</span>
              </label>
              <select
                value={companySize}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCompanySize(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501+">501+ employees</option>
              </select>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contact Phone <span className="text-red-500">*</span>
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
                    : 'border-gray-200 focus:ring-blue-600'
                }`}
              />
              {phoneError && (
                <p className="text-xs text-red-600 mt-1.5">{phoneError}</p>
              )}
              {!phoneError && phone && (
                <p className="text-xs text-gray-500 mt-1.5">Format: (555) 123-4567</p>
              )}
            </div>

            {/* Company Website */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Company Website (Optional)
              </label>
              <input
                type="url"
                value={website}
                onChange={handleWebsiteChange}
                placeholder="https://www.yourcompany.com"
                className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 ${
                  websiteError 
                    ? 'border-red-300 focus:ring-red-600' 
                    : 'border-gray-200 focus:ring-blue-600'
                }`}
              />
              {websiteError && (
                <p className="text-xs text-red-600 mt-1.5">{websiteError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors"
            >
              {submitting ? "Saving..." : "Next"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

