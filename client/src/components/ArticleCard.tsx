import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Clock } from 'lucide-react';
import { type Article } from '@shared/schema';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Recently';
    }
  };

  const handleExternalClick = () => {
    window.open(article.externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card 
      data-testid={`article-${article.id}`}
      data-category={article.category}
      className="article-card bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-slate-700 mx-auto max-w-4xl"
    >
      <CardContent className="p-6 text-[19px]">
        <div className="flex gap-4 items-start">
          {/* Image Section */}
          {article.imageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-24 h-18 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <h2 
              data-testid={`title-${article.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2"
            >
              {article.title}
            </h2>

            <p 
              data-testid={`summary-${article.id}`}
              className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed text-sm"
            >
              {article.summary}
            </p>

            <div className="flex items-center justify-between">
              <time 
                data-testid={`time-${article.id}`}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {formatTime(article.publishedAt)}
              </time>
              
              <Button
                onClick={handleExternalClick}
                data-testid={`external-link-${article.id}`}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Read More
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
