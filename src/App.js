import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import AlphabetFilter from './components/AlphabetFilter';
import DatabaseList from './components/DatabaseList';
import DatabaseCount from './components/DatabaseCount';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';

// CORS proxy for production deployment
const getSheetUrl = () => {
  return SHEET_URL;
};

function App() {
  const [allItemsData, setAllItemsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    tag1: 'all',
    tag2: 'all',
    tag3: 'all',
    provider: 'all',
    letter: null
  });
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allItemsData]);

  const fetchData = async () => {
    try {
      const url = getSheetUrl();
      console.log('Fetching data from:', url);
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
      console.log('Data received, length:', csvData.length);
      console.log('First 200 characters:', csvData.substring(0, 200));
      
      const processedData = processSheetData(csvData);
      console.log('Processed data count:', processedData.length);
      
      setAllItemsData(processedData);
      
      // Extract providers
      const providerSet = new Set(processedData.map(item => item.provider).filter(Boolean));
      setProviders(Array.from(providerSet).sort());
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading the sheet:', error);
      console.error('Error details:', error.message);
      setLoading(false);
    }
  };

  const cleanTag = (tag) => {
    if (!tag) return '';
    return tag.trim().replace(/^\s*[xX]/, '').replace(/\s+/g, ' ').replace(/\u00A0/g, ' ');
  };

  const processSheetData = (csvData) => {
    const lines = csvData.trim().split('\n');
    const processedData = [];

    for (let i = 1; i < lines.length; i++) {
      const entry = parseLine(lines[i]);
      processedData.push(entry);
    }

    return processedData;
  };

  const parseLine = (line) => {
    const parts = line.split('\t');
    const name = parts[0] || '';
    const provider = parts[1] || '';
    const imageUrl = parts[2] || '';
    const databaseUrl = parts[3] || '';
    const databaseDescriptionText = parts[4] || '';
    
    // Column 5 becomes tag1 (first primary tag)
    const tag1 = cleanTag(parts[5]);
    
    // Column 6 becomes tag2 (second primary tag)
    const tag2 = cleanTag(parts[6]);
    
    // Remaining columns (starting from column 7) become the other tags
    const tags = parts.slice(7).map(cleanTag).filter(Boolean);

    let firstLetter = name.trim().charAt(0).toUpperCase();
    if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

    return { name, provider, imageUrl, databaseUrl, databaseDescriptionText, tag1, tag2, tags, firstLetter };
  };

  const applyFilters = () => {
    let filtered = allItemsData.filter(item => {
      const matchesPrimaryTag = filters.tag1 === 'all' || item.tag1 === filters.tag1 || item.tag2 === filters.tag1;
      const matchesSecondaryTag = filters.tag2 === 'all' || item.tags.includes(filters.tag2);
      const matchesTag3 = filters.tag3 === 'all' || item.tags.includes(filters.tag3);
      const matchesProvider = filters.provider === 'all' || item.provider === filters.provider;
      const matchesLetter = !filters.letter || item.firstLetter === filters.letter;

      return matchesPrimaryTag && matchesSecondaryTag && matchesTag3 && matchesProvider && matchesLetter;
    });

    setFilteredData(filtered);
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      tag1: 'all',
      tag2: 'all',
      tag3: 'all',
      provider: 'all',
      letter: null
    });
  };

  if (loading) {
    return <div className="loading">Loading databases...</div>;
  }

  return (
    <div className="App">
      <Header logo="/Database_Project/images/CastillejaLogo.png" />
      
      <FilterBar
        allItemsData={allItemsData}
        filters={filters}
        providers={providers}
        onFilterChange={updateFilters}
        onClearFilters={clearFilters}
      />
      
      <AlphabetFilter
        allItemsData={allItemsData}
        filteredData={filteredData}
        selectedLetter={filters.letter}
        onLetterSelect={(letter) => updateFilters({ letter })}
        filters={filters}
      />
      
      <DatabaseCount count={filteredData.length} />
      
      <DatabaseList
        filteredData={filteredData}
        onTagClick={(tag, isPrimary, tag1, tag2) => {
          if (isPrimary === 1) {
            // First primary tag clicked - set primary filter
            updateFilters({ tag1, tag2: 'all', tag3: 'all', letter: null });
          } else if (isPrimary === 2) {
            // Second primary tag clicked - set primary filter (since we combine them)
            updateFilters({ tag1: tag, tag2: 'all', tag3: 'all', letter: null });
          } else {
            // Secondary tag clicked - set secondary filter
            updateFilters({ tag2: tag, tag3: 'all', letter: null });
          }
        }}
      />
    </div>
  );
}

export default App;
