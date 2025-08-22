import React from 'react';

const DatabaseCount = ({ count }) => {
  return (
    <div className="database-count">
      {count} database{count === 1 ? '' : 's'} found
    </div>
  );
};

export default DatabaseCount;
