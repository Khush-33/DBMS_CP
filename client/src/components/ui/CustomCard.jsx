import React from 'react';
import { Link } from 'react-router-dom';

const CustomCard = ({ title, value, description, to }) => {
  const content = (
    <>
      <p className="text-5xl font-bold text-amber-400">{value}</p>
      <h3 className="text-xl font-semibold mt-3 text-white">{title}</h3>
      <p className="text-gray-400 mt-1 text-sm">{description}</p>
    </>
  );

  const cardStyles = "block bg-gray-800/50 backdrop-blur-md p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:bg-gray-800/80 hover:shadow-amber-500/20 hover:-translate-y-2 ring-1 ring-white/10";

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