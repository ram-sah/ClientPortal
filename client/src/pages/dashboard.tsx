import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "../components/layout/app-layout";
import { StatsCards } from "../components/dashboard/stats-cards";
import { AccessRequests } from "../components/dashboard/access-requests";
import { CompetitorComparison } from "../components/companies/competitor-comparison";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Globe,
  Database,
  RefreshCw,
  Users,
  Phone,
  Mail,
  Activity,
  Target,
  Search,
  BarChart,
  TrendingDown,
  Eye,
  MessageSquare,
  Share2,
  Award,
  MousePointer,
  Filter,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  Settings,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user } = useAuth();
  const [expandedReports, setExpandedReports] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "quarterly"
  >("weekly");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  const {
    data: renderingReports = [],
    refetch: refetchRenderingReports,
    isLoading: isLoadingReports,
  } = useQuery({
    queryKey: ["/api/rendering-reports/airtable"],
  });

  // Get current user's company
  const userCompany = (companies as any[]).find(
    (company: any) => company.id === user?.companyId,
  );

  // Get company-specific rendering reports
  const userCompanyReports = (renderingReports as any[]).filter(
    (report: any) => {
      if (!userCompany) return false;

      const reportCompanyName = report.companyName?.toLowerCase() || "";
      const userCompanyName = userCompany.name.toLowerCase();

      // Simple name matching
      return (
        reportCompanyName.includes(userCompanyName) ||
        userCompanyName.includes(reportCompanyName) ||
        reportCompanyName === userCompanyName
      );
    },
  );

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId],
    );
  };

  // Generate company initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  const currentTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if user is a client - redirect them to reporting
  const isClientUser =
    user?.role === "client" || user?.role === "client_editor" || user?.role === "client_viewer";

  // Client Dashboard - Marketing Analytics Dashboard
  if (isClientUser) {
    return (
      <AppLayout
        title="Marketing Analytics Dashboard"
        subtitle="Last updated: 2 minutes ago"
        actions={
          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" className="text-gray-600">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Data Source Status */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Data Source Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">
                          Google Analytics 4
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Connected • Last sync: 1 min ago
                      </p>
                    </div>
                    <BarChart className="h-6 w-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">
                          Google Search Console
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Connected • Last sync: 3 min ago
                      </p>
                    </div>
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">
                          HubSpot CRM
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Connected • Last sync: 2 min ago
                      </p>
                    </div>
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Key Metrics - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    TOTAL SESSIONS
                  </p>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  24.6K
                </div>
                <div className="text-sm text-green-600">+5.2%</div>
                <div className="text-xs text-gray-500 mt-1">
                  Google Analytics 4
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <Search className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    SEARCH IMPRESSIONS
                  </p>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  125.8K
                </div>
                <div className="text-sm text-green-600">+8.1%</div>
                <div className="text-xs text-gray-500 mt-1">
                  Google Search Console
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    NEW LEADS
                  </p>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">847</div>
                <div className="text-sm text-green-600">+12.3%</div>
                <div className="text-xs text-gray-500 mt-1">HubSpot CRM</div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-yellow-600 font-bold text-lg">$</span>
                  </div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">
                    REVENUE
                  </p>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  $34,250
                </div>
                <div className="text-sm text-red-600">-2.4%</div>
                <div className="text-xs text-gray-500 mt-1">Cross-platform</div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics - Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">
                  CONVERSION RATE
                </p>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  6.3%
                </div>
                <div className="text-xs text-gray-500">
                  Sessions to leads conversion
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">
                  AVG SESSION DURATION
                </p>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  3:22
                </div>
                <div className="text-xs text-gray-500">
                  Average time on site
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">
                  ORGANIC TRAFFIC
                </p>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  50.2%
                </div>
                <div className="text-xs text-gray-500">
                  Percentage from search
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">
                  COST PER ACQUISITION
                </p>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  $1.39
                </div>
                <div className="text-xs text-gray-500">
                  Average cost per lead
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Admin Dashboard (existing dashboard)
  return (
    <AppLayout title="Dashboard" subtitle={`Last updated: ${currentTime}`}>
      {stats && <StatsCards stats={stats} />}

      {/* Detailed Company Report Section */}
      {userCompany && (
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                {userCompany.name} - Company Report
              </h2>
              <p className="text-secondary-600">
                Detailed competitive analysis and performance metrics
              </p>
            </div>
            <Button
              onClick={() => refetchRenderingReports()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoadingReports}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingReports ? "animate-spin" : ""}`}
              />
              Refresh Reports
            </Button>
          </div>

          {userCompanyReports.length > 0 ? (
            <div className="space-y-2">
              {userCompanyReports.map((report: any) => {
                const isExpanded = expandedReports.includes(report.id);

                // Parse competitor scores if it's a JSON string
                let competitorScores = [];
                try {
                  competitorScores =
                    typeof report.competitorScores === "string"
                      ? JSON.parse(report.competitorScores)
                      : report.competitorScores || [];
                } catch (e) {
                  competitorScores = [];
                }

                return (
                  <div
                    key={report.id}
                    className="bg-white border border-border/60 rounded-lg"
                    data-testid={`report-card-${report.id}`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleReportExpansion(report.id)}
                      data-testid={`report-toggle-${report.id}`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Company Avatar */}
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm border">
                          {getInitials(report.companyName)}
                        </div>

                        {/* Company Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3
                              className="text-lg font-semibold text-gray-900"
                              data-testid={`report-company-name-${report.id}`}
                            >
                              {report.companyName}
                            </h3>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Client
                            </Badge>
                          </div>

                          {report.website && (
                            <div
                              className="text-sm text-gray-600"
                              data-testid={`report-url-${report.id}`}
                            >
                              {report.website.replace(/^https?:\/\//, "")}
                            </div>
                          )}
                        </div>

                        {/* Created Date */}
                        {report.createdTime && (
                          <div
                            className="text-sm text-gray-600"
                            data-testid={`report-date-${report.id}`}
                          >
                            Created:{" "}
                            {new Date(report.createdTime).toLocaleDateString()}
                          </div>
                        )}

                        {/* Expand/Collapse Icon */}
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-4 space-y-4">
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge
                              variant="secondary"
                              data-testid={`report-traffic-${report.id}`}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Traffic: {report.clientTraffic || "N/A"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              data-testid={`report-keywords-${report.id}`}
                            >
                              <Globe className="h-3 w-3 mr-1" />
                              Keywords: {report.clientKeywords || "N/A"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              data-testid={`report-backlinks-${report.id}`}
                            >
                              <Database className="h-3 w-3 mr-1" />
                              Backlinks: {report.clientBacklinks || "N/A"}
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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-4xl text-gray-400 mb-4">📊</div>
              <p className="text-gray-600 mb-2">
                No competitive analysis reports found
              </p>
              <p className="text-sm text-gray-500">
                Reports for {userCompany.name} will appear here when available
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccessRequests />
      </div>
    </AppLayout>
  );
}
