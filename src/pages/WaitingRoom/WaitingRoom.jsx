import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Crown, Play, Clock, Wifi, WifiOff, Zap } from "lucide-react";
import styles from "./WaitingRoom.module.css";
import logo from "../../assets/images/logo.png";
import { socket, connectSocket } from "../../services/websocket/socketService";
import { useUserPersistence } from "../../hooks/useUserPersistence";
import storage from "../../utils/storage"; // Wrapper seguro para localStorage

export default function WaitingRoom() {
  const [players, setPlayers] = useState([]);
  const [gameInfo, setGameInfo] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [countdown, setCountdown] = useState(null);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState('waiting'); // 'waiting', 'countdown', 'starting', 'transitioning'
  const { restoreUserProgress } = useUserPersistence();
  const autoNavigateRef = useRef(false);
  const rejoinAttemptedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener información del usuario actual desde storage seguro
    const username = storage.getItem("username", null);
    const characterData = storage.getItem("selectedCharacter", null);
    const gamePin = storage.getItem("gamePin", null);

    if (!username || !characterData || !gamePin) {
      console.log("Datos faltantes, redirigiendo al inicio");
      navigate("/");
      return;
    }

    let character;
    try {
      character = JSON.parse(characterData);
      setCurrentUser({ username, character });
    } catch (error) {
      console.error("Error al cargar personaje desde localStorage:", error);
      
      // NUEVO: Intentar restaurar desde el progreso guardado
      const restoredCharacter = restoreUserProgress(username);
      if (restoredCharacter) {
        character = restoredCharacter;
        setCurrentUser({ username, character });
        console.log("Personaje restaurado en WaitingRoom:", restoredCharacter);
      } else {
        console.log("No se pudo restaurar el personaje, redirigiendo al inicio");
        navigate("/");
        return;
      }
    }

    if (!character) {
      // NUEVO: Si no hay personaje, intentar restaurar desde progreso guardado
      const restoredCharacter = restoreUserProgress(username);
      if (restoredCharacter) {
        character = restoredCharacter;
        setCurrentUser({ username, character });
        console.log("Personaje restaurado en WaitingRoom:", restoredCharacter);
      } else {
        console.log("No se encontró personaje, redirigiendo al inicio");
        navigate("/");
        return;
      }
    }

    try {

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

    connectSocket();

    const ensurePlayerPresence = (playerList = []) => {
      const isPlayerPresent = playerList.some((player) => player.username === username);
      if (isPlayerPresent) {
        rejoinAttemptedRef.current = true;
        return;
      }

      if (!rejoinAttemptedRef.current && socket.connected) {
        rejoinAttemptedRef.current = true;
        socket.emit(
          "join-game",
          {
            pin: gamePin,
            username,
            character,
          },
          (response) => {
            if (!response?.success) {
              console.error("Error al reingresar al juego:", response?.error);
              rejoinAttemptedRef.current = false;
              
              // MEJORADO: Manejo específico de nombres duplicados
              if (response?.error?.includes("Ya existe un jugador con ese nombre")) {
                alert("⚠️ Nombre ya en uso. Alguien más está usando tu nombre en esta sala. Serás redirigido para elegir otro nombre.");
                // Limpiar datos usando storage seguro
                storage.removeItem("username");
                storage.removeItem("selectedCharacter");
                navigate("/join");
              } else if (response?.error?.includes("Juego no encontrado")) {
                alert("❌ La sala ya no existe. Serás redirigido al inicio.");
                storage.removeItem("gamePin");
                navigate("/");
              }
            }
          }
        );
      }
    };

    // Socket events
    const navigateToGameInProgress = () => {
      if (!autoNavigateRef.current) {
        autoNavigateRef.current = true;
        // Guardar estado usando storage seguro
        storage.setItem("joiningInProgress", "true");
        navigate("/game");
      }
    };

    const handlePlayersUpdated = (data) => {
      console.log("Jugadores actualizados:", data);
      if (data && data.players) {
        setPlayers(data.players);
        ensurePlayerPresence(data.players);
      }
    };

    // MEJORADO: Manejo de inicio de juego con fases
    const handleGameStarting = (data) => {
      console.log("Juego iniciando:", data);
      setIsGameStarting(true);
      setTransitionPhase('countdown');
      if (data && data.countdown) {
        setCountdown(data.countdown);
      } else {
        setCountdown(5); // Countdown por defecto
      }
    };

    const handleGameStarted = (data) => {
      console.log("Juego iniciado:", data);
      setTransitionPhase('starting');

      // Transición suave antes de navegar
      setTimeout(() => {
        setTransitionPhase('transitioning');
        setTimeout(() => {
          navigate("/game");
        }, 1000); // 1 segundo de transición
      }, 500);
    };

    const handlePlayerJoined = (data) => {
      console.log("Jugador se unió:", data);
      if (data && data.players) {
        setPlayers(data.players);
        ensurePlayerPresence(data.players);
      }
      if (data && data.gameInfo) {
        setGameInfo(data.gameInfo);
        // Guardar cantidad de preguntas usando storage seguro
        storage.setItem("questionsCount", data.gameInfo.questionsCount.toString());
        if (data.gameInfo.status === "playing") {
          navigateToGameInProgress();
        }
      }
    };

    const handlePlayerLeft = (data) => {
      console.log("Jugador salió:", data);
      if (data && data.players) {
        setPlayers(data.players);
        ensurePlayerPresence(data.players);
      }
    };

    const fetchPlayers = () => {
      socket.emit("get-room-players", { pin: gamePin }, (response) => {
        if (response && response.success && response.players) {
          console.log("Jugadores obtenidos:", response.players);
          setPlayers(response.players);
          ensurePlayerPresence(response.players);
          if (response.gameInfo) {
            setGameInfo(response.gameInfo);
            // Guardar cantidad de preguntas usando storage seguro
            storage.setItem("questionsCount", response.gameInfo.questionsCount.toString());
            if (response.gameInfo.status === "playing") {
              navigateToGameInProgress();
            }
          }
        } else {
          console.log("No se pudieron obtener los jugadores:", response);
          setPlayers([]);
          ensurePlayerPresence([]);
        }
      });
    };

    const handleConnect = () => {
      console.log("Socket conectado");
      setConnectionStatus('connected');
      if (!rejoinAttemptedRef.current) {
        fetchPlayers();
      }
    };

    const handleDisconnect = () => {
      console.log("Socket desconectado");
      setConnectionStatus('disconnected');
      rejoinAttemptedRef.current = false;
    };

    socket.on("players-updated", handlePlayersUpdated);
    socket.on("game-starting", handleGameStarting);
    socket.on("game-started", handleGameStarted);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("player-left", handlePlayerLeft);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Solicitar lista actual de jugadores
    fetchPlayers();

    return () => {
      socket.off("players-updated", handlePlayersUpdated);
      socket.off("game-starting", handleGameStarting);
      socket.off("game-started", handleGameStarted);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("player-left", handlePlayerLeft);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
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
    // Obtener datos usando storage seguro
    const gamePin = storage.getItem("gamePin", null);
    const username = storage.getItem("username", null);

    socket.emit("leave-game", { pin: gamePin, username });

    // Limpiar datos usando storage seguro
    storage.removeItem("username");
    storage.removeItem("selectedCharacter");
    storage.removeItem("gamePin");

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