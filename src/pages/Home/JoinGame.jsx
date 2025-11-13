import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, Play, ArrowLeft, Gamepad2, Zap } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { socket, connectSocket } from "../../services/websocket/socketService";
import storage from "../../utils/storage";
import styles from "./JoinGame.module.css";

export default function JoinGame() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // NUEVO: Manejar PIN de la URL al cargar el componente
  useEffect(() => {
    const pinFromUrl = searchParams.get('pin');
    if (pinFromUrl) {
      // Guardar el PIN en storage seguro para uso posterior
      storage.setItem("gamePin", pinFromUrl);
      // Marcar que el PIN viene de un QR escaneado
      storage.setItem("pinFromQR", "true");
      console.log(`PIN obtenido de la URL (QR escaneado): ${pinFromUrl}`);
      
      // Mostrar mensaje de confirmación temporal
      setError("");
      setTimeout(() => {
        setSuccessMessage("✅ ¡QR escaneado correctamente! Ingresa tu nombre para continuar.");
        setTimeout(() => setSuccessMessage(""), 4000);
      }, 500);
    }
  }, [searchParams]);

  const handleSubmit = () => {
    // Obtener PIN desde storage seguro
    const pin = storage.getItem("gamePin", null);

    // NUEVO: Validar que existe un PIN
    if (!pin) {
      setError("No se encontró un PIN de juego válido. Por favor, escanea el código QR nuevamente o ingresa el PIN manualmente.");
      return;
    }

    if (!username.trim()) {
      setError("Por favor ingresa un nombre válido");
      return;
    }

    if (username.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    // Guardar el nombre temporalmente usando storage seguro y redirigir a selección de personajes
    storage.setItem("tempUsername", username.trim());
    
    // Limpiar el flag del QR ya que el proceso continúa
    storage.removeItem("pinFromQR");
    
    setTimeout(() => {
      setLoading(false);
      navigate("/character-selection");
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const goBack = () => {
    // Limpiar el flag del QR al salir usando storage seguro
    storage.removeItem("pinFromQR");
    navigate("/");
  };

  // Obtener PIN del juego desde storage seguro
  const gamePin = storage.getItem("gamePin", null);

  return (
    <div className={styles.joinWrapper}>
      {/* Loading Overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingCard}>
            <div className={styles.spinner}></div>
            <h3>Conectando al juego...</h3>
            <p>Preparando tu experiencia de aprendizaje</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button className={styles.backButton} onClick={goBack}>
        <ArrowLeft size={20} />
        Volver
      </button>

      {/* Main Content */}
      <div className={styles.joinContainer}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="DOT'S GO Logo" className={styles.logo} />
          </div>
          <h1 className={styles.title}>¡Únete a la Aventura!</h1>
          <p className={styles.subtitle}>
            Ingresa tu nombre para comenzar a aprender sobre pictogramas de seguridad
          </p>
        </div>

        {/* Game Info Card */}
        <div className={styles.gameInfoCard}>
          <div className={styles.gameInfoHeader}>
            <Gamepad2 size={24} />
            <span>Información del Juego</span>
          </div>
          <div className={styles.gameInfoContent}>
            <div className={styles.pinDisplay}>
              <span className={styles.pinLabel}>PIN del Juego:</span>
              <span className={styles.pinValue}>{gamePin}</span>
              {storage.getItem("pinFromQR", null) === "true" && (
                <span className={styles.qrBadge}>📱 Escaneado</span>
              )}
            </div>
            <div className={styles.gameFeatures}>
              <div className={styles.feature}>
                <Users size={16} />
                <span>Multijugador</span>
              </div>
              <div className={styles.feature}>
                <Zap size={16} />
                <span>Tiempo Real</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className={styles.formCard}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Tu Nombre de Jugador</label>
            <div className={styles.inputContainer}>
              <Users size={20} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Ingresa tu nombre..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyPress}
                className={`${styles.usernameInput} ${error ? styles.error : ''}`}
                disabled={loading}
                maxLength="20"
                autoFocus
              />
            </div>
            {username.length > 0 && (
              <div className={styles.characterCount}>
                {username.length}/20 caracteres
              </div>
            )}
            {error && (
              <div className={styles.errorMessage}>
                <span>⚠️</span>
                {error}
              </div>
            )}
            {successMessage && (
              <div className={styles.successMessage}>
                <span>✅</span>
                {successMessage}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !username.trim() || username.trim().length < 2}
            className={styles.joinButton}
          >
            {loading ? (
              <>
                <div className={styles.buttonSpinner}></div>
                Conectando...
              </>
            ) : (
              <>
                <Play size={20} />
                Seleccionar Personaje
              </>
            )}
          </button>
        </div>

        {/* Tips Section */}
        <div className={styles.tipsSection}>
          <h4>💡 Consejos para el Juego</h4>
          <ul className={styles.tipsList}>
            <li>Arrastra colores, símbolos y números para crear pictogramas</li>
            <li>¡La velocidad y precisión te darán más puntos!</li>
            <li>Aprende los 17 pictogramas de sustancias peligrosas</li>
          </ul>
        </div>
      </div>

      {/* Floating particles animation */}
      <div className={styles.particles}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`${styles.particle} ${styles[`particle${i + 1}`]}`}></div>
        ))}
      </div>
    </div>
  );
}