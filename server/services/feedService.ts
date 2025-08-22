import Parser from 'rss-parser';
import { type InsertArticle } from '@shared/schema';

const parser = new Parser();

interface FeedSource {
  url: string;
  category: 'news' | 'gaming' | 'technology' | 'entertainment';
  source: string;
}

const feedSources: FeedSource[] = [
  // News sources
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'news', source: 'BBC News' },
  { url: 'https://rss.cnn.com/rss/edition.rss', category: 'news', source: 'CNN' },
  { url: 'https://feeds.reuters.com/reuters/topNews', category: 'news', source: 'Reuters' },
  
  // Gaming sources
  { url: 'https://www.gamespot.com/feeds/mashup/', category: 'gaming', source: 'GameSpot' },
  { url: 'https://feeds.ign.com/ign/games-all', category: 'gaming', source: 'IGN Gaming' },
  { url: 'https://www.polygon.com/rss/index.xml', category: 'gaming', source: 'Polygon' },
  
  // Technology sources
  { url: 'https://feeds.feedburner.com/TechCrunch', category: 'technology', source: 'TechCrunch' },
  { url: 'https://www.wired.com/feed/rss', category: 'technology', source: 'Wired' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', source: 'Ars Technica' },
  
  // Entertainment sources
  { url: 'https://feeds.feedburner.com/variety/headlines', category: 'entertainment', source: 'Variety' },
  { url: 'https://www.hollywoodreporter.com/feed/', category: 'entertainment', source: 'Hollywood Reporter' },
  { url: 'https://ew.com/feed/', category: 'entertainment', source: 'Entertainment Weekly' },
];

function extractImageUrl(item: any, content: string): string | undefined {
  // Try RSS enclosure first (most reliable)
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  // Try media:content or media:thumbnail
  if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
    return item['media:content']['$'].url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail']['$'] && item['media:thumbnail']['$'].url) {
    return item['media:thumbnail']['$'].url;
  }
  
  // Try content:encoded or description for img tags
  const contentToSearch = item['content:encoded'] || content || item.description || '';
  
  // Look for img tags with better regex
  const imgMatches = contentToSearch.match(/<img[^>]+src=['"](https?:\/\/[^'"]+)['"]/gi);
  if (imgMatches) {
    for (const match of imgMatches) {
      const srcMatch = match.match(/src=['"](https?:\/\/[^'"]+)['"]/i);
      if (srcMatch && srcMatch[1]) {
        const url = srcMatch[1];
        // Skip very small images, ads, or tracking pixels
        if (!url.includes('1x1') && !url.includes('pixel') && !url.includes('tracking')) {
          return url;
        }
      }
    }
  }
  
  // Try og:image meta tags
  const ogImageMatch = contentToSearch.match(/<meta[^>]+property=['"](og:image|twitter:image)['"]\s+content=['"](https?:\/\/[^'"]+)['"]/i);
  if (ogImageMatch && ogImageMatch[2]) {
    return ogImageMatch[2];
  }
  
  return undefined;
}

function truncateSummary(content: string, maxLength: number = 200): string {
  // Strip HTML tags
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  
  if (textContent.length <= maxLength) return textContent;
  
  // Find the last space before the limit to avoid cutting words
  const truncated = textContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

function getCategoryImage(category: string): string {
  const categoryImages = {
    news: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
    gaming: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
    technology: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    entertainment: 'https://images.unsplash.com/photo-1489599988025-a4c0d7ad8a0b?w=800&h=400&fit=crop'
  };
  
  return categoryImages[category as keyof typeof categoryImages] || categoryImages.news;
}

export async function fetchAllFeeds(): Promise<InsertArticle[]> {
  const articles: InsertArticle[] = [];
  
  for (const feedSource of feedSources) {
    try {
      console.log(`Fetching feed from ${feedSource.source}...`);
      const feed = await parser.parseURL(feedSource.url);
      
      const feedArticles = feed.items.slice(0, 10).map(item => {
        const summary = truncateSummary(
          item.contentSnippet || item.content || item.title || '', 
          130
        );
        
        const imageUrl = extractImageUrl(item, item.content || '') || undefined;
        
        return {
          title: item.title || 'Untitled',
          summary,
          category: feedSource.category,
          externalUrl: item.link || '#',
          imageUrl,
          publishedAt: item.pubDate || new Date().toISOString(),
          source: feedSource.source,
        } as InsertArticle;
      });
      
      articles.push(...feedArticles);
    } catch (error) {
      console.error(`Error fetching feed from ${feedSource.source}:`, error);
    }
  }
  
  // Shuffle articles to provide variety
  for (let i = articles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [articles[i], articles[j]] = [articles[j], articles[i]];
  }
  
  return articles.slice(0, 50); // Limit to 50 articles total
}
