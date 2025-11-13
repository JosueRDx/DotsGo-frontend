import React from 'react';
import { useUserPersistence } from '../../hooks/useUserPersistence';
import storage from '../../utils/storage';

/**
 * Componente de desarrollo para mostrar el estado de persistencia del usuario
 * Solo para debugging - remover en producción
 */
export default function UserPersistenceStatus() {
  const { getSavedUsername, isInGame, getUserProgress } = useUserPersistence();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const savedUsername = getSavedUsername();
  const inGame = isInGame();
  // Obtener datos usando storage seguro
  const selectedCharacterData = storage.getItem('selectedCharacter', null);
  const userProgress = savedUsername ? getUserProgress(savedUsername) : null;
  
  let selectedCharacter = null;
  try {
    selectedCharacter = selectedCharacterData ? JSON.parse(selectedCharacterData) : null;
  } catch (error) {
    // Ignorar errores de parsing
  }

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
      fontFamily: 'monospace',
      maxWidth: '250px'
    }}>
      <div>👤 Usuario: {savedUsername || 'No guardado'}</div>
      <div>🎮 En juego: {inGame ? 'Sí' : 'No'}</div>
      <div>📍 PIN: {storage.getItem('gamePin', null) || 'N/A'}</div>
      <div>🎭 Personaje: {selectedCharacter?.name || 'No seleccionado'}</div>
      {userProgress && (
        <div>💾 Progreso: {userProgress.selectedCharacter?.name || 'Sin personaje guardado'}</div>
      )}
    </div>
  );
}