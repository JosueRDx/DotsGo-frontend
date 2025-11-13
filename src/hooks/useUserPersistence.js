import { useEffect, useRef } from 'react';
import { socket, leaveGameCleanly } from '../services/websocket/socketService';
import storage from '../utils/storage';

/**
 * Hook personalizado para manejar la persistencia del usuario
 * Guarda el nombre del usuario pero desconecta de la partida al recargar/cerrar
 */
export const useUserPersistence = () => {
    const hasSetupBeforeUnload = useRef(false);

    // NUEVO: Función para guardar progreso del usuario
    const saveUserProgress = (gamePin, username) => {
        try {
            const progressKey = `userProgress_${username}`;
            // Obtener personaje seleccionado usando storage seguro
            const selectedCharacter = storage.getItem("selectedCharacter", null);
            
            const currentProgress = {
                gamePin,
                username,
                selectedCharacter: selectedCharacter ? JSON.parse(selectedCharacter) : null,
                timestamp: Date.now(),
                savedAt: new Date().toISOString()
            };

            storage.setItem(progressKey, JSON.stringify(currentProgress));
            console.log(`Progreso guardado para ${username} en juego ${gamePin}`, currentProgress);
        } catch (error) {
            console.error("Error guardando progreso del usuario:", error);
        }
    };

    useEffect(() => {
        // Solo configurar una vez el evento beforeunload
        if (hasSetupBeforeUnload.current) return;
        hasSetupBeforeUnload.current = true;

        const handleBeforeUnload = (event) => {
            // Obtener datos usando storage seguro
            const gamePin = storage.getItem("gamePin", null);
            const username = storage.getItem("username", null);

            if (gamePin && username) {
                // NUEVO: Guardar progreso del usuario antes de salir
                saveUserProgress(gamePin, username);

                // Usar la función del servicio para salir limpiamente
                leaveGameCleanly(gamePin, username);

                // Limpiar datos de la partida activa pero mantener el progreso guardado usando storage seguro
                storage.removeItem("gamePin");
                // NO eliminar selectedCharacter - se mantiene para reconexión
                storage.removeItem("tempUsername");
                storage.removeItem("questionsCount");
                storage.removeItem("joiningInProgress");

                // El nombre y progreso se mantienen para futuras sesiones
                console.log(`Usuario ${username} desconectado de la partida por recarga/cierre - Progreso guardado`);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Obtener datos usando storage seguro
                const gamePin = storage.getItem("gamePin", null);
                const username = storage.getItem("username", null);

                if (gamePin && username) {
                    // NUEVO: Guardar progreso del usuario antes de salir
                    saveUserProgress(gamePin, username);

                    // Usar la función del servicio para salir limpiamente
                    leaveGameCleanly(gamePin, username);

                    // Limpiar datos de la partida activa pero mantener el progreso guardado usando storage seguro
                    storage.removeItem("gamePin");
                    // NO eliminar selectedCharacter - se mantiene para reconexión
                    storage.removeItem("tempUsername");
                    storage.removeItem("questionsCount");
                    storage.removeItem("joiningInProgress");

                    console.log(`Usuario ${username} desconectado por cambio de visibilidad - Progreso guardado`);
                }
            }
        };

        // Agregar event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            hasSetupBeforeUnload.current = false;
        };
    }, []);

    // Funciones utilitarias para manejar la persistencia del usuario
    const saveUsername = (username) => {
        storage.setItem("username", username);
    };

    const getSavedUsername = () => {
        return storage.getItem("username", "");
    };

    const clearGameData = () => {
        storage.removeItem("gamePin");
        // NO eliminar selectedCharacter - se mantiene para reconexión
        storage.removeItem("tempUsername");
        storage.removeItem("questionsCount");
        storage.removeItem("joiningInProgress");
        // Mantener el username y selectedCharacter guardados
    };

    const isInGame = () => {
        return !!(storage.getItem("gamePin", null) && storage.getItem("username", null));
    };



    const getUserProgress = (username) => {
        try {
            const progressKey = `userProgress_${username}`;
            const savedProgress = storage.getItem(progressKey, null);
            return savedProgress ? JSON.parse(savedProgress) : null;
        } catch (error) {
            console.error("Error obteniendo progreso del usuario:", error);
            return null;
        }
    };

    const clearUserProgress = (username) => {
        try {
            const progressKey = `userProgress_${username}`;
            storage.removeItem(progressKey);
            console.log(`Progreso eliminado para ${username}`);
        } catch (error) {
            console.error("Error eliminando progreso del usuario:", error);
        }
    };

    // NUEVO: Función para restaurar el progreso del usuario
    const restoreUserProgress = (username) => {
        try {
            const savedProgress = getUserProgress(username);
            if (savedProgress && savedProgress.selectedCharacter) {
                storage.setItem("selectedCharacter", JSON.stringify(savedProgress.selectedCharacter));
                console.log(`Personaje restaurado para ${username}:`, savedProgress.selectedCharacter.name);
                return savedProgress.selectedCharacter;
            }
            return null;
        } catch (error) {
            console.error("Error restaurando progreso del usuario:", error);
            return null;
        }
    };

    return {
        saveUsername,
        getSavedUsername,
        clearGameData,
        isInGame,
        saveUserProgress,
        getUserProgress,
        clearUserProgress,
        restoreUserProgress
    };
};