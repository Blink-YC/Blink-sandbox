// app/setup-profile/SetupProfileClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "customer" | "worker" | "business";

type ProfileDefaults = Partial<{
  // customer
  location: string;
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
          .select("default_city")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cp) setProfile({ location: cp.default_city ?? "" });
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
        default_city: (body.location as string) || null,
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
    <div className="min-h-screen px-4 py-10 max-2xl:mx-auto max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        Set up your {role} profile
      </h1>

      {/* Attach the ref directly to the real <form> */}
      <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
        {role === "customer" && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Service location</label>
            <input
              name="location"
              defaultValue={profile.location ?? ""}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
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
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2"
          >
            {saving ? "Saving…" : "Finish setup"}
          </button>
        </div>
      </form>
    </div>
  );
}
