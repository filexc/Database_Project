import React from 'react';

const LOGIC_LABELS = {
  AND: 'AND (all selected)',
  OR_ANY: 'OR (any selected)',
  PRIMARY_AND_SECONDARY_OR: 'Primary AND (any secondary)'
};

const FilterChips = ({ filters, onFilterChange }) => {
  const chips = [];

  (filters.primaryTags || []).forEach((tag, index) => {
    if (tag === 'all') return;
    chips.push({
      key: `primary-${index}`,
      label: `Primary ${index + 1}: ${tag}`,
      remove: () => {
        const next = [...(filters.primaryTags || ['all', 'all'])];
        next[index] = 'all';
        onFilterChange({ primaryTags: next, letters: [] });
      }
    });
  });

  (filters.secondaryTags || []).forEach((tag, index) => {
    if (tag === 'all') return;
    chips.push({
      key: `secondary-${index}`,
      label: `Secondary: ${tag}`,
      remove: () => {
        const next = (filters.secondaryTags || ['all']).filter((_, i) => i !== index);
        onFilterChange({
          secondaryTags: next.length > 0 ? next : ['all'],
          letters: []
        });
      }
    });
  });

  if (filters.provider !== 'all') {
    chips.push({
      key: 'provider',
      label: `Provider: ${filters.provider}`,
      remove: () => onFilterChange({ provider: 'all', letters: [] })
    });
  }

  (filters.letters || []).forEach((letter) => {
    chips.push({
      key: `letter-${letter}`,
      label: `Letter: ${letter}`,
      remove: () =>
        onFilterChange({
          letters: (filters.letters || []).filter((l) => l !== letter)
        })
    });
  });

  if (filters.matchMode && filters.matchMode !== 'AND') {
    chips.push({
      key: 'logic',
      label: `Logic: ${LOGIC_LABELS[filters.matchMode] || filters.matchMode}`,
      remove: () => onFilterChange({ matchMode: 'AND' })
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="filter-chips" role="region" aria-label="Active filters">
      <span className="filter-chips-label">Active filters</span>
      <ul className="filter-chips-list">
        {chips.map((chip) => (
          <li key={chip.key}>
            <span className="filter-chip">
              <span className="filter-chip-text">{chip.label}</span>
              <button
                type="button"
                className="filter-chip-remove"
                onClick={chip.remove}
                aria-label={`Remove ${chip.label}`}
              >
                ×
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilterChips;
