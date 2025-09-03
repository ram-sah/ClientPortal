import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '../components/layout/app-layout';
import { StatsCards } from '../components/dashboard/stats-cards';
import { RecentProjects } from '../components/dashboard/recent-projects';
import { QuickActions } from '../components/dashboard/quick-actions';
import { AccessRequests } from '../components/dashboard/access-requests';
import { dashboardApi, airtableApi, companyApi } from '../lib/api';
import { useAuth } from '../hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats']
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['/api/companies']
  });

  const { data: renderingReports = [] } = useQuery({
    queryKey: ['/api/rendering-reports/airtable']
  });

  // Get current user's company
  const userCompany = (companies as any[]).find((company: any) => company.id === user?.companyId);
  
  // Get company-specific rendering reports
  const userCompanyReports = (renderingReports as any[]).filter((report: any) => {
    if (!userCompany) return false;
    
    const reportCompanyName = report.fields['Company']?.toLowerCase() || '';
    const userCompanyName = userCompany.name.toLowerCase();
    
    // Simple name matching
    return reportCompanyName.includes(userCompanyName) || 
           userCompanyName.includes(reportCompanyName) ||
           reportCompanyName === userCompanyName;
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
        {/* Company Competitive Analysis */}
        <Card className="border border-secondary-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-secondary-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                {userCompany ? `${userCompany.name} Analysis` : 'Company Analysis'}
              </CardTitle>
              <Badge variant={userCompanyReports.length > 0 ? "default" : "secondary"}>
                {userCompanyReports.length} Reports
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {userCompany ? (
              userCompanyReports.length > 0 ? (
                <div className="space-y-4">
                  {userCompanyReports.slice(0, 3).map((report: any) => (
                    <div key={report.id} className="border border-secondary-100 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary-900">
                            {report.fields['Company'] || 'Company Report'}
                          </h4>
                          <p className="text-sm text-secondary-600 mt-1">
                            {report.fields['Description'] || 'Competitive analysis report'}
                          </p>
                        </div>
                        {report.fields['URL'] && (
                          <a 
                            href={report.fields['URL']} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 ml-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary-500">
                          {report.fields['Date'] ? new Date(report.fields['Date']).toLocaleDateString() : 'No date'}
                        </span>
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {userCompanyReports.length > 3 && (
                    <div className="text-center pt-2">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View All {userCompanyReports.length} Reports
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl text-secondary-400 mb-2">🏢</div>
                  <p className="text-secondary-600 mb-2">No competitive data found</p>
                  <p className="text-sm text-secondary-500">
                    Reports for {userCompany.name} will appear here when available
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl text-secondary-400 mb-2">🏢</div>
                <p className="text-secondary-600">No company assigned</p>
                <p className="text-sm text-secondary-500">Contact an administrator to assign your company</p>
              </div>
            )}
          </CardContent>
        </Card>

        <AccessRequests />
      </div>
    </AppLayout>
  );
}
