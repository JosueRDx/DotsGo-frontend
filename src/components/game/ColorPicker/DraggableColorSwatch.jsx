import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../Designer/ItemTypes';
import styles from './DraggableColorSwatch.module.css';

const DraggableColorSwatch = ({ colorOption }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.COLOR_SWATCH,
    item: { colorOption },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const isLightColor =
    colorOption.value === '#FFFFFF' || colorOption.value === '#FFFF00' || colorOption.value === 'lightgrey';

  const isPattern = colorOption.type === 'pattern';

  // Clases CSS dinámicas
  const swatchClasses = [
    styles.colorSwatch,
    isDragging && styles.dragging,
    isLightColor && styles.lightColor,
    isPattern && styles.pattern
  ].filter(Boolean).join(' ');

  // Solo estilos dinámicos que no se pueden hacer con CSS
  const dynamicStyles = {
    backgroundColor: isPattern ? '#fff' : colorOption.value,
    backgroundImage: isPattern ? colorOption.value : 'none',
    color: isLightColor || isPattern ? '#111' : '#fff',
  };

  return (
    <div 
      ref={dragRef} 
      className={swatchClasses}
      style={dynamicStyles}
      title={colorOption.name}
    >
      {colorOption.name}
    </div>
  );
};

export default DraggableColorSwatch;