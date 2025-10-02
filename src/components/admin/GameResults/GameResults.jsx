import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./GameResults.module.css";

export default function GameResults() {
  const location = useLocation();
  const { results } = location.state || { results: [] };

  const filteredResults = (results || []).filter(player => (player?.score || 0) > 0);
  const sortedResults = [...filteredResults].sort((a, b) => {
    const scoreDifference = (b.score || 0) - (a.score || 0);
    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    const aTime = Number.isFinite(a?.totalResponseTime) ? a.totalResponseTime : Number.POSITIVE_INFINITY;
    const bTime = Number.isFinite(b?.totalResponseTime) ? b.totalResponseTime : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });

  return (
    <div className={styles.resultsContainer}>
      <h1>Resultados Finales</h1>
      <div className={styles.ranking}>
        {sortedResults.length === 0 && (
          <div className={styles.emptyState}>No hay jugadores con puntaje registrado.</div>
        )}
        {sortedResults.map((player, index) => (
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
