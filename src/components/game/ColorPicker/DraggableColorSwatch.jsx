import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../Designer/ItemTypes';
import styles from './DraggableColorSwatch.module.css';

const DraggableColorSwatch = ({ colorOption, isTouchDevice = false, onSelect }) => {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: ItemTypes.COLOR_SWATCH,
      item: { colorOption },
      canDrag: !isTouchDevice,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
      [colorOption, isTouchDevice]
    );

  const isLightColor =
    colorOption.value === '#FFFFFF' ||
    colorOption.value === '#FFFF00' ||
    colorOption.value === 'lightgrey';

  const isPattern = colorOption.type === 'pattern';

  const swatchClasses = [
    styles.colorSwatch,
    isDragging && styles.dragging,
    isLightColor && styles.lightColor,
    isPattern && styles.pattern,
  ]
    .filter(Boolean)
    .join(' ');

  // Solo estilos dinámicos que no se pueden hacer con CSS
  const dynamicStyles = {
    backgroundColor: isPattern ? '#fff' : colorOption.value,
    backgroundImage: isPattern ? colorOption.value : 'none',
    color: isLightColor || isPattern ? '#111' : '#fff',
    cursor: isTouchDevice ? 'pointer' : 'grab',
  };

  return (
    <div
      ref={isTouchDevice ? null : dragRef}
      className={swatchClasses}
      style={dynamicStyles}
      title={colorOption.name}
      onClick={isTouchDevice ? () => onSelect && onSelect(colorOption) : undefined}
    >
      {colorOption.name}
    </div>
  );
};

export default DraggableColorSwatch;