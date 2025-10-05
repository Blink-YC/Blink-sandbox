// app/portal/PortalClient.tsx
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Role = "customer" | "worker" | "business";

/** UI-facing worker form shape */
type WorkerForm = {
  specialties: string;          // maps -> worker_profiles.trades[]
  years_experience: number | "";
  hourly_rate: number | "";     // maps -> worker_profiles.rate_cents (x100)
  service_area: string;         // (not in schema; optional to map later)
  credentials: string;          // maps -> worker_profiles.certifications[]
  portfolio: string;            // maps -> worker_profiles.portfolio_urls[0]
  about: string;                // maps -> worker_profiles.bio
  availability: string;         // maps -> worker_profiles.availability.note
};

const EMPTY_FORM: WorkerForm = {
  specialties: "",
  years_experience: "",
  hourly_rate: "",
  service_area: "",
  credentials: "",
  portfolio: "",
  about: "",
  availability: "",
};

/* DB-row helper types */
type AvailabilityJSON = { note?: string } & Record<string, unknown>;
type WorkerProfileRow = {
  bio: string | null;
  trades: string[] | null;
  years_experience: number | null;
  rate_type: "hourly" | "fixed" | null;
  rate_cents: number | null;
  service_radius_km: number | null;
  certifications: string[] | null;
  portfolio_urls: string[] | null;
  availability: AvailabilityJSON | null;
};

