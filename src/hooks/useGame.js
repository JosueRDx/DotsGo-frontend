import { useState, useCallback, useEffect, useRef } from 'react';
import { socket } from '../services/websocket/socketService';

/**
 * Hook personalizado para manejar el estado y la lógica del juego
 * @returns {Object} Estado y métodos del juego
 */
export const useGame = () => {
  const [gameState, setGameState] = useState({
    pin: null,
    status: 'waiting', // waiting, playing, finished
    players: [],
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 0,
    timeLimit: null,
    gameMode: 'classic',
    isHost: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  /**
   * Crear un nuevo juego
   */
  const createGame = useCallback(async (gameData) => {
    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      socket.emit('create-game', gameData, (response) => {
        if (mountedRef.current) {
          setLoading(false);
          if (response.success) {
            setGameState(prev => ({
              ...prev,
              pin: response.pin,
              status: 'waiting',
              isHost: true
            }));
            resolve(response);
          } else {
            setError(response.error);
            reject(new Error(response.error));
          }
        }
      });
    });
  }, []);

  /**
   * Unirse a un juego existente
   */
  const joinGame = useCallback(async (pin, username, character) => {
    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      socket.emit('join-game', { pin, username, character }, (response) => {
        if (mountedRef.current) {
          setLoading(false);
          if (response.success) {
            setGameState(prev => ({
              ...prev,
              pin,
              status: response.gameStatus,
              totalQuestions: response.totalQuestions,
              isHost: false
            }));
            resolve(response);
          } else {
            setError(response.error);
            reject(new Error(response.error));
          }
        }
      });
    });
  }, []);

  /**
   * Iniciar el juego (solo host)
   */
  const startGame = useCallback(async (pin) => {
    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      socket.emit('start-game', { pin }, (response) => {
        if (mountedRef.current) {
          setLoading(false);
          if (response.success) {
            setGameState(prev => ({
              ...prev,
              status: 'playing'
            }));
            resolve(response);
          } else {
            setError(response.error);
            reject(new Error(response.error));
          }
        }
      });
    });
  }, []);

  /**
   * Enviar respuesta
   */
  const submitAnswer = useCallback(async (pin, answer, responseTime, questionId, isAutoSubmit = false) => {
    return new Promise((resolve, reject) => {
      socket.emit('submit-answer', { 
        pin, 
        answer, 
        responseTime, 
        questionId, 
        isAutoSubmit 
      }, (response) => {
        if (mountedRef.current) {
          if (response.success) {
            resolve(response);
          } else {
            setError(response.error);
            reject(new Error(response.error));
          }
        }
      });
    });
  }, []);

  /**
   * Reiniciar el estado del juego
   */
  const resetGame = useCallback(() => {
    setGameState({
      pin: null,
      status: 'waiting',
      players: [],
      currentQuestion: null,
      questionIndex: 0,
      totalQuestions: 0,
      timeLimit: null,
      gameMode: 'classic',
      isHost: false
    });
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Actualizar estado del juego
   */
  const updateGameState = useCallback((updates) => {
    setGameState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Escuchar eventos del socket
  useEffect(() => {
    mountedRef.current = true;

    const handlePlayerJoined = (data) => {
      if (mountedRef.current) {
        setGameState(prev => ({
          ...prev,
          players: data.players || []
        }));
      }
    };

    const handlePlayersUpdated = (data) => {
      if (mountedRef.current) {
        setGameState(prev => ({
          ...prev,
          players: data.players || []
        }));
      }
    };

    const handleGameStarted = (data) => {
      if (mountedRef.current) {
        setGameState(prev => ({
          ...prev,
          status: 'playing',
          currentQuestion: data.question,
          questionIndex: data.currentIndex,
          totalQuestions: data.totalQuestions,
          timeLimit: data.timeLimit
        }));
      }
    };

    const handleNextQuestion = (data) => {
      if (mountedRef.current) {
        setGameState(prev => ({
          ...prev,
          currentQuestion: data.question,
          questionIndex: data.currentIndex,
          timeLimit: data.timeLimit
        }));
      }
    };

    const handleGameEnded = (data) => {
      if (mountedRef.current) {
        setGameState(prev => ({
          ...prev,
          status: 'finished',
          players: data.finalRankings || prev.players
        }));
      }
    };

    socket.on('player-joined', handlePlayerJoined);
    socket.on('players-updated', handlePlayersUpdated);
    socket.on('game-started', handleGameStarted);
    socket.on('next-question', handleNextQuestion);
    socket.on('game-ended', handleGameEnded);

    return () => {
      mountedRef.current = false;
      socket.off('player-joined', handlePlayerJoined);
      socket.off('players-updated', handlePlayersUpdated);
      socket.off('game-started', handleGameStarted);
      socket.off('next-question', handleNextQuestion);
      socket.off('game-ended', handleGameEnded);
    };
  }, []);

  return {
    gameState,
    loading,
    error,
    createGame,
    joinGame,
    startGame,
    submitAnswer,
    resetGame,
    updateGameState
  };
};

export default useGame;
