import React from 'react';
import DatabaseItem from './DatabaseItem';

const DatabaseList = ({ filteredData, onTagClick }) => {
  // Group items by first letter
  const groupedData = filteredData.reduce((acc, item) => {
    const letter = item.firstLetter;
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(item);
    return acc;
  }, {});

  // Sort letters
  const sortedLetters = Object.keys(groupedData).sort();

  if (filteredData.length === 0) {
    return (
      <div className="empty-message">
        No results match your filters.
      </div>
    );
  }

  return (
    <div className="container">
      {sortedLetters.map(letter => (
        <div key={letter} className="letter-section">
          <h3 className="letter-heading">{letter}</h3>
          {groupedData[letter].map((item, index) => (
            <DatabaseItem 
              key={`${item.name}-${index}`}
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