export default function PortalClient({ initialRole }: { initialRole: Role }) {
  const [tab, setTab] = useState<"find" | "worker">(
    initialRole === "worker" ? "worker" : "find"
  );
  const [query, setQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [workerForm, setWorkerForm] = useState<WorkerForm>(EMPTY_FORM);
  const [currentRole, setCurrentRole] = useState<Role>(initialRole);

  const router = useRouter();

  // load user + (optionally) profile + worker profile
  useEffect(() => {
    (async () => {
      const supabase = createClient();

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) return;

      setUserEmail(user.email ?? null);

      // Example read of generic profile (kept for future use)
      await supabase
        .from("profiles")
        .select("full_name, city, region, country")
        .eq("user_id", user.id)
        .maybeSingle();

      // Read worker profile to prefill form
      const { data: wpRaw } = await supabase
        .from("worker_profiles")
        .select(
          "bio, trades, years_experience, rate_type, rate_cents, service_radius_km, certifications, portfolio_urls, availability"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      const wp = wpRaw as WorkerProfileRow | null;

      if (wp) {
        setWorkerForm({
          specialties: Array.isArray(wp.trades) ? wp.trades.join(", ") : "",
          years_experience:
            typeof wp.years_experience === "number" ? wp.years_experience : "",
          hourly_rate:
            typeof wp.rate_cents === "number"
              ? Math.round(wp.rate_cents / 100)
              : "",
          service_area: "", // not in schema; derive later if you add a numeric field
          credentials: Array.isArray(wp.certifications)
            ? wp.certifications.join(", ")
            : "",
          portfolio:
            Array.isArray(wp.portfolio_urls) && wp.portfolio_urls.length > 0
              ? String(wp.portfolio_urls[0])
              : "",
          about: wp.bio ?? "",
          availability:
            typeof wp.availability?.note === "string" ? wp.availability.note : "",
        });
      }
    })();
  }, []);

  // If the URL role changes (page re-mounted), reflect it
  useEffect(() => {
    setCurrentRole(initialRole);
    setTab(initialRole === "worker" ? "worker" : "find");
  }, [initialRole]);

  return (
    <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <div className="border-b border-gray-200 mb-6 flex items-center justify-between">
        <nav className="flex gap-4">
          {/* Role switcher */}
          <select
            value={currentRole}
            onChange={(e) => {
              const nextRole = e.target.value as Role;
              setCurrentRole(nextRole);
              setTab(nextRole === "worker" ? "worker" : "find");
              // reflect in URL (will cause a soft navigation and server wrapper to pass new initialRole)
              router.replace(`/portal?role=${nextRole}`);
            }}
            className="border border-gray-300 rounded px-2 py-1 mr-4"
          >
            <option value="customer">Customer</option>
            <option value="worker">Worker</option>
            <option value="business">Business</option>
          </select>

          {/* Tabs vary by role */}
          {currentRole === "customer" && (
            <>
              <button
                onClick={() => setTab("find")}
                className={`px-3 py-2 ${
                  tab === "find"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Post Work
              </button>
              <button
                onClick={() => setTab("worker")}
                className={`px-3 py-2 ${
                  tab === "worker"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                My Tasks
              </button>
              <button className="px-3 py-2 text-gray-600">Profile</button>
              <button className="px-3 py-2 text-gray-600">Messages</button>
            </>
          )}

          {currentRole === "worker" && (
            <>
              <button
                onClick={() => setTab("find")}
                className={`px-3 py-2 ${
                  tab === "find"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Search Jobs
              </button>
              <button
                onClick={() => setTab("worker")}
                className={`px-3 py-2 ${
                  tab === "worker"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                My Work
              </button>
              <button className="px-3 py-2 text-gray-600">Availability</button>
              <button className="px-3 py-2 text-gray-600">Profile</button>
              <button className="px-3 py-2 text-gray-600">Messages</button>
            </>
          )}

          {currentRole === "business" && (
            <>
              <button
                onClick={() => setTab("find")}
                className={`px-3 py-2 ${
                  tab === "find"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setTab("worker")}
                className={`px-3 py-2 ${
                  tab === "worker"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
              >
                Workers
              </button>
              <button className="px-3 py-2 text-gray-600">Applications</button>
              <button className="px-3 py-2 text-gray-600">Messages</button>
            </>
          )}
        </nav>
        <UserEmailBadge email={userEmail} />
      </div>

      {tab === "find" ? (
        <FindTab query={query} setQuery={setQuery} />
      ) : (
        <WorkerFormSection workerForm={workerForm} setWorkerForm={setWorkerForm} />
      )}
    </div>
  );
}

/** Presentational bits — typed and lint-safe */

function UserEmailBadge({ email }: { email: string | null }) {
  return (
    <div className="text-sm text-gray-600">
      {email ? `Signed in as ${email}` : "Not signed in"}
    </div>
  );
}

function FindTab({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value);
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">What do you need help with?</label>
        <input
          className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          placeholder="e.g. Plumbing, Electrical, Carpentry"
          value={query}
          onChange={onChange}
        />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Results</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {["John Doe · Plumbing", "Jane Smith · Electrical", "Mark Lee · Carpentry"]
            .filter((x) => x.toLowerCase().includes(query.toLowerCase()))
            .map((x) => (
              <div key={x} className="border rounded p-3">
                {x}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function WorkerFormSection({
  workerForm,
  setWorkerForm,
}: {
  workerForm: WorkerForm;
  setWorkerForm: React.Dispatch<React.SetStateAction<WorkerForm>>;
}) {
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return;

    // Map UI fields -> worker_profiles columns
    const trades =
      workerForm.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    const certifications =
      workerForm.credentials
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    const payload = {
      user_id: user.id,
      bio: workerForm.about || null,
      trades,
      certifications,
      years_experience:
        workerForm.years_experience === "" ? null : Number(workerForm.years_experience),
      rate_type: "hourly" as const,
      rate_cents:
        workerForm.hourly_rate === ""
          ? null
          : Math.max(0, Number(workerForm.hourly_rate)) * 100,
      // service_radius_km: (derive from service_area later, if you add a numeric field)
      availability: workerForm.availability
        ? ({ note: workerForm.availability } as AvailabilityJSON)
        : null,
      portfolio_urls: workerForm.portfolio ? [workerForm.portfolio] : [],
    };

    const { error } = await supabase.from("worker_profiles").upsert(payload);
    if (!error) {
      // Optional: toast success
    }
  }

  return (
    <form className="space-y-4 max-w-2xl" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Specialties"
          name="specialties"
          placeholder="e.g. Plumbing, HVAC, Roofing"
          value={workerForm.specialties}
          onChange={(v) => setWorkerForm((s) => ({ ...s, specialties: v }))}
        />
        <NumberField
          label="Years of experience"
          name="years_experience"
          placeholder="e.g. 5"
          value={workerForm.years_experience}
          onChange={(v) => setWorkerForm((s) => ({ ...s, years_experience: v }))}
        />
        <NumberField
          label="Hourly rate ($)"
          name="hourly_rate"
          placeholder="e.g. 75"
          value={workerForm.hourly_rate}
          onChange={(v) => setWorkerForm((s) => ({ ...s, hourly_rate: v }))}
        />
        <TextField
          label="Service area"
          name="service_area"
          placeholder="e.g. Bay Area, 20mi radius"
          value={workerForm.service_area}
          onChange={(v) => setWorkerForm((s) => ({ ...s, service_area: v }))}
        />
      </div>

      <TextField
        label="Credentials"
        name="credentials"
        placeholder="e.g. License #, Certifications"
        value={workerForm.credentials}
        onChange={(v) => setWorkerForm((s) => ({ ...s, credentials: v }))}
      />

      <TextField
        label="Portfolio link"
        name="portfolio"
        placeholder="e.g. website, Instagram"
        value={workerForm.portfolio}
        onChange={(v) => setWorkerForm((s) => ({ ...s, portfolio: v }))}
      />

      <TextAreaField
        label="About you"
        name="about"
        placeholder="Brief description"
        value={workerForm.about}
        onChange={(v) => setWorkerForm((s) => ({ ...s, about: v }))}
      />

      <TextField
        label="Availability"
        name="availability"
        placeholder="e.g. Weekdays 8am–6pm, Sat by appointment"
        value={workerForm.availability}
        onChange={(v) => setWorkerForm((s) => ({ ...s, availability: v }))}
      />

      <div className="flex gap-3">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2">
          Save
        </button>
      </div>
    </form>
  );
}

/* Small typed inputs */
function TextField({
  label,
  name,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        className="w-full border border-gray-300 rounded px-3 py-2"
        placeholder={placeholder}
        value={value}
        onChange={onChangeInput}
      />
    </div>
  );
}

function NumberField({
  label,
  name,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder?: string;
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  const onChangeNumber = (e: ChangeEvent<HTMLInputElement>) => {
    const n = e.target.value;
    onChange(n === "" ? "" : Number(n));
  };
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type="number"
        min={0}
        className="w-full border border-gray-300 rounded px-3 py-2"
        placeholder={placeholder}
        value={value}
        onChange={onChangeNumber}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const onChangeText = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value);
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        name={name}
        className="w-full border border-gray-300 rounded px-3 py-2"
        rows={5}
        placeholder={placeholder}
        value={value}
        onChange={onChangeText}
      />
    </div>
  );
}
