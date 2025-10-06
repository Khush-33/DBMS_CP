import React from 'react';

const PageTitle = ({ children }) => {
  return (
    <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-white drop-shadow-lg">
      {children}
    </h1>
  );
};

export default PageTitle;