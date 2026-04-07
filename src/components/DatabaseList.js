import React from 'react';
import DatabaseItem from './DatabaseItem';

const DatabaseList = ({
  filteredData,
  onTagClick,
  hasActiveFilters,
  onClearFilters,
  groupingMode = 'letter'
}) => {
  if (filteredData.length === 0) {
    return (
      <div className="empty-message">
        <p className="empty-title">No results match your filters.</p>
        <p className="empty-subtext">Try clearing filters or choosing broader tags.</p>
        {hasActiveFilters && (
          <button className="clear-inline-button" onClick={onClearFilters}>
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  if (groupingMode === 'provider') {
    const providerOrder = [];
    const byProvider = {};
    filteredData.forEach((item) => {
      const raw = (item.provider || '').trim();
      const key = raw || '__empty__';
      if (!byProvider[key]) {
        byProvider[key] = { heading: raw || 'No provider', items: [] };
        providerOrder.push(key);
      }
      byProvider[key].items.push(item);
    });

    return (
      <div className="container">
        {providerOrder.map((key) => (
          <div key={key} className="letter-section">
            <h3 className="letter-heading">{byProvider[key].heading}</h3>
            {byProvider[key].items.map((item) => (
              <DatabaseItem
                key={item.id}
                item={item}
                onTagClick={onTagClick}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const groupedData = filteredData.reduce((acc, item) => {
    const letter = item.firstLetter;
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(item);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedData).sort();

  return (
    <div className="container">
      {sortedLetters.map((letter) => (
        <div key={letter} className="letter-section">
          <h3 className="letter-heading">{letter}</h3>
          {groupedData[letter].map((item) => (
            <DatabaseItem
              key={item.id}
              item={item}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default DatabaseList;
