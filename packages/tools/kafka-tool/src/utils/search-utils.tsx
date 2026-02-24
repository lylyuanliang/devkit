/**
 * Task 6.6: Search highlight utility
 * Task 6.8: Debounced search implementation
 * Provides utilities for message search highlighting and performance optimization
 */

import { SearchFilters } from '../ui/MessageSearch';

/**
 * Task 6.6: Highlight search term in text
 * Returns JSX with highlighted matches
 */
export function highlightSearchTerm(
  text: string | null,
  searchTerm: string,
  caseSensitive: boolean = false
): React.ReactNode {
  if (!text || !searchTerm) {
    return text;
  }

  try {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, flags);
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          // Check if this part matches the search term
          const isMatch = regex.test(part);
          return isMatch ? (
            <span key={index} className="search-highlight">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </>
    );
  } catch (error) {
    // If regex fails, return original text
    return text;
  }
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Task 6.8: Debounce search function
 * Delays search execution to avoid excessive requests
 */
export function createDebouncedSearch(
  callback: (filters: SearchFilters) => void,
  delayMs: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debouncedSearch(filters: SearchFilters) {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      callback(filters);
      timeoutId = null;
    }, delayMs);
  };
}

/**
 * Task 6.6: Search in messages with filtering
 * Returns matched messages with highlight info
 */
export interface SearchResult {
  messageIndex: number;
  matchType: 'key' | 'content' | 'both';
  highlights: {
    key?: string[];
    value?: string[];
  };
}

export function searchMessages(
  messages: Array<{
    key: string | null;
    value: string;
    partition: number;
    offset: number;
  }>,
  filters: SearchFilters
): SearchResult[] {
  if (!filters.searchTerm) {
    return [];
  }

  const results: SearchResult[] = [];
  const searchTerm = filters.searchTerm;
  const flags = filters.caseSensitive ? 'g' : 'gi';

  let regex: RegExp;
  try {
    regex = filters.useRegex
      ? new RegExp(searchTerm, flags)
      : new RegExp(escapeRegExp(searchTerm), flags);
  } catch (error) {
    // Invalid regex
    return [];
  }

  messages.forEach((message, index) => {
    let matchType: 'key' | 'content' | 'both' | null = null;
    const highlights: { key?: string[]; value?: string[] } = {};

    // Check key match
    const keyMatches = filters.filterType !== 'content' && message.key?.match(regex);
    if (keyMatches) {
      highlights.key = keyMatches;
      matchType = 'key';
    }

    // Check value match
    const valueMatches =
      filters.filterType !== 'key' && message.value?.match(regex);
    if (valueMatches) {
      highlights.value = valueMatches;
      matchType = matchType === 'key' ? 'both' : 'content';
    }

    if (matchType) {
      results.push({
        messageIndex: index,
        matchType,
        highlights,
      });
    }
  });

  return results;
}

/**
 * Task 6.8: Search performance utilities
 * Optimizes search performance on large message sets
 */
export class SearchPerformanceOptimizer {
  private lastSearchTime: number = 0;
  private searchResultCache: Map<string, SearchResult[]> = new Map();
  private cacheHitCount: number = 0;
  private cacheMissCount: number = 0;

  /**
   * Task 6.4: Test search debouncing performance
   */
  getPerformanceStats(): {
    lastSearchTime: number;
    cacheHitRate: number;
    cacheSize: number;
  } {
    const totalRequests = this.cacheHitCount + this.cacheMissCount;
    const hitRate =
      totalRequests > 0
        ? ((this.cacheHitCount / totalRequests) * 100).toFixed(2)
        : '0';

    return {
      lastSearchTime: this.lastSearchTime,
      cacheHitRate: parseFloat(hitRate),
      cacheSize: this.searchResultCache.size,
    };
  }

  /**
   * Search with caching
   */
  search(
    messages: any[],
    filters: SearchFilters
  ): { results: SearchResult[]; fromCache: boolean } {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(filters);

    // Check cache
    if (this.searchResultCache.has(cacheKey)) {
      this.cacheHitCount++;
      this.lastSearchTime = performance.now() - startTime;
      return {
        results: this.searchResultCache.get(cacheKey) || [],
        fromCache: true,
      };
    }

    // Perform search
    this.cacheMissCount++;
    const results = searchMessages(messages, filters);
    this.searchResultCache.set(cacheKey, results);
    this.lastSearchTime = performance.now() - startTime;

    // Keep cache size reasonable
    if (this.searchResultCache.size > 50) {
      const firstKey = Array.from(this.searchResultCache.keys())[0];
      this.searchResultCache.delete(firstKey);
    }

    return { results, fromCache: false };
  }

  private generateCacheKey(filters: SearchFilters): string {
    return `${filters.searchTerm}|${filters.filterType}|${filters.caseSensitive}|${filters.useRegex}`;
  }

  clearCache(): void {
    this.searchResultCache.clear();
    this.cacheHitCount = 0;
    this.cacheMissCount = 0;
  }
}
