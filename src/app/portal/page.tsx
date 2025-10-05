"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

export default function PortalPage() {
  const [tab, setTab] = useState<'find' | 'worker'>("find");
  const [query, setQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const params = useSearchParams();
  const router = useRouter();
  const roleParam = (params?.get('role') as 'customer'|'worker'|'business') || undefined;

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        setUserEmail(user.email ?? null);
        const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (p) {
          setProfile(p);
          // choose default tab per role
          const r = roleParam || p.role;
          if (r === 'customer') setTab('find');
          if (r === 'worker') setTab('worker');
          if (r === 'business') setTab('find');
        }
      }
    })();
  }, []);

  return (
    <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <div className="border-b border-gray-200 mb-6 flex items-center justify-between">
        <nav className="flex gap-4">
          {/* Role switcher */}
          <select
            defaultValue={profile?.role || roleParam || 'customer'}
            onChange={(e) => router.replace(`/portal?role=${e.target.value}`)}
            className="border border-gray-300 rounded px-2 py-1 mr-4"
          >
            <option value="customer">Customer</option>
            <option value="worker">Worker</option>
            <option value="business">Business</option>
          </select>

          {/* Tabs vary by role */}
          {((profile?.role || roleParam) === 'customer' || (!profile?.role && !roleParam)) && (
            <>
              <button onClick={() => setTab('find')} className={`px-3 py-2 ${tab==='find' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Post Work</button>
              <button onClick={() => setTab('worker')} className={`px-3 py-2 ${tab==='worker' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>My Tasks</button>
              <button className="px-3 py-2 text-gray-600">Profile</button>
              <button className="px-3 py-2 text-gray-600">Messages</button>
            </>
          )}
          {((profile?.role || roleParam) === 'worker') && (
            <>
              <button onClick={() => setTab('find')} className={`px-3 py-2 ${tab==='find' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Search Jobs</button>
              <button onClick={() => setTab('worker')} className={`px-3 py-2 ${tab==='worker' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>My Work</button>
              <button className="px-3 py-2 text-gray-600">Availability</button>
              <button className="px-3 py-2 text-gray-600">Profile</button>
              <button className="px-3 py-2 text-gray-600">Messages</button>
            </>
          )}
          {((profile?.role || roleParam) === 'business') && (
            <>
              <button onClick={() => setTab('find')} className={`px-3 py-2 ${tab==='find' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Projects</button>
              <button onClick={() => setTab('worker')} className={`px-3 py-2 ${tab==='worker' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>Workers</button>
              <button className="px-3 py-2 text-gray-600">Applications</button>
              <button className="px-3 py-2 text-gray-600">Messages</button>
            </>
          )}
        </nav>
        <div className="text-sm text-gray-600">{userEmail ? `Signed in as ${userEmail}` : 'Not signed in'}</div>
      </div>

      {tab === 'find' ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">What do you need help with?</label>
            <input
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. Plumbing, Electrical, Carpentry"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Results</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {["John Doe · Plumbing", "Jane Smith · Electrical", "Mark Lee · Carpentry"].
                filter((x) => x.toLowerCase().includes(query.toLowerCase())).
                map((x) => (
                  <div key={x} className="border rounded p-3">{x}</div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <form className="space-y-4 max-w-2xl" onSubmit={async (e) => {
          e.preventDefault();
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          const user = data.user;
          if (!user) return;
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          const body = Object.fromEntries(formData.entries());
          await supabase.from('profiles').upsert({
            id: user.id,
            specialties: body.specialties as string,
            years_experience: Number(body.years_experience || 0),
            hourly_rate: Number(body.hourly_rate || 0),
            service_area: body.service_area as string,
            credentials: body.credentials as string,
            portfolio: body.portfolio as string,
            about: body.about as string,
            availability: body.availability as string,
            updated_at: new Date().toISOString(),
          });
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Specialties</label>
              <input name="specialties" defaultValue={profile?.specialties ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Plumbing, HVAC, Roofing" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Years of experience</label>
              <input name="years_experience" type="number" min={0} defaultValue={profile?.years_experience ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. 5" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Hourly rate ($)</label>
              <input name="hourly_rate" type="number" min={0} defaultValue={profile?.hourly_rate ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. 75" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Service area</label>
              <input name="service_area" defaultValue={profile?.service_area ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Bay Area, 20mi radius" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Credentials</label>
            <input name="credentials" defaultValue={profile?.credentials ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. License #, Certifications" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Portfolio link</label>
            <input name="portfolio" defaultValue={profile?.portfolio ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. website, Instagram" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">About you</label>
            <textarea name="about" defaultValue={profile?.about ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" rows={5} placeholder="Brief description" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Availability</label>
            <input name="availability" defaultValue={profile?.availability ?? ''} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. Weekdays 8am–6pm, Sat by appointment" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2">Save</button>
          </div>
        </form>
      )}
    </div>
  );
}


