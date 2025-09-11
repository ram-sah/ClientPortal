import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AppLayout } from "../components/layout/app-layout";
import {
  ExternalLink,
  Users,
  Heart,
  Shield,
  Target,
  BookOpen,
  RefreshCw,
  CheckCircle,
  Calendar,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  url: string;
  category: string;
  sentimentScore: number;
  relevanceScore: number;
  sourceAuthorityScore: number;
  engagementScore: number;
  totalScore: number;
  weeklyTrendTag: string;
  recommendedActions: string;
  contentType: string;
  createdTime: string;
  // Additional fields from linked News Monitor table
  articleUrl: string;
  publicationDate: string;
}

export default function NewsMonitoring() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

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
    isFetching: isFetchingNews,
  } = useQuery<NewsItem[]>({
    queryKey: ["/api/news-monitoring/airtable"],
  });

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

  // Animated refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshProgress(0);
    setShowSuccess(false);

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setRefreshProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    try {
      await refetchNewsMonitoring();
      setRefreshProgress(100);
      setLastRefreshTime(new Date());
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to refresh news data:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsRefreshing(false);
        setRefreshProgress(0);
      }, 1000);
    }
  };

  // Display all news items (latest 4)


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
            {lastRefreshTime && (
              <p className="text-sm text-gray-500 mt-1">
                Last refreshed: {lastRefreshTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showSuccess && (
              <div className="flex items-center gap-2 text-green-600 animate-fade-in" data-testid="refresh-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Updated!</span>
              </div>
            )}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isLoadingNews || isRefreshing}
              data-testid="button-refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingNews || isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>

        {/* Progress Bar for Refresh */}
        {isRefreshing && (
          <div className="bg-white rounded-lg border p-4 animate-fade-in" data-testid="refresh-progress">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Fetching latest news...</span>
              <span className="text-sm text-gray-500">{Math.round(refreshProgress)}%</span>
            </div>
            <Progress 
              value={refreshProgress} 
              className="h-2 transition-all duration-300 ease-out"
            />
          </div>
        )}

        {newsMonitoringData.length > 0 ? (
          /* Display all news items with complete data including linked fields */
          <div className="space-y-6">
            {newsMonitoringData.slice(0, 4).map((newsItem: NewsItem, index: number) => (
              <Card 
                key={newsItem.id} 
                className={`border-border/60 transition-all duration-500 ease-in-out ${
                  isFetchingNews && !isLoadingNews ? 'animate-pulse opacity-70' : 'opacity-100'
                }`}
                data-testid={`news-card-${index}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2" data-testid={`news-title-${index}`}>
                        {newsItem.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100" data-testid={`news-category-${index}`}>
                          {newsItem.category}
                        </Badge>
                        <Badge variant="outline" className="text-gray-600" data-testid={`news-content-type-${index}`}>
                          {newsItem.contentType}
                        </Badge>
                        <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100" data-testid={`news-trend-tag-${index}`}>
                          {newsItem.weeklyTrendTag}
                        </Badge>
                      </div>
                      
                      {/* Links and Dates Section */}
                      <div className="space-y-2 mb-3">
                        {newsItem.articleUrl && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <a 
                              href={newsItem.articleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              data-testid={`news-article-url-${index}`}
                            >
                              Article URL
                            </a>
                          </div>
                        )}
                        
                        {newsItem.createdTime && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600" data-testid={`news-created-date-${index}`}>
                              Created: {new Date(newsItem.createdTime).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long', 
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${getScoreBgColor(newsItem.totalScore)}`}>
                      <div className={`text-3xl font-bold ${getScoreColor(newsItem.totalScore)}`} data-testid={`news-total-score-${index}`}>
                        {newsItem.totalScore}%
                      </div>
                      <div className="text-sm text-gray-600">Total Score</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Score Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg transition-all duration-300 hover:shadow-md">
                      <Heart className="h-8 w-8 text-green-600 mx-auto mb-2 transition-transform duration-200 hover:scale-110" />
                      <div className="text-2xl font-bold text-green-600" data-testid={`sentiment-score-${index}`}>
                        {newsItem.sentimentScore}%
                      </div>
                      <div className="text-sm text-gray-600">Sentiment Score</div>
                      <Progress value={newsItem.sentimentScore} className="h-2 mt-2 transition-all duration-500" />
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-lg transition-all duration-300 hover:shadow-md">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2 transition-transform duration-200 hover:scale-110" />
                      <div className="text-2xl font-bold text-blue-600" data-testid={`relevance-score-${index}`}>
                        {newsItem.relevanceScore}%
                      </div>
                      <div className="text-sm text-gray-600">Relevance Score</div>
                      <Progress value={newsItem.relevanceScore} className="h-2 mt-2 transition-all duration-500" />
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg transition-all duration-300 hover:shadow-md">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2 transition-transform duration-200 hover:scale-110" />
                      <div className="text-2xl font-bold text-purple-600" data-testid={`authority-score-${index}`}>
                        {newsItem.sourceAuthorityScore}%
                      </div>
                      <div className="text-sm text-gray-600">Source Authority</div>
                      <Progress value={newsItem.sourceAuthorityScore} className="h-2 mt-2 transition-all duration-500" />
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg transition-all duration-300 hover:shadow-md">
                      <Users className="h-8 w-8 text-orange-600 mx-auto mb-2 transition-transform duration-200 hover:scale-110" />
                      <div className="text-2xl font-bold text-orange-600" data-testid={`engagement-score-${index}`}>
                        {newsItem.engagementScore}%
                      </div>
                      <div className="text-sm text-gray-600">Engagement Score</div>
                      <Progress value={newsItem.engagementScore} className="h-2 mt-2 transition-all duration-500" />
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">Recommended Actions</h3>
                    </div>
                    <p className="text-gray-700" data-testid={`recommended-actions-${index}`}>
                      {newsItem.recommendedActions}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

      </div>
    </AppLayout>
  );
}