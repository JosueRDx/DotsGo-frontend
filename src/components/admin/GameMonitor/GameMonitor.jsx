import React, {useState, useEffect} from "react";
import styles from "./GameMonitor.module.css";
import { socket } from "../../../services/websocket/socketService";

export default function GameMonitor({ tiempo, codigo, onIniciarJuego, esperandoResultados }) {
  const [players, setPlayers] = useState([]);
  useEffect(() => {
    socket.on("player-joined", ({players}) => {
      setPlayers(players);
    });
    return () => {
      socket.off("player-joined");
    };
  }, []);
  return (
    <div>
      <div className={styles.gameMonitorContainer}>
        <h2>¡Juego Creado!</h2>
        <div className={styles.gameInfo}>
          <p><strong>Tiempo:</strong> {tiempo} segundos por pregunta</p>
        </div>
        <div className={styles.gameCode}>
          <p>Código de Juego</p>
          <span>{codigo}</span>
        </div>
        <button className={styles.buttonForm} onClick={onIniciarJuego}>Iniciar Juego</button>
      </div>

      <div className={styles.connectedStudentsContainer}>
        <h3>Usuarios conectados</h3>
        <div className={styles.studentsList}>
          {players.map((player) => (
            <div key={player.id} className={styles.student}>
              <p>{player.username}</p>
            </div>
          ))}
        </div>
      </div>

      {esperandoResultados && (
        <div className={styles.waitingMessage}>
          <p>Esperando a que finalice la partida y se generen los resultados...</p>
        </div>
      )}
    </div>
  );
}
