import React from 'react';

const AlphabetFilter = ({ allItemsData, filteredData, selectedLetter, onLetterSelect }) => {
  const getAvailableLetters = () => {
    const availableLetters = new Set(allItemsData.map(item => item.firstLetter));
    return availableLetters;
  };

  const getVisibleLetters = () => {
    const visibleLetters = new Set(filteredData.map(item => item.firstLetter));
    return visibleLetters;
  };

  const availableLetters = getAvailableLetters();
  const visibleLetters = getVisibleLetters();
  
  // Check if we're filtering by tags or provider
  const isFilteringByTagsOrProvider = filteredData.length !== allItemsData.length;

  const alphabet = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

  const isButtonDisabled = (letter) => {
    // Only disable letters that don't have any databases at all
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
