import React, { useState, useEffect } from 'react';

const FilterBar = ({ allItemsData, filters, providers, onFilterChange, onClearFilters }) => {
  const [tag1Options, setTag1Options] = useState([]);
  const [tag2Options, setTag2Options] = useState([]);
  const [tag3Options, setTag3Options] = useState([]);
  const [showTag3, setShowTag3] = useState(false);

  // Generate tag1 options
  useEffect(() => {
    const primaryTags = [...new Set(allItemsData.map(item => item.tag1).filter(Boolean))].sort();
    setTag1Options(primaryTags);
  }, [allItemsData]);

  // Generate all secondary tags (independent of primary tag selection)
  useEffect(() => {
    const allSecondaryTags = [...new Set(allItemsData.flatMap(item => item.tags))].sort();
    setTag2Options(allSecondaryTags);
  }, [allItemsData]);

  // Update tag3 options when tag1 or tag2 changes
  useEffect(() => {
    if (filters.tag2 === 'all') {
      setTag3Options([]);
      setShowTag3(false);
    } else {
      // Filter items based on selected tag2
      let filteredItems = allItemsData.filter(item => item.tags.includes(filters.tag2));
      
      // If tag1 is also selected, further filter by tag1
      if (filters.tag1 !== 'all') {
        filteredItems = filteredItems.filter(item => item.tag1 === filters.tag1);
      }
      
      const tertiaryTags = [...new Set(
        filteredItems.flatMap(item => item.tags).filter(tag => tag !== filters.tag2)
      )].sort();
      setTag3Options(tertiaryTags);
      setShowTag3(tertiaryTags.length > 0);
    }
  }, [filters.tag1, filters.tag2, allItemsData]);

  const handleTag1Change = (value) => {
    onFilterChange({ 
      tag1: value, 
      tag3: 'all',
      letter: null 
    });
  };

  const handleTag2Change = (value) => {
    onFilterChange({ 
      tag2: value, 
      tag3: 'all',
      letter: null 
    });
  };

  const handleTag3Change = (value) => {
    onFilterChange({ 
      tag3: value,
      letter: null 
    });
  };

  const handleProviderChange = (value) => {
    onFilterChange({ 
      provider: value,
      letter: null 
    });
  };

  const isAnyFilterActive = filters.tag1 !== 'all' || filters.tag2 !== 'all' || filters.provider !== 'all' || filters.letter !== null;

  return (
    <div className="filterBar">
      <div className="tag1Filters">
        <select 
          value={filters.tag1} 
          onChange={(e) => handleTag1Change(e.target.value)}
        >
          <option value="all">All Primary Tags</option>
          {tag1Options.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div className="tagFilters">
        <select 
          value={filters.tag2} 
          onChange={(e) => handleTag2Change(e.target.value)}
        >
          <option value="all">All Secondary Tags</option>
          {tag2Options.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {showTag3 && (
        <div className="tag3Filters" style={{ display: 'block' }}>
          <select 
            value={filters.tag3} 
            onChange={(e) => handleTag3Change(e.target.value)}
          >
            <option value="all">All Tags</option>
            {tag3Options.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      )}

      <div className="providerFilters">
        <select 
          value={filters.provider} 
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          <option value="all">All Providers</option>
          {providers.map(provider => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
      </div>

      <button 
        className="clear-button"
        disabled={!isAnyFilterActive}
        onClick={onClearFilters}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default FilterBar;
