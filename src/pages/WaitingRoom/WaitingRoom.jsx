import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Crown, Play, Clock, Wifi, WifiOff, Zap } from "lucide-react";
import styles from "./WaitingRoom.module.css";
import logo from "../../assets/images/logo.png";
import { socket } from "../../services/websocket/socketService";

export default function WaitingRoom() {
  const [players, setPlayers] = useState([]);
  const [gameInfo, setGameInfo] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [countdown, setCountdown] = useState(null);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState('waiting'); // 'waiting', 'countdown', 'starting', 'transitioning'
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener información del usuario actual
    const username = localStorage.getItem("username");
    const characterData = localStorage.getItem("selectedCharacter");
    const gamePin = localStorage.getItem("gamePin");

    if (!username || !characterData || !gamePin) {
      console.log("Datos faltantes, redirigiendo al inicio");
      navigate("/");
      return;
    }

    try {
      const character = JSON.parse(characterData);
      setCurrentUser({ username, character });

      // Obtener información del juego
      setGameInfo({
        pin: gamePin,
        name: "Aventura de Pictogramas",
        maxPlayers: 50,
        questionsCount: 0
      });
    } catch (error) {
      console.error("Error al cargar datos:", error);
      navigate("/");
      return;
    }

    // Socket events
    socket.on("players-updated", (data) => {
      console.log("Jugadores actualizados:", data);
      if (data && data.players) {
        setPlayers(data.players);
      }
    });

    // MEJORADO: Manejo de inicio de juego con fases
    socket.on("game-starting", (data) => {
      console.log("Juego iniciando:", data);
      setIsGameStarting(true);
      setTransitionPhase('countdown');
      if (data && data.countdown) {
        setCountdown(data.countdown);
      } else {
        setCountdown(5); // Countdown por defecto
      }
    });

    socket.on("game-started", (data) => {
      console.log("Juego iniciado:", data);
      setTransitionPhase('starting');

      // Transición suave antes de navegar
      setTimeout(() => {
        setTransitionPhase('transitioning');
        setTimeout(() => {
          navigate("/game");
        }, 1000); // 1 segundo de transición
      }, 500);
    });

    socket.on("player-joined", (data) => {
      console.log("Jugador se unió:", data);
      if (data && data.players) {
        setPlayers(data.players);
      }
      if (data && data.gameInfo) {
        setGameInfo(data.gameInfo);
        localStorage.setItem("questionsCount", data.gameInfo.questionsCount);
      }
    });

    socket.on("player-left", (data) => {
      console.log("Jugador salió:", data);
      if (data && data.players) {
        setPlayers(data.players);
      }
    });

    socket.on("connect", () => {
      console.log("Socket conectado");
      setConnectionStatus('connected');
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado");
      setConnectionStatus('disconnected');
    });

    // Solicitar lista actual de jugadores
    socket.emit("get-room-players", { pin: gamePin }, (response) => {
      if (response && response.success && response.players) {
        console.log("Jugadores obtenidos:", response.players);
        setPlayers(response.players);
        if (response.gameInfo) {
          setGameInfo(response.gameInfo);
          localStorage.setItem("questionsCount", response.gameInfo.questionsCount);
        }
      } else {
        console.log("No se pudieron obtener los jugadores:", response);
        setPlayers([]);
      }
    });

    return () => {
      socket.off("players-updated");
      socket.off("game-starting");
      socket.off("game-started");
      socket.off("player-joined");
      socket.off("player-left");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [navigate]);

  // MEJORADO: Countdown effect con efectos de sonido y animaciones
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);

        // Efectos especiales en los últimos 3 segundos
        if (countdown <= 3) {
          // Aquí podrías agregar efectos de sonido
          console.log(`¡${countdown}!`);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && transitionPhase === 'countdown') {
      setTransitionPhase('starting');
    }
  }, [countdown, transitionPhase]);

  const leaveGame = () => {
    const gamePin = localStorage.getItem("gamePin");
    const username = localStorage.getItem("username");

    socket.emit("leave-game", { pin: gamePin, username });

    localStorage.removeItem("username");
    localStorage.removeItem("selectedCharacter");
    localStorage.removeItem("gamePin");

    navigate("/");
  };

  const isHost = currentUser && players.length > 0 && players[0]?.username === currentUser.username;

  // Función para obtener el mensaje de la fase actual
  const getPhaseMessage = () => {
    switch (transitionPhase) {
      case 'countdown':
        return countdown > 0 ? `El juego comenzará en ${countdown}...` : "¡Iniciando!";
      case 'starting':
        return "¡Preparando el juego!";
      case 'transitioning':
        return "¡Comenzando aventura!";
      default:
        return "Esperando jugadores...";
    }
  };

  return (
    <div className={`${styles.waitingWrapper} ${styles[transitionPhase]}`}>
      {/* Enhanced Countdown overlay */}
      {(transitionPhase === 'countdown' || transitionPhase === 'starting' || transitionPhase === 'transitioning') && (
        <div className={`${styles.countdownOverlay} ${styles[`phase-${transitionPhase}`]}`}>
          <div className={`${styles.countdownCard} ${countdown <= 3 && countdown > 0 ? styles.critical : ''}`}>
            {transitionPhase === 'countdown' && countdown > 0 && (
              <>
                <div className={styles.countdownIcon}>
                  <Clock size={64} />
                </div>
                <h2>¡El juego está comenzando!</h2>
                <div className={`${styles.countdownNumber} ${countdown <= 3 ? styles.critical : ''}`}>
                  {countdown}
                </div>
                <p>Prepárate para la aventura...</p>
                <div className={styles.countdownProgress}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  ></div>
                </div>
              </>
            )}

            {transitionPhase === 'starting' && (
              <>
                <div className={styles.startingIcon}>
                  <Zap size={64} />
                </div>
                <h2>¡Preparando el Juego!</h2>
                <div className={styles.loadingSpinner}></div>
                <p>Cargando preguntas y configuración...</p>
              </>
            )}

            {transitionPhase === 'transitioning' && (
              <>
                <div className={styles.transitionIcon}>
                  <Play size={64} />
                </div>
                <h2>¡Comenzando Aventura!</h2>
                <div className={styles.waveEffect}></div>
                <p>¡Que comience la diversión!</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <img src={logo} alt="DOT'S GO Logo" className={styles.logo} />
          <div className={styles.gameTitle}>
            <h2>Sala de Espera</h2>
            <div className={styles.connectionStatus}>
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi size={16} />
                  <span>Conectado</span>
                </>
              ) : (
                <>
                  <WifiOff size={16} />
                  <span>Desconectado</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.gameInfo}>
          <div className={styles.pinDisplay}>
            PIN: <span>{gameInfo.pin}</span>
          </div>
          <button
            className={styles.leaveButton}
            onClick={leaveGame}
            disabled={isGameStarting}
          >
            {isGameStarting ? 'Iniciando...' : 'Salir'}
          </button>
        </div>
      </header>

      {/* Status Bar */}
      {isGameStarting && (
        <div className={styles.statusBar}>
          <div className={styles.statusMessage}>
            <Zap size={18} />
            <span>{getPhaseMessage()}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Game Info Panel */}
        <div className={styles.gameInfoPanel}>
          <h3>🎮 Información del Juego</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Users size={20} />
              <div>
                <span className={styles.infoLabel}>Jugadores</span>
                <span className={styles.infoValue}>{players.length}/{gameInfo.maxPlayers}</span>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Clock size={20} />
              <div>
                <span className={styles.infoLabel}>Preguntas</span>
                <span className={styles.infoValue}>{gameInfo.questionsCount}</span>
              </div>
            </div>
          </div>

          {isHost && (
            <div className={styles.hostControls}>
              <div className={styles.hostBadge}>
                <Crown size={16} />
                Eres el anfitrión
              </div>
              <p className={styles.hostInfo}>
                {isGameStarting
                  ? "¡El juego está comenzando!"
                  : "El juego comenzará automáticamente cuando el administrador lo inicie desde su panel."
                }
              </p>
            </div>
          )}
        </div>

        {/* Players Grid */}
        <div className={styles.playersSection}>
          <div className={styles.sectionHeader}>
            <h3>👥 Jugadores Conectados ({players.length})</h3>
            {players.length === 0 && !isGameStarting && (
              <p className={styles.waitingMessage}>Esperando más jugadores...</p>
            )}
          </div>

          <div className={`${styles.playersGrid} ${isGameStarting ? styles.gameStarting : ''}`}>
            {players.map((player, index) => (
              <div
                key={`${player.username}-${index}`}
                className={`${styles.playerCard} ${currentUser?.username === player.username ? styles.currentUser : ''
                  } ${index === 0 ? styles.host : ''} ${isGameStarting ? styles.ready : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {index === 0 && (
                  <div className={styles.hostIndicator}>
                    <Crown size={14} />
                  </div>
                )}

                {currentUser?.username === player.username && (
                  <div className={styles.youIndicator}>Tú</div>
                )}

                <div className={styles.playerAvatar}>
                  {player.character && player.character.image ? (
                    <img
                      src={player.character.image}
                      alt={player.character.name || 'Avatar'}
                      className={styles.avatarImage}
                      onError={(e) => {
                        console.error("Error cargando imagen:", player.character.image);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={styles.defaultAvatar}>
                      <Users size={32} />
                    </div>
                  )}
                </div>

                <div className={styles.playerInfo}>
                  <h4 className={styles.playerName}>{player.username}</h4>
                  <p className={styles.characterName}>
                    {player.character?.name || 'Sin personaje'}
                  </p>
                  <p className={styles.characterSpecialty}>
                    {player.character?.specialty || ''}
                  </p>
                </div>

                <div className={styles.playerStatus}>
                  <div className={`${styles.statusDot} ${isGameStarting ? styles.starting : ''}`}></div>
                  <span>{isGameStarting ? 'Preparado' : 'Listo'}</span>
                </div>
              </div>
            ))}

            {players.length < gameInfo.maxPlayers && !isGameStarting && (
              <div className={styles.emptySlot}>
                <div className={styles.emptyAvatar}>
                  <Users size={32} />
                </div>
                <p>Esperando jugador...</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.instructionsPanel}>
          <h4>🎯 ¿Cómo Jugar?</h4>
          <ul className={styles.instructionsList}>
            <li>Arrastra colores para crear la base del pictograma</li>
            <li>Selecciona símbolos y colócalos en la posición correcta</li>
            <li>Agrega números si es necesario</li>
            <li>¡Sé rápido y preciso para obtener más puntos!</li>
          </ul>
        </div>
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