// src/components/game/LogoPicker/LogoPicker.jsx
import React from 'react';
import DraggableLogoSwatch from './DraggableLogoSwatch';
import styles from './LogoPicker.module.css';

const LogoPicker = ({ symbols, title }) => {
  return (
    <div className={styles.logoPickerMainContainer}>
      {title && <h2>{title}</h2>}
      <div className={styles.logoOptionsWrapper}>
        {symbols.map((symbolOpt) =>
          symbolOpt.path ? (
            <DraggableLogoSwatch key={symbolOpt.id} symbolOption={symbolOpt} />
          ) : null
        )}
      </div>
    </div>
  );
};

export default LogoPicker;

