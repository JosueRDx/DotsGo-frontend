import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
// Importar imágenes de personajes
import personaje1 from "../../assets/images/personajes/1.png";
import personaje2 from "../../assets/images/personajes/2.png";
import personaje3 from "../../assets/images/personajes/3.png";
import personaje4 from "../../assets/images/personajes/4.png";
import personaje5 from "../../assets/images/personajes/5.png";
import personaje6 from "../../assets/images/personajes/6.png";

const API_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function Admin() {
  const [activeSection, setActiveSection] = useState('crear-juego');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados para crear juego (manteniendo funcionalidad original)
  const [juegoCreado, setJuegoCreado] = useState(false);
  const [tiempo, setTiempo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [tiempoJuego, setTiempoJuego] = useState("30");
  const [nombreJuego, setNombreJuego] = useState("");
  const [dificultad, setDificultad] = useState("medio");
  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [esperandoResultados, setEsperandoResultados] = useState(false);
  
  const navigate = useNavigate();

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

    socket.on("player-joined", ({players}) => {
      setPlayers(players);
    });

    socket.on("game-ended", ({ results }) => {
      console.log("Resultados finales recibidos en Admin:", results);
      setEsperandoResultados(false);
      navigate("/game-results", { state: { results } });
    });

    return () => {
      socket.off("player-joined");
      socket.off("game-ended");
      disconnectSocket();
    };
  }, [navigate]);

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
    questionIds: selectedQuestions 
  }, (response) => {
    if (response.success) {
      setCodigo(response.pin);
      setTiempo(tiempoJuego);
      setJuegoCreado(true);
      console.log(`Admin: Juego creado con PIN ${response.pin}`);
    } else {
      alert(response.error || "Error al crear el juego");
      console.error("Error al crear juego:", response.error);
    }
  });
};

  const handleIniciarJuego = () => {
    setEsperandoResultados(true);
    socket.emit("start-game", { pin: codigo }, (response) => {
      if (!response.success) {
        setEsperandoResultados(false);
        alert(response.error || "Error al iniciar el juego");
      }
    });
  };

  const resetGame = () => {
    setJuegoCreado(false);
    setCodigo("");
    setTiempo("");
    setPlayers([]);
    setSelectedQuestions([]);
    setNombreJuego("");
    setEsperandoResultados(false);
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
                    <h3><Zap size={20} style={{display: 'inline', marginRight: '8px'}} />Configuración Rápida</h3>
                    
                    <div className={styles.formGroup}>
                      <label>Nombre del Juego</label>
                      <input 
                        type="text" 
                        placeholder="Ej: Aventura Química Nivel 1"
                        value={nombreJuego}
                        onChange={(e) => setNombreJuego(e.target.value)}
                      />
                    </div>
                    
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
                      <span><Play size={16} style={{marginRight: '8px'}} />Crear Juego</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Preguntas */}
                <div className={styles.questionsContainer}>
                  <h3><BookOpen size={20} style={{display: 'inline', marginRight: '8px'}} />Seleccionar Preguntas</h3>
                  <div className={styles.questionsGrid}>
                    {questions.map((question) => (
                      <div
                        key={question._id}
                        className={`${styles.questionCard} ${
                          selectedQuestions.includes(question._id) ? styles.questionCardSelected : ""
                        }`}
                        data-type={question.title.toLowerCase()}
                        onClick={() => toggleQuestionSelection(question._id)}
                      >
                        <h4>{question.title}</h4>
                        <div className={styles.questionDetails}>
                          <span><FlaskConical size={14} style={{marginRight: '4px'}} />{question.correctAnswer.pictogram}</span>
                          <span><Palette size={14} style={{marginRight: '4px'}} />{question.correctAnswer.colors?.length || 0} colores</span>
                          <span><Hash size={14} style={{marginRight: '4px'}} />{question.correctAnswer.number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.gameMonitor}>
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
                  <span><Star size={14} style={{marginRight: '4px'}} />0.0</span>
                  <span><Users size={14} style={{marginRight: '4px'}} />0 jugadores</span>
                  <span><Gamepad2 size={14} style={{marginRight: '4px'}} />0 partidas</span>
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
                  <span><Star size={14} style={{marginRight: '4px'}} />0.0</span>
                  <span><Users size={14} style={{marginRight: '4px'}} />0 jugadores</span>
                  <span><Gamepad2 size={14} style={{marginRight: '4px'}} />0 partidas</span>
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