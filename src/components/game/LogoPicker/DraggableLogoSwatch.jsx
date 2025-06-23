// src/components/game/LogoPicker/DraggableLogoSwatch.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../Designer/ItemTypes';
import styles from './LogoPicker.module.css';

const DraggableLogoSwatch = ({ symbolOption }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.SYMBOL_ICON,
    item: { symbolOption },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  if (!symbolOption.path) return null;

  return (
    <div
      ref={dragRef}
      className={styles.logoButton}
      title={symbolOption.name}
      style={{ opacity: isDragging ? 0.4 : 1, cursor: 'grab' }}
    >
      <img
        src={symbolOption.path}
        alt={symbolOption.name}
        className={styles.logoImage}
      />
      <span className={styles.logoNameText}>{symbolOption.name}</span>
    </div>
  );
};

export default DraggableLogoSwatch;
