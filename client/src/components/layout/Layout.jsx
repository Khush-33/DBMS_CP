import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Removed QuickDock component

const Layout = ({ children }) => {
  const location = useLocation();
  const shouldHideFooter = location.pathname === '/live-auction';

  return (
    // Assumes you've added 'font-poppins' to your tailwind.config.js or are using a global CSS import
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default Layout;