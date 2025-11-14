// app/onboarding/CustomerOnboarding.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { StepProgress } from "@/components/StepProgress";

type UserMeta = Partial<{
  given_name: string;
  first_name: string;
  family_name: string;
  last_name: string;
  full_name: string;
  name: string;
  email: string;
}>;

// Minimal Google Maps types to avoid `any`
type GMapsPlace = { formatted_address?: string };
type GMapsAutocomplete = {
  addListener: (eventName: "place_changed", handler: () => void) => void;
  getPlace: () => GMapsPlace | undefined;
};
type GMapsAutocompleteCtor = (
  input: HTMLInputElement,
  options?: Record<string, unknown>
) => GMapsAutocomplete;
type GoogleMaps = { maps?: { places?: { Autocomplete: GMapsAutocompleteCtor } } };
type GoogleWindow = { google?: GoogleMaps };

export function CustomerOnboarding() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [location,  setLocation]  = useState("");
  const [emailPrefilled, setEmailPrefilled] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const locationInputRef = useRef<HTMLInputElement | null>(null);

  // Ensure prefill runs once (handles React strict mode double-effect in dev)
  const didPrefill = useRef(false);

  // Prefill from Supabase user (Google sign-in provides names/email)
  useEffect(() => {
    if (didPrefill.current) return;
    didPrefill.current = true;

    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      const meta = (user.user_metadata ?? {}) as UserMeta;

      // Try to parse full_name if available
      const fullName = meta.full_name || meta.name;
      if (fullName) {
        const parts = fullName.split(" ");
        if (parts.length >= 2) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(" "));
        }
      } else {
        // Fallback to individual name fields
        const givenName = meta.given_name || meta.first_name;
        const familyName = meta.family_name || meta.last_name;
        if (givenName) setFirstName(givenName);
        if (familyName) setLastName(familyName);
      }

      // Prefill email
      if (user.email) {
        setEmail(user.email);
        setEmailPrefilled(true);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (user) {
      // Save common data to profiles table
      await supabase.from("profiles").upsert({
        user_id: user.id,
        full_name: `${firstName} ${lastName}`.trim(),
        city: location,
        updated_at: new Date().toISOString(),
      });

      // Mark onboarding as basics_done
      await supabase.from("user_roles").upsert({
        user_id: user.id,
        role: "customer",
        stage: "basics_done",
        enabled_at: new Date().toISOString(),
      });
    }

    router.replace("/setup-profile?role=customer");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-12 px-4">
      {/* Google Places script for location autocomplete */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          const g = (window as unknown as GoogleWindow).google;
          const Autocomplete = g?.maps?.places?.Autocomplete;
          const inputEl = locationInputRef.current;
          if (!Autocomplete || !inputEl) return;

          const autocomplete = Autocomplete(inputEl, {
            types: ["(cities)"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place?.formatted_address) {
              setLocation(place.formatted_address);
            }
          });
        }}
      />

      <StepProgress
        steps={[
          { number: 1, label: "Basic info", completed: false, current: true },
          { number: 2, label: "Your needs", completed: false, current: false },
          { number: 3, label: "Complete", completed: false, current: false },
        ]}
      />

      <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Basic information</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Onboarding as 👤 Customer
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">First name</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            type="text"
            required
            value={firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Last name</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            type="text"
            required
            value={lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            type="email"
            required
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={emailPrefilled}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Location</label>
          <input
            ref={locationInputRef}
            className="w-full border border-gray-300 rounded px-3 py-2"
            type="text"
            required
            value={location}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
            placeholder="City, State"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Next"}
        </button>
      </form>
    </div>
  );
}

