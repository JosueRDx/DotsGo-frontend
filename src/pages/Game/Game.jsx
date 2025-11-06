import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { CheckCircle, Clock, Zap, Send, AlertCircle, Target, Trophy } from "lucide-react";

import { socket } from "../../services/websocket/socketService";
import { useUserPersistence } from "../../hooks/useUserPersistence";
import styles from "./Game.module.css";

import {
  availableColors,
  availableSymbols,
  availableNumbers,
} from "../../components/game/Designer/pictogramData";

import LivePreviewRombo from "../../components/game/LivePreview/LivePreviewRombo";
import ColorPicker from "../../components/game/ColorPicker/ColorPicker";
import LogoPicker from "../../components/game/LogoPicker/LogoPicker";
import NumberPicker from "../../components/game/NumberPicker/NumberPicker";
import CorrectAnswersDisplay from "../../components/game/CorrectAnswersDisplay/CorrectAnswersDisplay";
import Header from "../../layouts/header/Header";

export default function Game() {
  const navigate = useNavigate();
  const { restoreUserProgress } = useUserPersistence();
  
  const isTouchDevice = typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const questionRef = useRef(null);
  const joiningInProgressRef = useRef(false);
  
  // Estado para saber si el juego ha iniciado alguna vez
  const [gameHasStarted, setGameHasStarted] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [topColor, setTopColor] = useState(null);
  const [bottomColor, setBottomColor] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [symbolPosition, setSymbolPosition] = useState(null);
  const [number, setNumber] = useState(null);
  const [numberPosition, setNumberPosition] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);


  // Estados para feedback visual
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
    const hasSubmittedRef = useRef(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // NUEVO: Estados para mostrar respuestas correctas
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [correctAnswersData, setCorrectAnswersData] = useState(null);

  // NUEVO: Estados para modo aventura
  const [gameMode, setGameMode] = useState('classic');
  const [playerLives, setPlayerLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [lostLifeIndex, setLostLifeIndex] = useState(-1); // Para animación de pérdida de vida
  
  // NUEVO: Estados para modo duelo
  const [playerPosition, setPlayerPosition] = useState(0);

  // Mantener referencia actualizada de si ya se envió la respuesta
  useEffect(() => {
    hasSubmittedRef.current = hasSubmitted;
  }, [hasSubmitted]);

  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  // Filtrar colores disponibles - incluir solid y pattern
  const availableColorOptions = availableColors.filter(
    (color) => color.type === 'solid' || color.type === 'pattern'
  );

  // También tener disponibles solo los sólidos para casos específicos
  const solidColors = availableColors.filter((color) => color.type === 'solid');

  const handleTopColorDrop = (color) => {
    if (hasSubmitted) return;
    
    // Permitir tanto solid como pattern
    if (color.type !== 'solid' && color.type !== 'pattern') {
      alert("Por favor, arrastra un color válido para la parte superior.");
      return;
    }

    setTopColor(color);
  };

  const handleBottomColorDrop = (color) => {
    if (hasSubmitted) return;
    
    // Permitir tanto solid como pattern
    if (color.type !== 'solid' && color.type !== 'pattern') {
      alert("Por favor, arrastra un color válido para la parte inferior.");
      return;
    }

    setBottomColor(color);
  };

  const handleSymbolDrop = (symbol, position) => {
    if (hasSubmitted) return;
    
    setSymbol(symbol);
    setSymbolPosition(position);
    setCurrentStep((prev) => (prev === 2 ? 3 : prev));
  };

  const handleNumberDrop = (num, position) => {
    if (hasSubmitted) return;
    
    setNumber(num === 'Sin Número' ? null : num);
    setNumberPosition(position);
    setCurrentStep((prev) => (prev === 3 ? 4 : prev));
  };

    const handleSelectColor = (color) => {
    if (hasSubmitted) return;
    setSelectedItem({ type: 'color', option: color });
  };

  const handleSelectSymbol = (sym) => {
    if (hasSubmitted) return;
    setSelectedItem({ type: 'symbol', option: sym });
  };

  const handleSelectNumber = (num) => {
    if (hasSubmitted) return;
    setSelectedItem({ type: 'number', value: num });
  };

  const handleZoneTap = (zone) => {
    if (hasSubmitted || !selectedItem) return;
    switch (selectedItem.type) {
      case 'color':
        zone === 'top'
          ? handleTopColorDrop(selectedItem.option)
          : handleBottomColorDrop(selectedItem.option);
        break;
      case 'symbol':
        handleSymbolDrop(selectedItem.option, zone);
        break;
      case 'number':
        handleNumberDrop(selectedItem.value, zone);
        break;
      default:
        break;
    }
    setSelectedItem(null);
  };

  // Calcular progreso de completado
  useEffect(() => {
    let progress = 0;
    if (topColor) progress += 25;
    if (bottomColor) progress += 25;
    if (symbol) progress += 25;
    if (number !== null || currentStep >= 4) progress += 25;
    
    setProgressPercentage(progress);
  }, [topColor, bottomColor, symbol, number, currentStep]);

  useEffect(() => {
    if (topColor && bottomColor && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [topColor, bottomColor, currentStep]);

  // Efecto para manejar la cuenta regresiva
  useEffect(() => {
    let intervalId;

    if (timeLeft > 0 && !hasSubmitted) {
      intervalId = setInterval(() => {
        setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [timeLeft, hasSubmitted]);

  // Auto-submit cuando el contador llega a cero
  useEffect(() => {
    if (timeLeft === 0 && !hasSubmitted && !isSubmitting) {
      handleAutoSubmit();
    }
  }, [timeLeft, hasSubmitted, isSubmitting]);

  useEffect(() => {
    const pin = localStorage.getItem("gamePin");
    const username = localStorage.getItem("username");
    const storedCount = localStorage.getItem("questionsCount");
    if (storedCount) {
      setTotalQuestions(parseInt(storedCount, 10));
    }

    const joiningFlag = localStorage.getItem("joiningInProgress");
    if (joiningFlag === "true") {
      joiningInProgressRef.current = true;
      localStorage.removeItem("joiningInProgress");
    }

    // Guardar ID del socket para identificar respuestas propias
    if (socket.connected) {
      setSocketId(socket.id);
    } else {
      socket.connect();
      setSocketId(socket.id);
    }
    
    // Cargar información del personaje seleccionado
    const characterData = localStorage.getItem("selectedCharacter");
    if (characterData) {
      try {
        const character = JSON.parse(characterData);
        setSelectedCharacter(character);
        console.log("Personaje cargado desde localStorage:", character);
      } catch (error) {
        console.error("Error al cargar personaje desde localStorage:", error);
        
        // NUEVO: Intentar restaurar desde el progreso guardado
        if (username) {
          const restoredCharacter = restoreUserProgress(username);
          if (restoredCharacter) {
            setSelectedCharacter(restoredCharacter);
            console.log("Personaje restaurado desde progreso guardado:", restoredCharacter);
          }
        }
      }
    } else if (username) {
      // NUEVO: Si no hay personaje en localStorage, intentar restaurar desde progreso guardado
      const restoredCharacter = restoreUserProgress(username);
      if (restoredCharacter) {
        setSelectedCharacter(restoredCharacter);
        console.log("Personaje restaurado desde progreso guardado:", restoredCharacter);
      }
    }

    // Verificar si el usuario viene del flujo correcto
    if (!username || !pin) {
      console.log("Usuario no autenticado, redirigiendo al inicio");
      navigate("/");
      return;
    }

    console.log(`Entrando al juego - PIN: ${pin}, Usuario: ${username}`);

    // Marcar que el juego ya inició (vienen del countdown)
    setGameHasStarted(true);

    // Solicitar la pregunta actual al entrar
    console.log("Solicitando pregunta actual al servidor...");
    socket.emit("get-current-question", { pin }, (response) => {
      console.log("Respuesta get-current-question:", response);

      if (response && response.success) {
        if (response.question) {
          console.log("✅ Pregunta activa recibida:", response.question.title);
          setQuestion(response.question);
          setTimeLeft(response.timeLeft || 0);
          setQuestionTimeLimit(response.timeLeft || 0);
          setQuestionIndex(response.currentIndex || 1);
          setTotalQuestions(response.totalQuestions || totalQuestions);
          
          // NUEVO: Detectar modo de juego desde la respuesta
          if (response.gameMode) {
            setGameMode(response.gameMode);
            console.log("🎮 Modo de juego detectado:", response.gameMode);
          }
          if (response.modeConfig && response.modeConfig.maxLives) {
            setMaxLives(response.modeConfig.maxLives);
          }
        } else {
          console.log("⚠ No hay pregunta activa en este momento");
          // Mantener gameHasStarted en true pero sin pregunta
        }
      } else {
        console.error("❌ Error obteniendo pregunta:", response?.error);
        // Podrían estar entre preguntas
      }
    });

    // También usar el método de respaldo para compatibilidad
    socket.emit("request-current-question", { pin }, (response) => {
      if (response.success && response.question && !question) {
        setQuestion(response.question);
        setTimeLeft(response.timeLeft);
        setQuestionTimeLimit(response.timeLeft);
        setQuestionIndex(response.currentIndex || 1);
        setTotalQuestions(response.totalQuestions || totalQuestions);
        setGameHasStarted(true);
        console.log("Pregunta cargada (método respaldo):", response.question);
      } else if (response.error && response.error.includes("No hay juego activo")) {
        navigate("/waiting-room");
      }
    });

    // Escuchar nueva pregunta (para cuando cambie)
    socket.on("game-started", ({ question, timeLimit, currentIndex, totalQuestions: totalQ }) => {
      console.log("🎯 Nueva pregunta recibida via game-started:", question.title);
      
      // Cerrar respuestas correctas si están abiertas
      if (showCorrectAnswers) {
        setShowCorrectAnswers(false);
        setCorrectAnswersData(null);
      }
      
      if (joiningInProgressRef.current) {
        joiningInProgressRef.current = false;
      } else if (questionRef.current && !hasSubmittedRef.current) {
        handleAutoSubmit();
      }
      
      resetGameState();
      setQuestion(question);
      setTimeLeft(timeLimit);
      setQuestionTimeLimit(timeLimit);
      setQuestionIndex(currentIndex || 1);
      setTotalQuestions(totalQ || totalQuestions);
      setGameHasStarted(true);
    });

    // Escuchar siguiente pregunta
    socket.on("next-question", ({ question, timeLimit, currentIndex, totalQuestions: totalQ }) => {
      console.log("🎯 Siguiente pregunta recibida:", question.title);
      
      // Cerrar respuestas correctas si están abiertas
      if (showCorrectAnswers) {
        setShowCorrectAnswers(false);
        setCorrectAnswersData(null);
      }
      
      if (joiningInProgressRef.current) {
        joiningInProgressRef.current = false;
      } else if (questionRef.current && !hasSubmittedRef.current) {
        handleAutoSubmit();
      }
      
      resetGameState();
      setQuestion(question);
      setTimeLeft(timeLimit);
      setQuestionTimeLimit(timeLimit);
      setQuestionIndex(currentIndex || questionIndex + 1);
      setTotalQuestions(totalQ || totalQuestions);
      setGameHasStarted(true);
    });

    socket.on("game-ended", ({ results, hasWinner, gameMode: endGameMode, winner, endReason }) => {
      console.log("🏁 Juego terminado, redirigiendo a resultados");
      console.log("¿Hay ganador?:", hasWinner);
      console.log("Modo de juego:", endGameMode);
      console.log("Ganador:", winner);
      console.log("Razón de fin:", endReason);
      
      localStorage.removeItem("selectedCharacter");
      localStorage.removeItem("username");
      localStorage.removeItem("questionsCount");
      
      navigate("/game-results", { 
        state: { 
          results, 
          hasWinner,
          gameMode: endGameMode || gameMode,
          winner,
          endReason
        } 
      });
    });

    socket.on("game-cancelled", () => {
      alert("El juego ha sido cancelado por el administrador");
      localStorage.removeItem("selectedCharacter");
      localStorage.removeItem("username");
      localStorage.removeItem("questionsCount");
      navigate("/");
    });

    // Escuchar confirmación de respuesta propia
    socket.on("player-answered", ({ playerId, isCorrect }) => {
      if (playerId === socketId) {
        setIsSubmitting(false);
        
        if (isCorrect) {
          setSubmissionStatus('success');
          setShowSuccessAnimation(true);
          setTimeout(() => setShowSuccessAnimation(false), 2000);
        } else {
          // En modos con vidas, esperar el evento player-life-lost para mostrar el estado correcto
          if (gameMode === 'adventure' || gameMode === 'duel') {
            setSubmissionStatus('waiting-life-check');
            // Timeout de respaldo por si no llega el evento de vida
            setTimeout(() => {
              if (submissionStatus === 'waiting-life-check') {
                setSubmissionStatus('error');
                setTimeout(() => setSubmissionStatus(null), 3000);
              }
            }, 1000);
          } else {
            // Modo clásico: mostrar error normal
            setSubmissionStatus('error');
            setTimeout(() => setSubmissionStatus(null), 3000);
          }
        }
      }
    });

    // NUEVO: Escuchar actualizaciones de ranking (incluye info de vidas)
    socket.on("ranking-updated", ({ players, gameMode: mode, modeConfig }) => {
      if (mode) {
        setGameMode(mode);
      }
      if (modeConfig && modeConfig.maxLives) {
        setMaxLives(modeConfig.maxLives);
      }
      
      // Encontrar las vidas y posición del jugador actual (solo para modos que las usen)
      const currentPlayer = players.find(p => p.id === socketId);
      if (currentPlayer && (mode === 'adventure' || mode === 'duel')) {
        // Actualizar vidas (solo en modos que las usen)
        if (typeof currentPlayer.lives === 'number') {
          const previousLives = playerLives;
          
          // Solo actualizar si realmente cambió
          if (previousLives !== currentPlayer.lives) {
            setPlayerLives(currentPlayer.lives);
            console.log(`🔄 Vidas actualizadas via ranking: ${previousLives} → ${currentPlayer.lives}`);
          }
        }
        
        // Actualizar posición (para modo duelo)
        if (typeof currentPlayer.position === 'number') {
          setPlayerPosition(currentPlayer.position);
        }
      }
    });

    // NUEVO: Escuchar pérdida de vida
    socket.on("player-life-lost", ({ playerId, livesRemaining, mode }) => {
      if (playerId === socketId) {
        const previousLives = playerLives;
        
        // Marcar qué vida se perdió para la animación (la última vida activa)
        setLostLifeIndex(previousLives - 1); // La vida que se perdió es la última que estaba activa
        
        setPlayerLives(livesRemaining);
        console.log(`💔 Perdiste una vida. Vidas restantes: ${livesRemaining} (modo: ${mode})`);
        
        // Mostrar notificación visual de pérdida de vida
        setSubmissionStatus('life-lost');
        
        // Limpiar el estado después de mostrar la notificación
        setTimeout(() => {
          if (livesRemaining > 0) {
            setSubmissionStatus(null);
          }
          // Limpiar la animación de pérdida de vida
          setLostLifeIndex(-1);
        }, 3000); // 3 segundos para mostrar la notificación
        
        // Log adicional para debugging
        console.log(`🔄 Vidas actualizadas: ${previousLives} → ${livesRemaining}, vida perdida en índice: ${previousLives - 1}`);
      }
    });

    // NUEVO: Escuchar evento para mostrar respuestas correctas
    socket.on("show-correct-answers", (data) => {
      console.log("📋 Frontend recibió evento show-correct-answers:", data);
      console.log("📋 Datos de respuestas correctas:", JSON.stringify(data, null, 2));
      
      setCorrectAnswersData(data);
      setShowCorrectAnswers(true);
      
      // NO ocultar la pregunta ni el tiempo, mantener la interfaz estable
      // setQuestion(null); // COMENTADO: Esto causaba problemas
      // setTimeLeft(null); // COMENTADO: Esto causaba problemas
      
      // Limpiar estados de envío
      setIsSubmitting(false);
      setSubmissionStatus(null);
      setShowSuccessAnimation(false);
      
      console.log("📋 Estado actualizado - showCorrectAnswers:", true);
    });

    // NUEVO: Escuchar actualizaciones de posición en duelo
    socket.on("duel-position-update", ({ playerId, username, position, action, reason, points }) => {
      if (playerId === socketId) {
        console.log(`⚔️ Actualización de duelo: ${action} - Posición: ${position}`);
        
        if (action === 'eliminated') {
          console.log(`💀 Fuiste eliminado del duelo: ${reason}`);
          setSubmissionStatus('eliminated');
          
          // Mostrar mensaje de eliminación por más tiempo
          setTimeout(() => {
            setSubmissionStatus(null);
          }, 5000);
        } else if (action === 'advance') {
          console.log(`🚀 Avanzaste ${points} posiciones en el duelo`);
          setPlayerPosition(position);
          
          // Mostrar feedback positivo
          setSubmissionStatus('duel-advance');
          setTimeout(() => {
            setSubmissionStatus(null);
          }, 2000);
        }
      }
    });

    // NUEVO: Escuchar Game Over individual (modo aventura)
    socket.on("player-game-over", ({ reason, message, gameMode, finalStats }) => {
      console.log("💀 Game Over recibido:", { reason, message, gameMode, finalStats });
      
      // Limpiar datos locales
      localStorage.removeItem("selectedCharacter");
      localStorage.removeItem("username");
      localStorage.removeItem("questionsCount");
      
      // Navegar a resultados con datos del jugador eliminado
      navigate("/game-results", { 
        state: { 
          results: [finalStats], 
          hasWinner: false,
          gameMode: gameMode,
          isGameOver: true,
          gameOverReason: reason,
          gameOverMessage: message
        } 
      });
    });

    return () => {
      socket.off("game-started");
      socket.off("next-question");
      socket.off("game-ended");
      socket.off("game-cancelled");
      socket.off("player-answered");
      socket.off("show-correct-answers");
      socket.off("player-game-over");
      socket.off("ranking-updated");
      socket.off("player-life-lost");
      socket.off("duel-position-update");
    };
  }, [navigate]);

  // Función para resetear el estado del juego
  const resetGameState = () => {
    setTopColor(null);
    setBottomColor(null);
    setSymbol(null);
    setSymbolPosition(null);
    setNumber(null);
    setNumberPosition(null);
    setCurrentStep(1);
    setIsSubmitting(false);
    setHasSubmitted(false);
    setSubmissionStatus(null);
    setShowSuccessAnimation(false);
    setProgressPercentage(0);
    setLostLifeIndex(-1); // Resetear animación de pérdida de vida
  };

  // Limpiar selección actual sin afectar el estado de envío
  const clearSelections = () => {
    if (hasSubmitted) return;
    
    if (!question) {
      return;
    }

    setTopColor(null);
    setBottomColor(null);
    setSymbol(null);
    setSymbolPosition(null);
    setNumber(null);
    setNumberPosition(null);
    setCurrentStep(1);
  };

  // Auto-submit cuando se agota el tiempo
  const handleAutoSubmit = () => {
    if (hasSubmitted) return;
    
    
    if (!question) {
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true);
    setSubmissionStatus('waiting');

    // Construir la respuesta en el formato correcto
    const answer = {
      pictogram: symbol?.id || null,
      colors: [
        topColor?.name?.toLowerCase() || null,
        bottomColor?.name?.toLowerCase() || null
      ].filter(Boolean),
      number: number || null
    };

    const pin = localStorage.getItem("gamePin");
    const username = localStorage.getItem("username");
    const parsedLimit = Number(questionTimeLimit);
    const parsedTimeLeft = Number(timeLeft);
    const autoResponseTime = Number.isFinite(parsedLimit)
      ? parsedLimit
      : (Number.isFinite(parsedTimeLeft) ? parsedTimeLeft : 0);

    console.log("Respuesta auto-enviada (tiempo agotado):", answer);

    socket.emit("submit-answer", {
      pin: pin,
      answer: answer,
      responseTime: autoResponseTime,
      questionId: question?._id,
      isAutoSubmit: true
    }, (response) => {
      if (response.success) {
        console.log("Respuesta (auto) recibida por el servidor:", response);
      } else {
        console.error("Error desde el servidor (auto):", response.error);
      }
    });
  };

  // Función para enviar respuesta manual
  const submitAnswer = () => {
    if (hasSubmitted || isSubmitting) return;
    
    setIsSubmitting(true);
    setHasSubmitted(true);
    setSubmissionStatus('waiting');

    // Construir la respuesta con los datos correctos
    const answer = {
      pictogram: symbol?.id || null,  // Usar symbol.id, no symbol.name
      colors: [
        topColor?.name?.toLowerCase() || null,
        bottomColor?.name?.toLowerCase() || null
      ].filter(Boolean), // Filtrar valores null/undefined
      number: number || null
    };

    const pin = localStorage.getItem("gamePin");
    const username = localStorage.getItem("username");
    const responseTime = questionTimeLimit !== null ? questionTimeLimit - timeLeft : 0; // Tiempo que tardó en responder

    console.log("Enviando respuesta:", JSON.stringify(answer, null, 2));
    console.log("PIN:", pin, "Username:", username, "ResponseTime:", responseTime);

    socket.emit("submit-answer", {
      pin: pin,
      answer: answer,
      responseTime: responseTime,
      questionId: question?._id,
      isAutoSubmit: false
    }, (response) => {
      if (response.success) {
        console.log("Respuesta recibida por el servidor:", response);
      } else {
        console.error("Error desde el servidor:", response.error);
      }
  });
  };

  // Verificar si puede enviar respuesta
  const canSubmit = () => {
    return topColor && bottomColor && symbol && !hasSubmitted && !isSubmitting;
  };

  // NUEVO: Función para manejar el cierre de respuestas correctas
  const handleCloseCorrectAnswers = () => {
    console.log("🔄 Cerrando respuestas correctas y reseteando estado");
    setShowCorrectAnswers(false);
    setCorrectAnswersData(null);
    
    // NO resetear el estado del juego aquí, ya que la siguiente pregunta llegará automáticamente
    // resetGameState(); // COMENTADO: Esto causaba problemas de estado
  };

  // Debug info - solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('Game State Debug:', {
      question: question ? question.title : 'No question',
      timeLeft,
      gameHasStarted,
      hasSubmitted,
      isSubmitting,
      currentStep,
      progressPercentage,
      questionIndex,
      totalQuestions
    });
  }

  return (
    <DndProvider
      backend={isTouchDevice ? TouchBackend : HTML5Backend}
      options={isTouchDevice ? { enableMouseEvents: true } : undefined}
    >      
      <Header 
        timeLeft={timeLeft} 
        showCreateButton={false}
        selectedCharacter={selectedCharacter}
      />

      <div className={`${styles.gameWrapper} ${hasSubmitted ? styles.submitted : ''}`}>
        {/* Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className={styles.successOverlay}>
            <div className={styles.successAnimation}>
              <CheckCircle size={64} />
              <h2>¡Respuesta Enviada!</h2>
              <p>Esperando siguiente pregunta...</p>
            </div>
          </div>
        )}

        <div className={styles.gameContainer}>
          {/* Enhanced Question Header */}
          <div className={styles.questionHeader}>
            <div className={styles.questionInfo}>
              <h2 className={styles.questionTitle}>
                {question ? 
                  question.title : 
                  gameHasStarted ? 
                    "Preparando siguiente pregunta..." : 
                    "Esperando inicio del juego..."
                }
              </h2>
              
              {question && (
                <div className={styles.questionMeta}>
                  <div className={styles.timeIndicator}>
                    <Clock size={16} />
                    <span className={timeLeft <= 10 ? styles.timeUrgent : ''}>
                      {timeLeft}s restantes
                    </span>
                  </div>
                  
                  <div className={styles.progressIndicator}>
                    <Target size={16} />
                    <span>Progreso: {progressPercentage}%</span>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className={styles.questionCount}>
                    Pregunta {questionIndex} de {totalQuestions}
                  </div>

                  {/* NUEVO: Indicador de vidas para modo aventura */}
                  {gameMode === 'adventure' && (
                    <div className={styles.livesIndicator}>
                      <span className={styles.livesLabel}>Vidas:</span>
                      <div className={styles.livesContainer}>
                        {Array.from({ length: maxLives }, (_, i) => (
                          <div
                            key={i}
                            className={`${styles.lifeHeart} ${
                              i < playerLives ? styles.lifeActive : styles.lifeInactive
                            } ${
                              i === lostLifeIndex ? styles.lifeLost : ''
                            }`}
                          >
                            ❤️
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NUEVO: Indicador de posición para modo duelo */}
                  {gameMode === 'duel' && (
                    <div className={styles.duelIndicator}>
                      <span className={styles.duelLabel}>Posición:</span>
                      <div className={styles.duelPosition}>
                        <span className={styles.positionValue}>{playerPosition || 0}</span>
                        <span className={styles.positionMax}>/ 10</span>
                      </div>
                      <div className={styles.duelWarning}>
                        <span className={styles.warningIcon}>⚠️</span>
                        <span className={styles.warningText}>¡Eliminatorio!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Character Indicator */}
            {selectedCharacter && (
              <div className={styles.characterBadge}>
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
          </div>

          <main className={styles.gameLayout}>
            {/* Preview Section */}
            <section className={styles.previewSection}>
              <div className={styles.previewCard}>
                <h3 className={styles.sectionTitle}>
                  <Zap size={20} />
                  Tu Pictograma
                </h3>
                
                <LivePreviewRombo
                  topColorOption={topColor}
                  bottomColorOption={bottomColor}
                  symbolOption={symbol}
                  symbolPosition={symbolPosition}
                  number={number}
                  numberPosition={numberPosition}
                  onTopColorDrop={handleTopColorDrop}
                  onBottomColorDrop={handleBottomColorDrop}
                  onSymbolDrop={handleSymbolDrop}
                  onNumberDrop={handleNumberDrop}
                  isTouchDevice={isTouchDevice}
                  onZoneTap={handleZoneTap}
                  selectedItem={selectedItem}
                />
              </div>
            </section>

            {/* Controls Section */}
            <section className={styles.controlsSection}>
              {currentStep === 1 && question && (
                <div className={styles.controlCard}>
                  <ColorPicker
                    colors={availableColorOptions}
                    title={
                      isTouchDevice
                        ? "Paso 1: Selecciona un Color y toca la zona (Superior / Inferior)"
                        : "Paso 1: Arrastra Colores (Superior / Inferior)"
                    }
                    disabled={hasSubmitted}
                    isTouchDevice={isTouchDevice}
                    onSelectColor={handleSelectColor}
                  />
                </div>
              )}

              {currentStep === 2 && question && (
                <div className={styles.controlCard}>
                  <LogoPicker
                    symbols={availableSymbols}
                    title={
                      isTouchDevice
                        ? "Paso 2: Selecciona un Símbolo y toca la zona (Arriba / Abajo)"
                        : "Paso 2: Arrastra un Símbolo (Arriba / Abajo)"
                    }
                    disabled={hasSubmitted}
                    isTouchDevice={isTouchDevice}
                    onSelectSymbol={handleSelectSymbol}
                  />
                </div>
              )}

              {currentStep === 3 && question && (
                <div className={styles.controlCard}>
                  <NumberPicker
                    numbers={availableNumbers}
                    title={
                      isTouchDevice
                        ? "Paso 3: Selecciona un Número y toca la zona (Superior / Inferior)"
                        : "Paso 3: Arrastra un Número (Superior / Inferior)"
                    }
                    disabled={hasSubmitted}
                    isTouchDevice={isTouchDevice}
                    onSelectNumber={handleSelectNumber}
                  />
                </div>
              )}

              {currentStep === 4 && !hasSubmitted && question && (
                <div className={styles.controlCard}>
                  <div className={styles.summarySection}>
                    <h3>
                      <Trophy size={20} />
                      ¡Pictograma Listo!
                    </h3>
                    <div className={styles.summaryGrid}>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Color Superior:</span>
                        <span className={styles.summaryValue}>{topColor?.name || 'No seleccionado'}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Color Inferior:</span>
                        <span className={styles.summaryValue}>{bottomColor?.name || 'No seleccionado'}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Símbolo:</span>
                        <span className={styles.summaryValue}>
                          {symbol?.name || 'No seleccionado'} ({symbolPosition || 'N/A'})
                        </span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Número:</span>
                        <span className={styles.summaryValue}>
                          {number || 'Ninguno'} ({numberPosition || 'N/A'})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {question && !hasSubmitted && (
                <div className={styles.submitSection}>
                  <button
                    className={`${styles.submitButton} ${
                      canSubmit() ? styles.canSubmit : styles.cannotSubmit
                    } ${isSubmitting ? styles.waiting : ''}`}
                    onClick={submitAnswer}
                    disabled={!canSubmit()}
                  >
                    {isSubmitting ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <>
                        <Send size={20} />
                        <span>Enviar Respuesta</span>
                      </>
                    )}
                  </button>
                  <button
                    className={styles.clearButton}
                    onClick={clearSelections}
                    type="button"
                  >
                    Limpiar Selección
                  </button>
                </div>
              )}

              {submissionStatus === 'waiting' && (
                <div className={styles.statusMessage}>
                  <Clock size={25} />
                  <span>Esperando a los demás jugadores...</span>
                </div>
              )}

              {submissionStatus === 'waiting-life-check' && (
                <div className={styles.waitingLifeCheck}>
                  <AlertCircle size={25} />
                  <span>Verificando respuesta...</span>
                </div>
              )}

              {submissionStatus === 'error' && (
                <div className={styles.statusMessage} style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}>
                  <AlertCircle size={25} />
                  <span>Respuesta incorrecta</span>
                </div>
              )}

              {submissionStatus === 'life-lost' && (
                <div className={styles.lifeLostMessage}>
                  <div className={styles.lifeLostIcon}>💔</div>
                  <div className={styles.lifeLostText}>
                    <h3>¡Perdiste una vida!</h3>
                    <p>Te quedan {playerLives} vida{playerLives !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}

              {submissionStatus === 'eliminated' && (
                <div className={styles.eliminatedMessage}>
                  <div className={styles.eliminatedIcon}>💀</div>
                  <div className={styles.eliminatedText}>
                    <h3>¡Fuiste eliminado!</h3>
                    <p>Respuesta incorrecta en modo duelo</p>
                  </div>
                </div>
              )}

              {submissionStatus === 'duel-advance' && (
                <div className={styles.duelAdvanceMessage}>
                  <div className={styles.duelAdvanceIcon}>🚀</div>
                  <div className={styles.duelAdvanceText}>
                    <h3>¡Avanzaste!</h3>
                    <p>Posición actual: {playerPosition}/10</p>
                  </div>
                </div>
              )}

              {/* ESTADO: Esperando que el juego inicie por primera vez */}
              {!question && !gameHasStarted && (
                <div className={styles.waitingCard}>
                  <div className={styles.waitingContent}>
                    <Clock size={48} />
                    <h3>Esperando inicio del juego</h3>
                    <p>El administrador iniciará el juego desde su panel</p>
                    <div className={styles.waitingSpinner} />
                  </div>
                </div>
              )}

              {/* ESTADO: Entre preguntas (el juego ya inició pero no hay pregunta actual) */}
              {!question && gameHasStarted && (
                <div className={styles.waitingCard}>
                  <div className={styles.waitingContent}>
                    <Zap size={48} />
                    <h3>Preparando siguiente pregunta</h3>
                    <p>La siguiente pregunta aparecerá en breve</p>
                    <div className={styles.waitingSpinner} />
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* NUEVO: Componente para mostrar respuestas correctas */}
      <CorrectAnswersDisplay
        isVisible={showCorrectAnswers}
        roundIndex={correctAnswersData?.roundIndex}
        totalQuestions={correctAnswersData?.totalQuestions}
        playerAnswers={correctAnswersData?.playerAnswers}
        displayTime={correctAnswersData?.displayTime || 5000}
        onClose={handleCloseCorrectAnswers}
      />
    </DndProvider>
  );
}