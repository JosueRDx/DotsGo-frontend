import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import styles from './ReconnectionNotification.module.css';

export default function ReconnectionNotification({ 
  isConnected, 
  isReconnecting, 
  gracePeriodSeconds = 180 
}) {
  const [timeRemaining, setTimeRemaining] = useState(gracePeriodSeconds);

  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeRemaining(gracePeriodSeconds);
    }
  }, [isConnected, isReconnecting, gracePeriodSeconds]);

  if (isConnected) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className={styles.notification}>
      <div className={styles.content}>
        {isReconnecting ? (
          <>
            <RefreshCw className={styles.spinIcon} size={20} />
            <div className={styles.text}>
              <strong>Reconectando...</strong>
              <span>Intentando restablecer la conexión</span>
            </div>
          </>
        ) : (
          <>
            <WifiOff size={20} />
            <div className={styles.text}>
              <strong>Conexión perdida</strong>
              <span>
                Reconecta en {minutes}:{seconds.toString().padStart(2, '0')} o perderás tu progreso
              </span>
            </div>
          </>
        )}
      </div>
      <div className={styles.progressBar}>
        <div 
          className={styles.progress} 
          style={{ width: `${(timeRemaining / gracePeriodSeconds) * 100}%` }}
        />
      </div>
    </div>
  );
}
