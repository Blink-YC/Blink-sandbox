// app/setup-profile/SetupProfileClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "customer" | "worker" | "business";

type ProfileDefaults = Partial<{
  // customer
  service_needs: string;
  property_type: string;
  service_frequency: string;
  // worker
  years_experience: string;
  hourly_rate: number;
  job_type: string;
  // business
  company_name: string;
}>;

export function SetupProfileClient({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const role = initialRole;

  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileDefaults>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Form field states for controlled inputs
  const [yearsExperience, setYearsExperience] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [jobType, setJobType] = useState('');

  // ✅ Use a ref to guarantee a real HTMLFormElement
  const formRef = useRef<HTMLFormElement>(null);

  // Available skills for workers
  const availableSkills = [
    "Electrical wiring",
    "OSHA-10 Certified",
    "Forklift Operation",
    "Welding",
    "HVAC",
    "Plumbing",
    "Carpentry",
    "Inventory Management",
    "CDL License",
    "Heavy Machinery",
    "Construction Labor",
    "Painting",
    "Roofing",
    "Concrete Work",
    "Equipment Maintenance",
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  function handleBack() {
    // Save current Step 2 form data to localStorage before going back
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const step2Data: Record<string, unknown> = Object.fromEntries(formData.entries());
      
      console.log('📦 Raw form entries:', step2Data);
      
      // For workers, also save selected skills (they're in state, not form)
      if (role === 'worker') {
        step2Data.skills = selectedSkills; // Store as array
        console.log('📦 Selected skills:', selectedSkills);
        console.log('📦 Years experience from form:', step2Data.years_experience);
        console.log('📦 Hourly rate from form:', step2Data.hourly_rate);
        console.log('📦 Job type from form:', step2Data.job_type);
      }
      
      const storageKey = role === 'business' 
        ? 'employer_onboarding_step2' 
        : role === 'worker' 
        ? 'worker_onboarding_step2' 
        : 'customer_onboarding_step2';
      
      localStorage.setItem(storageKey, JSON.stringify(step2Data));
      console.log(`✅ Saved ${role} Step 2 data to localStorage (${storageKey}):`, step2Data);
      
      // Verify it was saved
      const verify = localStorage.getItem(storageKey);
      console.log('✅ Verified localStorage contains:', verify ? JSON.parse(verify) : 'NULL');
    } else {
      console.error('❌ formRef.current is null, cannot save Step 2 data');
    }
    
    router.push(`/onboarding?role=${role}`);
  }

  // Prefill based on role
  useEffect(() => {
    (async () => {
      // First, try to load from localStorage (current session)
      const storageKey = role === 'business' 
        ? 'employer_onboarding_step2' 
        : role === 'worker' 
        ? 'worker_onboarding_step2' 
        : 'customer_onboarding_step2';
      
      const savedStep2 = localStorage.getItem(storageKey);
      
      if (savedStep2) {
        try {
          const parsed = JSON.parse(savedStep2);
          console.log(`✅ Loading ${role} Step 2 data from localStorage:`, parsed);
          
          if (role === 'worker') {
            // Restore worker Step 2 data
            if (parsed.skills) {
              // Skills is now stored as array directly, not stringified
              const skills = Array.isArray(parsed.skills) ? parsed.skills : JSON.parse(parsed.skills);
              setSelectedSkills(skills);
              console.log('✅ Restored selected skills:', skills);
            }
            
            // Set form field states
            setYearsExperience(parsed.years_experience || '');
            setHourlyRate(parsed.hourly_rate || '');
            setJobType(parsed.job_type || '');
            
            setProfile({
              years_experience: parsed.years_experience || undefined,
              hourly_rate: parsed.hourly_rate ? Number(parsed.hourly_rate) : undefined,
              job_type: parsed.job_type || undefined,
            });
            console.log('✅ Restored profile state:', {
              years_experience: parsed.years_experience,
              hourly_rate: parsed.hourly_rate,
              job_type: parsed.job_type,
            });
            return; // Use localStorage data, don't load from DB
          } else if (role === 'business') {
            // Restore employer Step 2 data (if you add fields later)
            setProfile({});
            return;
          }
        } catch (e) {
          console.error('❌ Error parsing Step 2 localStorage data:', e);
        }
      }

      // If no localStorage data, try loading from database (returning users)
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      if (role === "worker") {
        const { data: wp } = await supabase
          .from("worker_profiles")
          .select("trades, years_experience_range, rate_cents, job_type_preference")
          .eq("user_id", user.id)
          .maybeSingle();

        if (wp) {
          // Set selected skills from trades array
          if (Array.isArray(wp.trades) && wp.trades.length > 0) {
            setSelectedSkills(wp.trades);
          }
          
          // Set form field states
          setYearsExperience(wp.years_experience_range || '');
          setHourlyRate(
            typeof wp.rate_cents === "number"
              ? String(Math.round(wp.rate_cents / 100))
              : ''
          );
          setJobType(wp.job_type_preference || '');
          
          setProfile({
            years_experience: wp.years_experience_range ?? undefined,
            hourly_rate:
              typeof wp.rate_cents === "number"
                ? Math.round(wp.rate_cents / 100)
                : undefined,
            job_type: wp.job_type_preference ?? undefined,
          });
        }
      } else if (role === "customer") {
        const { data: cp } = await supabase
          .from("customer_profiles")
          .select("service_needs, property_type, service_frequency")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cp) {
          setProfile({
            service_needs: cp.service_needs ?? "",
            property_type: cp.property_type ?? "",
            service_frequency: cp.service_frequency ?? "",
          });
        }
      } else if (role === "business") {
        const { data: bp } = await supabase
          .from("business_profiles")
          .select("hiring_frequency, typical_roles, avg_open_positions, company_description, search_radius")
          .eq("user_id", user.id)
          .maybeSingle();

        if (bp) {
          setProfile({});
          // No prefilling needed for business Step 2 (for now)
        }
      }
    })();
  }, [role]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return; // hard guard

    // Validate worker skills (minimum 3 required)
    if (role === "worker" && selectedSkills.length < 3) {
      alert("Please select at least 3 skills to continue.");
      return;
    }

    setSaving(true);

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setSaving(false);
      return;
    }

    // ✅ Build FormData from the actual <form> element (Step 2 data)
    const formData = new FormData(formRef.current);
    const body = Object.fromEntries(formData.entries());

    // 🔵 Load Step 1 data from localStorage
    const step1Key = role === 'business' ? 'employer_onboarding_step1' : 'worker_onboarding_step1';
    const step1Data = localStorage.getItem(step1Key);
    const step1 = step1Data ? JSON.parse(step1Data) : {};

    console.log('💾 Saving complete onboarding data to database...');
    console.log('Step 1 data from localStorage:', step1);
    console.log('Step 2 data from form:', body);

    // Save BOTH Step 1 and Step 2 data to database
    if (role === "worker") {
      // Parse skills from hidden input
      let skills: string[] = [];
      try {
        skills = JSON.parse(body.skills as string);
      } catch {
        skills = [];
      }

      // Save Step 1 data to profiles table
      await supabase.from("profiles").upsert({
        user_id: user.id,
        full_name: step1.fullName || null,
        phone: step1.phone || null,
        city: step1.location || null,
        updated_at: new Date().toISOString(),
      });

      // Save Step 1 + Step 2 data to worker_profiles table
      await supabase.from("worker_profiles").upsert({
        user_id: user.id,
        // Step 1 fields
        travel_radius: step1.travelRadius || null,
        availability: step1.availability || null,
        // Step 2 fields
        trades: skills,
        years_experience_range: (body.years_experience as string) || null,
        rate_cents: body.hourly_rate
          ? Math.round(Number(body.hourly_rate) * 100)
          : null,
        job_type_preference: (body.job_type as string) || null,
        updated_at: new Date().toISOString(),
      });
    } else if (role === "customer") {
      await supabase.from("customer_profiles").upsert({
        user_id: user.id,
        service_needs: (body.service_needs as string) || null,
        property_type: (body.property_type as string) || null,
        service_frequency: (body.service_frequency as string) || null,
        preferred_contact_method: "app",
        updated_at: new Date().toISOString(),
      });
    } else if (role === "business") {
      // Save Step 1 data to profiles table
      await supabase.from("profiles").upsert({
        user_id: user.id,
        phone: step1.phone || null,
        city: step1.location || null,
        updated_at: new Date().toISOString(),
      });

      // Save Step 1 + Step 2 data to business_profiles table
      await supabase.from("business_profiles").upsert({
        user_id: user.id,
        // Step 1 fields
        company_name: step1.companyName || null,
        industry: step1.industry || null,
        company_size: step1.companySize || null,
        primary_location: step1.location || null,
        website: step1.website || null,
        // Step 2 fields
        hiring_frequency: (body.hiring_frequency as string) || null,
        typical_roles: (body.typical_roles as string) || null,
        avg_open_positions: (body.avg_open_positions as string) || null,
        company_description: (body.company_description as string) || null,
        search_radius: (body.search_radius as string) || null,
        updated_at: new Date().toISOString(),
      });
    }

    // Mark role stage complete
    console.log("🔵 Starting user_roles update process...");
    console.log("🔵 User ID:", user.id);
    console.log("🔵 Role:", role);
    
    // First, check if the role exists
    const { data: existingRole, error: selectError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", role)
      .maybeSingle();

    console.log("🔵 Existing role query result:", existingRole);
    console.log("🔵 Existing role query error:", selectError);

    let updateError;
    let updateResult;
    
    if (existingRole) {
      // Update existing role
      console.log("🟡 Attempting to UPDATE existing role...");
      const result = await supabase
        .from("user_roles")
        .update({ stage: "profile_done" })
        .eq("user_id", user.id)
        .eq("role", role)
        .select();
      
      updateError = result.error;
      updateResult = result.data;
      console.log("🟡 Update result:", updateResult);
      console.log("🟡 Update error:", updateError);
    } else {
      // Insert new role
      console.log("🟢 Attempting to INSERT new role...");
      const result = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: role,
          stage: "profile_done",
        })
        .select();
      
      updateError = result.error;
      updateResult = result.data;
      console.log("🟢 Insert result:", updateResult);
      console.log("🟢 Insert error:", updateError);
    }

    if (updateError) {
      console.error("❌ Error updating user_roles:", updateError);
      console.error("❌ Full error details:", JSON.stringify(updateError, null, 2));
      alert(`Failed to complete profile setup: ${updateError.message || 'Unknown error'}. Please try again.`);
      setSaving(false);
      return;
    }

    // Wait a moment for database to propagate
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify the update worked
    console.log("🔍 Verifying update...");
    const { data: verifyRole, error: verifyError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", role)
      .single();

    console.log("🔍 Verified role after update:", verifyRole);
    console.log("🔍 Verify error:", verifyError);

    if (verifyRole?.stage !== "profile_done") {
      console.error("❌ VERIFICATION FAILED: Stage is not profile_done!");
      console.error("❌ Expected: 'profile_done', Got:", verifyRole?.stage);
      alert(`Warning: Profile stage is '${verifyRole?.stage}' instead of 'profile_done'. Please check the database or contact support.`);
    } else {
      console.log("✅ Successfully updated user_roles to profile_done for role:", role);
    }

    // 🧹 Clear localStorage after successful onboarding completion
    console.log("🧹 Cleaning up localStorage...");
    if (role === 'business') {
      localStorage.removeItem('employer_onboarding_step1');
      localStorage.removeItem('employer_onboarding_step2');
    } else if (role === 'worker') {
      localStorage.removeItem('worker_onboarding_step1');
      localStorage.removeItem('worker_onboarding_step2');
    } else if (role === 'customer') {
      localStorage.removeItem('customer_onboarding_step1');
      localStorage.removeItem('customer_onboarding_step2');
    }
    console.log("✅ localStorage cleared");

    setSaving(false);
    
    // Redirect to the appropriate portal based on role
    if (role === "business") {
      router.replace("/employer-portal");
    } else if (role === "worker") {
      router.replace("/worker-portal");
    } else {
      router.replace("/portal"); // Fallback for customer role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
              </svg>
            </div>
            <span className="text-gray-900 font-bold text-xl">Blink</span>
          </div>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push('/');
            }}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step 2 of 2</span>
            <span className="text-sm text-gray-500">
              {role === "business" ? "Your hiring needs" : role === "worker" ? "Your skills" : "Your needs"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${role === 'worker' ? 'bg-orange-500' : 'bg-blue-600'}`} style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Icon based on role */}
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
            role === "business" 
              ? "bg-blue-100" 
              : role === "worker" 
              ? "bg-orange-100" 
              : "bg-purple-100"
          }`}>
            {role === "business" ? (
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ) : role === "worker" ? (
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {role === "business" ? "Your hiring needs" : role === "worker" ? "Your skills and experience" : "Your needs"}
          </h2>
          <p className="text-gray-600 mb-8">
            {role === "business" 
              ? "Help us understand what kind of workers you typically need." 
              : role === "worker"
              ? "Tell us about your skills to get matched with the right jobs."
              : "Help us understand what services you're looking for."}
          </p>

          {/* Attach the ref directly to the real <form> */}
          <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
        {role === "customer" && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">What type of services are you looking for?</label>
              <textarea
                name="service_needs"
                rows={3}
                defaultValue={profile.service_needs ?? ""}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Plumbing, Electrical, HVAC, General Repairs"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">Property type</label>
              <select
                name="property_type"
                defaultValue={profile.property_type ?? ""}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select property type</option>
                <option value="residential">Residential (Home/Apartment)</option>
                <option value="commercial">Commercial (Office/Store)</option>
                <option value="industrial">Industrial (Warehouse/Factory)</option>
                <option value="mixed">Mixed Use</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">How often do you need services?</label>
              <select
                name="service_frequency"
                defaultValue={profile.service_frequency ?? ""}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select frequency</option>
                <option value="one-time">One-time project</option>
                <option value="occasional">Occasional (Few times a year)</option>
                <option value="regular">Regular (Monthly)</option>
                <option value="ongoing">Ongoing partnership</option>
              </select>
            </div>
          </>
        )}

        {role === "worker" && (
          <>
            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <select
                name="years_experience"
                required
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select experience</option>
                <option value="0-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>

            {/* Select Your Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Your Skills <span className="text-red-500">*</span> (Choose at least 3)
              </label>
              <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSkills.includes(skill)
                        ? 'bg-orange-500 text-white border-2 border-orange-500'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedSkills.length} skills
              </p>
              {/* Hidden input to submit skills */}
              <input type="hidden" name="skills" value={JSON.stringify(selectedSkills)} />
            </div>

            {/* Desired Hourly Pay */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Desired Hourly Pay <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-medium text-base">
                  $
                </span>
                <input
                  type="number"
                  name="hourly_rate"
                  required
                  min="1"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="20"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-20 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-base">
                  /hour
                </span>
              </div>
            </div>

            {/* Preferred Job Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Preferred Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="job_type"
                required
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select job type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            {/* Pro tip */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Pro tip:</span> You&apos;ll be able to add detailed work history, certifications, and project showcases in your profile settings after completing setup.
              </p>
            </div>
          </>
        )}

        {role === "business" && (
          <>
            {/* How often do you hire? */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                How often do you hire? <span className="text-red-500">*</span>
              </label>
              <select
                name="hiring_frequency"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select frequency</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly (Every 3 months)</option>
                <option value="occasionally">Occasionally (As needed)</option>
                <option value="rarely">Rarely (Once or twice a year)</option>
              </select>
            </div>

            {/* What types of roles do you typically hire for? */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                What types of roles do you typically hire for? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="typical_roles"
                required
                placeholder="e.g. Electricians, Construction Laborers, Project Managers"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50"
              />
            </div>

            {/* Average number of open positions at a time */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Average number of open positions at a time <span className="text-red-500">*</span>
              </label>
              <select
                name="avg_open_positions"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select range</option>
                <option value="1-2">1-2 positions</option>
                <option value="3-5">3-5 positions</option>
                <option value="6-10">6-10 positions</option>
                <option value="11-20">11-20 positions</option>
                <option value="20+">20+ positions</option>
              </select>
            </div>

            {/* Tell us about your company (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tell us about your company (Optional)
              </label>
              <textarea
                name="company_description"
                rows={4}
                placeholder="What makes your company a great place to work? What projects do you typically work on?"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                This will be shown to workers when they view your job postings
              </p>
            </div>

            {/* Preferred search radius for candidates */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Preferred search radius for candidates <span className="text-red-500">*</span>
              </label>
              <select
                name="search_radius"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="">Select radius</option>
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option>
                <option value="statewide">Statewide</option>
                <option value="nationwide">Nationwide</option>
              </select>
            </div>
          </>
        )}

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-3.5 font-semibold disabled:opacity-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 text-white rounded-lg px-6 py-3.5 font-semibold disabled:cursor-not-allowed transition-colors ${
                  role === 'worker'
                    ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                }`}
              >
                {saving ? "Saving..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
