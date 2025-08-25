import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import AlphabetFilter from './components/AlphabetFilter';
import DatabaseList from './components/DatabaseList';
import DatabaseCount from './components/DatabaseCount';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';

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
      const response = await fetch(SHEET_URL);
      const csvData = await response.text();
      const processedData = processSheetData(csvData);
      setAllItemsData(processedData);
      
      // Extract providers
      const providerSet = new Set(processedData.map(item => item.provider).filter(Boolean));
      setProviders(Array.from(providerSet).sort());
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading the sheet:', error);
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
    const tag1 = cleanTag(parts[5]);
    const tags = parts.slice(6).map(cleanTag).filter(Boolean);

    let firstLetter = name.trim().charAt(0).toUpperCase();
    if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

    return { name, provider, imageUrl, databaseUrl, databaseDescriptionText, tag1, tags, firstLetter };
  };

  const applyFilters = () => {
    let filtered = allItemsData.filter(item => {
      const matchesTag1 = filters.tag1 === 'all' || item.tag1 === filters.tag1;
      const matchesTag2 = filters.tag2 === 'all' || item.tags.includes(filters.tag2);
      const matchesTag3 = filters.tag3 === 'all' || item.tags.includes(filters.tag3);
      const matchesProvider = filters.provider === 'all' || item.provider === filters.provider;
      const matchesLetter = !filters.letter || item.firstLetter === filters.letter;

      return matchesTag1 && matchesTag2 && matchesTag3 && matchesProvider && matchesLetter;
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
      />
      
      <DatabaseCount count={filteredData.length} />
      
      <DatabaseList
        filteredData={filteredData}
        onTagClick={(tag, isPrimary, tag1) => {
          if (isPrimary) {
            updateFilters({ tag1, tag3: 'all', letter: null });
          } else {
            updateFilters({ tag2: tag, tag3: 'all', letter: null });
          }
        }}
      />
    </div>
  );
}

export default App;
