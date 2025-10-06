import React from 'react';
import { Link } from 'react-router-dom';

const CustomCard = ({ title, value, description, to }) => {
  const content = (
    <>
      <p className="text-5xl font-bold accent-cyan">{value}</p>
      <h3 className="text-xl font-semibold mt-3 text-white">{title}</h3>
      <p className="text-gray-400 mt-1 text-sm">{description}</p>
    </>
  );

  // stronger visual style so cards contrast with a busy background image
  const cardStyles = "block glass-strong bg-gray-900/75 backdrop-blur-lg p-6 rounded-xl shadow-2xl relative z-10 text-center transition-all duration-300 hover:bg-gray-900/90 hover:shadow-2xl hover:-translate-y-2 ring-1 ring-white/20 border border-white/6";

  if (to) {
    return (
      <Link to={to} className={cardStyles}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardStyles}>
      {content}
    </div>
  );
};

export default CustomCard;