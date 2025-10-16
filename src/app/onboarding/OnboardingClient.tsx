// app/onboarding/OnboardingClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { StepProgress } from "@/components/StepProgress";

/* ---- Minimal types ---- */
type Role = "customer" | "worker" | "business";
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
type GMapsAutocompleteCtor = new (
  input: HTMLInputElement,
  opts?: { types?: string[] }
) => GMapsAutocomplete;
type GoogleMaps = { maps?: { places?: { Autocomplete: GMapsAutocompleteCtor } } };
type GoogleWindow = { google?: GoogleMaps };

export default function OnboardingClient({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const role = initialRole;

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

      // Try direct fields first
      let given = meta.given_name || meta.first_name;
      let family = meta.family_name || meta.last_name;

      // Fallback to full name fields
      const full = meta.full_name || meta.name || "";
      if ((!given || !family) && full) {
        const parts = String(full).trim().split(/\s+/);
        if (parts.length >= 2) {
          given = given || parts[0];
          family = family || parts.slice(1).join(" ");
        } else if (parts.length === 1) {
          given = given || parts[0];
        }
      }

      if (given)  setFirstName((prev) => prev || given!);
      if (family) setLastName((prev)  => prev || family!);

      const initialEmail = user.email ?? meta.email;
      if (initialEmail) {
        setEmail((prev) => {
          if (!prev) {
            setEmailPrefilled(true);
            return initialEmail!;
          }
          return prev;
        });
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
      await supabase.from("profiles").upsert({
        user_id: user.id,
        full_name: `${firstName} ${lastName}`.trim(),
        city: location || null,
        updated_at: new Date().toISOString(),
      });
      await supabase.from("user_roles").upsert({
        user_id: user.id,
        role,
        stage: "basics_done",
        enabled_at: new Date().toISOString(),
      });
    }
    router.replace(`/setup-profile?role=${role}`);
  }

  async function handleBack() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  const onChangeFirst = (e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value);
  const onChangeLast  = (e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value);
  const onChangeEmail = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const onChangeLoc   = (e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value);

  return (
    <div className="min-h-screen px-4 py-10">
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

      <StepProgress
        steps={[
          { number: 1, label: "Basic Info", completed: false, current: true },
          { number: 2, label: "Profile Setup", completed: false, current: false },
          { number: 3, label: "Complete", completed: false, current: false },
        ]}
      />

      <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Basic information</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Onboarding as {role === "worker" ? "🔧 Worker" : role === "customer" ? "👤 Customer" : "🏢 Business"}
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">First name</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={firstName}
            onChange={onChangeFirst}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Last name</label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={lastName}
            onChange={onChangeLast}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={onChangeEmail}
            required
            readOnly={emailPrefilled}
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Location</label>
          <input
            ref={locationInputRef}
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={location}
            onChange={onChangeLoc}
            placeholder="City, State, Country"
            required
            autoComplete="off"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded px-3 py-2 font-medium disabled:opacity-50"
          >
            ← Previous
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 font-medium disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Next →"}
          </button>
        </div>
      </form>
    </div>
  );
}
