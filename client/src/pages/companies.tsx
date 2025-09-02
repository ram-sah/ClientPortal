  import { AppLayout } from '../components/layout/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Building, Users, MoreVertical, Edit, Trash2, RefreshCw, Database, Cloud, Globe, Mail, Phone, MapPin, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  type: z.enum(['partner', 'client', 'sub'], {
    required_error: 'Please select a company type'
  }),
  domain: z.string().optional(),
  parentId: z.string().optional()
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'local' | 'airtable'>('local');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCompetitiveAnalysis, setShowCompetitiveAnalysis] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['/api/companies']
  });

  const { data: airtableCompanies = [], isLoading: isLoadingAirtable, refetch: refetchAirtable } = useQuery({
    queryKey: ['/api/companies/airtable'],
    enabled: dataSource === 'airtable'
  });

  const { data: competitiveAnalysis = [], isLoading: isLoadingCompetitive, refetch: refetchCompetitive } = useQuery({
    queryKey: ['/api/companies/competitive-analysis'],
    enabled: showCompetitiveAnalysis
  });

  const createCompanyForm = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      type: 'client',
      domain: '',
      parentId: ''
    }
  });

  const createCompanyMutation = useMutation({
    mutationFn: companyApi.createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: 'Company created',
        description: 'New company has been created successfully.',
      });
      setIsCreateDialogOpen(false);
      createCompanyForm.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create company',
        variant: 'destructive'
      });
    }
  });

  const onCreateSubmit = (data: CreateCompanyForm) => {
    createCompanyMutation.mutate(data);
  };

  const handleRefreshAirtable = async () => {
    setIsRefreshing(true);
    try {
      await refetchAirtable();
      if (showCompetitiveAnalysis) {
        await refetchCompetitive();
      }
      toast({
        title: 'Data refreshed',
        description: 'Airtable data has been refreshed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh Airtable data',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleAnalysisExpansion = (companyId: string) => {
    setExpandedAnalysis(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const displayCompanies = dataSource === 'airtable' ? airtableCompanies : companies;
  const filteredCompanies = (displayCompanies as any[]).filter((company: any) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.website?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || company.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'partner':
        return 'bg-orange-100 text-orange-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      case 'sub':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getParentCompanyName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = (displayCompanies as any[]).find((c: any) => c.id === parentId);
    return parent?.name;
  };

  return (
    <AppLayout title="Company Management" subtitle="Manage companies and organizational structure">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-companies"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48" data-testid="select-type-filter">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="sub">Sub-company</SelectItem>
            </SelectContent>
          </Select>

          {/* Data Source Toggle */}
          <div className="flex gap-2">
            <Button
              variant={dataSource === 'local' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataSource('local')}
              data-testid="button-local-data"
            >
              <Database className="w-4 h-4 mr-2" />
              Local
            </Button>
            <Button
              variant={dataSource === 'airtable' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDataSource('airtable')}
              data-testid="button-airtable-data"
            >
              <Cloud className="w-4 h-4 mr-2" />
              Airtable
            </Button>
            {dataSource === 'airtable' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshAirtable}
                  disabled={isRefreshing}
                  data-testid="button-refresh-airtable"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant={showCompetitiveAnalysis ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowCompetitiveAnalysis(!showCompetitiveAnalysis)}
                  data-testid="button-competitive-analysis"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Competitive Analysis
                </Button>
              </>
            )}
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-company">
              <Plus className="w-4 h-4 mr-2" />
              New Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
            </DialogHeader>
            <Form {...createCompanyForm}>
              <form onSubmit={createCompanyForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createCompanyForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createCompanyForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-type">
                            <SelectValue placeholder="Select company type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="sub">Sub-company</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createCompanyForm.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="acmecorp.com" {...field} data-testid="input-company-domain" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createCompanyForm.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Company (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-parent-company">
                            <SelectValue placeholder="Select parent company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {companies.filter(c => c.type === 'owner' || c.type === 'client').map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCompanyMutation.isPending} data-testid="button-create-company-submit">
                    {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Companies</p>
                <p className="text-2xl font-semibold text-secondary-900">{companies.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Building className="text-primary-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Client Companies</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {(displayCompanies as any[]).filter((c: any) => c.type === 'client').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Partner Companies</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {(displayCompanies as any[]).filter((c: any) => c.type === 'partner').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Building className="text-orange-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Sub-companies</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {(displayCompanies as any[]).filter((c: any) => c.type === 'sub').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Building className="text-blue-500 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Source Indicator */}
      {dataSource === 'airtable' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Viewing data from Airtable</span>
            {airtableCompanies.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {airtableCompanies.length} records
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshAirtable}
            disabled={isRefreshing || isLoadingAirtable}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing || isLoadingAirtable ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )}

      {/* Competitive Analysis Section */}
      {showCompetitiveAnalysis && competitiveAnalysis.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Competitive Analysis</h3>
                <Badge variant="outline">{competitiveAnalysis.length} Companies Analyzed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCompetitive ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-secondary-600">Loading competitive data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {competitiveAnalysis.map((analysis: any) => (
                    <div key={analysis.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleAnalysisExpansion(analysis.id)}
                        data-testid={`competitive-analysis-${analysis.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-secondary-900">{analysis.companyName || 'Unknown Company'}</h4>
                            {analysis.competitorAnalysis && (
                              <p className="text-sm text-secondary-600">
                                {analysis.competitorAnalysis.competitors ? 
                                  `${analysis.competitorAnalysis.competitors.length} competitors identified` : 
                                  'Analysis available'}
                              </p>
                            )}
                          </div>
                        </div>
                        {expandedAnalysis.includes(analysis.id) ? (
                          <ChevronUp className="w-5 h-5 text-secondary-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-secondary-400" />
                        )}
                      </div>
                      
                      {expandedAnalysis.includes(analysis.id) && analysis.competitorAnalysis && (
                        <div className="mt-4 space-y-3">
                          {analysis.competitorAnalysis.competitors && analysis.competitorAnalysis.competitors.length > 0 ? (
                            <>
                              <div className="text-sm font-medium text-secondary-700 mb-2">Competitors:</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {analysis.competitorAnalysis.competitors.map((competitor: any, index: number) => (
                                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                                    <div className="font-medium text-secondary-900">
                                      {competitor.name || competitor.company_name || `Competitor ${index + 1}`}
                                    </div>
                                    {competitor.website && (
                                      <a 
                                        href={competitor.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary-600 hover:underline flex items-center mt-1"
                                      >
                                        <Globe className="w-3 h-3 mr-1" />
                                        {new URL(competitor.website).hostname}
                                      </a>
                                    )}
                                    {competitor.description && (
                                      <p className="text-xs text-secondary-600 mt-1">{competitor.description}</p>
                                    )}
                                    {competitor.industry && (
                                      <Badge variant="outline" className="mt-2 text-xs">{competitor.industry}</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <pre className="text-xs text-secondary-700 whitespace-pre-wrap">
                                {JSON.stringify(analysis.competitorAnalysis, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {expandedAnalysis.includes(analysis.id) && analysis.error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">{analysis.error}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Companies List */}
      {(isLoading || isLoadingAirtable) ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-3 bg-secondary-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 w-20 bg-secondary-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              {searchTerm || typeFilter !== 'all' ? 'No companies found' : 'No companies yet'}
            </h3>
            <p className="text-secondary-600 mb-4">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first company to get started.'
              }
            </p>
            {!searchTerm && typeFilter === 'all' && (
              <Button data-testid="button-create-first-company" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Company
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow" data-testid={`company-card-${company.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {getInitials(company.name)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-secondary-900">{company.name}</h3>
                        <Badge className={getTypeColor(company.type)}>
                          {company.type.charAt(0).toUpperCase() + company.type.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-secondary-600">
                        {dataSource === 'airtable' ? (
                          <>
                            {company.website && (
                              <div className="flex items-center space-x-1">
                                <Globe className="w-3 h-3 text-secondary-400" />
                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 underline">
                                  {new URL(company.website).hostname}
                                </a>
                              </div>
                            )}
                            {company.contactEmail && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3 text-secondary-400" />
                                <span>{company.contactEmail}</span>
                              </div>
                            )}
                            {company.contactPhone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-secondary-400" />
                                <span>{company.contactPhone}</span>
                              </div>
                            )}
                            {(company.city || company.state) && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-secondary-400" />
                                <span>{[company.city, company.state].filter(Boolean).join(', ')}</span>
                              </div>
                            )}
                            {company.industry && (
                              <Badge variant="outline" className="text-xs">{company.industry}</Badge>
                            )}
                          </>
                        ) : (
                          <>
                            {company.domain && (
                              <span>{company.domain}</span>
                            )}
                            {company.parentId && (
                              <span>Parent: {getParentCompanyName(company.parentId)}</span>
                            )}
                            <span>Created: {new Date(company.createdAt || company.createdTime || Date.now()).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid={`button-company-actions-${company.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem data-testid={`button-edit-company-${company.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Company
                      </DropdownMenuItem>
                      <DropdownMenuItem data-testid={`button-view-users-${company.id}`}>
                        <Users className="w-4 h-4 mr-2" />
                        View Users
                      </DropdownMenuItem>
                      {company.type !== 'owner' && (
                        <DropdownMenuItem className="text-red-600" data-testid={`button-delete-company-${company.id}`}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Company
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
