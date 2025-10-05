"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetupProfilePage() {
  const router = useRouter();
  const params = useSearchParams();
  const role = (params?.get('role') as 'customer'|'worker'|'business') || 'customer';
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (p) setProfile(p);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    // Update role-specific tables and advance stage to profile_done
    if (role === 'worker') {
      await supabase.from('worker_profiles').upsert({
        user_id: user.id,
        headline: (body.headline as string) || null,
        bio: (body.about as string) || null,
        trades: (body.specialties as string)?.split(',').map(s=>s.trim()) || [],
        certifications: (body.credentials as string)?.split(',').map(s=>s.trim()) || [],
        years_experience: body.years_experience ? Number(body.years_experience) : null,
        rate_cents: body.hourly_rate ? Math.round(Number(body.hourly_rate) * 100) : null,
        service_radius_km: body.service_radius_km ? Number(body.service_radius_km) : null,
        updated_at: new Date().toISOString(),
      });
    } else if (role === 'customer') {
      await supabase.from('customer_profiles').upsert({
        user_id: user.id,
        default_city: (body.location as string) || null,
        preferred_contact_method: 'app',
        updated_at: new Date().toISOString(),
      });
    } else if (role === 'business') {
      await supabase.from('business_profiles').upsert({
        user_id: user.id,
        company_name: (body.company_name as string) || null,
        website: (body.portfolio as string) || null,
        hq_city: (body.service_area as string) || null,
        updated_at: new Date().toISOString(),
      });
    }

    await supabase.from('user_roles').upsert({
      user_id: user.id,
      role,
      stage: 'profile_done',
      enabled_at: new Date().toISOString(),
    });
    router.replace(`/portal?role=${role}`);
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Set up your {role} profile</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {role === 'customer' && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">Service location</label>
              <input name="location" defaultValue={profile?.location ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </>
        )}

        {role === 'worker' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Specialties</label>
                <input name="specialties" defaultValue={profile?.specialties ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Years of experience</label>
                <input name="years_experience" type="number" min={0} defaultValue={profile?.years_experience ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Hourly rate ($)</label>
                <input name="hourly_rate" type="number" min={0} defaultValue={profile?.hourly_rate ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Service area</label>
                <input name="service_area" defaultValue={profile?.service_area ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Credentials</label>
              <input name="credentials" defaultValue={profile?.credentials ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </>
        )}

        {role === 'business' && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">Company name</label>
              <input name="company_name" defaultValue={profile?.company_name ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Service area</label>
              <input name="service_area" defaultValue={profile?.service_area ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2">
            {saving ? 'Saving…' : 'Finish setup'}
          </button>
        </div>
      </form>
    </div>
  );
}


