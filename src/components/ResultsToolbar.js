import React from 'react';
import DatabaseCount from './DatabaseCount';

const ResultsToolbar = ({ count, sortBy, onSortChange }) => {
  return (
    <div className="results-toolbar">
      <div className="results-toolbar-row">
        <DatabaseCount count={count} />
        <div className="sort-controls">
          <label htmlFor="sort-select" className="filter-label">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="name">Name (A–Z)</option>
            <option value="provider">Provider (A–Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ResultsToolbar;
