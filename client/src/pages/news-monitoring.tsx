import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AppLayout } from "../components/layout/app-layout";
import {
  ExternalLink,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  articleUrl: string;
  createdDate: string;
  url?: string;
  createdTime?: string;
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
          /* Display latest 4 news items with Title, Article URL, and Created Date */
          <div className="space-y-4">
            {newsMonitoringData.map((newsItem: NewsItem, index: number) => (
              <Card 
                key={newsItem.id} 
                className={`border-border/60 transition-all duration-300 ease-in-out hover:shadow-md ${
                  isFetchingNews && !isLoadingNews ? 'animate-pulse opacity-70' : 'opacity-100'
                }`}
                data-testid={`news-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3" data-testid={`news-title-${index}`}>
                        {newsItem.title}
                      </h3>
                      
                      <div className="space-y-2">
                        {newsItem.articleUrl && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-gray-500" />
                            <a 
                              href={newsItem.articleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                              data-testid={`news-article-url-${index}`}
                            >
                              View Original Article
                            </a>
                          </div>
                        )}
                        
                        {newsItem.createdDate && (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 text-gray-500 flex items-center justify-center">
                              📅
                            </div>
                            <span className="text-sm text-gray-600" data-testid={`news-created-date-${index}`}>
                              {new Date(newsItem.createdDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long', 
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
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