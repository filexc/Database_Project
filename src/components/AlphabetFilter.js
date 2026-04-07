import React from 'react';
import { matchesFilters } from '../utils/filters';

const ALPHABET_ORDER = [
  '#',
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
];

const sortSelectedLetters = (set) =>
  ALPHABET_ORDER.filter((letter) => set.has(letter));

const AlphabetFilter = ({
  allItemsData,
  selectedLetters = [],
  multiLetter,
  onLettersChange,
  filters
}) => {
  const getAvailableLetters = () => {
    let availableData = allItemsData.filter((item) =>
      matchesFilters(item, filters, { includeLetter: false })
    );

    const availableLetters = new Set(availableData.map((item) => item.firstLetter));
    return availableLetters;
  };

  const availableLetters = getAvailableLetters();

  const alphabet = ALPHABET_ORDER;

  const isButtonDisabled = (letter) => !availableLetters.has(letter);

  const isButtonActive = (letter) => selectedLetters.includes(letter);

  const handleLetterClick = (letter) => {
    if (letter === null) {
      onLettersChange([]);
      return;
    }

    if (multiLetter) {
      const nextSet = new Set(selectedLetters);
      if (nextSet.has(letter)) {
        nextSet.delete(letter);
      } else {
        nextSet.add(letter);
      }
      onLettersChange(sortSelectedLetters(nextSet));
      return;
    }

    if (selectedLetters.length === 1 && selectedLetters[0] === letter) {
      onLettersChange([]);
    } else {
      onLettersChange([letter]);
    }
  };

  return (
    <div className="alphabetFilter">
      <button
        type="button"
        onClick={() => handleLetterClick(null)}
        className={selectedLetters.length === 0 ? 'active' : ''}
        aria-pressed={selectedLetters.length === 0}
      >
        All
      </button>

      {alphabet.map((letter) => (
        <button
          type="button"
          key={letter}
          onClick={() => handleLetterClick(letter)}
          disabled={isButtonDisabled(letter)}
          className={isButtonActive(letter) ? 'active' : ''}
          aria-pressed={isButtonActive(letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default AlphabetFilter;
