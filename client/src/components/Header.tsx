import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

export function Header({ currentCategory, onCategoryChange }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'Home', icon: '🏠' },
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              <span className="text-amber-500">⚡</span>
              TechyDhamaka
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                data-testid={`nav-${category.id}`}
                onClick={() => handleCategoryClick(category.id)}
                className={`font-medium transition-colors pb-1 ${
                  currentCategory === category.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </nav>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              data-testid="theme-toggle"
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600"
            >
              {theme === 'light' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-400" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-700"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                data-testid={`mobile-nav-${category.id}`}
                onClick={() => handleCategoryClick(category.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentCategory === category.id
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
