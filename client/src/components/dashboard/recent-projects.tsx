import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '../../lib/api';
import { Link } from 'wouter';

export function RecentProjects() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects']
  });

  const recentProjects = projects.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 border border-secondary-200">
        <CardHeader className="border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-secondary-900">Recent Projects</h2>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-secondary-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 border border-secondary-200">
      <CardHeader className="border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary-900">Recent Projects</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700" data-testid="button-view-all-projects">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {recentProjects.length === 0 ? (
          <div className="p-6 text-center text-secondary-500">
            No projects found. Create your first project to get started.
          </div>
        ) : (
          <div className="divide-y divide-secondary-200">
            {recentProjects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-secondary-50 transition-colors" data-testid={`project-${project.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {getInitials(project.name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-secondary-900">{project.name}</h3>
                      <p className="text-sm text-secondary-600">
                        {project.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-secondary-500">
                      {project.endDate ? `Due ${new Date(project.endDate).toLocaleDateString()}` : 'No due date'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
