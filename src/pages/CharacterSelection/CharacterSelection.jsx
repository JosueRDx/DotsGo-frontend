import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Users, Star, Zap, CheckCircle } from "lucide-react";
import styles from "./CharacterSelection.module.css";
import logo from "../../assets/images/logo.png";
import { socket, connectSocket, saveSession, getSession, saveGameData, hasActiveTabWithSession } from "../../services/websocket/socketService";
import MultiAccountBlock from "../../components/MultiAccountBlock";

// Importar imágenes de personajes
import personaje1 from "../../assets/images/personajes/1.png";
import personaje2 from "../../assets/images/personajes/2.png";
import personaje3 from "../../assets/images/personajes/3.png";
import personaje4 from "../../assets/images/personajes/4.png";
import personaje5 from "../../assets/images/personajes/5.png";
import personaje6 from "../../assets/images/personajes/6.png";
// NUEVO: imágenes de personajes 7–11
import personaje7 from "../../assets/images/personajes/7.png";
import personaje8 from "../../assets/images/personajes/8.png";
import personaje9 from "../../assets/images/personajes/9.png";
import personaje10 from "../../assets/images/personajes/10.png";
import personaje11 from "../../assets/images/personajes/11.png";

export default function CharacterSelection() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const navigate = useNavigate();

  // NUEVO: Verificar sesión existente al cargar
  React.useEffect(() => {
    const existingSession = getSession();
    const currentPin = localStorage.getItem("gamePin");
    const currentUsername = localStorage.getItem("tempUsername");
    
    // NUEVO: Verificar si hay otra pestaña activa
    if (hasActiveTabWithSession()) {
      console.log('🚫 Otra pestaña activa detectada');
      const session = getSession();
      setBlockReason(`Ya estás jugando como "${session.username}" en otra pestaña. Cierra la otra pestaña primero.`);
      setIsBlocked(true);
      return;
    }
    
    if (existingSession && existingSession.pin === currentPin) {
      // Caso 1: Mismo usuario regresando (PERMITIR - saltar selección)
      if (existingSession.username === currentUsername) {
        console.log('✅ Usuario regresando detectado:', currentUsername);
        console.log('   Personaje guardado:', existingSession.character?.name);
        
        // Restaurar datos del usuario
        localStorage.setItem("username", currentUsername);
        localStorage.setItem("selectedCharacter", JSON.stringify(existingSession.character));
        
        // Reconectar automáticamente con personaje guardado
        setLoading(true);
        connectSocket();
        
        socket.emit("join-game", { 
          pin: currentPin, 
          username: currentUsername, 
          character: existingSession.character,
          sessionId: existingSession.sessionId
        }, (response) => {
          setLoading(false);
          
          if (response.success) {
            console.log('✅ Reconexión automática exitosa');
            
            // Redirigir según estado del juego
            if (response.gameStatus === 'playing') {
              navigate('/game');
            } else {
              navigate('/waiting-room');
            }
          } else {
            console.log('❌ Error en reconexión:', response.error);
            // Si falla, permitir seleccionar personaje de nuevo
          }
        });
        
        return; // Salir del useEffect
      }
      
      // Caso 2: Usuario diferente (BLOQUEAR - multicuenta)
      console.log('🚫 Multicuenta detectada en frontend');
      console.log('   Usuario existente:', existingSession.username);
      console.log('   Intento:', currentUsername);
      
      setBlockReason(`Ya estás jugando como "${existingSession.username}". No puedes crear otra cuenta.`);
      setIsBlocked(true);
    }
  }, [navigate]);

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
      name: 'Maestro Seguro', 
      image: personaje2,
      specialty: 'Guardián de la Seguridad',
      description: 'Especialista en prevención de riesgos y protocolos de emergencia.',
      color: '#3b82f6',
      stats: { speed: 80, precision: 95, knowledge: 85 }
    },
    { 
      id: 3, 
      name: 'Genio del Lab', 
      image: personaje3,
      specialty: 'Científico de Laboratorio',
      description: 'Conoce cada equipo y procedimiento de laboratorio a la perfección.',
      color: '#8b5cf6',
      stats: { speed: 90, precision: 85, knowledge: 90 }
    },
    { 
      id: 4, 
      name: 'Guardián Ígneo', 
      image: personaje4,
      specialty: 'Especialista en Incendios',
      description: 'Experto en sustancias inflamables y sistemas de extinción.',
      color: '#ef4444',
      stats: { speed: 95, precision: 80, knowledge: 80 }
    },
    { 
      id: 5, 
      name: 'Eco Guerrero', 
      image: personaje5,
      specialty: 'Protector Ambiental',
      description: 'Defensor del medio ambiente y especialista en sustancias tóxicas.',
      color: '#059669',
      stats: { speed: 75, precision: 90, knowledge: 95 }
    },
    { 
      id: 6, 
      name: 'Héroe Químico', 
      image: personaje6,
      specialty: 'Manejo de Materiales Peligrosos',
      description: 'Experto en transporte y almacenamiento de sustancias peligrosas.',
      color: '#f59e0b',
      stats: { speed: 88, precision: 88, knowledge: 88 }
        },
        // ====== NUEVOS PERSONAJES ======
    { 
      id: 7, 
      name: 'Agente Bio', 
      image: personaje7,
      specialty: 'Bioseguridad',
      description: 'Controla agentes biológicos y domina cabinas de bioseguridad.',
      color: '#14b8a6',
      stats: { speed: 82, precision: 92, knowledge: 93 }
    },
    { 
      id: 8, 
      name: 'Experto Polar', 
      image: personaje8,
      specialty: 'Bajas Temperaturas',
      description: 'Especialista en nitrógeno líquido, criogenia y EPP térmico.',
      color: '#06b6d4',
      stats: { speed: 78, precision: 89, knowledge: 91 }
    },
    { 
      id: 9, 
      name: 'Núcleo Atómico', 
      image: personaje9,
      specialty: 'Radioprotección',
      description: 'Gestiona fuentes ionizantes y protocolos ALARA.',
      color: '#f97316',
      stats: { speed: 84, precision: 94, knowledge: 90 }
    },
    { 
      id: 10, 
      name: 'Mago Residual', 
      image: personaje10,
      specialty: 'Gestión de Residuos',
      description: 'Clasifica, neutraliza y dispone residuos peligrosos sin errores.',
      color: '#22c55e',
      stats: { speed: 76, precision: 96, knowledge: 92 }
    },
    { 
      id: 11, 
      name: 'Jefe de Normas', 
      image: personaje11,
      specialty: 'Normativa & Auditoría',
      description: 'Memoriza normas, auditorías y checklists como nadie.',
      color: '#a855f7',
      stats: { speed: 86, precision: 93, knowledge: 97 }
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

    // Recuperar sesión existente si hay una
    const existingSession = getSession();
    const sessionId = existingSession?.sessionId || null;

    // Enviar información del personaje junto con los datos del jugador
    socket.emit("join-game", { 
      pin, 
      username, 
      character: {
        id: selectedCharacter.id,
        name: selectedCharacter.name,
        image: selectedCharacter.image,
        specialty: selectedCharacter.specialty
      },
      sessionId // Incluir sessionId para reconexión
    }, (response) => {
      setLoading(false);
      if (response.success) {
        // Guardar sesión persistente
        saveSession({
          sessionId: response.sessionId,
          pin,
          username,
          character: {
            id: selectedCharacter.id,
            name: selectedCharacter.name,
            image: selectedCharacter.image,
            specialty: selectedCharacter.specialty
          }
        });

        // Guardar datos del juego
        saveGameData({
          pin,
          username,
          character: selectedCharacter,
          totalQuestions: response.totalQuestions
        });

        localStorage.setItem("username", username);
        localStorage.setItem("selectedCharacter", JSON.stringify(selectedCharacter));

        if (typeof response.totalQuestions === "number") {
          localStorage.setItem("questionsCount", response.totalQuestions);
        }
        
        // Limpiar datos temporales
        localStorage.removeItem("tempUsername");
        
        // Manejar reconexión
        if (response.reconnected) {
          console.log("✅ Reconectado exitosamente");
          // Restaurar estado del jugador
          if (response.playerData) {
            localStorage.setItem("playerScore", response.playerData.score || 0);
            localStorage.setItem("playerLives", response.playerData.lives || 3);
          }
        }
        
        const joiningInProgress = response.gameStatus === "playing";
        if (joiningInProgress) {
          localStorage.setItem("joiningInProgress", "true");
          console.log("Conectado a una partida en curso");
          navigate("/game");
        } else {
          localStorage.removeItem("joiningInProgress");
          console.log("Conectado al juego con personaje seleccionado");
          navigate("/waiting-room");
        }
      } else {
        // MEJORADO: Manejo específico de errores de nombres duplicados
        const errorMessage = response.error || "Error al unirse al juego";
        
        // Manejo específico por código de error
        if (response.code === 'DUPLICATE_BROWSER') {
          setBlockReason(response.error || "Ya tienes una cuenta activa en este juego desde otra pestaña o ventana.");
          setIsBlocked(true);
        } else if (response.code === 'IP_LIMIT_REACHED') {
          setBlockReason(response.error || "Límite de jugadores alcanzado desde esta red. Máximo 2 jugadores por conexión.");
          setIsBlocked(true);
        } else if (errorMessage.includes("Ya existe un jugador con ese nombre")) {
          setError("⚠️ Nombre ya en uso. Alguien más ya está usando este nombre en la sala. Por favor, vuelve atrás y elige otro nombre.");
        } else if (errorMessage.includes("Juego no encontrado")) {
          setError("❌ Sala no encontrada. Verifica que el PIN sea correcto.");
        } else if (errorMessage.includes("ya ha finalizado")) {
          setError("🏁 Esta partida ya ha terminado. Busca una nueva sala para jugar.");
        } else {
          setError(`❌ ${errorMessage}`);
        }
        
        console.error("Error al unirse al juego:", errorMessage);
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
      {/* Multi-Account Block Overlay */}
      {isBlocked && (
        <MultiAccountBlock 
          reason={blockReason}
          onClose={() => navigate('/')}
        />
      )}

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
            <div className={styles.errorContent}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            {error.includes("Nombre ya en uso") && (
              <button 
                className={styles.changeNameButton}
                onClick={goBack}
              >
                <ArrowLeft size={16} />
                Cambiar Nombre
              </button>
            )}
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