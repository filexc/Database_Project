import React, { useState, useEffect } from 'react';
import { itemMatchesPrimarySelection } from '../utils/filters';

const FilterBar = ({ allItemsData, filters, providers, onFilterChange, onClearFilters }) => {
  const [tag1Options, setTag1Options] = useState([]);
  const [secondaryOptions, setSecondaryOptions] = useState([]);

  // Generate combined primary tag options (from both tag1 and tag2)
  useEffect(() => {
    const tag1Tags = allItemsData.map(item => item.tag1).filter(Boolean);
    const tag2Tags = allItemsData.map(item => item.tag2).filter(Boolean);
    const allPrimaryTags = [...new Set([...tag1Tags, ...tag2Tags])].sort();
    setTag1Options(allPrimaryTags);
  }, [allItemsData]);

  // Generate secondary tag options (from remaining tags array)
  useEffect(() => {
    const hasPrimaryFilter = (filters.primaryTags || []).some((p) => p !== 'all');
    const shouldShowAllSecondaryOptions =
      filters.matchMode === 'OR_ANY' || !hasPrimaryFilter;

    if (shouldShowAllSecondaryOptions) {
      const allSecondaryTags = [...new Set(allItemsData.flatMap(item => item.tags))].sort();
      setSecondaryOptions(allSecondaryTags);
    } else {
      const filteredItems = allItemsData.filter((item) =>
        itemMatchesPrimarySelection(item, filters.primaryTags)
      );
      const availableSecondaryTags = [...new Set(filteredItems.flatMap(item => item.tags))].sort();
      setSecondaryOptions(availableSecondaryTags);
    }
  }, [allItemsData, filters.primaryTags, filters.matchMode]);

  const primaryTags = filters.primaryTags || ['all', 'all'];

  const handlePrimaryChange = (index, value) => {
    const next = [...primaryTags];
    next[index] = value;
    onFilterChange({
      primaryTags: next,
      letters: []
    });
  };

  const secondaryTags = filters.secondaryTags || ['all'];
  const selectedSecondaryTags = secondaryTags.filter(tag => tag !== 'all');
  const renderedSecondaryOptions = [...new Set([...secondaryOptions, ...selectedSecondaryTags])].sort();

  const handleSecondaryChange = (index, value) => {
    const next = [...secondaryTags];
    next[index] = value;
    onFilterChange({
      secondaryTags: next,
      letters: []
    });
  };

  const addSecondaryDropdown = () => {
    onFilterChange({
      secondaryTags: [...secondaryTags, 'all']
    });
  };

  const removeSecondaryDropdown = (index) => {
    const next = secondaryTags.filter((_, i) => i !== index);
    onFilterChange({
      secondaryTags: next.length > 0 ? next : ['all'],
      letters: []
    });
  };

  const handleProviderChange = (value) => {
    onFilterChange({
      provider: value,
      letters: []
    });
  };

  const isAnyFilterActive =
    primaryTags.some((p) => p !== 'all') ||
    secondaryTags.some(tag => tag !== 'all') ||
    filters.provider !== 'all' ||
    (filters.letters || []).length > 0 ||
    filters.matchMode !== 'AND';

  return (
    <div className="filterBar">
      <div className="tag1Filters">
        <label htmlFor="primary-tag-0-select" className="filter-label">Primary tag 1</label>
        <select
          id="primary-tag-0-select"
          value={primaryTags[0]}
          onChange={(e) => handlePrimaryChange(0, e.target.value)}
        >
          <option value="all">All Primary Tags</option>
          {tag1Options.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      <div className="tag1Filters">
        <label htmlFor="primary-tag-1-select" className="filter-label">Primary tag 2</label>
        <select
          id="primary-tag-1-select"
          value={primaryTags[1] || 'all'}
          onChange={(e) => handlePrimaryChange(1, e.target.value)}
        >
          <option value="all">All Primary Tags</option>
          {tag1Options.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {secondaryTags.map((tagValue, index) => (
        <div key={`secondary-${index}`} className={index === 0 ? 'tag2Filters' : 'tag3Filters'}>
          <label htmlFor={`secondary-tag-${index}-select`} className="filter-label">
            {`Secondary tag ${index + 1}`}
          </label>
          <div className="secondary-row">
            <select
              id={`secondary-tag-${index}-select`}
              value={tagValue}
              onChange={(e) => handleSecondaryChange(index, e.target.value)}
            >
              <option value="all">All Secondary Tags</option>
              {renderedSecondaryOptions.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            {secondaryTags.length > 1 && (
              <button
                type="button"
                className="secondary-remove-button"
                onClick={() => removeSecondaryDropdown(index)}
                aria-label={`Remove secondary tag ${index + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="secondary-add-wrap">
        <label className="filter-label" htmlFor="add-secondary-button">Secondary tags</label>
        <button
          id="add-secondary-button"
          type="button"
          className="secondary-add-button"
          onClick={addSecondaryDropdown}
        >
          + Add Secondary Tag
        </button>
      </div>

      <div className="providerFilters">
        <label htmlFor="provider-select" className="filter-label">Provider</label>
        <select 
          id="provider-select"
          value={filters.provider} 
          onChange={(e) => handleProviderChange(e.target.value)}
        >
          <option value="all">All Providers</option>
          {providers.map(provider => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
      </div>

      <div className="logicFilters">
        <label htmlFor="logic-select" className="filter-label">Filter logic</label>
        <select
          id="logic-select"
          value={filters.matchMode}
          onChange={(e) => onFilterChange({ matchMode: e.target.value })}
        >
          <option value="AND">AND (all selected)</option>
          <option value="OR_ANY">OR (any selected)</option>
          <option value="PRIMARY_AND_SECONDARY_OR">Primary AND (any Secondary tag)</option>
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
