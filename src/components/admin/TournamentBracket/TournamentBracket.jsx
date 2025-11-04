import React, { useState, useEffect } from 'react';
import styles from './TournamentBracket.module.css';

const TournamentBracket = ({ players, onStartMatch, currentMatch, tournamentState }) => {
  const [bracket, setBracket] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);

  // Generar el bracket inicial
  useEffect(() => {
    if (players.length > 0) {
      generateBracket(players);
    }
  }, [players]);

  const generateBracket = (playerList) => {
    // Mezclar jugadores aleatoriamente
    const shuffledPlayers = [...playerList].sort(() => Math.random() - 0.5);
    
    // Si hay número impar de jugadores, agregar un "bye" (pase automático)
    const playersWithByes = [...shuffledPlayers];
    if (playersWithByes.length % 2 !== 0) {
      playersWithByes.push({ id: 'bye', username: 'BYE', isBye: true });
    }

    // Crear la primera ronda
    const firstRound = [];
    for (let i = 0; i < playersWithByes.length; i += 2) {
      firstRound.push({
        id: `match-${Math.floor(i/2)}`,
        player1: playersWithByes[i],
        player2: playersWithByes[i + 1],
        winner: null,
        status: 'pending', // pending, active, completed
        round: 0
      });
    }

    // Calcular todas las rondas necesarias
    const totalRounds = Math.ceil(Math.log2(playersWithByes.length));
    const allRounds = [firstRound];

    // Generar rondas vacías para el bracket
    for (let round = 1; round < totalRounds; round++) {
      const roundMatches = [];
      const previousRoundMatches = allRounds[round - 1].length;
      
      for (let i = 0; i < Math.ceil(previousRoundMatches / 2); i++) {
        roundMatches.push({
          id: `match-r${round}-${i}`,
          player1: null,
          player2: null,
          winner: null,
          status: 'waiting',
          round: round
        });
      }
      allRounds.push(roundMatches);
    }

    setBracket(allRounds);
    setCurrentRound(0);
  };

  const getRoundName = (roundIndex, totalRounds) => {
    const roundsFromEnd = totalRounds - roundIndex - 1;
    switch (roundsFromEnd) {
      case 0: return 'Final';
      case 1: return 'Semifinal';
      case 2: return 'Cuartos';
      case 3: return 'Octavos';
      default: return `Ronda ${roundIndex + 1}`;
    }
  };

  const getNextAvailableMatch = () => {
    for (let round = 0; round < bracket.length; round++) {
      for (let match of bracket[round]) {
        if (match.status === 'pending' && match.player1 && match.player2) {
          return { round, match };
        }
      }
    }
    return null;
  };

  const handleStartNextMatch = () => {
    const nextMatch = getNextAvailableMatch();
    if (nextMatch && onStartMatch) {
      onStartMatch(nextMatch.match, nextMatch.round);
    }
  };

  const updateMatchResult = (matchId, winner) => {
    setBracket(prevBracket => {
      const newBracket = [...prevBracket];
      
      // Encontrar y actualizar el match
      for (let roundIndex = 0; roundIndex < newBracket.length; roundIndex++) {
        const matchIndex = newBracket[roundIndex].findIndex(m => m.id === matchId);
        if (matchIndex !== -1) {
          newBracket[roundIndex][matchIndex].winner = winner;
          newBracket[roundIndex][matchIndex].status = 'completed';
          
          // Avanzar ganador a la siguiente ronda
          if (roundIndex < newBracket.length - 1) {
            const nextRoundIndex = roundIndex + 1;
            const nextMatchIndex = Math.floor(matchIndex / 2);
            
            if (newBracket[nextRoundIndex][nextMatchIndex]) {
              if (!newBracket[nextRoundIndex][nextMatchIndex].player1) {
                newBracket[nextRoundIndex][nextMatchIndex].player1 = winner;
              } else {
                newBracket[nextRoundIndex][nextMatchIndex].player2 = winner;
                newBracket[nextRoundIndex][nextMatchIndex].status = 'pending';
              }
            }
          }
          break;
        }
      }
      
      return newBracket;
    });
  };

  // Actualizar bracket basado en el estado del torneo
  useEffect(() => {
    if (tournamentState?.currentMatch?.winner) {
      updateMatchResult(
        tournamentState.currentMatch.id,
        tournamentState.currentMatch.winner
      );
    }
  }, [tournamentState]);

  if (bracket.length === 0) {
    return (
      <div className={styles.bracketContainer}>
        <div className={styles.emptyBracket}>
          <h3>🏆 Torneo de Duelos</h3>
          <p>Esperando jugadores para generar el bracket...</p>
          <div className={styles.tournamentInfo}>
            <span>Jugadores conectados: {players.length}</span>
            <span>Mínimo requerido: 2</span>
          </div>
        </div>
      </div>
    );
  }

  const totalRounds = bracket.length;
  const nextMatch = getNextAvailableMatch();

  return (
    <div className={styles.bracketContainer}>
      <div className={styles.bracketHeader}>
        <h3>🏆 Bracket del Torneo</h3>
        <div className={styles.tournamentControls}>
          {nextMatch && (
            <button 
              className={styles.startMatchBtn}
              onClick={handleStartNextMatch}
              disabled={currentMatch?.status === 'active'}
            >
              {currentMatch?.status === 'active' 
                ? '⚔️ Duelo en Curso...' 
                : `▶️ Iniciar ${getRoundName(nextMatch.round, totalRounds)}`
              }
            </button>
          )}
        </div>
      </div>

      <div className={styles.bracketGrid}>
        {bracket.map((round, roundIndex) => (
          <div key={roundIndex} className={styles.roundColumn}>
            <div className={styles.roundHeader}>
              <h4>{getRoundName(roundIndex, totalRounds)}</h4>
              <span className={styles.roundInfo}>
                {round.filter(m => m.status === 'completed').length}/{round.length} completados
              </span>
            </div>
            
            <div className={styles.matchesContainer}>
              {round.map((match, matchIndex) => (
                <div 
                  key={match.id} 
                  className={`${styles.matchCard} ${styles[match.status]} ${
                    currentMatch?.id === match.id ? styles.activeMatch : ''
                  }`}
                >
                  <div className={styles.matchHeader}>
                    <span className={styles.matchNumber}>
                      Match {matchIndex + 1}
                    </span>
                    <span className={`${styles.matchStatus} ${styles[match.status]}`}>
                      {match.status === 'pending' && '⏳'}
                      {match.status === 'active' && '⚔️'}
                      {match.status === 'completed' && '✅'}
                      {match.status === 'waiting' && '⏸️'}
                    </span>
                  </div>

                  <div className={styles.playersContainer}>
                    <div className={`${styles.player} ${
                      match.winner?.id === match.player1?.id ? styles.winner : ''
                    } ${match.player1?.isBye ? styles.bye : ''}`}>
                      {match.player1 ? (
                        <>
                          <div className={styles.playerAvatar}>
                            {match.player1.character?.image ? (
                              <img 
                                src={match.player1.character.image} 
                                alt={match.player1.character.name} 
                              />
                            ) : (
                              <div className={styles.defaultAvatar}>
                                {match.player1.isBye ? '🚫' : '👤'}
                              </div>
                            )}
                          </div>
                          <span className={styles.playerName}>
                            {match.player1.username}
                          </span>
                        </>
                      ) : (
                        <span className={styles.tbd}>TBD</span>
                      )}
                    </div>

                    <div className={styles.vs}>VS</div>

                    <div className={`${styles.player} ${
                      match.winner?.id === match.player2?.id ? styles.winner : ''
                    } ${match.player2?.isBye ? styles.bye : ''}`}>
                      {match.player2 ? (
                        <>
                          <div className={styles.playerAvatar}>
                            {match.player2.character?.image ? (
                              <img 
                                src={match.player2.character.image} 
                                alt={match.player2.character.name} 
                              />
                            ) : (
                              <div className={styles.defaultAvatar}>
                                {match.player2.isBye ? '🚫' : '👤'}
                              </div>
                            )}
                          </div>
                          <span className={styles.playerName}>
                            {match.player2.username}
                          </span>
                        </>
                      ) : (
                        <span className={styles.tbd}>TBD</span>
                      )}
                    </div>
                  </div>

                  {match.winner && (
                    <div className={styles.matchResult}>
                      🏆 {match.winner.username}
                    </div>
                  )}

                  {/* Manejar BYE automáticamente */}
                  {(match.player1?.isBye || match.player2?.isBye) && match.status === 'pending' && (
                    <div className={styles.byeNotice}>
                      Pase automático
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Información del torneo */}
      <div className={styles.tournamentInfo}>
        <div className={styles.infoCard}>
          <h4>📊 Estado del Torneo</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Jugadores:</span>
              <span className={styles.infoValue}>{players.filter(p => !p.isBye).length}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rondas:</span>
              <span className={styles.infoValue}>{totalRounds}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ronda Actual:</span>
              <span className={styles.infoValue}>
                {nextMatch ? getRoundName(nextMatch.round, totalRounds) : 'Finalizado'}
              </span>
            </div>
          </div>
        </div>

        {/* Ganador del torneo */}
        {bracket[totalRounds - 1]?.[0]?.winner && (
          <div className={styles.tournamentWinner}>
            <h3>🏆 ¡Campeón del Torneo!</h3>
            <div className={styles.winnerCard}>
              <div className={styles.winnerAvatar}>
                {bracket[totalRounds - 1][0].winner.character?.image ? (
                  <img 
                    src={bracket[totalRounds - 1][0].winner.character.image} 
                    alt={bracket[totalRounds - 1][0].winner.character.name} 
                  />
                ) : (
                  <div className={styles.defaultAvatar}>👤</div>
                )}
              </div>
              <span className={styles.winnerName}>
                {bracket[totalRounds - 1][0].winner.username}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentBracket;