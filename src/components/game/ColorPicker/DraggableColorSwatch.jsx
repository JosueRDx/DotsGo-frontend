import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from '../Designer/ItemTypes';

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

  const swatchStyle = {
    width: '100px',
    height: '140px',
    borderRadius: '10px',
    border: '2px solid #ddd',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: isLightColor || isPattern ? '#111' : '#fff',
    cursor: 'grab',
    boxShadow: isDragging
      ? '0 0 10px rgba(0, 0, 0, 0.3)'
      : '0 4px 10px rgba(0, 0, 0, 0.15)',
    opacity: isDragging ? 0.5 : 1,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    userSelect: 'none',
    flex: '0 0 auto',
    backgroundColor: isPattern ? '#fff' : colorOption.value,
    backgroundImage: isPattern ? colorOption.value : 'none',
    backgroundSize: '20px 20px',
    backgroundRepeat: 'repeat',
  };

  return (
    <div ref={dragRef} style={swatchStyle} title={colorOption.name}>
      {colorOption.name}
    </div>
  );
};

export default DraggableColorSwatch;
