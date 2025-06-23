import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./GameResults.module.css";

export default function GameResults() {
  const location = useLocation();
  const { results } = location.state || { results: [] };

  return (
    <div className={styles.resultsContainer}>
      <h1>Resultados Finales</h1>
      <div className={styles.ranking}>
        {results.map((player, index) => (
          <div key={index} className={styles.playerRow}>
            <span className={styles.rank}>{index + 1}</span>
            <span className={styles.name}>{player.username}</span>
            <span className={styles.score}>{player.score} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
