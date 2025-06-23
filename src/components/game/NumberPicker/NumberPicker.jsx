// src/components/game/NumberPicker/NumberPicker.jsx
import React from 'react';
import DraggableNumberSwatch from './DraggableNumberSwatch';
import styles from './NumberPicker.module.css';

const NumberPicker = ({ numbers, title }) => {
  return (
    <div className={styles.numberPickerMainContainer}>
      {title && <h2>{title}</h2>}
      <div className={styles.numberOptionsWrapper}>
        {numbers.map((numValue) => (
          <DraggableNumberSwatch key={numValue} numberValue={numValue} />
        ))}
      </div>
    </div>
  );
};

export default NumberPicker;
