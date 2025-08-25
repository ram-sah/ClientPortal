import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../components/layout/app-layout';
import { StatsCards } from '../components/dashboard/stats-cards';
import { RecentProjects } from '../components/dashboard/recent-projects';
import { QuickActions } from '../components/dashboard/quick-actions';
import { AccessRequests } from '../components/dashboard/access-requests';
import { dashboardApi } from '../lib/api';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats']
  });

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Loading...">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-secondary-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-secondary-200 rounded-lg"></div>
            <div className="h-96 bg-secondary-200 rounded-lg"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle={`Last updated: ${currentTime}`}
    >
      {stats && <StatsCards stats={stats} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentProjects />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Reports Performance - Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">Monthly Reports</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="h-48 bg-secondary-50 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-4xl text-secondary-400 mb-2">📊</div>
                <p className="text-secondary-600">Report Performance Chart</p>
                <p className="text-sm text-secondary-500 mt-1">Chart implementation pending</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-secondary-900">18</p>
                <p className="text-sm text-secondary-600">This Month</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-secondary-900">4.2m</p>
                <p className="text-sm text-secondary-600">Avg View Time</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-secondary-900">92%</p>
                <p className="text-sm text-secondary-600">Engagement</p>
              </div>
            </div>
          </div>
        </div>

        <AccessRequests />
      </div>
    </AppLayout>
  );
}
