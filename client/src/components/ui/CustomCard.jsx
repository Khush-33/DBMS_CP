import React from 'react';
import { Link } from 'react-router-dom';

const CustomCard = ({ title, value, description, to }) => {
  const content = (
    <>
      <div className="text-4xl font-bold text-primary mb-3">{value}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </>
  );

  const cardStyles = "card text-center block";

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