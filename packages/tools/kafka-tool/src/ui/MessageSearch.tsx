import React, { useState } from 'react';

interface MessageSearchProps {
  onSearch?: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  searchText?: string;
  filterType: 'key' | 'content' | 'all';
  caseSensitive: boolean;
  useRegex: boolean;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'key' | 'content' | 'all'>('all');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate regex if enabled
    if (useRegex && searchText) {
      try {
        new RegExp(searchText);
      } catch (err) {
        setError('Invalid regular expression');
        return;
      }
    }

    onSearch?.({
      searchText,
      filterType,
      caseSensitive,
      useRegex,
    });
  };

  const handleReset = () => {
    setSearchText('');
    setFilterType('all');
    setCaseSensitive(false);
    setUseRegex(false);
    setError(null);

    onSearch?.({
      searchText: '',
      filterType: 'all',
      caseSensitive: false,
      useRegex: false,
    });
  };

  return (
    <div className="message-search">
      <form onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search messages..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍 Search
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="search-options">
          <div className="option-group">
            <label>Search In:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
              <option value="all">All Fields</option>
              <option value="key">Message Key Only</option>
              <option value="content">Message Content Only</option>
            </select>
          </div>

          <div className="option-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
              />
              Case Sensitive
            </label>
          </div>

          <div className="option-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
              Use Regular Expression
            </label>
          </div>

          <button type="button" onClick={handleReset} className="reset-button">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageSearch;
