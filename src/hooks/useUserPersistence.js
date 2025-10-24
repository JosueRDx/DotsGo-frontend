import { useEffect, useRef } from 'react';
import { socket, leaveGameCleanly } from '../services/websocket/socketService';

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
            const currentProgress = {
                gamePin,
                username,
                timestamp: Date.now(),
                savedAt: new Date().toISOString()
            };

            localStorage.setItem(progressKey, JSON.stringify(currentProgress));
            console.log(`Progreso guardado para ${username} en juego ${gamePin}`);
        } catch (error) {
            console.error("Error guardando progreso del usuario:", error);
        }
    };

    useEffect(() => {
        // Solo configurar una vez el evento beforeunload
        if (hasSetupBeforeUnload.current) return;
        hasSetupBeforeUnload.current = true;

        const handleBeforeUnload = (event) => {
            const gamePin = localStorage.getItem("gamePin");
            const username = localStorage.getItem("username");

            if (gamePin && username) {
                // NUEVO: Guardar progreso del usuario antes de salir
                saveUserProgress(gamePin, username);

                // Usar la función del servicio para salir limpiamente
                leaveGameCleanly(gamePin, username);

                // Limpiar datos de la partida activa pero mantener el progreso guardado
                localStorage.removeItem("gamePin");
                localStorage.removeItem("selectedCharacter");
                localStorage.removeItem("tempUsername");
                localStorage.removeItem("questionsCount");
                localStorage.removeItem("joiningInProgress");

                // El nombre y progreso se mantienen para futuras sesiones
                console.log(`Usuario ${username} desconectado de la partida por recarga/cierre - Progreso guardado`);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const gamePin = localStorage.getItem("gamePin");
                const username = localStorage.getItem("username");

                if (gamePin && username) {
                    // NUEVO: Guardar progreso del usuario antes de salir
                    saveUserProgress(gamePin, username);

                    // Usar la función del servicio para salir limpiamente
                    leaveGameCleanly(gamePin, username);

                    // Limpiar datos de la partida activa pero mantener el progreso guardado
                    localStorage.removeItem("gamePin");
                    localStorage.removeItem("selectedCharacter");
                    localStorage.removeItem("tempUsername");
                    localStorage.removeItem("questionsCount");
                    localStorage.removeItem("joiningInProgress");

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
        localStorage.setItem("username", username);
    };

    const getSavedUsername = () => {
        return localStorage.getItem("username") || "";
    };

    const clearGameData = () => {
        localStorage.removeItem("gamePin");
        localStorage.removeItem("selectedCharacter");
        localStorage.removeItem("tempUsername");
        localStorage.removeItem("questionsCount");
        localStorage.removeItem("joiningInProgress");
        // Mantener el username guardado
    };

    const isInGame = () => {
        return !!(localStorage.getItem("gamePin") && localStorage.getItem("username"));
    };



    const getUserProgress = (username) => {
        try {
            const progressKey = `userProgress_${username}`;
            const savedProgress = localStorage.getItem(progressKey);
            return savedProgress ? JSON.parse(savedProgress) : null;
        } catch (error) {
            console.error("Error obteniendo progreso del usuario:", error);
            return null;
        }
    };

    const clearUserProgress = (username) => {
        try {
            const progressKey = `userProgress_${username}`;
            localStorage.removeItem(progressKey);
            console.log(`Progreso eliminado para ${username}`);
        } catch (error) {
            console.error("Error eliminando progreso del usuario:", error);
        }
    };

    return {
        saveUsername,
        getSavedUsername,
        clearGameData,
        isInGame,
        saveUserProgress,
        getUserProgress,
        clearUserProgress
    };
};