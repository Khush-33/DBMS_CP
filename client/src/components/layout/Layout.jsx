import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    // Assumes you've added 'font-poppins' to your tailwind.config.js or are using a global CSS import
    <div className="min-h-screen flex flex-col bg-slate-900 text-gray-200 font-poppins">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;