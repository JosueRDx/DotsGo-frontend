import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, Medal, Award, Crown, Users, Target, Zap, Star, Home, RotateCcw, XCircle, Timer } from "lucide-react";
import styles from "./GameResults.module.css";
import logo from "../../assets/images/logo.png";

export default function GameResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || { results: [] };
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const allResults = results || [];

  const filteredResults = allResults.filter(player => (player?.score || 0) > 0);

  const sortedResults = [...filteredResults].sort((a, b) => {
    const scoreDifference = (b.score || 0) - (a.score || 0);
    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    const aTime = Number.isFinite(a?.totalResponseTime) ? a.totalResponseTime : Number.POSITIVE_INFINITY;
    const bTime = Number.isFinite(b?.totalResponseTime) ? b.totalResponseTime : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });

  const topPlayer = sortedResults[0];

  const calculateAccuracy = (player) => {
    const correct = player?.correctAnswers ?? 0;
    const total = player?.totalQuestions ?? 0;

    if (total === 0) {
      return 0;
    }

    return (correct / total) * 100;
  };

  const totalPlayers = allResults.length;
  const totalQuestions = allResults.reduce((max, player) => {
    const playerTotal = player?.totalQuestions ?? 0;
    return playerTotal > max ? playerTotal : max;
  }, 0);

  const maxScore = allResults.reduce((max, player) => {
    const playerScore = player?.score ?? 0;
    return playerScore > max ? playerScore : max;
  }, 0);

  const averageAccuracy = totalPlayers > 0
    ? Math.round(
        allResults.reduce((sum, player) => sum + calculateAccuracy(player), 0) / totalPlayers
      )
    : 0;

  useEffect(() => {
    // Secuencia de animaciones
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
    const timer3 = setTimeout(() => {
      setAnimationPhase(3);
      setShowConfetti(true);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const getTrophyIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy size={32} className={styles.goldTrophy} />;
      case 2: return <Medal size={32} className={styles.silverMedal} />;
      case 3: return <Award size={32} className={styles.bronzeAward} />;
      default: return <Star size={24} className={styles.regularStar} />;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return styles.firstPlace;
      case 2: return styles.secondPlace;
      case 3: return styles.thirdPlace;
      default: return styles.regularPlace;
    }
  };

  const getPerformanceMessage = (player, rank) => {
    const accuracy = calculateAccuracy(player);
    
    if (rank === 1) return "¡Campeón Absoluto!";
    if (rank === 2) return "¡Excelente Trabajo!";
    if (rank === 3) return "¡Muy Bien Hecho!";
    if (accuracy >= 80) return "¡Gran Actuación!";
    if (accuracy >= 60) return "¡Buen Intento!";
    return "¡Sigue Practicando!";
  };

  const goHome = () => {
    navigate("/");
  };

  const playAgain = () => {
    navigate("/");
  };

  return (
    <div className={styles.resultsWrapper}>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className={styles.confetti}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`${styles.confettiPiece} ${styles[`confetti${(i % 6) + 1}`]}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <img src={logo} alt="DOT'S GO Logo" className={styles.logo} />
          <div className={styles.gameTitle}>
            <h1>¡Juego Completado!</h1>
            <p>Resultados Finales</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Winner Spotlight */}
        {topPlayer && animationPhase >= 1 && (
          <div className={`${styles.winnerSpotlight} ${styles.animated}`}>
            <div className={styles.winnerCard}>
              <div className={styles.winnerCrown}>
                <Crown size={48} />
              </div>
              
              {topPlayer.character && (
                <div className={styles.winnerAvatar}>
                  <img
                    src={topPlayer.character.image}
                    alt={topPlayer.character.name}
                    className={styles.winnerImage}
                  />
                </div>
              )}

              <div className={styles.winnerInfo}>
                <h2 className={styles.winnerTitle}>🏆 ¡Campeón!</h2>
                <h3 className={styles.winnerName}>{topPlayer.username}</h3>
                <div className={styles.winnerScore}>
                  <span className={styles.scoreLabel}>Puntuación Final</span>
                  <span className={styles.scoreValue}>{topPlayer.score}</span>
                </div>
                <div className={styles.winnerStats}>
                  <div className={styles.statItem}>
                    <Target size={16} />
                    <span>{topPlayer.correctAnswers}/{topPlayer.totalQuestions}</span>
                  </div>
                  <div className={styles.statItem}>
                    <XCircle size={16} />
                    <span>Incorrectas: {topPlayer.totalQuestions - topPlayer.correctAnswers}</span>
                  </div>
                  <div className={styles.statItem}>
                    <Zap size={16} />
                    <span>{Math.round((topPlayer.correctAnswers / topPlayer.totalQuestions) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {animationPhase >= 2 && (
          <div className={`${styles.resultsSection} ${styles.animated}`}>
            <h3 className={styles.sectionTitle}>📊 Clasificación Final</h3>
            
            <div className={styles.resultsGrid}>
              {sortedResults.length === 0 && (
                <div className={styles.noResults}>No hay jugadores con puntaje registrado.</div>
              )}
              {sortedResults.map((player, index) => (
                <div
                  key={index}
                  className={`${styles.resultCard} ${getRankClass(index + 1)} ${styles.animated}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className={styles.rankSection}>
                    <div className={styles.rankNumber}>{index + 1}</div>
                    <div className={styles.rankIcon}>
                      {getTrophyIcon(index + 1)}
                    </div>
                  </div>

                  <div className={styles.playerSection}>
                    {player.character && (
                      <div className={styles.playerAvatar}>
                        <img 
                          src={player.character.image} 
                          alt={player.character.name}
                          className={styles.avatarImage}
                        />
                      </div>
                    )}
                    
                    <div className={styles.playerInfo}>
                      <h4 className={styles.playerName}>{player.username}</h4>
                      <p className={styles.characterName}>
                        {player.character?.name || 'Sin personaje'}
                      </p>
                      <p className={styles.performanceMessage}>
                        {getPerformanceMessage(player, index + 1)}
                      </p>
                    </div>
                  </div>

                  <div className={styles.statsSection}>
                    <div className={styles.scoreDisplay}>
                      <span className={styles.scoreLabel}>Puntos</span>
                      <span className={styles.scoreValue}>{player.score}</span>
                    </div>
                    
                    <div className={styles.accuracyStats}>
                      <div className={styles.statRow}>
                        <Target size={14} />
                        <span>Correctas: {player.correctAnswers}</span>
                      </div>
                      <div className={styles.statRow}>
                        <XCircle size={14} />
                        <span>Incorrectas: {player.totalQuestions - player.correctAnswers}</span>
                      </div>
                      <div className={styles.statRow}>
                        <Users size={14} />
                        <span>Total: {player.totalQuestions}</span>
                      </div>
                      <div className={styles.statRow}>
                        <Zap size={14} />
                        <span>Precisión: {Math.round(calculateAccuracy(player))}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Details */}
        {animationPhase >= 2 && allResults.length > 0 && (
          <div className={`${styles.playerDetailsSection} ${styles.animated}`}>
            <h3 className={styles.sectionTitle}>🧑‍🤝‍🧑 Detalle de los Jugadores</h3>

            <div className={styles.playerDetailsGrid}>
              {allResults.map((player, index) => {
                const accuracy = Math.round(calculateAccuracy(player));
                const incorrectAnswers = (player?.totalQuestions ?? 0) - (player?.correctAnswers ?? 0);
                const totalTime = player?.totalResponseTime ?? null;

                return (
                  <div key={index} className={styles.playerDetailCard}>
                    <div className={styles.playerDetailHeader}>
                      {player?.character && (
                        <div className={styles.playerDetailAvatar}>
                          <img
                            src={player.character.image}
                            alt={player.character.name}
                            className={styles.playerDetailImage}
                          />
                        </div>
                      )}

                      <div className={styles.playerDetailInfo}>
                        <h4 className={styles.playerDetailName}>{player?.username || `Jugador ${index + 1}`}</h4>
                        <span className={styles.playerDetailCharacter}>
                          {player?.character?.name || "Sin personaje"}
                        </span>
                      </div>

                      <div className={styles.playerDetailScore}>
                        <span className={styles.playerDetailScoreLabel}>Puntos</span>
                        <span className={styles.playerDetailScoreValue}>{player?.score ?? 0}</span>
                      </div>
                    </div>

                    <div className={styles.playerDetailStats}>
                      <div className={styles.playerDetailStat}>
                        <Target size={16} />
                        <span>Correctas: {player?.correctAnswers ?? 0}</span>
                      </div>
                      <div className={styles.playerDetailStat}>
                        <XCircle size={16} />
                        <span>Incorrectas: {incorrectAnswers}</span>
                      </div>
                      <div className={styles.playerDetailStat}>
                        <Users size={16} />
                        <span>Total: {player?.totalQuestions ?? 0}</span>
                      </div>
                      <div className={styles.playerDetailStat}>
                        <Zap size={16} />
                        <span>Precisión: {accuracy}%</span>
                      </div>
                      {totalTime !== null && (
                        <div className={styles.playerDetailStat}>
                          <Timer size={16} />
                          <span>Tiempo: {Math.round(totalTime)}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Summary */}
        {animationPhase >= 3 && (
          <div className={`${styles.summarySection} ${styles.animated}`}>
            <h3 className={styles.sectionTitle}>📈 Resumen de la Partida</h3>
            
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <Users size={32} />
                <div className={styles.summaryInfo}>
                  <span className={styles.summaryLabel}>Jugadores</span>
                  <span className={styles.summaryValue}>{totalPlayers}</span>
                </div>
              </div>
              
              <div className={styles.summaryCard}>
                <Target size={32} />
                <div className={styles.summaryInfo}>
                  <span className={styles.summaryLabel}>Preguntas</span>
                  <span className={styles.summaryValue}>{totalQuestions}</span>
                </div>
              </div>
              
              <div className={styles.summaryCard}>
                <Trophy size={32} />
                <div className={styles.summaryInfo}>
                  <span className={styles.summaryLabel}>Puntuación Máxima</span>
                  <span className={styles.summaryValue}>{maxScore}</span>
                </div>
              </div>
              
              <div className={styles.summaryCard}>
                <Zap size={32} />
                <div className={styles.summaryInfo}>
                  <span className={styles.summaryLabel}>Precisión Promedio</span>
                  <span className={styles.summaryValue}>
                    {averageAccuracy}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {animationPhase >= 3 && (
          <div className={`${styles.actionsSection} ${styles.animated}`}>
            <button className={styles.homeButton} onClick={goHome}>
              <Home size={20} />
              Ir al Inicio
            </button>
            <button className={styles.playAgainButton} onClick={playAgain}>
              <RotateCcw size={20} />
              Jugar de Nuevo
            </button>
          </div>
        )}
      </main>

      {/* Floating particles */}
      <div className={styles.particles}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`${styles.particle} ${styles[`particle${i + 1}`]}`}></div>
        ))}
      </div>
    </div>
  );
}