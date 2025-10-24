import React from 'react';
import { useUserPersistence } from '../../hooks/useUserPersistence';

/**
 * Componente de desarrollo para mostrar el estado de persistencia del usuario
 * Solo para debugging - remover en producción
 */
export default function UserPersistenceStatus() {
  const { getSavedUsername, isInGame } = useUserPersistence();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const savedUsername = getSavedUsername();
  const inGame = isInGame();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div>👤 Usuario: {savedUsername || 'No guardado'}</div>
      <div>🎮 En juego: {inGame ? 'Sí' : 'No'}</div>
      <div>📍 PIN: {localStorage.getItem('gamePin') || 'N/A'}</div>
    </div>
  );
}