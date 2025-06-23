import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Users, Star, Zap, CheckCircle } from "lucide-react";
import styles from "./CharacterSelection.module.css";
import logo from "../../assets/images/logo.png";
import { socket, connectSocket } from "../../services/websocket/socketService";

// Importar imágenes de personajes
import personaje1 from "../../assets/images/personajes/1.png";
import personaje2 from "../../assets/images/personajes/2.png";
import personaje3 from "../../assets/images/personajes/3.png";
import personaje4 from "../../assets/images/personajes/4.png";
import personaje5 from "../../assets/images/personajes/5.png";
import personaje6 from "../../assets/images/personajes/6.png";

export default function CharacterSelection() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Datos de los personajes
  const characters = [
    { 
      id: 1, 
      name: 'Químico Pro', 
      image: personaje1,
      specialty: 'Experto en Sustancias',
      description: 'Domina las reacciones químicas y conoce cada pictograma al detalle.',
      color: '#10b981',
      stats: { speed: 85, precision: 90, knowledge: 95 }
    },
    { 
      id: 2, 
      name: 'Safety Master', 
      image: personaje2,
      specialty: 'Guardián de la Seguridad',
      description: 'Especialista en prevención de riesgos y protocolos de emergencia.',
      color: '#3b82f6',
      stats: { speed: 80, precision: 95, knowledge: 85 }
    },
    { 
      id: 3, 
      name: 'Lab Expert', 
      image: personaje3,
      specialty: 'Científico de Laboratorio',
      description: 'Conoce cada equipo y procedimiento de laboratorio a la perfección.',
      color: '#8b5cf6',
      stats: { speed: 90, precision: 85, knowledge: 90 }
    },
    { 
      id: 4, 
      name: 'Fire Guardian', 
      image: personaje4,
      specialty: 'Especialista en Incendios',
      description: 'Experto en sustancias inflamables y sistemas de extinción.',
      color: '#ef4444',
      stats: { speed: 95, precision: 80, knowledge: 80 }
    },
    { 
      id: 5, 
      name: 'Eco Warrior', 
      image: personaje5,
      specialty: 'Protector Ambiental',
      description: 'Defensor del medio ambiente y especialista en sustancias tóxicas.',
      color: '#059669',
      stats: { speed: 75, precision: 90, knowledge: 95 }
    },
    { 
      id: 6, 
      name: 'Hazmat Hero', 
      image: personaje6,
      specialty: 'Manejo de Materiales Peligrosos',
      description: 'Experto en transporte y almacenamiento de sustancias peligrosas.',
      color: '#f59e0b',
      stats: { speed: 88, precision: 88, knowledge: 88 }
    }
  ];

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setError("");
  };

  // FUNCIÓN ACTUALIZADA para ir a sala de espera
  const handleConfirmSelection = () => {
    if (!selectedCharacter) {
      setError("Por favor selecciona un personaje antes de continuar");
      return;
    }

    const pin = localStorage.getItem("gamePin");
    const username = localStorage.getItem("tempUsername");

    if (!username) {
      setError("Error: Nombre de usuario no encontrado");
      return;
    }

    setLoading(true);
    setError("");

    connectSocket();

    // Enviar información del personaje junto con los datos del jugador
    socket.emit("join-game", { 
      pin, 
      username, 
      character: {
        id: selectedCharacter.id,
        name: selectedCharacter.name,
        image: selectedCharacter.image,
        specialty: selectedCharacter.specialty // AGREGADO: specialty
      }
    }, (response) => {
      setLoading(false);
      if (response.success) {
        // NUEVO: Guardar datos para la sala de espera
        localStorage.setItem("username", username);
        localStorage.setItem("selectedCharacter", JSON.stringify(selectedCharacter));
        
        // Limpiar datos temporales
        localStorage.removeItem("tempUsername");
        console.log("Conectado al juego con personaje seleccionado");
        
        // CAMBIO: Ir a sala de espera en lugar de directo al juego
        navigate("/waiting-room");
      } else {
        setError(response.error || "Error al unirse al juego");
      }
    });
  };

  const goBack = () => {
    navigate("/join");
  };

  const gamePin = localStorage.getItem("gamePin");
  const username = localStorage.getItem("tempUsername");

  return (
    <div className={styles.selectionWrapper}>
      {/* Loading Overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingCard}>
            <div className={styles.spinner}></div>
            <h3>Preparando tu personaje...</h3>
            <p>Uniéndote a la sala de espera</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button className={styles.backButton} onClick={goBack}>
        <ArrowLeft size={20} />
        Cambiar Nombre
      </button>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <img src={logo} alt="DOT'S GO Logo" className={styles.headerLogo} />
        </div>
        <div className={styles.gameInfo}>
          <div className={styles.pinDisplay}>
            PIN: <span>{gamePin}</span>
          </div>
          <div className={styles.playerInfo}>
            <Users size={16} />
            {username}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.titleSection}>
          <h1>Elige tu Personaje</h1>
          <p>Cada personaje tiene habilidades únicas que te ayudarán en el juego</p>
        </div>

        {/* Characters Grid */}
        <div className={styles.charactersGrid}>
          {characters.map((character) => (
            <div
              key={character.id}
              className={`${styles.characterCard} ${
                selectedCharacter?.id === character.id ? styles.selected : ""
              }`}
              onClick={() => handleCharacterSelect(character)}
              style={{ "--character-color": character.color }}
            >
              {selectedCharacter?.id === character.id && (
                <div className={styles.selectedBadge}>
                  <CheckCircle size={20} />
                </div>
              )}

              <div className={styles.characterImage}>
                <img 
                  src={character.image} 
                  alt={character.name}
                />
              </div>

              <div className={styles.characterInfo}>
                <h3>{character.name}</h3>
                <div className={styles.specialty}>
                  <Star size={14} />
                  {character.specialty}
                </div>
                <p className={styles.description}>{character.description}</p>

                {/* Stats */}
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Velocidad</span>
                    <div className={styles.statBar}>
                      <div 
                        className={styles.statFill} 
                        style={{ width: `${character.stats.speed}%` }}
                      ></div>
                    </div>
                    <span className={styles.statValue}>{character.stats.speed}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Precisión</span>
                    <div className={styles.statBar}>
                      <div 
                        className={styles.statFill} 
                        style={{ width: `${character.stats.precision}%` }}
                      ></div>
                    </div>
                    <span className={styles.statValue}>{character.stats.precision}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Conocimiento</span>
                    <div className={styles.statBar}>
                      <div 
                        className={styles.statFill} 
                        style={{ width: `${character.stats.knowledge}%` }}
                      ></div>
                    </div>
                    <span className={styles.statValue}>{character.stats.knowledge}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selection Summary */}
        {selectedCharacter && (
          <div className={styles.selectionSummary}>
            <div className={styles.summaryContent}>
              <div className={styles.selectedCharacterPreview}>
                <img src={selectedCharacter.image} alt={selectedCharacter.name} />
                <div>
                  <h4>Has seleccionado:</h4>
                  <h3>{selectedCharacter.name}</h3>
                  <p>{selectedCharacter.specialty}</p>
                </div>
              </div>
              <button 
                className={styles.confirmButton}
                onClick={handleConfirmSelection}
                disabled={loading}
              >
                <Play size={20} />
                Unirse a Sala
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            {error}
          </div>
        )}
      </main>

      {/* Floating particles */}
      <div className={styles.particles}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`${styles.particle} ${styles[`particle${i + 1}`]}`}></div>
        ))}
      </div>
    </div>
  );
}