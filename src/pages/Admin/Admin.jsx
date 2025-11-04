import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import { socket, connectSocket, disconnectSocket } from "../../services/websocket/socketService";
import {
  Gamepad2,
  BookOpen,
  Users,
  Star,
  BarChart3,
  Play,
  Settings,
  Zap,
  FlaskConical,
  Palette,
  Hash
} from "lucide-react";
import styles from "./Admin.module.css";
import logo from "../../assets/images/logo.png";
import TournamentBracket from "../../components/admin/TournamentBracket/TournamentBracket";
// Importar imágenes de personajes
import personaje1 from "../../assets/images/personajes/1.png";
import personaje2 from "../../assets/images/personajes/2.png";
import personaje3 from "../../assets/images/personajes/3.png";
import personaje4 from "../../assets/images/personajes/4.png";
import personaje5 from "../../assets/images/personajes/5.png";
import personaje6 from "../../assets/images/personajes/6.png";
import { API_URL, FRONTEND_URL } from "../../utils/constants";

const GAME_STATE_STORAGE_KEY = "adminGameState";

export default function Admin() {
  const [activeSection, setActiveSection] = useState('crear-juego');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados para crear juego (manteniendo funcionalidad original)
  const [tiempo, setTiempo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [tiempoJuego, setTiempoJuego] = useState("30");
  const [nombreJuego, setNombreJuego] = useState("");
  const [dificultad, setDificultad] = useState("medio");
  const [esperandoResultados, setEsperandoResultados] = useState(false);
  const [juegoCreado, setJuegoCreado] = useState(false);
  const [questions, setQuestions] = useState([]);
  
  // NUEVO: Estado para modo de juego
  const [selectedGameMode, setSelectedGameMode] = useState("classic");
  const [adventureLives, setAdventureLives] = useState(3);
  
  // NUEVO: Estados para modo duelo
  const [duelState, setDuelState] = useState({
    players: [],
    finishLine: 15,
    gameEnded: false,
    winner: null
  });

  // NUEVO: Estados para modo torneo
  const [tournamentState, setTournamentState] = useState({
    bracket: [],
    currentMatch: null,
    status: 'waiting', // waiting, active, completed
    winner: null
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [playerRankings, setPlayerRankings] = useState([]);
  const [showRanking, setShowRanking] = useState(false);
  const [players, setPlayers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  // NUEVO: Configuraciones de modos de juego
  const gameModes = {
    classic: {
      name: 'Modo Clásico',
      description: 'Responde todas las preguntas y acumula puntos. El jugador con más puntos gana.',
      icon: '🏆',
      maxPlayers: 50,
      features: ['Puntuación por velocidad', 'Todas las preguntas', 'Ranking final'],
      color: '#10b981'
    },
    adventure: {
      name: 'Modo Aventura',
      description: 'Escala la montaña con 3 vidas. Cada error te hace perder una vida.',
      icon: '🏔️',
      maxPlayers: 20,
      features: ['3 vidas por jugador', 'Eliminación por vidas', 'Supervivencia'],
      color: '#f59e0b'
    },
    duel: {
      name: 'Modo Duelo',
      description: 'Enfrentamiento 1v1 eliminatorio. Un error y estás fuera.',
      icon: '⚔️',
      maxPlayers: 2,
      features: ['Solo 2 jugadores', 'Eliminatorio directo', 'Un error = eliminación'],
      color: '#ef4444'
    },
    tournament: {
      name: 'Modo Torneo',
      description: 'Torneo eliminatorio con múltiples jugadores. Bracket automático.',
      icon: '🏆',
      maxPlayers: 32,
      features: ['Múltiples jugadores', 'Bracket automático', 'Eliminación directa'],
      color: '#8b5cf6'
    }
  };

  const saveGameState = useCallback((newState) => {
    if (typeof window === "undefined") return;

    try {
      const existingStateJSON = localStorage.getItem(GAME_STATE_STORAGE_KEY);
      const existingState = existingStateJSON ? JSON.parse(existingStateJSON) : {};
      const updatedState = { ...existingState, ...newState };

      if (Object.keys(updatedState).length === 0) {
        localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      } else {
        localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(updatedState));
      }
    } catch (error) {
      console.error("Error al guardar el estado del juego:", error);
    }
  }, []);

  const resetGame = useCallback(() => {
    setActiveSection('crear-juego');
    setTiempo("");
    setCodigo("");
    setSelectedQuestions([]);
    setTiempoJuego("30");
    setNombreJuego("");
    setDificultad("medio");
    setEsperandoResultados(false);
    setJuegoCreado(false);
    setCurrentQuestion(0);
    setTotalQuestions(0);
    setPlayerRankings([]);
    setShowRanking(false);
    setPlayers([]);

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      } catch (error) {
        console.error("Error al limpiar el estado del juego:", error);
      }
    }
  }, []);


  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Cargar preguntas
  useEffect(() => {
    console.log("Admin.jsx: Intentando obtener preguntas desde:", `${API_URL}/api/questions`);

    fetch(`${API_URL}/api/questions`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('La respuesta de la red no fue exitosa. Estado: ' + res.status);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Admin.jsx: ¡Éxito! Preguntas recibidas:", data);
        setQuestions(data);
      })
      .catch((err) => console.error("Error definitivo al obtener preguntas en Admin.jsx:", err));
  }, []);

  // Socket setup (manteniendo funcionalidad original)
  useEffect(() => {
    connectSocket();

    const handlePlayerJoined = ({ players = [] }) => {
      setPlayers(players);
    };

    const handlePlayerLeft = ({ players = [] }) => {
      setPlayers(players);
    };

    const handlePlayersUpdated = ({ players = [] }) => {
      setPlayers(players);
    };

    socket.on("game-started", (data) => {
      setCurrentQuestion(data.currentIndex);
      setTotalQuestions(data.totalQuestions);
    });

    const handleGameEnded = ({ results, hasWinner }) => {
      console.log("Resultados finales recibidos en Admin:", results);
      console.log("¿Hay ganador?:", hasWinner);
      setEsperandoResultados(false);
      resetGame();
      navigate("/game-results", { state: { results, hasWinner } });
    };

    const restoreSavedGame = () => {
      if (typeof window === "undefined") return;

      const savedGameJSON = localStorage.getItem(GAME_STATE_STORAGE_KEY);
      if (!savedGameJSON) return;

      try {
        const savedGame = JSON.parse(savedGameJSON);

        if (savedGame.pin) {
          setCodigo(savedGame.pin);
          setJuegoCreado(true);
        }

        if (savedGame.tiempoJuego) {
          const storedTime = String(savedGame.tiempoJuego);
          setTiempo(storedTime);
          setTiempoJuego(storedTime);
        }

        if (savedGame.nombreJuego) {
          setNombreJuego(savedGame.nombreJuego);
        }

        if (Array.isArray(savedGame.selectedQuestions)) {
          setSelectedQuestions(savedGame.selectedQuestions);
        }

        if (savedGame.esperandoResultados) {
          setEsperandoResultados(true);
        }
      } catch (error) {
        console.error("Error al restaurar el estado del juego guardado:", error);
        localStorage.removeItem(GAME_STATE_STORAGE_KEY);
      }
    };

    const attemptRejoin = () => {
      if (typeof window === "undefined") return;

      const savedGameJSON = localStorage.getItem(GAME_STATE_STORAGE_KEY);
      if (!savedGameJSON) return;

      let savedGame;
      try {
        savedGame = JSON.parse(savedGameJSON);
      } catch (error) {
        console.error("Error al parsear estado de juego almacenado:", error);
        localStorage.removeItem(GAME_STATE_STORAGE_KEY);
        return;
      }

      if (!savedGame.pin) return;

      socket.emit("rejoin-host", { pin: savedGame.pin }, (response) => {
        if (!response?.success) {
          resetGame();
          return;
        }

        const { game } = response;
        setPlayers(game.players || []);

        if (game.status === "finished") {
          resetGame();
          return;
        }

        const isPlaying = game.status === "playing";
        setEsperandoResultados(isPlaying);
        saveGameState({ esperandoResultados: isPlaying });
      });
    };

    restoreSavedGame();

    socket.on("player-joined", handlePlayerJoined);
    socket.on("game-ended", handleGameEnded);
    socket.on("connect", attemptRejoin);
    socket.on("player-left", handlePlayerLeft);
    socket.on("players-updated", handlePlayersUpdated);

    if (socket.connected) {
      attemptRejoin();
    }

    socket.on("ranking-updated", (data) => {
      console.log("Actualización de estado recibida:", data);
      if (data.players) {
        // Asegurarse de que los jugadores tengan los campos necesarios
        const updatedPlayers = data.players.map(player => ({
          id: player.id || player._id || Math.random().toString(36).substr(2, 9),
          username: player.username || 'Jugador',
          score: player.score || 0,
          correctAnswers: player.correctAnswers || 0,
          wrongAnswers: player.wrongAnswers || 0,
          totalResponseTime: player.totalResponseTime || 0
        }));

        // Ordenar jugadores por puntuación (de mayor a menor)
        const sortedPlayers = [...updatedPlayers].sort((a, b) => b.score - a.score);
        setPlayerRankings(sortedPlayers);
      }
    });

    // NUEVO: Event listeners para modo duelo
    socket.on("duel-state-update", (data) => {
      console.log("🏁 Actualización de estado del duelo:", data);
      setDuelState(data);
    });

    socket.on("duel-position-update", (data) => {
      console.log("⚔️ Actualización de posición en duelo:", data);
      // Actualizar el estado local del duelo
      setDuelState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === data.playerId 
            ? { ...p, position: data.position, lives: data.livesRemaining || p.lives }
            : p
        )
      }));
    });

    // NUEVO: Event listeners para modo torneo
    socket.on("tournament-state-update", (data) => {
      console.log("🏆 Actualización de estado del torneo:", data);
      setTournamentState(data);
    });

    socket.on("tournament-match-started", (data) => {
      console.log("⚔️ Match de torneo iniciado:", data);
      setTournamentState(prev => ({
        ...prev,
        currentMatch: data.match,
        status: 'active'
      }));
    });

    socket.on("tournament-match-completed", (data) => {
      console.log("✅ Match de torneo completado:", data);
      setTournamentState(prev => ({
        ...prev,
        currentMatch: null,
        bracket: data.bracket,
        winner: data.tournamentWinner || prev.winner
      }));
    });

    // NUEVO: Escuchar intentos de nombres duplicados
    socket.on("duplicate-name-attempt", (data) => {
      console.log("⚠️ Intento de nombre duplicado:", data);
      
      // Agregar notificación al estado
      const newNotification = {
        id: Date.now(),
        type: 'warning',
        title: 'Nombre Duplicado',
        message: `Intento de usar "${data.attemptedName}" (ya existe: "${data.existingName}")`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setNotifications(prev => [...prev, newNotification]);
      
      // Remover automáticamente después de 5 segundos
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    });


    return () => {
      socket.off("player-joined", handlePlayerJoined);
      socket.off("game-ended", handleGameEnded);
      socket.off("connect", attemptRejoin);
      socket.off("player-left", handlePlayerLeft);
      socket.off("players-updated", handlePlayersUpdated);
      socket.off("game-started");
      socket.off("ranking-updated");
      socket.off("duplicate-name-attempt");
      socket.off("duel-state-update");
      socket.off("duel-position-update");
      socket.off("tournament-state-update");
      socket.off("tournament-match-started");
      socket.off("tournament-match-completed");
      disconnectSocket();
    };
  }, [navigate, resetGame, saveGameState]);

  const menuItems = [
    { id: 'crear-juego', label: 'Crear Juego', icon: <Gamepad2 size={20} />, color: '#6366f1' },
    { id: 'mis-sets', label: 'Mis Sets', icon: <BookOpen size={20} />, color: '#8b5cf6' },
    { id: 'personajes', label: 'Personajes', icon: <Users size={20} />, color: '#06b6d4' },
    { id: 'favoritos', label: 'Favoritos', icon: <Star size={20} />, color: '#f59e0b' },
    { id: 'historial', label: 'Historial', icon: <BarChart3 size={20} />, color: '#10b981' },
    { id: 'jugar', label: 'Jugar', icon: <Play size={20} />, color: '#ef4444' },
    { id: 'configuracion', label: 'Configuración', icon: <Settings size={20} />, color: '#6b7280' }
  ];

  // Datos de personajes actualizados con imágenes reales
  const characters = [
    {
      id: 1,
      name: 'Químico Pro',
      image: personaje1
    },
    {
      id: 2,
      name: 'Safety Master',
      image: personaje2
    },
    {
      id: 3,
      name: 'Lab Expert',
      image: personaje3
    },
    {
      id: 4,
      name: 'Fire Guardian',
      image: personaje4
    },
    {
      id: 5,
      name: 'Eco Warrior',
      image: personaje5
    },
    {
      id: 6,
      name: 'Hazmat Hero',
      image: personaje6
    }
  ];

  const gameStats = [
    { label: 'Juegos Creados', value: '0', icon: <Gamepad2 size={24} />, change: '+0' },
    { label: 'Jugadores Activos', value: players.length.toString(), icon: <Users size={24} />, change: `+${players.length}` },
    { label: 'Partidas Completadas', value: '0', icon: <Play size={24} />, change: '+0' },
    { label: 'Puntuación Media', value: '0.0', icon: <BarChart3 size={24} />, change: '+0.0' }
  ];

  // Funciones para manejar preguntas
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions((prevSelected) =>
      prevSelected.includes(questionId)
        ? prevSelected.filter((id) => id !== questionId)
        : [...prevSelected, questionId]
    );
  };

  const selectAllQuestions = () => {
    const allQuestionIds = questions.map(q => q._id);
    setSelectedQuestions(allQuestionIds);
  };

  const clearAllQuestions = () => {
    setSelectedQuestions([]);
  };

  // Funciones originales del juego
  const handleCrearJuego = () => {
    if (selectedQuestions.length === 0) {
      alert("Por favor, selecciona al menos una pregunta antes de crear el juego.");
      return;
    }

    console.log(`Admin: Creando juego con ${selectedQuestions.length} preguntas:`, selectedQuestions);

    socket.emit("create-game", {
      timeLimit: parseInt(tiempoJuego),
      questionIds: selectedQuestions,
      gameMode: selectedGameMode, // NUEVO: Incluir modo de juego
      gameName: nombreJuego,
      modeConfig: {
        maxLives: selectedGameMode === 'adventure' ? adventureLives : 3
      }
    }, (response) => {
      if (response.success) {
        setCodigo(response.pin);
        setTiempo(tiempoJuego);
        setJuegoCreado(true);
        saveGameState({ pin: response.pin, esperandoResultados: false });
        console.log(`Admin: Juego creado con PIN ${response.pin}`);
      } else {
        alert(response.error || "Error al crear el juego");
        console.error("Error al crear juego:", response.error);
      }
    });
  };

  const handleIniciarJuego = () => {
    setEsperandoResultados(true);
    saveGameState({ esperandoResultados: true });
    setShowRanking(true); // Mostrar el ranking cuando inicia el juego
    
    // Para modo torneo, crear el bracket primero
    if (selectedGameMode === 'tournament') {
      socket.emit("create-tournament", { pin: codigo }, (response) => {
        if (response.success) {
          setTournamentState(response.tournament);
        } else {
          alert(response.error || "Error al crear el torneo");
          setEsperandoResultados(false);
          saveGameState({ esperandoResultados: false });
          setShowRanking(false);
          return;
        }
      });
    }
    
    socket.emit("start-game", { pin: codigo }, (response) => {
      if (!response.success) {
        setEsperandoResultados(false);
        saveGameState({ esperandoResultados: false });
        setShowRanking(false);
        alert(response.error || "Error al iniciar el juego");
      }
    });
  };

  // NUEVO: Función para iniciar un match del torneo
  const handleStartTournamentMatch = (match, round) => {
    socket.emit("start-tournament-match", { 
      pin: codigo, 
      matchId: match.id 
    }, (response) => {
      if (!response.success) {
        alert(response.error || "Error al iniciar el match");
      }
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'crear-juego':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>🎮 Crear Nuevo Juego</h2>
              <p>Diseña experiencias educativas únicas</p>
            </div>

            <div className={styles.statsGrid}>
              {gameStats.map((stat, index) => (
                <div key={index} className={styles.statCard}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <div className={styles.statInfo}>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                    <div className={styles.statChange}>{stat.change}</div>
                  </div>
                </div>
              ))}
            </div>

            {!juegoCreado ? (
              <div className={styles.gameCreationContainer}>
                <div className={styles.creationForm}>
                  <div className={styles.formCard}>
                    <h3><Zap size={20} style={{ display: 'inline', marginRight: '8px' }} />Configuración Rápida</h3>

                    <div className={styles.formGroup}>
                      <label>Nombre del Juego</label>
                      <input
                        type="text"
                        placeholder="Ej: Aventura Química Nivel 1"
                        value={nombreJuego}
                        onChange={(e) => setNombreJuego(e.target.value)}
                      />
                    </div>

                    {/* NUEVO: Selección de Modo de Juego */}
                    <div className={styles.formGroup}>
                      <label>Modo de Juego</label>
                      <div className={styles.gameModeSelector}>
                        {Object.entries(gameModes).map(([modeKey, mode]) => (
                          <div
                            key={modeKey}
                            className={`${styles.gameModeCard} ${
                              selectedGameMode === modeKey ? styles.selected : ''
                            }`}
                            onClick={() => setSelectedGameMode(modeKey)}
                            style={{ '--mode-color': mode.color }}
                          >
                            <div className={styles.modeIcon}>{mode.icon}</div>
                            <div className={styles.modeInfo}>
                              <h4>{mode.name}</h4>
                              <p>{mode.description}</p>
                              <div className={styles.modeFeatures}>
                                {mode.features.map((feature, index) => (
                                  <span key={index} className={styles.feature}>
                                    {feature}
                                  </span>
                                ))}
                              </div>
                              <div className={styles.modeStats}>
                                <span>Máx. {mode.maxPlayers} jugadores</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* NUEVO: Configuración específica para Modo Aventura */}
                    {selectedGameMode === 'adventure' && (
                      <div className={styles.formGroup}>
                        <label>Número de Vidas (Modo Aventura)</label>
                        <div className={styles.livesSelector}>
                          <button
                            className={`${styles.livesBtn} ${adventureLives === 1 ? styles.active : ''}`}
                            onClick={() => setAdventureLives(1)}
                          >
                            ❤️ 1 Vida
                          </button>
                          <button
                            className={`${styles.livesBtn} ${adventureLives === 2 ? styles.active : ''}`}
                            onClick={() => setAdventureLives(2)}
                          >
                            ❤️❤️ 2 Vidas
                          </button>
                          <button
                            className={`${styles.livesBtn} ${adventureLives === 3 ? styles.active : ''}`}
                            onClick={() => setAdventureLives(3)}
                          >
                            ❤️❤️❤️ 3 Vidas
                          </button>
                          <button
                            className={`${styles.livesBtn} ${adventureLives === 5 ? styles.active : ''}`}
                            onClick={() => setAdventureLives(5)}
                          >
                            ❤️❤️❤️❤️❤️ 5 Vidas
                          </button>
                          <input
                            type="number"
                            placeholder="Custom"
                            value={adventureLives}
                            onChange={(e) => setAdventureLives(parseInt(e.target.value) || 3)}
                            min="1"
                            max="10"
                            className={styles.customLivesInput}
                          />
                        </div>
                        <p className={styles.livesDescription}>
                          Cada jugador comenzará con {adventureLives} vida{adventureLives !== 1 ? 's' : ''}. 
                          Al responder incorrectamente, perderán una vida. Sin vidas = eliminación.
                        </p>
                      </div>
                    )}

                    <div className={styles.formGroup}>
                      <label>Tiempo por Pregunta (segundos)</label>
                      <div className={styles.timeSelector}>
                        <button
                          className={`${styles.timeBtn} ${tiempoJuego === '30' ? styles.active : ''}`}
                          onClick={() => setTiempoJuego('30')}
                        >
                          30s
                        </button>
                        <button
                          className={`${styles.timeBtn} ${tiempoJuego === '60' ? styles.active : ''}`}
                          onClick={() => setTiempoJuego('60')}
                        >
                          60s
                        </button>
                        <button
                          className={`${styles.timeBtn} ${tiempoJuego === '90' ? styles.active : ''}`}
                          onClick={() => setTiempoJuego('90')}
                        >
                          90s
                        </button>
                        <input
                          type="number"
                          placeholder="Custom"
                          value={tiempoJuego}
                          onChange={(e) => setTiempoJuego(e.target.value)}
                          min="10"
                          max="300"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Dificultad</label>
                      <div className={styles.difficultySelector}>
                        <button
                          className={`${styles.diffBtn} ${styles.easy} ${dificultad === 'facil' ? styles.active : ''}`}
                          onClick={() => setDificultad('facil')}
                        >
                          Fácil
                        </button>
                        <button
                          className={`${styles.diffBtn} ${styles.medium} ${dificultad === 'medio' ? styles.active : ''}`}
                          onClick={() => setDificultad('medio')}
                        >
                          Medio
                        </button>
                        <button
                          className={`${styles.diffBtn} ${styles.hard} ${dificultad === 'dificil' ? styles.active : ''}`}
                          onClick={() => setDificultad('dificil')}
                        >
                          Difícil
                        </button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Preguntas Seleccionadas ({selectedQuestions.length})</label>
                      <div className={styles.questionsActions}>
                        <button
                          className={styles.selectAllBtn}
                          onClick={selectAllQuestions}
                        >
                          Seleccionar Todas
                        </button>
                        <button
                          className={styles.clearAllBtn}
                          onClick={clearAllQuestions}
                        >
                          Limpiar
                        </button>
                      </div>
                    </div>

                    <button
                      className={styles.createBtn}
                      onClick={handleCrearJuego}
                      disabled={selectedQuestions.length === 0}
                    >
                      <span><Play size={16} style={{ marginRight: '8px' }} />Crear Juego</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Preguntas */}
                <div className={styles.questionsContainer}>
                  <h3><BookOpen size={20} style={{ display: 'inline', marginRight: '8px' }} />Seleccionar Preguntas</h3>
                  <div className={styles.questionsGrid}>
                    {questions.map((question) => (
                      <div
                        key={question._id}
                        className={`${styles.questionCard} ${selectedQuestions.includes(question._id) ? styles.questionCardSelected : ""
                          }`}
                        data-type={question.title.toLowerCase()}
                        onClick={() => toggleQuestionSelection(question._id)}
                      >
                        <h4>{question.title}</h4>
                        <div className={styles.questionDetails}>
                          <span><FlaskConical size={14} style={{ marginRight: '4px' }} />{question.correctAnswer.pictogram}</span>
                          <span><Palette size={14} style={{ marginRight: '4px' }} />{question.correctAnswer.colors?.length || 0} colores</span>
                          <span><Hash size={14} style={{ marginRight: '4px' }} />{question.correctAnswer.number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${styles.gameMonitor} ${showRanking ? styles.withRanking : ''}`}>
                <div className={styles.gameMonitorCard}>
                  <h3>🎉 ¡Juego Creado Exitosamente!</h3>
                  <div className={styles.gameInfo}>
                    <p><strong>Nombre:</strong> {nombreJuego || 'Juego sin nombre'}</p>
                    <p><strong>Tiempo:</strong> {tiempo} segundos por pregunta</p>
                    <p><strong>Preguntas:</strong> {selectedQuestions.length}</p>
                  </div>
                  <div className={styles.gameCode}>
                    <p>Código de Juego</p>
                    <span>{codigo}</span>
                    {codigo && (
                      <div className={styles.qrContainer}>
                        <QRCodeSVG
                          value={`${FRONTEND_URL}/join?pin=${codigo}`}
                          size={128}
                          level="H"
                          includeMargin={true}
                          style={{ background: 'white', padding: '8px', borderRadius: '8px' }}
                        />
                        <p className={styles.qrLabel}>Escanea para unirte al juego</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.gameActions}>
                    <button
                      className={styles.startGameBtn}
                      onClick={handleIniciarJuego}
                      disabled={esperandoResultados}
                    >
                      {esperandoResultados ? '⏳ Juego en Curso...' : '🚀 Iniciar Juego'}
                    </button>
                    <button className={styles.resetGameBtn} onClick={resetGame}>
                      🔄 Crear Otro Juego
                    </button>
                  </div>

                  <div className={styles.connectedPlayers}>
                    <h4>👥 Usuarios Conectados ({players.length})</h4>
                    <div className={styles.playersList}>
                      {players.length === 0 ? (
                        <p className={styles.noPlayers}>Esperando jugadores...</p>
                      ) : (
                        players.map((player) => (
                          <div key={player.id} className={styles.playerCard}>
                            <span className={styles.playerAvatar}><Users size={16} /></span>
                            <p className={styles.playerName}>{player.username}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {esperandoResultados && (
                    <div className={styles.waitingResults}>
                      <div className={styles.spinner}></div>
                      <p>Esperando resultados del juego...</p>
                    </div>
                  )}
                </div>

                {showRanking && selectedGameMode === 'tournament' && (
                  <TournamentBracket
                    players={players}
                    onStartMatch={handleStartTournamentMatch}
                    currentMatch={tournamentState.currentMatch}
                    tournamentState={tournamentState}
                  />
                )}

                {showRanking && selectedGameMode === 'duel' && (
                  <div className={styles.duelArena}>
                    <h4>⚔️ Arena de Duelo</h4>
                    <div className={styles.duelTrack}>
                      <div className={styles.trackHeader}>
                        <span className={styles.startLine}>🏁 INICIO</span>
                        <span className={styles.finishLine}>🏆 META (Pos. {duelState.finishLine || 10})</span>
                        <span className={styles.eliminatoryWarning}>⚠️ ELIMINATORIO</span>
                      </div>
                      
                      <div className={styles.raceTrack}>
                        {/* Líneas de posición */}
                        {Array.from({ length: (duelState.finishLine || 10) + 1 }, (_, i) => (
                          <div key={i} className={styles.positionLine} style={{ left: `${(i / (duelState.finishLine || 10)) * 100}%` }}>
                            <span className={styles.positionNumber}>{i}</span>
                          </div>
                        ))}
                        
                        {/* Jugadores */}
                        {duelState.players.map((player, index) => (
                          <div
                            key={player.id}
                            className={`${styles.duelPlayer} ${player.isEliminated ? styles.eliminated : ''}`}
                            style={{
                              left: `${Math.min((player.position / (duelState.finishLine || 10)) * 100, 100)}%`,
                              top: `${20 + (index * 60)}px`
                            }}
                          >
                            <div className={styles.playerAvatar}>
                              {player.character?.image ? (
                                <img src={player.character.image} alt={player.character.name} />
                              ) : (
                                <div className={styles.defaultAvatar}>👤</div>
                              )}
                            </div>
                            <div className={styles.playerInfo}>
                              <span className={styles.playerName}>{player.username}</span>
                              <div className={styles.playerStats}>
                                <span className={styles.position}>Pos: {player.position}</span>
                                <span className={styles.eliminatoryStatus}>
                                  {player.isEliminated ? '💀 ELIMINADO' : '✅ ACTIVO'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {duelState.gameEnded && duelState.winner && (
                        <div className={styles.duelWinner}>
                          <h3>🏆 ¡{duelState.winner.username} Ganó el Duelo!</h3>
                          <p>Tipo de victoria: {duelState.winner.winType === 'race' ? 'Llegó a la meta' : 'Oponente eliminado'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showRanking && selectedGameMode !== 'duel' && (
                  <div className={styles.liveRanking}>
                    <h4>🏆 Ranking</h4>
                    <div className={styles.rankingList}>
                      {playerRankings && playerRankings.length > 0 ? (
                        playerRankings
                          .sort((a, b) => b.score - a.score)
                          .map((player, index) => {
                            const maxScore = playerRankings[0]?.score || 1;
                            const progressWidth = maxScore > 0 ? (player.score / maxScore) * 100 : 0;

                            return (
                              <div key={player.id} className={styles.rankingItem}>
                                <span className={styles.rankPosition}>#{index + 1}</span>
                                <span className={styles.rankPlayerName}>
                                  {player.username}
                                </span>
                                <span className={styles.rankScore}>
                                  {player.score} pts
                                </span>
                                <div className={styles.rankProgress}>
                                  <div
                                    className={styles.progressBar}
                                    style={{
                                      width: `${progressWidth}%`
                                    }}
                                  />
                                </div>
                                <div className={styles.stats}>
                                  <span className={styles.statItem}>✓ {player.correctAnswers || 0}</span>
                                  <span className={styles.statItem}>✗ {player.wrongAnswers || 0}</span>
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className={styles.noRankings}>
                          <p>Esperando jugadores...</p>
                          <p className={styles.questionInfo}>
                            Pregunta actual: {currentQuestion} de {totalQuestions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'personajes':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>👾 Mis Personajes</h2>
              <p>Selecciona tu avatar favorito</p>
            </div>

            <div className={styles.charactersGrid}>
              {characters.map((character) => (
                <div key={character.id} className={styles.characterCard}>
                  <div className={styles.characterAvatar}>
                    <img
                      src={character.image}
                      alt={character.name}
                      className={styles.characterImage}
                    />
                  </div>
                  <div className={styles.characterInfo}>
                    <h4>{character.name}</h4>
                  </div>
                  <button className={styles.selectCharacter}>Seleccionar</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'mis-sets':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>📚 Mis Sets de Preguntas</h2>
              <p>Organiza y gestiona tus contenidos</p>
            </div>

            <div className={styles.setsGrid}>
              <div className={`${styles.setCard} ${styles.featured}`}>
                <div className={styles.setHeader}>
                  <span className={styles.setBadge}>Destacado</span>
                  <span className={styles.setQuestions}>{questions.length} preguntas</span>
                </div>
                <h3>Set Principal de Preguntas</h3>
                <p>Conjunto completo de preguntas sobre sustancias peligrosas y pictogramas de seguridad</p>
                <div className={styles.setStats}>
                  <span><Star size={14} style={{ marginRight: '4px' }} />0.0</span>
                  <span><Users size={14} style={{ marginRight: '4px' }} />0 jugadores</span>
                  <span><Gamepad2 size={14} style={{ marginRight: '4px' }} />0 partidas</span>
                </div>
                <button className={styles.setAction}>Editar Set</button>
              </div>

              <div className={styles.setCard}>
                <div className={styles.setHeader}>
                  <span className={styles.setQuestions}>0 preguntas</span>
                </div>
                <h3>Set Personalizado</h3>
                <p>Crea tu propio conjunto de preguntas personalizadas</p>
                <div className={styles.setStats}>
                  <span><Star size={14} style={{ marginRight: '4px' }} />0.0</span>
                  <span><Users size={14} style={{ marginRight: '4px' }} />0 jugadores</span>
                  <span><Gamepad2 size={14} style={{ marginRight: '4px' }} />0 partidas</span>
                </div>
                <button className={styles.setAction}>Crear Set</button>
              </div>

              <div className={`${styles.setCard} ${styles.newSet}`}>
                <div className={styles.newSetContent}>
                  <div className={styles.plusIcon}>+</div>
                  <h3>Crear Nuevo Set</h3>
                  <p>Organiza preguntas por tema</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>🚧 Próximamente</h2>
              <p>Esta sección estará disponible pronto</p>
            </div>
            <div className={styles.comingSoon}>
              <div className={styles.comingSoonIcon}>⏳</div>
              <h3>Funcionalidad en Desarrollo</h3>
              <p>Estamos trabajando en nuevas características increíbles para esta sección.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.adminPanel}>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className={styles.notificationsContainer}>
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`${styles.notification} ${styles[notification.type]}`}
            >
              <div className={styles.notificationHeader}>
                <span className={styles.notificationIcon}>⚠️</span>
                <span className={styles.notificationTitle}>{notification.title}</span>
                <button 
                  className={styles.notificationClose}
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                >
                  ×
                </button>
              </div>
              <div className={styles.notificationMessage}>{notification.message}</div>
              <div className={styles.notificationTime}>{notification.timestamp}</div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className={styles.mobileHeader}>
          <button
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>Gaming Admin</h1>
          <div className={styles.userAvatar}><Users size={16} /></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isMobile ? (sidebarOpen ? styles.open : styles.closed) : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <img
              src={logo}
              alt="Logo"
              className={styles.logoImage}
            />
          </div>
          {isMobile && (
            <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>×</button>
          )}
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeSection === item.id ? styles.active : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              style={activeSection === item.id ? { '--accent-color': item.color } : {}}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {activeSection === item.id && <div className={styles.navIndicator}></div>}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatarLarge}><Users size={18} /></div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>Admin</div>
              <div className={styles.userStatus}>En línea</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}