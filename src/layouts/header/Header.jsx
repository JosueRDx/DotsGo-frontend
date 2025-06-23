import React from "react";
import styles from "./Header.module.css";
import logo from "../../assets/images/logo.png";
import { Gamepad2, Users } from "lucide-react";

export default function Header({ children, timeLeft, showCreateButton = true, selectedCharacter }) {
  const handleCreateGame = () => {
    //lógica para crear una partida
    console.log("Crear partida clickeado");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <img src={logo} alt="DOT'S GO Logo" className={styles.headerLogo} />
        <span className={styles.headerTitle}>DOT'S GO!!</span>
      </div>

      {/* NUEVO: Mostrar personaje seleccionado */}
      {selectedCharacter && (
        <div className={styles.characterDisplay}>
          <img 
            src={selectedCharacter.image} 
            alt={selectedCharacter.name}
            className={styles.characterAvatar}
          />
          <div className={styles.characterInfo}>
            <span className={styles.characterName}>{selectedCharacter.name}</span>
            <span className={styles.characterSpecialty}>{selectedCharacter.specialty}</span>
          </div>
        </div>
      )}

      {/* Timer existente con mejoras */}
      {timeLeft !== null && (
        <div className={`${styles.timer} ${timeLeft <= 10 ? styles.lowTime : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      )}

      {/* Botón crear partida existente */}
      {showCreateButton && (
        <button className={styles.createGameBtn} onClick={handleCreateGame}>
          <Gamepad2 size={20} />
          Crear Partida
        </button>
      )}
      
      {children}
      
    </header>
  );
}