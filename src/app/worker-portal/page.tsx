// app/worker-portal/page.tsx
import { Suspense } from 'react';
import WorkerDashboard from './WorkerDashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-600">Loading…</div>}>
      <WorkerDashboard />
    </Suspense>
  );
}

