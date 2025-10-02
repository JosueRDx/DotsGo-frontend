// src/components/game/NumberPicker/DraggableNumberSwatch.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../Designer/ItemTypes';
import styles from './NumberPicker.module.css';

const DraggableNumberSwatch = ({ numberValue, isTouchDevice = false, onSelect }) => {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.NUMBER_BADGE,
      item: { numberValue },
      canDrag: !isTouchDevice,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
     [numberValue, isTouchDevice]
  );

  return (
    <div
      ref={isTouchDevice ? null : dragRef}
      className={styles.numberButton}
      title={`Número ${numberValue}`}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: isTouchDevice ? 'pointer' : 'grab',
      }}
      onClick={isTouchDevice ? () => onSelect && onSelect(numberValue) : undefined}
    >
      {numberValue}
    </div>
  );
};

export default DraggableNumberSwatch;
