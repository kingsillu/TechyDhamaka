import fs from 'fs';
import path from 'path';
import Parser from 'rss-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['description', 'description'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

const RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'news', source: 'BBC News' },
  { url: 'https://rss.cnn.com/rss/edition.rss', category: 'news', source: 'CNN' },
  { url: 'https://feeds.reuters.com/reuters/topNews', category: 'news', source: 'Reuters' },
  { url: 'https://www.gamespot.com/feeds/mashup/', category: 'gaming', source: 'GameSpot' },
  { url: 'https://feeds.ign.com/ign/games-all', category: 'gaming', source: 'IGN Gaming' },
  { url: 'https://www.polygon.com/rss/index.xml', category: 'gaming', source: 'Polygon' },
  { url: 'https://feeds.feedburner.com/TechCrunch', category: 'technology', source: 'TechCrunch' },
  { url: 'https://www.wired.com/feed/rss', category: 'technology', source: 'Wired' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', source: 'Ars Technica' },
  { url: 'https://feeds.feedburner.com/variety/headlines', category: 'entertainment', source: 'Variety' },
  { url: 'https://www.hollywoodreporter.com/feed/', category: 'entertainment', source: 'Hollywood Reporter' },
  { url: 'https://ew.com/feed/', category: 'entertainment', source: 'Entertainment Weekly' }
];

function extractImageUrl(item: any): string | undefined {
  // Try different image sources in order of preference
  if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
    return item.mediaContent.$.url;
  }
  
  if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
    return item.mediaThumbnail.$.url;
  }
  
  if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // Try to extract image from content
  const content = item.contentEncoded || item.description || item.summary || '';
  if (content) {
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
  }
  
  return undefined;
}

function cleanHtmlContent(htmlContent: string): string {
  if (!htmlContent) return '';
  
  return htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);
}

async function fetchFeed(feedUrl: string, category: string, source: string) {
  try {
    console.log(`Fetching feed from ${source}...`);
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items.slice(0, 5).map((item, index) => ({
      id: `${source.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
      title: item.title || 'No title',
      summary: cleanHtmlContent(item.contentSnippet || item.description || item.summary || 'No summary available'),
      externalUrl: item.link || '#',
      imageUrl: extractImageUrl(item),
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      category: category,
      source: source
    }));
  } catch (error) {
    console.error(`Error fetching feed from ${source}:`, error);
    return [];
  }
}

async function generateStaticData() {
  console.log('🚀 Generating static data...');
  
  const promises = RSS_FEEDS.map(({ url, category, source }) => 
    fetchFeed(url, category, source)
  );
  
  const results = await Promise.all(promises);
  const allArticles = results.flat();
  
  // Sort by published date (newest first)
  allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'client', 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write all articles
  const articlesPath = path.join(outputDir, 'articles.json');
  fs.writeFileSync(articlesPath, JSON.stringify(allArticles, null, 2));
  
  // Write articles by category
  const categories = ['news', 'gaming', 'technology', 'entertainment'];
  for (const category of categories) {
    const categoryArticles = allArticles.filter(article => article.category === category);
    const categoryPath = path.join(outputDir, `articles-${category}.json`);
    fs.writeFileSync(categoryPath, JSON.stringify(categoryArticles, null, 2));
  }
  
  console.log(`✅ Generated ${allArticles.length} articles`);
  console.log('📁 Static files created:');
  console.log('   - /articles.json');
  categories.forEach(cat => console.log(`   - /articles-${cat}.json`));
}

// Run the generation
generateStaticData().catch(console.error);