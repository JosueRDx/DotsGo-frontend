import React, { useState } from "react";
import styles from "./GameCreator.module.css";

export default function GameCreator({ onCrearJuego }) {
  const [tiempoJuego, setTiempoJuego] = useState("");

  const handleClick = () => {
    if (tiempoJuego) {
      onCrearJuego(Number(tiempoJuego));
    } else {
      alert("Por favor, complete el campo de tiempo.");
    }
  };

  return (
    <div className={styles.gameCreatorContainer}>
      <h2>Crear Nuevo Juego</h2>
      <p>Ingresa el tiempo límite en segundos</p>

      <label>Tiempo (segundos):</label>
      <input
        type="number"
        placeholder="Establecer Tiempo Límite"
        value={tiempoJuego}
        onChange={(e) => setTiempoJuego(e.target.value)}
      />

      <button onClick={handleClick}>Crear Juego</button>
    </div>
  );
}
