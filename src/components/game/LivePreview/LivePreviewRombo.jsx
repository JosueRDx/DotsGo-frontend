import React from 'react';
import { useDrop } from 'react-dnd';
import './LivePreviewRombo.module.css';
import { ItemTypes } from '../Designer/ItemTypes';
import styles from './LivePreviewRombo.module.css';

const LivePreviewRombo = ({
  topColorOption,
  bottomColorOption,
  symbolOption,
  symbolPosition,
  number,
  numberPosition,
  onTopColorDrop,
  onBottomColorDrop,
  onSymbolDrop,
  onNumberDrop,
}) => {
  const [{ isOverTop, canDropTop, draggedItemTypeTop }, dropTopRef] = useDrop(() => ({
    accept: [ItemTypes.COLOR_SWATCH, ItemTypes.SYMBOL_ICON, ItemTypes.NUMBER_BADGE],
    drop: (item, monitor) => {
      const type = monitor.getItemType();
      if (type === ItemTypes.COLOR_SWATCH && item.colorOption) {
        onTopColorDrop(item.colorOption);
      } else if (type === ItemTypes.SYMBOL_ICON && item.symbolOption) {
        onSymbolDrop(item.symbolOption, 'top');
      } else if (type === ItemTypes.NUMBER_BADGE && item.numberValue) {
        onNumberDrop(item.numberValue, 'top');
      }
    },
    collect: (monitor) => ({
      isOverTop: !!monitor.isOver(),
      canDropTop: !!monitor.canDrop(),
      draggedItemTypeTop: monitor.getItemType(),
    }),
  }));

  const [{ isOverBottom, canDropBottom, draggedItemTypeBottom }, dropBottomRef] = useDrop(() => ({
    accept: [ItemTypes.COLOR_SWATCH, ItemTypes.SYMBOL_ICON, ItemTypes.NUMBER_BADGE],
    drop: (item, monitor) => {
      const type = monitor.getItemType();
      if (type === ItemTypes.COLOR_SWATCH && item.colorOption) {
        onBottomColorDrop(item.colorOption);
      } else if (type === ItemTypes.SYMBOL_ICON && item.symbolOption) {
        onSymbolDrop(item.symbolOption, 'bottom');
      } else if (type === ItemTypes.NUMBER_BADGE && item.numberValue) {
        onNumberDrop(item.numberValue, 'bottom');
      }
    },
    collect: (monitor) => ({
      isOverBottom: !!monitor.isOver(),
      canDropBottom: !!monitor.canDrop(),
      draggedItemTypeBottom: monitor.getItemType(),
    }),
  }));

  const topBackground = topColorOption?.type === 'pattern'
    ? `linear-gradient(to bottom, ${topColorOption.value} 0%, ${topColorOption.value} 50%, transparent 50%, transparent 100%)`
    : topColorOption?.value || 'transparent';

  const bottomBackground = bottomColorOption?.type === 'pattern'
    ? `linear-gradient(to top, ${bottomColorOption.value} 0%, ${bottomColorOption.value} 50%, transparent 50%, transparent 100%)`
    : bottomColorOption?.value || 'transparent';

  const combinedBackground = 
    topColorOption?.type === 'pattern' || bottomColorOption?.type === 'pattern'
      ? `${topBackground}, ${bottomBackground}`
      : `linear-gradient(to bottom, ${topBackground} 0%, ${topBackground} 50%, ${bottomBackground} 50%, ${bottomBackground} 100%)`;

  const romboInnerStyles = {
    width: 'min(40vw, 360px)',
    height: 'min(40vw, 360px)',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    border: '2px solid transparent',
    transition: 'box-shadow 0.3s ease',
    background: '',
  };

  const backgroundLayers = [];

  // TOP background
  if (topColorOption) {
    if (topColorOption.type === 'pattern') {
      backgroundLayers.push(`${topColorOption.value} top / 100% 50% no-repeat`);
    } else {
      backgroundLayers.push(`linear-gradient(to bottom, ${topColorOption.value} 0%, ${topColorOption.value} 50%, transparent 50%, transparent 100%)`);
    }
  }

  // BOTTOM background
  if (bottomColorOption) {
    if (bottomColorOption.type === 'pattern') {
      backgroundLayers.push(`${bottomColorOption.value} bottom / 100% 50% no-repeat`);
    } else {
      backgroundLayers.push(`linear-gradient(to top, ${bottomColorOption.value} 0%, ${bottomColorOption.value} 50%, transparent 50%, transparent 100%)`);
    }
  }

  // Combine layers
  romboInnerStyles.background = backgroundLayers.join(', ');

  if (!topColorOption && !bottomColorOption) {
    romboInnerStyles.backgroundColor = 'lightgrey';
  }

  if (
    (topColorOption?.value === '#FFFFFF' && bottomColorOption?.value === '#FFFFFF') ||
    (topColorOption?.value === '#FFFFFF' && !bottomColorOption) ||
    (bottomColorOption?.value === '#FFFFFF' && !topColorOption)
  ) {
    romboInnerStyles.border = '2px solid #000000';
  }

  const dropZoneBase = {
    flex: 1,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'outline 0.2s ease',
  };

  const topDropZoneStyles = {
    ...dropZoneBase,
    outlineOffset: '-2px',
    outline:
      canDropTop && isOverTop
        ? `3px dashed ${draggedItemTypeTop === ItemTypes.COLOR_SWATCH ? 'orange' : 'green'}`
        : canDropTop
        ? `2px dashed ${draggedItemTypeTop === ItemTypes.COLOR_SWATCH ? 'grey' : 'lightgreen'}`
        : 'none',
  };

  const bottomDropZoneStyles = {
    ...dropZoneBase,
    outlineOffset: '-2px',
    outline:
      canDropBottom && isOverBottom
        ? `3px dashed ${draggedItemTypeBottom === ItemTypes.COLOR_SWATCH ? 'orange' : 'green'}`
        : canDropBottom
        ? `2px dashed ${draggedItemTypeBottom === ItemTypes.COLOR_SWATCH ? 'grey' : 'lightgreen'}`
        : 'none',
  };

  const logoStyles = {
    position: 'absolute',
    left: '50%',
    top: symbolPosition === 'top' ? '35%' : symbolPosition === 'bottom' ? '40%' : '50%',
    bottom: symbolPosition === 'bottom' ? '25%' : 'unset',
    transform: symbolPosition === 'bottom' ? 'translate(-50%, 50%)' : 'translate(-50%, -50%)',
    width: '28%',
    height: 'auto',
    maxHeight: '32%',
    objectFit: 'contain',
    pointerEvents: 'none',
    zIndex: 20,
    transition: 'top 0.3s ease, bottom 0.3s ease, transform 0.3s ease',
    filter: 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.35))',
  };

  const numberTextColor =
    bottomColorOption?.value?.toLowerCase() === '#000000' ? '#FFFFFF' : '#000000';

  const numberStyles = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontWeight: 'bold',
    fontSize: '2em',
    color: numberTextColor,
    textShadow: '1px 1px 2px rgba(0,0,0,0.25)',
    zIndex: 20,
    ...(numberPosition === 'top' ? { top: '8%' } : { bottom: '8%' }),
  };

  const isEmpty = !topColorOption && !bottomColorOption && !symbolOption && !number;

  return (
    <div className="rombo-container">
      <div className="rombo-outer">
        <div className={styles['rombo-inner']} style={romboInnerStyles}>
          <div className="rombo-border-inner" />
          <div ref={dropTopRef} style={topDropZoneStyles}>
            {isEmpty && !isOverTop && !isOverBottom && (
              <span className="rombo-drop-hint">
                Arrastra
                <br />
                colores
                <br />
                aquí
              </span>
            )}
          </div>
          <div ref={dropBottomRef} style={bottomDropZoneStyles}></div>

          {symbolOption?.path && (
            <img
              src={symbolOption.path}
              alt={symbolOption.name}
              className="rombo-logo"
              style={logoStyles}
            />
          )}

          {number && number !== 'Sin Número' && (
            <div className="rombo-number" style={numberStyles}>{number}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivePreviewRombo;
