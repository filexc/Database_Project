import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import AlphabetFilter from './components/AlphabetFilter';
import DatabaseList from './components/DatabaseList';
import ResultsToolbar from './components/ResultsToolbar';
import FilterChips from './components/FilterChips';
import { matchesFilters } from './utils/filters';
import { splitTsvLine, splitTsvRecords } from './utils/tsv';

const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
};

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';

// CORS proxy for production deployment
const getSheetUrl = () => {
  return SHEET_URL;
};

function App() {
  const [allItemsData, setAllItemsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    primaryTags: ['all', 'all'],
    secondaryTags: ['all'],
    provider: 'all',
    letters: [],
    matchMode: 'AND'
  });
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allItemsData]);

  const sortedFilteredData = useMemo(() => {
    const nameCompare = (a, b) =>
      (a.name || '')
        .trim()
        .localeCompare((b.name || '').trim(), undefined, {
          sensitivity: 'base',
          numeric: true
        });

    const list = [...filteredData];
    if (sortBy === 'name') {
      list.sort((a, b) => nameCompare(a, b));
    } else if (sortBy === 'provider') {
      const provKey = (item) => (item.provider || '').trim();
      list.sort((a, b) => {
        const pa = provKey(a);
        const pb = provKey(b);
        if (!pa && !pb) return nameCompare(a, b);
        if (!pa) return 1;
        if (!pb) return -1;
        const cmp = pa.localeCompare(pb, undefined, {
          sensitivity: 'base',
          numeric: true
        });
        if (cmp !== 0) return cmp;
        return nameCompare(a, b);
      });
    }
    return list;
  }, [filteredData, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = getSheetUrl();
      devLog('Fetching data from:', url);
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/plain,text/html',
          'Content-Type': 'text/plain',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvData = await response.text();
      devLog('Data received, length:', csvData.length);
      devLog('First 200 characters:', csvData.substring(0, 200));

      const processedData = processSheetData(csvData);
      devLog('Processed data count:', processedData.length);
      
      setAllItemsData(processedData);
      
      // Extract providers
      const providerSet = new Set(processedData.map(item => item.provider).filter(Boolean));
      setProviders(Array.from(providerSet).sort());
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading the sheet:', error);
      console.error('Error details:', error.message);
      setError('We could not load the database list. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const cleanTag = (tag) => {
    if (!tag) return '';
    return tag.trim().replace(/^\s*[xX]/, '').replace(/\s+/g, ' ').replace(/\u00A0/g, ' ');
  };

  const processSheetData = (csvData) => {
    const lines = splitTsvRecords(csvData.trim());
    const processedData = [];

    for (let i = 1; i < lines.length; i++) {
      const entry = parseLine(lines[i], i);
      processedData.push(entry);
    }

    return processedData;
  };

  const parseLine = (line, rowIndex) => {
    const parts = splitTsvLine(line);
    const name = parts[0] || '';
    const provider = parts[1] || '';
    const imageUrl = parts[2] || '';
    const databaseUrl = parts[3] || '';
    const databaseDescriptionText = parts[4] || '';

    // Column 5 becomes tag1 (first primary tag)
    const tag1 = cleanTag(parts[5]);

    // Column 6 becomes tag2 (second primary tag)
    const tag2 = cleanTag(parts[6]);

    const tags = parts.slice(7).map(cleanTag).filter(Boolean);

    let firstLetter = name.trim().charAt(0).toUpperCase();
    if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

    const urlKey = databaseUrl.trim();
    const nameKey = name.trim();
    const id = urlKey || `n:${nameKey}|p:${provider.trim()}|${rowIndex}`;

    return {
      id,
      name,
      provider,
      imageUrl,
      databaseUrl,
      databaseDescriptionText,
      tag1,
      tag2,
      tags,
      firstLetter
    };
  };

  const applyFilters = () => {
    const filtered = allItemsData.filter((item) =>
      matchesFilters(item, filters, { includeLetter: true })
    );
    setFilteredData(filtered);
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFilters };
      if (next.matchMode === 'AND' && (next.letters || []).length > 1) {
        next.letters = next.letters.slice(0, 1);
      }
      return next;
    });
  };

  const addSecondaryTagFromClick = (tag) => {
    setFilters(prev => {
      const currentSecondary = prev.secondaryTags || ['all'];

      // Do not duplicate tags already selected.
      if (currentSecondary.includes(tag)) {
        return { ...prev, letters: [] };
      }

      const nextSecondary = [...currentSecondary];
      const firstEmptyIndex = nextSecondary.findIndex(value => value === 'all');

      if (firstEmptyIndex >= 0) {
        nextSecondary[firstEmptyIndex] = tag;
      } else {
        nextSecondary.push(tag);
      }

      return {
        ...prev,
        secondaryTags: nextSecondary,
        letters: []
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      primaryTags: ['all', 'all'],
      secondaryTags: ['all'],
      provider: 'all',
      letters: [],
      matchMode: 'AND'
    });
  };

  if (loading) {
    return (
      <div className="App">
        <Header logo="/Database_Project/images/CastillejaLogo.png" />
        <div className="loading" role="status" aria-live="polite">
          <p className="loading-title">Loading databases...</p>
          <p className="loading-subtext">Gathering results and building filters for you.</p>
          <div className="skeleton-list" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton-item">
                <div className="skeleton-logo"></div>
                <div className="skeleton-text-block">
                  <div className="skeleton-line skeleton-line-title"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-tags">
                    <span className="skeleton-tag"></span>
                    <span className="skeleton-tag"></span>
                    <span className="skeleton-tag"></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <Header logo="/Database_Project/images/CastillejaLogo.png" />
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button className="retry-button" onClick={fetchData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header logo="/Database_Project/images/CastillejaLogo.png" />

      <div className="sticky-filters-wrap">
        <FilterBar
          allItemsData={allItemsData}
          filters={filters}
          providers={providers}
          onFilterChange={updateFilters}
          onClearFilters={clearFilters}
        />

        <AlphabetFilter
          allItemsData={allItemsData}
          selectedLetters={filters.letters || []}
          multiLetter={
            filters.matchMode === 'OR_ANY' ||
            filters.matchMode === 'PRIMARY_AND_SECONDARY_OR'
          }
          onLettersChange={(letters) => updateFilters({ letters })}
          filters={filters}
        />

        <FilterChips filters={filters} onFilterChange={updateFilters} />
      </div>

      <ResultsToolbar
        count={sortedFilteredData.length}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <DatabaseList
        filteredData={sortedFilteredData}
        groupingMode={sortBy === 'name' ? 'letter' : 'provider'}
        hasActiveFilters={
          (filters.primaryTags || []).some((p) => p !== 'all') ||
          (filters.secondaryTags || []).some(tag => tag !== 'all') ||
          filters.provider !== 'all' ||
          (filters.letters || []).length > 0
        }
        onClearFilters={clearFilters}
        onTagClick={(tag, isPrimary, tag1, tag2) => {
          if (isPrimary === 1) {
            setFilters((prev) => {
              const next = [...(prev.primaryTags || ['all', 'all'])];
              const empty = next.findIndex((v) => v === 'all');
              if (empty >= 0) next[empty] = tag1;
              else next[0] = tag1;
              return { ...prev, primaryTags: next, letters: [] };
            });
          } else if (isPrimary === 2) {
            setFilters((prev) => {
              const next = [...(prev.primaryTags || ['all', 'all'])];
              const empty = next.findIndex((v) => v === 'all');
              if (empty >= 0) next[empty] = tag;
              else next[1] = tag;
              return { ...prev, primaryTags: next, letters: [] };
            });
          } else {
            // Secondary tag clicked - fill next available secondary slot.
            addSecondaryTagFromClick(tag);
          }
        }}
      />
    </div>
  );
}

export default App;
