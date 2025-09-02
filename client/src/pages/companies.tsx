  import { AppLayout } from '../components/layout/app-layout';
import { CompetitorComparison } from '../components/companies/competitor-comparison';
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
import { Plus, Search, Building, Users, RefreshCw, Database, Cloud, Globe, Mail, Phone, MapPin, TrendingUp, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '../lib/api';
import { useToast } from '../hooks/use-toast';

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
  const [expandedReports, setExpandedReports] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['/api/companies']
  });

  const { data: airtableCompanies = [], isLoading: isLoadingAirtable, refetch: refetchAirtable } = useQuery({
    queryKey: ['/api/companies/airtable'],
    enabled: dataSource === 'airtable'
  });


  // Fetch rendering reports from Airtable to show competitor data
  const { data: renderingReports = [], isLoading: isLoadingReports, refetch: refetchRenderingReports } = useQuery({
    queryKey: ['/api/rendering-reports/airtable'],
    enabled: true // Always fetch rendering reports to show competitor data
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
      await Promise.all([
        refetchAirtable(),
        refetchRenderingReports(),
        Promise.resolve()
      ]);
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

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
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
                {airtableCompanies.length} companies
              </Badge>
            )}
            {renderingReports.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                {renderingReports.length} reports
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshAirtable}
            disabled={isRefreshing || isLoadingAirtable || isLoadingReports}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing || isLoadingAirtable || isLoadingReports ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
                        {dataSource === 'airtable' && renderingReports.some((r: any) => 
                          r.companyName?.toLowerCase() === company.name?.toLowerCase() ||
                          r.companyName?.toLowerCase() === company.Name?.toLowerCase()
                        ) && (
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Report Available
                          </Badge>
                        )}
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
                  
                </div>
                
                {/* Auto-show Competitor Comparison for client companies with reports */}
                {company.type === 'client' && (
                  <div className="mt-4 border-t pt-4">
                    {(() => {
                      if (isLoadingReports) {
                        return (
                          <div className="flex items-center justify-center py-4">
                            <RefreshCw className="w-5 h-5 animate-spin text-primary-600 mr-2" />
                            <span className="text-secondary-600">Loading competitor data from Airtable...</span>
                          </div>
                        );
                      }

                      if (!renderingReports || !Array.isArray(renderingReports) || renderingReports.length === 0) {
                        return (
                          <div className="text-center py-4 text-secondary-500">
                            No competitor reports available from Airtable.
                          </div>
                        );
                      }

                      
                      // Improved name matching - try multiple variations
                      const companyNameLower = company.name?.toLowerCase().trim();
                      const report = renderingReports.find((r: any) => {
                        const reportNameLower = r.companyName?.toLowerCase().trim();
                        
                        // Exact match
                        if (reportNameLower === companyNameLower) return true;
                        
                        // Contains match
                        if (reportNameLower?.includes(companyNameLower) || companyNameLower?.includes(reportNameLower)) return true;
                        
                        // Try without common suffixes and prefixes
                        const cleanCompany = companyNameLower?.replace(/\s+(llc|inc|corp|ltd|ai|lab|labs)$/g, '').replace(/^(the\s+)/g, '');
                        const cleanReport = reportNameLower?.replace(/\s+(llc|inc|corp|ltd|ai|lab|labs)$/g, '').replace(/^(the\s+)/g, '');
                        if (cleanReport === cleanCompany) return true;
                        
                        // Word-by-word matching (at least 2 words match)
                        const companyWords = companyNameLower?.split(/\s+/) || [];
                        const reportWords = reportNameLower?.split(/\s+/) || [];
                        const matchingWords = companyWords.filter(word => reportWords.includes(word));
                        if (matchingWords.length >= Math.min(2, companyWords.length)) return true;
                        
                        // Similar length strings with high character overlap
                        if (companyNameLower && reportNameLower && 
                            Math.abs(companyNameLower.length - reportNameLower.length) <= 3) {
                          const commonChars = companyNameLower.split('').filter(char => reportNameLower.includes(char)).length;
                          const similarity = commonChars / Math.max(companyNameLower.length, reportNameLower.length);
                          if (similarity > 0.8) return true;
                        }
                        
                        return false;
                      });
                      
                      
                      if (!report) {
                        return (
                          <div className="text-center py-4 text-secondary-500">
                            No competitor report available for "{company.name}" in Airtable.
                            <br />
                            <small className="text-xs">Available companies: {renderingReports.map((r: any) => r.companyName).join(', ')}</small>
                          </div>
                        );
                      }
                      
                      // Parse competitor scores if it's a JSON string
                      let competitorScores = [];
                      try {
                        competitorScores = typeof report.competitorScores === 'string' 
                          ? JSON.parse(report.competitorScores) 
                          : report.competitorScores || [];
                      } catch (e) {
                        // Error parsing competitor scores - using empty array
                        competitorScores = [];
                      }
                      
                      
                      return (
                        <CompetitorComparison
                          companyName={report.companyName || company.name}
                          clientTraffic={report.clientTraffic}
                          clientKeywords={report.clientKeywords}
                          clientBacklinks={report.clientBacklinks}
                          competitorScores={competitorScores}
                        />
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dedicated section for Airtable Rendering Reports - Show all companies from Airtable */}
      {renderingReports && renderingReports.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Competitor Analysis Reports</h2>
              <p className="text-secondary-600">All companies with competitor data from Airtable</p>
            </div>
            <Button
              onClick={() => refetchRenderingReports()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoadingReports}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingReports ? 'animate-spin' : ''}`} />
              Refresh Reports
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            {renderingReports.map((report: any) => {
              const isExpanded = expandedReports.includes(report.id);
              
              // Parse competitor scores if it's a JSON string
              let competitorScores = [];
              try {
                competitorScores = typeof report.competitorScores === 'string' 
                  ? JSON.parse(report.competitorScores) 
                  : report.competitorScores || [];
              } catch (e) {
                competitorScores = [];
              }

              return (
                <Card key={report.id} className="border border-border/60" data-testid={`report-card-${report.id}`}>
                  <CardHeader className="pb-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-secondary/20 rounded-lg p-2 -m-2 transition-colors"
                      onClick={() => toggleReportExpansion(report.id)}
                      data-testid={`report-toggle-${report.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-secondary-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-secondary-600" />
                        )}
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold" data-testid={`report-company-name-${report.id}`}>
                            {report.companyName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-secondary-600 mt-1">
                            {report.website && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span data-testid={`report-url-${report.id}`}>{report.website}</span>
                              </div>
                            )}
                            {report.createdTime && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span data-testid={`report-date-${report.id}`}>
                                  {new Date(report.createdTime).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-secondary-500">
                        {isExpanded ? 'Click to collapse' : 'Click to expand'}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" data-testid={`report-traffic-${report.id}`}>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Traffic: {report.clientTraffic || 'N/A'}
                          </Badge>
                          <Badge variant="secondary" data-testid={`report-keywords-${report.id}`}>
                            <Globe className="h-3 w-3 mr-1" />
                            Keywords: {report.clientKeywords || 'N/A'}
                          </Badge>
                          <Badge variant="secondary" data-testid={`report-backlinks-${report.id}`}>
                            <Database className="h-3 w-3 mr-1" />
                            Backlinks: {report.clientBacklinks || 'N/A'}
                          </Badge>
                        </div>
                        
                        <CompetitorComparison
                          companyName={report.companyName}
                          clientTraffic={report.clientTraffic}
                          clientKeywords={report.clientKeywords}
                          clientBacklinks={report.clientBacklinks}
                          competitorScores={competitorScores}
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
