import React, { useState } from 'react';
import { Users, UserX, Crown, AlertTriangle, X } from 'lucide-react';
import styles from './PlayersManager.module.css';

/**
 * Componente para gestionar jugadores durante la partida
 * Permite al administrador ver y expulsar jugadores
 */
export default function PlayersManager({ 
  players = [], 
  isGameActive = false, 
  onKickPlayer,
  gamePin 
}) {
  const [showKickConfirm, setShowKickConfirm] = useState(null);
  const [kickingPlayer, setKickingPlayer] = useState(null);

  const handleKickClick = (player) => {
    setShowKickConfirm(player);
  };

  const confirmKick = async () => {
    if (!showKickConfirm) return;
    
    setKickingPlayer(showKickConfirm.id);
    
    try {
      await onKickPlayer(showKickConfirm);
      setShowKickConfirm(null);
    } catch (error) {
      console.error('Error al expulsar jugador:', error);
    } finally {
      setKickingPlayer(null);
    }
  };

  const cancelKick = () => {
    setShowKickConfirm(null);
  };

  if (!players || players.length === 0) {
    return (
      <div className={styles.playersManager}>
        <div className={styles.header}>
          <Users size={20} />
          <h3>Jugadores Conectados (0)</h3>
        </div>
        <div className={styles.emptyState}>
          <Users size={48} />
          <p>No hay jugadores conectados</p>
          <span>Comparte el PIN: <strong>{gamePin}</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playersManager}>
      {/* Confirmación de expulsión */}
      {showKickConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmHeader}>
              <AlertTriangle size={24} />
              <h4>Confirmar Expulsión</h4>
            </div>
            
            <div className={styles.confirmContent}>
              <div className={styles.playerPreview}>
                {showKickConfirm.character?.image && (
                  <img 
                    src={showKickConfirm.character.image} 
                    alt={showKickConfirm.character.name}
                    className={styles.playerAvatar}
                  />
                )}
                <div>
                  <p><strong>{showKickConfirm.username}</strong></p>
                  <p>{showKickConfirm.character?.name || 'Sin personaje'}</p>
                </div>
              </div>
              
              <p>¿Estás seguro de que quieres expulsar a este jugador?</p>
              <p className={styles.warning}>
                Esta acción no se puede deshacer y el jugador será desconectado inmediatamente.
              </p>
            </div>
            
            <div className={styles.confirmActions}>
              <button 
                className={styles.cancelBtn}
                onClick={cancelKick}
                disabled={kickingPlayer}
              >
                Cancelar
              </button>
              <button 
                className={styles.confirmBtn}
                onClick={confirmKick}
                disabled={kickingPlayer}
              >
                {kickingPlayer === showKickConfirm.id ? (
                  <>
                    <div className={styles.spinner}></div>
                    Expulsando...
                  </>
                ) : (
                  <>
                    <UserX size={16} />
                    Expulsar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <Users size={20} />
        <h3>Jugadores Conectados ({players.length})</h3>
        {isGameActive && (
          <span className={styles.gameStatus}>
            🎮 Partida en curso
          </span>
        )}
      </div>

      <div className={styles.playersList}>
        {players.map((player, index) => (
          <div 
            key={`${player.id}-${index}`} 
            className={`${styles.playerCard} ${index === 0 ? styles.host : ''}`}
          >
            {/* Indicador de host */}
            {index === 0 && (
              <div className={styles.hostBadge}>
                <Crown size={14} />
                <span>Host</span>
              </div>
            )}

            {/* Avatar del jugador */}
            <div className={styles.playerAvatar}>
              {player.character?.image ? (
                <img 
                  src={player.character.image} 
                  alt={player.character.name}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.defaultAvatar}>
                  <Users size={24} />
                </div>
              )}
            </div>

            {/* Información del jugador */}
            <div className={styles.playerInfo}>
              <h4 className={styles.playerName}>{player.username}</h4>
              <p className={styles.characterName}>
                {player.character?.name || 'Sin personaje'}
              </p>
              {player.character?.specialty && (
                <p className={styles.characterSpecialty}>
                  {player.character.specialty}
                </p>
              )}
              
              {/* Stats durante el juego */}
              {isGameActive && (
                <div className={styles.playerStats}>
                  <span className={styles.stat}>
                    🏆 {player.score || 0} pts
                  </span>
                  <span className={styles.stat}>
                    ✅ {player.correctAnswers || 0}
                  </span>
                </div>
              )}
            </div>

            {/* Estado de conexión */}
            <div className={styles.playerStatus}>
              <div className={styles.statusDot}></div>
              <span>Conectado</span>
            </div>

            {/* Botón de expulsión (solo para jugadores, no para el host) */}
            {index !== 0 && (
              <button
                className={styles.kickButton}
                onClick={() => handleKickClick(player)}
                disabled={kickingPlayer === player.id}
                title="Expulsar jugador"
              >
                {kickingPlayer === player.id ? (
                  <div className={styles.miniSpinner}></div>
                ) : (
                  <UserX size={16} />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <span>PIN del juego: <strong>{gamePin}</strong></span>
          <span>Máximo: 50 jugadores</span>
        </div>
        
        {isGameActive && (
          <div className={styles.gameInfo}>
            <span className={styles.gameIndicator}>
              🎯 Los jugadores están respondiendo preguntas
            </span>
          </div>
        )}
      </div>
    </div>
  );
}