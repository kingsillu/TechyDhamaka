import { useState } from 'react';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Search, Wifi, WifiOff } from 'lucide-react';
import { useHybridArticles } from '@/hooks/useHybridArticles';

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    articles, 
    isLoading, 
    isLiveLoading,
    hasLiveContent,
    error,
    refreshFeeds 
  } = useHybridArticles();

  const handleRefresh = async (forceLive: boolean = false) => {
    setIsRefreshing(true);
    try {
      await refreshFeeds(forceLive);
    } catch (error) {
      console.error('Failed to refresh feeds:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredArticles = articles.filter(article => 
    currentCategory === 'all' || article.category === currentCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Header 
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="text-center mb-8 relative">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔥 {currentCategory === 'all' ? 'Latest Updates' : 
               currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} 🚀
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            📰 Stay updated with trending topics and breaking news ⚡
          </p>
          
          <div className="absolute right-0 top-0 flex items-center space-x-2">
            {/* Content Status Indicator */}
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              {hasLiveContent ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-gray-400" />
                  <span>Cached</span>
                </>
              )}
            </div>
            
            {/* Refresh Buttons */}
            <Button
              onClick={() => handleRefresh(false)}
              disabled={isRefreshing || isLiveLoading}
              data-testid="refresh-static-button"
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              {isRefreshing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              <span>Quick</span>
            </Button>
            
            <Button
              onClick={() => handleRefresh(true)}
              disabled={isRefreshing || isLiveLoading}
              data-testid="refresh-live-button"
              variant="default"
              size="sm"
              className="flex items-center space-x-1"
            >
              {isLiveLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Wifi className="w-3 h-3" />
              )}
              <span>Live</span>
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div 
            data-testid="loading-state"
            className="text-center py-12"
          >
            <Loader2 className="inline-block animate-spin h-8 w-8 text-primary-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading latest content...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div 
            data-testid="error-state"
            className="text-center py-12"
          >
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 dark:text-red-300 mb-4">
                Failed to load articles. Please try refreshing the page.
              </p>
              <Button onClick={() => handleRefresh(false)} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && !error && (
          <>
            {filteredArticles.length > 0 ? (
              <div 
                data-testid="articles-grid"
                className="space-y-6 mx-auto"
              >
                {filteredArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div 
                data-testid="no-results"
                className="text-center py-12"
              >
                <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try selecting a different category or refresh for new content.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              <span className="text-amber-500">⚡</span>
              TechyDhamaka
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your ultimate destination for trending tech, gaming, and entertainment news
            </p>
            <div className="flex justify-center space-x-6 mb-4">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Instagram
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 TechyDhamaka. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
