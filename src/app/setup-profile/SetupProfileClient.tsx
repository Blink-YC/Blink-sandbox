// app/setup-profile/SetupProfileClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { StepProgress } from "@/components/StepProgress";

type Role = "customer" | "worker" | "business";

type ProfileDefaults = Partial<{
  // customer
  service_needs: string;
  property_type: string;
  service_frequency: string;
  // worker
  specialties: string;
  years_experience: number;
  hourly_rate: number;
  service_area: string;
  credentials: string;
  // business
  company_name: string;
}>;

export function SetupProfileClient({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const role = initialRole;

  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileDefaults>({});

  // ✅ Use a ref to guarantee a real HTMLFormElement
  const formRef = useRef<HTMLFormElement>(null);

  function handleBack() {
    router.push(`/onboarding?role=${role}`);
  }

  // Prefill based on role
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;

      if (role === "worker") {
        const { data: wp } = await supabase
          .from("worker_profiles")
          .select("trades, years_experience, rate_cents, certifications")
          .eq("user_id", user.id)
          .maybeSingle();

        if (wp) {
          setProfile({
            specialties: Array.isArray(wp.trades) ? wp.trades.join(", ") : "",
            years_experience:
              typeof wp.years_experience === "number"
                ? wp.years_experience
                : undefined,
            hourly_rate:
              typeof wp.rate_cents === "number"
                ? Math.round(wp.rate_cents / 100)
                : undefined,
            credentials: Array.isArray(wp.certifications)
              ? wp.certifications.join(", ")
              : "",
            service_area: "",
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
          .select("company_name, hq_city")
          .eq("user_id", user.id)
          .maybeSingle();

        if (bp) {
          setProfile({
            company_name: bp.company_name ?? "",
            service_area: bp.hq_city ?? "",
          });
        }
      }
    })();
  }, [role]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return; // hard guard
    setSaving(true);

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setSaving(false);
      return;
    }

    // ✅ Build FormData from the actual <form> element
    const formData = new FormData(formRef.current);
    const body = Object.fromEntries(formData.entries());

    // Update role-specific tables
    if (role === "worker") {
      await supabase.from("worker_profiles").upsert({
        user_id: user.id,
        headline: (body.headline as string) || null,
        bio: (body.about as string) || null,
        trades:
          (body.specialties as string)
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        certifications:
          (body.credentials as string)
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        years_experience: body.years_experience
          ? Number(body.years_experience)
          : null,
        rate_cents: body.hourly_rate
          ? Math.round(Number(body.hourly_rate) * 100)
          : null,
        service_radius_km: body.service_radius_km
          ? Number(body.service_radius_km)
          : null,
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
      await supabase.from("business_profiles").upsert({
        user_id: user.id,
        company_name: (body.company_name as string) || null,
        website: (body.portfolio as string) || null,
        hq_city: (body.service_area as string) || null,
        updated_at: new Date().toISOString(),
      });
    }

    // Mark role stage complete
    await supabase.from("user_roles").upsert({
      user_id: user.id,
      role,
      stage: "profile_done",
      enabled_at: new Date().toISOString(),
    });

    setSaving(false);
    router.replace(`/portal?role=${role}`);
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <StepProgress
        steps={[
          { number: 1, label: "Basic Info", completed: true, current: false },
          { number: 2, label: "Profile Setup", completed: false, current: true },
          { number: 3, label: "Complete", completed: false, current: false },
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            Set up your {role} profile
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Onboarding as {role === "worker" ? "🔧 Worker" : role === "customer" ? "👤 Customer" : "🏢 Business"}
          </span>
        </div>

        {/* Attach the ref directly to the real <form> */}
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Specialties</label>
                <input
                  name="specialties"
                  defaultValue={profile.specialties ?? ""}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. Plumbing, HVAC, Roofing"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Years of experience
                </label>
                <input
                  name="years_experience"
                  type="number"
                  min={0}
                  defaultValue={
                    typeof profile.years_experience === "number"
                      ? profile.years_experience
                      : ""
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Hourly rate ($)</label>
                <input
                  name="hourly_rate"
                  type="number"
                  min={0}
                  defaultValue={
                    typeof profile.hourly_rate === "number"
                      ? profile.hourly_rate
                      : ""
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Service area</label>
                <input
                  name="service_area"
                  defaultValue={profile.service_area ?? ""}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Credentials</label>
              <input
                name="credentials"
                defaultValue={profile.credentials ?? ""}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g. License #, Certifications"
              />
            </div>
          </>
        )}

        {role === "business" && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">Company name</label>
              <input
                name="company_name"
                defaultValue={profile.company_name ?? ""}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Service area</label>
              <input
                name="service_area"
                defaultValue={profile.service_area ?? ""}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Website / Portfolio</label>
              <input
                name="portfolio"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={saving}
            className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded px-3 py-2 font-medium disabled:opacity-50"
          >
            ← Previous
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : "Finish →"}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
