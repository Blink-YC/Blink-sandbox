"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [emailPrefilled, setEmailPrefilled] = useState(false);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const params = useSearchParams();
  const role = (params?.get('role') as 'customer'|'worker'|'business') || 'customer';

  // Prefill from Supabase user (Google sign-in provides names/email)
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      const meta: any = user.user_metadata || {};
      // Try direct fields first
      let given = meta.given_name || meta.first_name;
      let family = meta.family_name || meta.last_name;
      // Fallback to full name fields
      const full = meta.full_name || meta.name || '';
      if ((!given || !family) && full) {
        const parts = String(full).trim().split(/\s+/);
        if (parts.length >= 2) {
          given = given || parts[0];
          family = family || parts.slice(1).join(' ');
        } else if (parts.length === 1) {
          given = given || parts[0];
        }
      }
      // As final fallback, check identity_data if present
      if ((!given || !family) && Array.isArray((user as any).identities)) {
        const id0: any = (user as any).identities?.[0]?.identity_data || {};
        given = given || id0.given_name || id0.first_name;
        family = family || id0.family_name || id0.last_name;
      }
      if (!firstName && given) setFirstName(given);
      if (!lastName && family) setLastName(family);
      if (!email && (user.email || meta.email)) {
        setEmail(user.email || meta.email);
        setEmailPrefilled(true);
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (user) {
      // Update generic profiles table
      await supabase.from("profiles").upsert({
        user_id: user.id,
        full_name: `${firstName} ${lastName}`.trim(),
        city: location || null,
        updated_at: new Date().toISOString(),
      });
      // Ensure role is enabled and mark stage as basics_done
      await supabase.from('user_roles').upsert({
        user_id: user.id,
        role,
        stage: 'basics_done',
        enabled_at: new Date().toISOString(),
      });
    }
    router.replace(`/setup-profile?role=${role}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Google Places script for location autocomplete */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          try {
            // @ts-ignore
            const google = (window as any).google;
            if (!google || !locationInputRef.current) return;
            // Autocomplete focused on cities; still returns formatted address that includes state/country
            const ac = new google.maps.places.Autocomplete(locationInputRef.current, {
              types: ["(cities)"],
            });
            ac.addListener("place_changed", () => {
              const place = ac.getPlace();
              if (place && place.formatted_address) {
                setLocation(place.formatted_address);
              }
            });
          } catch {}
        }}
      />
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Basic information</h1>
        <div className="space-y-1">
          <label className="text-sm font-medium">First name</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Last name</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            readOnly={emailPrefilled}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Location</label>
          <input
            ref={locationInputRef}
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, State, Country"
            required
            autoComplete="off"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2">
          Continue
        </button>
      </form>
    </div>
  );
}


