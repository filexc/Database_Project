import React from 'react';

const AlphabetFilter = ({ allItemsData, filteredData, selectedLetter, onLetterSelect, filters }) => {
  const getAvailableLetters = () => {
    // Apply all filters except the letter filter to see what letters would be available
    let availableData = allItemsData.filter(item => {
      const matchesPrimaryTag = filters.tag1 === 'all' || item.tag1 === filters.tag1 || item.tag2 === filters.tag1;
      const matchesSecondaryTag = filters.tag2 === 'all' || item.tags.includes(filters.tag2);
      const matchesTag3 = filters.tag3 === 'all' || item.tags.includes(filters.tag3);
      const matchesProvider = filters.provider === 'all' || item.provider === filters.provider;
      
      return matchesPrimaryTag && matchesSecondaryTag && matchesTag3 && matchesProvider;
    });
    
    const availableLetters = new Set(availableData.map(item => item.firstLetter));
    return availableLetters;
  };

  const availableLetters = getAvailableLetters();

  const alphabet = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

  const isButtonDisabled = (letter) => {
    // Always disable letters that don't have any databases with current filters
    return !availableLetters.has(letter);
  };

  const isButtonActive = (letter) => {
    return selectedLetter === letter;
  };

  return (
    <div className="alphabetFilter">
      <button
        onClick={() => onLetterSelect(null)}
        className={!selectedLetter ? 'active' : ''}
      >
        All
      </button>
      
      {alphabet.map(letter => (
        <button
          key={letter}
          onClick={() => onLetterSelect(letter)}
          disabled={isButtonDisabled(letter)}
          className={isButtonActive(letter) ? 'active' : ''}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default AlphabetFilter;
