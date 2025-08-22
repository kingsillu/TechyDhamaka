import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type Article } from '@shared/schema';

const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'news', source: 'BBC News' },
  { url: 'https://www.gamespot.com/feeds/mashup/', category: 'gaming', source: 'GameSpot' },
  { url: 'https://feeds.feedburner.com/TechCrunch', category: 'technology', source: 'TechCrunch' },
  { url: 'https://feeds.feedburner.com/variety/headlines', category: 'entertainment', source: 'Variety' }
];

async function fetchLiveFeeds(): Promise<Article[]> {
  const allArticles: Article[] = [];
  
  for (const feed of RSS_FEEDS) {
    try {
      // Use a CORS proxy service for client-side RSS fetching
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.status === 'ok' && data.items) {
        const articles = data.items.slice(0, 5).map((item: any, index: number) => ({
          id: `live-${feed.source.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
          title: item.title || 'No title',
          summary: (item.description || item.content || '').replace(/<[^>]*>/g, '').substring(0, 200),
          externalUrl: item.link || '#',
          imageUrl: item.thumbnail || item.enclosure?.link,
          publishedAt: item.pubDate || new Date().toISOString(),
          category: feed.category,
          source: feed.source
        }));
        
        allArticles.push(...articles);
      }
    } catch (error) {
      console.log(`Could not fetch live feed from ${feed.source}`);
    }
  }
  
  return allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function useHybridArticles() {
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [hasLiveContent, setHasLiveContent] = useState(false);
  
  // Load static files first (instant)
  const { 
    data: staticArticles = [], 
    isLoading: isStaticLoading,
    error: staticError,
    refetch: refetchStatic 
  } = useQuery<Article[]>({
    queryKey: ['/articles.json'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  // Load live content in background (optional)
  const { 
    data: liveArticles = [],
    error: liveError,
    refetch: refetchLive
  } = useQuery<Article[]>({
    queryKey: ['live-articles'],
    queryFn: fetchLiveFeeds,
    enabled: false, // Don't auto-fetch
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
  
  // Combine articles: use live if available, fallback to static
  const articles = hasLiveContent && liveArticles.length > 0 ? liveArticles : staticArticles;
  
  const refreshFeeds = async (forceLive: boolean = false) => {
    if (forceLive) {
      setIsLiveLoading(true);
      try {
        const result = await refetchLive();
        if (result.data && result.data.length > 0) {
          setHasLiveContent(true);
        }
      } catch (error) {
        console.log('Live fetch failed, using static content');
      } finally {
        setIsLiveLoading(false);
      }
    } else {
      // Just refetch static
      await refetchStatic();
    }
  };
  
  return {
    articles,
    isLoading: isStaticLoading,
    isLiveLoading,
    hasLiveContent,
    error: staticError,
    refreshFeeds
  };
}