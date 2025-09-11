import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AppLayout } from "../components/layout/app-layout";
import {
  ExternalLink,
  TrendingUp,
  Users,
  Heart,
  Shield,
  Target,
  BookOpen,
  BarChart3,
  RefreshCw,
} from "lucide-react";

export default function NewsMonitoring() {
  const currentTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const {
    data: newsMonitoringData = [],
    refetch: refetchNewsMonitoring,
    isLoading: isLoadingNews,
  } = useQuery({
    queryKey: ["/api/news-monitoring/airtable"],
  });

  // Get the first news item to display (you can extend this to show multiple items)
  const newsItem = newsMonitoringData.length > 0 ? newsMonitoringData[0] : null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-50";
    if (score >= 80) return "bg-blue-50";
    if (score >= 70) return "bg-yellow-50";
    return "bg-red-50";
  };

  if (isLoadingNews) {
    return (
      <AppLayout title="News Monitoring" subtitle="Loading...">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-secondary-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-secondary-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="News Monitoring"
      subtitle={`Last updated: ${currentTime}`}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">News & Media Monitoring</h2>
            <p className="text-secondary-600">
              Track industry news, mentions, and competitor activities
            </p>
          </div>
          <Button
            onClick={() => refetchNewsMonitoring()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isLoadingNews}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoadingNews ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
        </div>

        {newsItem ? (
          /* Main News Item with real data */
          <Card className="border-border/60">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2" data-testid="news-title">
                    {newsItem.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                      {newsItem.category}
                    </Badge>
                    <Badge variant="outline" className="text-gray-600">
                      {newsItem.contentType}
                    </Badge>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                      {newsItem.weeklyTrendTag}
                    </Badge>
                  </div>
                  <a 
                    href={newsItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                    data-testid="news-url"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Article
                  </a>
                </div>
                <div className={`text-center p-4 rounded-lg ${getScoreBgColor(newsItem.totalScore)}`}>
                  <div className={`text-3xl font-bold ${getScoreColor(newsItem.totalScore)}`}>
                    {newsItem.totalScore}%
                  </div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Score Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600" data-testid="sentiment-score">
                    {newsItem.sentimentScore}%
                  </div>
                  <div className="text-sm text-gray-600">Sentiment Score</div>
                  <Progress value={newsItem.sentimentScore} className="h-2 mt-2" />
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600" data-testid="relevance-score">
                    {newsItem.relevanceScore}%
                  </div>
                  <div className="text-sm text-gray-600">Relevance Score</div>
                  <Progress value={newsItem.relevanceScore} className="h-2 mt-2" />
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600" data-testid="authority-score">
                    {newsItem.sourceAuthorityScore}%
                  </div>
                  <div className="text-sm text-gray-600">Source Authority</div>
                  <Progress value={newsItem.sourceAuthorityScore} className="h-2 mt-2" />
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600" data-testid="engagement-score">
                    {newsItem.engagementScore}%
                  </div>
                  <div className="text-sm text-gray-600">Engagement Score</div>
                  <Progress value={newsItem.engagementScore} className="h-2 mt-2" />
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Recommended Actions</h3>
                </div>
                <p className="text-gray-700" data-testid="recommended-actions">
                  {newsItem.recommendedActions}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* No data available */
          <Card className="border-border/60">
            <CardContent className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">📰</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No News Data Available</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any news monitoring data. This could be because:
              </p>
              <ul className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-1 mb-4">
                <li>• The Airtable 'News Scores' table is empty</li>
                <li>• There's a connection issue with Airtable</li>
                <li>• The data is still being processed</li>
              </ul>
              <Button 
                onClick={() => refetchNewsMonitoring()}
                className="mt-4"
                disabled={isLoadingNews}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNews ? "animate-spin" : ""}`} />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Additional Monitoring Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">B2B Marketing Strategies</span>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Hot</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Lead Generation</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Rising</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Digital Transformation</span>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Stable</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Content Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Article Views</span>
                    <span className="font-medium">12,450</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Social Shares</span>
                    <span className="font-medium">892</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Comments</span>
                    <span className="font-medium">156</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}