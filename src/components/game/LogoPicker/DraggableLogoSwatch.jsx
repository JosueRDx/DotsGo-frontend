// src/components/game/LogoPicker/DraggableLogoSwatch.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../Designer/ItemTypes';
import styles from './LogoPicker.module.css';

const DraggableLogoSwatch = ({ symbolOption, isTouchDevice = false, onSelect }) => {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.SYMBOL_ICON,
      item: { symbolOption },
      canDrag: !isTouchDevice,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
      [symbolOption, isTouchDevice]
  );

  if (!symbolOption.path) return null;

  return (
    <div
      ref={isTouchDevice ? null : dragRef}
      className={styles.logoButton}
      title={symbolOption.name}
      style={{ opacity: isDragging ? 0.4 : 1, cursor: isTouchDevice ? 'pointer' : 'grab' }}
      onClick={isTouchDevice ? () => onSelect && onSelect(symbolOption) : undefined}    >
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
