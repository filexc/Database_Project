import React from 'react';

const Header = ({ logo }) => {
  return (
    <header className="header">
      <div className="header-content">
        {logo && (
          <div className="logo-container">
            <img 
              src={logo} 
              alt="Logo" 
              className="header-logo"
            />
          </div>
        )}
        <h2 className="header-title">Databases</h2>
      </div>
    </header>
  );
};

export default Header;
