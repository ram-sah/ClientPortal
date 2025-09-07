import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "../components/layout/app-layout";
import { useAuth } from "../hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Reports() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "weekly" | "monthly" | "quarterly"
  >("weekly");

  const currentTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if user is a client
  const isClientUser =
    user?.role === "client_editor" || user?.role === "client_viewer";

  // Client Dashboard
  if (isClientUser) {
    return (
      <AppLayout title="Reporting" subtitle={`Last updated: ${currentTime}`}>
        <Tabs
          value={selectedPeriod}
          onValueChange={(value: any) => setSelectedPeriod(value)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly Report</TabsTrigger>
          </TabsList>

          {/* Weekly Report Section */}
          <TabsContent value="weekly" className="space-y-6">
            <div className="text-sm text-gray-600 italic mb-4">
              Story: Here's who's coming to the site and how the sales team is
              engaging with new leads.
            </div>

            {/* Vector & HubSpot Visitor Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Vector Visitor Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        company: "TechCorp Inc.",
                        visits: 12,
                        lastVisit: "2 hours ago",
                        score: 85,
                      },
                      {
                        company: "Innovation Labs",
                        visits: 8,
                        lastVisit: "5 hours ago",
                        score: 72,
                      },
                      {
                        company: "Digital Solutions",
                        visits: 6,
                        lastVisit: "1 day ago",
                        score: 68,
                      },
                    ].map((visitor, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{visitor.company}</p>
                          <p className="text-sm text-gray-600">
                            {visitor.visits} visits • {visitor.lastVisit}
                          </p>
                        </div>
                        <Badge
                          variant={
                            visitor.score >= 80 ? "default" : "secondary"
                          }
                        >
                          Score: {visitor.score}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    HubSpot Visitor Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        contact: "John Smith",
                        company: "Alpha Corp",
                        action: "Downloaded whitepaper",
                        time: "30 min ago",
                      },
                      {
                        contact: "Sarah Johnson",
                        company: "Beta Inc",
                        action: "Viewed pricing",
                        time: "2 hours ago",
                      },
                      {
                        contact: "Mike Wilson",
                        company: "Gamma LLC",
                        action: "Submitted form",
                        time: "4 hours ago",
                      },
                    ].map((activity, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{activity.contact}</p>
                        <p className="text-sm text-gray-600">
                          {activity.company}
                        </p>
                        <p className="text-sm text-blue-600">
                          {activity.action} • {activity.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prospecting Section */}
            <Card>
              <CardHeader>
                <CardTitle>Prospecting Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">
                        Call Outcomes This Week
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Connected</span>
                        <span className="font-medium">24</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Voicemail</span>
                        <span className="font-medium">18</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>No Answer</span>
                        <span className="font-medium">12</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">
                        Email Outcomes This Week
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Opened</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Clicked</span>
                        <span className="font-medium">42</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Replied</span>
                        <span className="font-medium">8</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">
                        Sales Activities
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Meetings</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Demos</span>
                        <span className="font-medium">6</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Proposals</span>
                        <span className="font-medium">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paid Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Paid Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">$12,450</p>
                    <p className="text-sm text-gray-600">Ad Spend</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">2.8M</p>
                    <p className="text-sm text-gray-600">Impressions</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">4,250</p>
                    <p className="text-sm text-gray-600">Clicks</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">82</p>
                    <p className="text-sm text-gray-600">Conversions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Report Section */}
          <TabsContent value="monthly" className="space-y-6">
            <div className="text-sm text-gray-600 italic mb-4">
              Story: Here's your progress toward goals and a closer look at
              which channels are the most effective at helping reach those
              goals.
            </div>

            {/* KPI Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>KPI Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      kpi: "Website Traffic",
                      goal: 100000,
                      current: 78500,
                      unit: "visits",
                    },
                    {
                      kpi: "Lead Generation",
                      goal: 500,
                      current: 412,
                      unit: "leads",
                    },
                    {
                      kpi: "Conversion Rate",
                      goal: 3.5,
                      current: 2.8,
                      unit: "%",
                    },
                    {
                      kpi: "Revenue",
                      goal: 1000000,
                      current: 825000,
                      unit: "$",
                    },
                  ].map((metric, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{metric.kpi}</span>
                        <span className="text-gray-600">
                          {metric.unit === "$" && "$"}
                          {metric.current.toLocaleString()}
                          {metric.unit === "%" && "%"} /
                          {metric.unit === "$" && " $"}
                          {metric.goal.toLocaleString()}
                          {metric.unit === "%" && "%"}
                          {metric.unit === "visits" && " visits"}
                          {metric.unit === "leads" && " leads"}
                        </span>
                      </div>
                      <Progress
                        value={(metric.current / metric.goal) * 100}
                        className="h-2"
                      />
                      <div className="text-xs text-right text-gray-500">
                        {((metric.current / metric.goal) * 100).toFixed(0)}% of
                        goal attained
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ABM Scorecard */}
            <Card>
              <CardHeader>
                <CardTitle>ABM Scorecard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Target Accounts Engaged
                      </p>
                      <p className="text-2xl font-bold">42 / 50</p>
                      <p className="text-xs text-green-600">+8 this month</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Email Click Rate</p>
                      <p className="text-2xl font-bold">18.5%</p>
                      <p className="text-xs text-green-600">
                        ↑ 2.3% from last month
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Lead Progression</p>
                      <p className="text-2xl font-bold">26%</p>
                      <p className="text-xs text-red-600">
                        ↓ 1.2% from last month
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Digital Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    SERP Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                      <span>Impressions</span>
                      <span className="font-bold">125,400</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                      <span>Clicks</span>
                      <span className="font-bold">8,250</span>
                    </div>
                    <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                      <span>CTR</span>
                      <span className="font-bold">6.6%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                      <span>Avg. Position</span>
                      <span className="font-bold">12.4</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Social Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">
                          LinkedIn Engagement Rate
                        </span>
                        <span className="text-sm font-medium">4.2%</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Twitter Engagement Rate</span>
                        <span className="text-sm font-medium">2.8%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">
                          Facebook Engagement Rate
                        </span>
                        <span className="text-sm font-medium">3.5%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Funnel & Pipeline Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Funnel & Pipeline Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-3">
                      New Business Pipeline
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Closed-Won</span>
                        <span className="font-medium">$245,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Goal</span>
                        <span className="font-medium">$500,000</span>
                      </div>
                      <Progress value={49} className="h-2 mt-2" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-3">
                      Existing Business Pipeline
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Closed-Won</span>
                        <span className="font-medium">$580,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Goal</span>
                        <span className="font-medium">$600,000</span>
                      </div>
                      <Progress value={97} className="h-2 mt-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quarterly Report Section */}
          <TabsContent value="quarterly" className="space-y-6">
            <div className="text-sm text-gray-600 italic mb-4">
              Story: Here's how TOFU/brand-related tactics are impacting
              engagement and bottom-funnel metrics.
            </div>

            {/* PR Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>PR & Brand Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-600">2.4M</p>
                    <p className="text-sm text-gray-600">
                      Brand Estimated Views
                    </p>
                    <p className="text-xs text-gray-500 mt-1">via Meltwater</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-green-600">156</p>
                    <p className="text-sm text-gray-600">Brand Mentions</p>
                    <p className="text-xs text-gray-500 mt-1">+24% QoQ</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-purple-600">18%</p>
                    <p className="text-sm text-gray-600">Share of Voice</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Industry average: 12%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Trends */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-3">
                        Organic Traffic Trend
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Q1</span>
                          <span className="font-medium">125,000 visits</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Q2</span>
                          <span className="font-medium">142,000 visits</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Q3</span>
                          <span className="font-medium text-green-600">
                            168,000 visits ↑
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-3">
                        Keyword Rankings
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Top 3 positions</span>
                          <span className="font-medium">24 keywords</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Top 10 positions</span>
                          <span className="font-medium">86 keywords</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total tracked</span>
                          <span className="font-medium">250 keywords</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TOFU Trends */}
            <Card>
              <CardHeader>
                <CardTitle>TOFU Trends & Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">
                      Total Engaged Audience
                    </p>
                    <p className="text-3xl font-bold">48,500</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Combined social following (12K) + database (8.5K) + avg.
                      website visitors (28K)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-3">
                        Paid Ad Performance
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Impressions</span>
                          <span className="font-medium">8.4M</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversions</span>
                          <span className="font-medium">342</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cost per conversion</span>
                          <span className="font-medium">$125</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-3">
                        TOFU to BOFU Impact
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>% TAL Engaged</span>
                          <span className="font-medium">42%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Downloads</span>
                          <span className="font-medium">856</span>
                        </div>
                        <div className="flex justify-between">
                          <span>MQL Conversion</span>
                          <span className="font-medium">12.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AppLayout>
    );
  }

  // Admin users see a simple fallback
  return (
    <AppLayout
      title="Reporting Dashboard"
      subtitle="Generate and manage client performance reports"
    >
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-4">
          Admin Reporting Dashboard
        </h3>
        <p className="text-gray-600">
          This is the reporting dashboard for administrators.
        </p>
      </div>
    </AppLayout>
  );
}
