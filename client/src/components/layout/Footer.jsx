import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900/50 text-center py-5 mt-auto border-t border-white/10">
      <div className="container mx-auto text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} IPL Auction Portal. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;