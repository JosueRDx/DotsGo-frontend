// src/components/SectionContent.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Importa prop-types

// Componente auxiliar para los botones de acción
const ActionButtonComponent = ({ button }) => (
  <button
    className="btn"
    style={{ background: button.gradient }}
    onClick={button.onClick}
  >
    {button.icon} {button.label}
  </button>
);

// Definición de PropTypes para ActionButtonComponent
ActionButtonComponent.propTypes = {
  button: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.node, // icon puede ser cualquier cosa renderizable (string, JSX, etc.)
    gradient: PropTypes.string,
    onClick: PropTypes.func.isRequired,
  }).isRequired,
};

// Componente auxiliar para las tarjetas de contenido
const ContentCardComponent = ({ card }) => (
  <div className="content-card">
    <h3 style={{ color: card.color || '#64748B' }}>{card.title}</h3>
    <p>{card.description}</p>
  </div>
);

// Definición de PropTypes para ContentCardComponent
ContentCardComponent.propTypes = {
  card: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string, // color es opcional
  }).isRequired,
};


// Componente principal SectionContent
export const SectionContent = ({
  title,
  description,
  buttons,
  cards,
  tutorialLink,
}) => {
  const handleTutorialClick = () => {
    alert('Tutorial functionality would be implemented here');
  };

  return (
    <div className="section-content">
      <div className="central-card">
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-description">{description}</p>}
        
        <div className="action-buttons">
          {buttons.map((button, index) => (
            <ActionButtonComponent key={index} button={button} />
          ))}
        </div>

        
        {cards && cards.length > 0 && (
          <div className="content-grid">
            {cards.map((card, index) => (
              <ContentCardComponent key={index} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Definición de PropTypes para SectionContent
SectionContent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string, // description es opcional
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      gradient: PropTypes.string,
      onClick: PropTypes.func.isRequired,
    })
  ).isRequired, // buttons es un array de objetos con una forma específica y es requerido
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      color: PropTypes.string,
    })
  ), // cards es un array de objetos con una forma específica y es opcional
  tutorialLink: PropTypes.bool, // tutorialLink es booleano y opcional
};