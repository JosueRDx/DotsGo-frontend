import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Users, Target } from 'lucide-react';
import styles from './CorrectAnswersDisplay.module.css';
import { availableSymbols } from '../Designer/pictogramData';

/**
 * Componente para mostrar las respuestas correctas después de cada pregunta
 */
export default function CorrectAnswersDisplay({ 
  isVisible, 
  roundIndex, 
  totalQuestions, 
  playerAnswers, 
  displayTime,
  onClose 
}) {
  const [timeLeft, setTimeLeft] = useState(displayTime / 1000);

  useEffect(() => {
    if (!isVisible) return;

    setTimeLeft(displayTime / 1000);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, displayTime, onClose]);

  console.log("🎭 CorrectAnswersDisplay render - isVisible:", isVisible, "playerAnswers:", playerAnswers);

  if (!isVisible || !playerAnswers || playerAnswers.length === 0) {
    console.log("🎭 CorrectAnswersDisplay no se muestra - isVisible:", isVisible, "playerAnswers length:", playerAnswers?.length);
    return null;
  }

  // Función para renderizar el pictograma correcto
  const renderCorrectPictogram = (correctAnswer) => {
    const { pictogram, colors, number, symbolPosition, numberPosition } = correctAnswer;
    
    console.log("🎨 Renderizando pictograma:", { pictogram, colors, number, symbolPosition, numberPosition });

    return (
      <div className={styles.pictogramPreview}>
        <div className={styles.romboContainer}>
          {/* Colores de fondo */}
          <div 
            className={styles.romboTop}
            style={{ 
              backgroundColor: colors?.[0] ? getColorValue(colors[0]) : '#6B7280',
              backgroundImage: colors?.[0] ? getPatternStyle(colors[0]) : null,
              border: colors?.[0] === 'blanco' ? '2px solid #000000' : '2px solid #374151'
            }}
          />
          <div 
            className={styles.romboBottom}
            style={{ 
              backgroundColor: colors?.[1] ? getColorValue(colors[1]) : '#6B7280',
              backgroundImage: colors?.[1] ? getPatternStyle(colors[1]) : null,
              border: colors?.[1] === 'blanco' ? '2px solid #000000' : '2px solid #374151'
            }}
          />
          
          {/* Símbolo */}
          {pictogram && pictogram !== 'no_symbol' && (() => {
            const symbolImageSrc = getSymbolImage(pictogram);
            console.log("🖼️ Imagen del símbolo obtenida:", symbolImageSrc);
            
            return symbolImageSrc ? (
              <div 
                className={styles.symbolContainer}
                style={{
                  top: symbolPosition === 'top' ? '25%' : symbolPosition === 'bottom' ? '65%' : '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <img 
                  src={symbolImageSrc} 
                  alt={pictogram}
                  className={styles.symbolImage}
                  onError={(e) => {
                    console.error("❌ Error cargando imagen del símbolo:", e.target.src);
                  }}
                  onLoad={() => {
                    console.log("✅ Imagen del símbolo cargada correctamente");
                  }}
                />
              </div>
            ) : null;
          })()}
          
          {/* Número */}
          {number && (
            <div 
              className={styles.numberContainer}
              style={{
                top: numberPosition === 'top' ? '10%' : 'auto',
                bottom: numberPosition === 'bottom' ? '10%' : 'auto',
                right: '10%'
              }}
            >
              <span className={styles.numberText}>{number}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Función auxiliar para obtener el valor del color
  const getColorValue = (colorName) => {
    if (!colorName) return '#6B7280';
    
    const normalizedColor = colorName.toLowerCase().trim();
    
    const colorMap = {
      'rojo': '#DC2626',
      'red': '#DC2626',
      'azul': '#2563EB',
      'blue': '#2563EB', 
      'amarillo': '#FACC15',
      'yellow': '#FACC15',
      'verde': '#16A34A',
      'green': '#16A34A',
      'naranja': '#FF9900',
      'orange': '#FF9900',
      'blanco': '#FFFFFF',
      'white': '#FFFFFF',
      'negro': '#000000',
      'black': '#000000'
    };
    
    console.log("🎨 Obteniendo color para:", colorName, "→", colorMap[normalizedColor] || '#6B7280');
    return colorMap[normalizedColor] || '#6B7280';
  };

  // Función auxiliar para obtener patrones
  const getPatternStyle = (colorName) => {
    if (!colorName) return null;
    
    const normalizedColor = colorName.toLowerCase();
    
    if (normalizedColor.includes('rayas negras') || normalizedColor.includes('black_stripes')) {
      return 'repeating-linear-gradient(90deg, #000000 0px, #000000 12px, #FFFFFF 12px, #FFFFFF 24px)';
    }
    if (normalizedColor.includes('rayas rojas') || normalizedColor.includes('red_stripes')) {
      return 'repeating-linear-gradient(90deg, #DC2626 0px, #DC2626 12px, #FFFFFF 12px, #FFFFFF 24px)';
    }
    
    console.log("🎨 Patrón para:", colorName, "→", null);
    return null;
  };

  // Función auxiliar para obtener la imagen del símbolo
  const getSymbolImage = (symbolId) => {
    console.log("🔍 Buscando símbolo:", symbolId);
    
    if (!symbolId || symbolId === 'no_symbol') {
      return null;
    }
    
    // Buscar el símbolo en los datos disponibles
    const symbolData = availableSymbols.find(symbol => symbol.id === symbolId);
    
    if (symbolData && symbolData.path) {
      console.log("✅ Símbolo encontrado:", symbolData.name, "Path:", symbolData.path);
      return symbolData.path;
    }
    
    console.warn(`⚠️ Símbolo no encontrado: ${symbolId}`);
    return null;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <CheckCircle size={32} className={styles.checkIcon} />
            <div>
              <h2>Respuestas Correctas</h2>
              <p>Pregunta {roundIndex} de {totalQuestions}</p>
            </div>
          </div>
          
          <div className={styles.timer}>
            <Clock size={20} />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Respuestas de jugadores */}
        <div className={styles.answersGrid}>
          {playerAnswers.map((playerAnswer, index) => (
            <div key={`${playerAnswer.playerId}-${index}`} className={styles.answerCard}>
              {/* Info del jugador */}
              <div className={styles.playerInfo}>
                {playerAnswer.character?.image && (
                  <img 
                    src={playerAnswer.character.image} 
                    alt={playerAnswer.character.name}
                    className={styles.playerAvatar}
                  />
                )}
                <div className={styles.playerDetails}>
                  <h4>{playerAnswer.username}</h4>
                  <p>{playerAnswer.character?.name || 'Sin personaje'}</p>
                </div>
              </div>

              {/* Pregunta del jugador */}
              <div className={styles.questionSection}>
                <h5 className={styles.questionTitle}>
                  <Target size={16} />
                  {playerAnswer.question.title}
                </h5>
                
                {/* Respuesta correcta visual */}
                {renderCorrectPictogram(playerAnswer.question.correctAnswer)}
                
                {/* Detalles de la respuesta */}
                <div className={styles.answerDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Pictograma:</span>
                    <span className={styles.detailValue}>
                      {playerAnswer.question.correctAnswer.pictogram || 'Ninguno'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Colores:</span>
                    <span className={styles.detailValue}>
                      {playerAnswer.question.correctAnswer.colors?.join(', ') || 'Ninguno'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Número:</span>
                    <span className={styles.detailValue}>
                      {playerAnswer.question.correctAnswer.number || 'Ninguno'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <Users size={16} />
            <span>{playerAnswers.length} jugadores</span>
          </div>
          <p className={styles.nextMessage}>
            Preparando siguiente pregunta...
          </p>
        </div>
      </div>
    </div>
  );
}