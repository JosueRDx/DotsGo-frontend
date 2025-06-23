// src/components/Sidebar.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Importa prop-types
import { MENU_ITEMS } from "../utils/constants";

import logo from '../assets/images/logo.png';

export const Sidebar = ({
  activeSection,
  onSectionChange,
  onCreateGame,
}) => {
  const handleLogoClick = () => {
    // Lógica para el clic del logo (si la necesitas)
  };

  return (
    <div className="sidebar">
      <div className="logo-section">
        <img 
          src={logo} 
          alt="Logo" 
          className="logo-image"
          onClick={handleLogoClick}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'contain',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        />
      </div>

      <button className="create-btn" onClick={onCreateGame}>
        ✏️ Crear Juego
      </button>

      {MENU_ITEMS.map((item) => (
        <div
          key={item.id}
          className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => onSectionChange(item.id)}
        >
          <span className="menu-icon">{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
};

// Añade la validación de props aquí
Sidebar.propTypes = {
  activeSection: PropTypes.string.isRequired, // activeSection debe ser un string y es requerido
  onSectionChange: PropTypes.func.isRequired, // onSectionChange debe ser una función y es requerida
  onCreateGame: PropTypes.func.isRequired,    // onCreateGame debe ser una función y es requerida
};