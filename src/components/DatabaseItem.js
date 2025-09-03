import React from 'react';

const DatabaseItem = ({ item, onTagClick }) => {
  const handleTagClick = (tag, isPrimary, tag1, tag2) => {
    onTagClick(tag, isPrimary, tag1, tag2);
  };

  const allDisplayTags = [item.tag1, item.tag2, ...item.tags].filter(Boolean);

  return (
    <div className="item">
      <div className="logo-frame">
        <img src={item.imageUrl} alt={`${item.name} logo`} />
      </div>

      <div className="text-block">
        <a 
          href={item.databaseUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="database-name"
        >
          {item.name}{item.provider ? ` (${item.provider})` : ''}
        </a>
        <span className="description"> - {item.databaseDescriptionText}</span>
        
        {allDisplayTags.length > 0 && (
          <div className="tags-container">
            {/* First Primary Tag */}
            {item.tag1 && (
              <span 
                className="tag-label primary"
                onClick={() => handleTagClick(item.tag1, 1, item.tag1, item.tag2)}
              >
                {item.tag1}
              </span>
            )}
            
            {/* Second Primary Tag */}
            {item.tag2 && (
              <span 
                className="tag-label primary"
                onClick={() => handleTagClick(item.tag2, 2, item.tag1, item.tag2)}
              >
                {item.tag2}
              </span>
            )}
            
            {/* Other Tags */}
            {item.tags.map((tag, index) => (
              <span 
                key={index}
                className="tag-label"
                onClick={() => handleTagClick(tag, false, item.tag1, item.tag2)}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseItem;
