import { Dashboard } from '@/pages/dashboard.page';
import { FloatingActionBar } from '@/features/transactions/components/action-bar.component';

export default function DashboardRoute() {
  return (
    <>
      <Dashboard />
      <FloatingActionBar />
    </>
  );
}
