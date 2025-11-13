import React from 'react';
import { ShieldAlert } from 'lucide-react';
import styles from './MultiAccountBlock.module.css';

export default function MultiAccountBlock({ reason, onClose }) {
  const handleClose = () => {
    // Intentar cerrar la pestaña
    window.close();
    
    // Si no se puede cerrar, redirigir después de un momento
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        window.location.href = '/';
      }
    }, 100);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <ShieldAlert size={64} strokeWidth={2.5} />
        </div>
        
        <h1 className={styles.title}>
          USTED YA ESTÁ JUGANDO
        </h1>
        
        <p className={styles.message}>
          No puedes crear múltiples cuentas en el mismo juego.
        </p>
        
        <div className={styles.details}>
          <p><strong>⚠️ Multicuenta Detectada</strong></p>
          <p>{reason || 'Ya tienes una cuenta activa desde este navegador'}</p>
          <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>
            Cierra esta pestaña y usa tu cuenta existente.
          </p>
        </div>
        
        <button 
          className={styles.button}
          onClick={handleClose}
        >
          Cerrar Esta Pestaña
        </button>
      </div>
    </div>
  );
}
