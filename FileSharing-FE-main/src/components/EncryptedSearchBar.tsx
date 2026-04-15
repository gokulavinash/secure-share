import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface EncryptedSearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function EncryptedSearchBar({
  onSearch,
  onClear,
  placeholder = 'Search files... (e.g., report AND 2024 NOT draft)',
  isLoading = false,
}: EncryptedSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // Auto-reset when search bar is cleared
    if (newValue === '' && onClear) {
      onClear();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 items-center w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-10"
          disabled={isLoading}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
        {isLoading ? 'Searching...' : 'Search'}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Boolean Search Operators</h4>
            <div className="space-y-2 text-sm">
              <div>
                <Badge variant="secondary" className="mr-2">AND</Badge>
                <span className="text-muted-foreground">
                  Both terms must be present
                </span>
                <p className="text-xs text-muted-foreground mt-1 ml-2">
                  Example: <code>report AND 2024</code>
                </p>
              </div>
              <div>
                <Badge variant="secondary" className="mr-2">OR</Badge>
                <span className="text-muted-foreground">
                  Either term can be present
                </span>
                <p className="text-xs text-muted-foreground mt-1 ml-2">
                  Example: <code>invoice OR receipt</code>
                </p>
              </div>
              <div>
                <Badge variant="secondary" className="mr-2">NOT</Badge>
                <span className="text-muted-foreground">
                  Exclude files with this term
                </span>
                <p className="text-xs text-muted-foreground mt-1 ml-2">
                  Example: <code>document NOT draft</code>
                </p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Search is performed on encrypted data using secure indexing.
                Your files remain encrypted during the search process.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
