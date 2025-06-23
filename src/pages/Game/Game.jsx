import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CheckCircle, Clock, Zap, Send, AlertCircle, Target, Trophy } from "lucide-react";

import { socket } from "../../services/websocket/socketService";
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
import Header from "../../layouts/header/Header";

export default function Game() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // Estado para saber si el juego ha iniciado alguna vez
  const [gameHasStarted, setGameHasStarted] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [topColor, setTopColor] = useState(null);
  const [bottomColor, setBottomColor] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [symbolPosition, setSymbolPosition] = useState(null);
  const [number, setNumber] = useState(null);
  const [numberPosition, setNumberPosition] = useState(null);

  // Estados para feedback visual
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

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
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            // Auto-submit si el tiempo se agota
            if (!hasSubmitted) {
              handleAutoSubmit();
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [timeLeft, hasSubmitted]);

  useEffect(() => {
    const pin = localStorage.getItem("gamePin");
    const username = localStorage.getItem("username");
    const storedCount = localStorage.getItem("questionsCount");
    if (storedCount) {
      setTotalQuestions(parseInt(storedCount, 10));
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
        console.log("Personaje cargado:", character);
      } catch (error) {
        console.error("Error al cargar personaje:", error);
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
      resetGameState();
      setQuestion(question);
      setTimeLeft(timeLimit);
      setQuestionTimeLimit(timeLimit);
      setQuestionIndex(currentIndex || questionIndex + 1);
      setTotalQuestions(totalQ || totalQuestions);
      setGameHasStarted(true);
    });

    socket.on("game-ended", ({ results }) => {
      console.log("🏁 Juego terminado, redirigiendo a resultados");
      localStorage.removeItem("selectedCharacter");
      localStorage.removeItem("username");
      localStorage.removeItem("questionsCount");
      navigate("/game-results", { state: { results } });
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
        setSubmissionStatus(isCorrect ? 'success' : 'error');
        setShowSuccessAnimation(isCorrect);
        if (isCorrect) {
          setTimeout(() => setShowSuccessAnimation(false), 2000);
        } else {
          setTimeout(() => setSubmissionStatus(null), 3000);
        }
      }
    });

    return () => {
      socket.off("game-started");
      socket.off("next-question");
      socket.off("game-ended");
      socket.off("game-cancelled");
      socket.off("player-answered");
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
  };

  // Auto-submit cuando se agota el tiempo
  const handleAutoSubmit = () => {
    if (hasSubmitted) return;
    
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
    const responseTime = questionTimeLimit !== null ? questionTimeLimit - timeLeft : 0;

    console.log("Respuesta auto-enviada (tiempo agotado):", answer);

    socket.emit("submit-answer", { 
      pin: pin,
      answer: answer,
      responseTime: responseTime
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
      responseTime: responseTime
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
    <DndProvider backend={HTML5Backend}>
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
                />
              </div>
            </section>

            {/* Controls Section */}
            <section className={styles.controlsSection}>
              {currentStep === 1 && question && (
                <div className={styles.controlCard}>
                  <ColorPicker 
                    colors={availableColorOptions} 
                    title="Paso 1: Arrastra Colores (Superior / Inferior)" 
                    disabled={hasSubmitted}
                  />
                </div>
              )}

              {currentStep === 2 && question && (
                <div className={styles.controlCard}>
                  <LogoPicker 
                    symbols={availableSymbols} 
                    title="Paso 2: Arrastra un Símbolo (Arriba / Abajo)" 
                    disabled={hasSubmitted}
                  />
                </div>
              )}

              {currentStep === 3 && question && (
                <div className={styles.controlCard}>
                  <NumberPicker 
                    numbers={availableNumbers} 
                    title="Paso 3: Arrastra un Número (Superior / Inferior)" 
                    disabled={hasSubmitted}
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
                    }`}
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
    </DndProvider>
  );
}