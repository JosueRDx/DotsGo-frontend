// src/components/Header.jsx

import React from 'react';
import PropTypes from 'prop-types'; // Importa prop-types

// Asegúrate de que las rutas a tus estilos y logos sean correctas si los usas
// import styles from "./Header.module.css";
// import logo_small from "../../assets/images/logo_small.png"

export const Header = ({ title, user }) => {
  return (
    <div className="header"> {/* Puedes cambiar a className={styles.header} si usas CSS Modules */}
      <h1 className="page-title">{title}</h1> {/* Puedes cambiar a className={styles.pageTitle} */}
      <div className="user-info"> {/* Puedes cambiar a className={styles.userInfo} */}
        <div className="user-avatar">{user.avatar}</div> {/* user.avatar puede ser una URL de imagen o un carácter/icono */}
        <span>{user.name}</span>
      </div>
    </div>
  );
};

// Definición de PropTypes para el componente Header
Header.propTypes = {
  title: PropTypes.string.isRequired, // El título del header (string, requerido)
  user: PropTypes.shape({            // Un objeto 'user' con la siguiente forma:
    avatar: PropTypes.node,         // avatar puede ser cualquier cosa renderizable (string, JSX, etc.), opcional si lo tienes
    name: PropTypes.string.isRequired, // name debe ser un string y es requerido
  }).isRequired,                     // El objeto 'user' es requerido
};