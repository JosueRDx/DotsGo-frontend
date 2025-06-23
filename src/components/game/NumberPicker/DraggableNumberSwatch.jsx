// src/components/game/NumberPicker/DraggableNumberSwatch.jsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../Designer/ItemTypes';
import styles from './NumberPicker.module.css';

const DraggableNumberSwatch = ({ numberValue }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.NUMBER_BADGE,
    item: { numberValue },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef}
      className={styles.numberButton}
      title={`Número ${numberValue}`}
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
      }}
    >
      {numberValue}
    </div>
  );
};

export default DraggableNumberSwatch;
