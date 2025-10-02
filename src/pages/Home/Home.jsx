import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Users, Zap, Trophy, Play, ArrowRight } from "lucide-react";
import styles from "./Home.module.css";
import logo from "../../assets/images/logo.png";
import { socket, connectSocket } from "../../services/websocket/socketService";

const VALID_USERNAME = "fernando25";
const VALID_PASSWORD = "mineria25";

export default function Home() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const navigate = useNavigate();

  const handleCloseLogin = useCallback(() => {
    setShowLogin(false);
    setCredentials({ username: "", password: "" });
    setLoginError("");
    setIsLoginLoading(false);
  }, []);

  useEffect(() => {
    if (showLogin) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogin]);

  useEffect(() => {
    if (!showLogin) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseLogin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLogin, handleCloseLogin]);
  
  const handlePinChange = (value) => {
    const sanitizedValue = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    if (pinError) {
      setPinError("");
    }
    setPin(sanitizedValue);
  };

  const handleSubmitPin = () => {
    if (pin.length !== 6) {
      alert("El PIN debe tener 6 caracteres.");
      return;
    }
    setIsLoading(true);
    setPinError("");

    const emitValidation = () => {
      socket.emit("get-room-players", { pin }, (response) => {
        setIsLoading(false);

        if (response?.success) {
          localStorage.setItem("gamePin", pin);
          navigate("/join");
          return;
        }

        setPinError(response?.error || "PIN inválido. Verifica e intenta nuevamente.");
      });
    };

    const handleConnectionError = (error) => {
      setIsLoading(false);
      setPinError("No se pudo verificar el PIN. Intenta de nuevo más tarde.");
      console.error("Error al conectar el socket:", error);
    };

    if (socket.connected) {
      emitValidation();
      return;
    }

    const onConnect = () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      emitValidation();
    };

    const onError = (err) => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      handleConnectionError(err);
    };

    socket.once("connect", onConnect);
    socket.once("connect_error", onError);

    connectSocket();
  };

  const handleCreateGame = () => {
    setShowLogin(true);
  };

  const handleLoginChange = (field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (loginError) {
      setLoginError("");
    }
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    if (isLoginLoading) return;

    setIsLoginLoading(true);

    const isValidUser =
      credentials.username.trim().toLowerCase() === VALID_USERNAME &&
      credentials.password === VALID_PASSWORD;

    if (!isValidUser) {
      setLoginError("Credenciales incorrectas. Inténtalo nuevamente.");
      setIsLoginLoading(false);
      return;
    }

    setLoginError("");
    setTimeout(() => {
      setIsLoginLoading(false);
      handleCloseLogin();
      navigate("/admin");
    }, 400);
  };

  const features = [
    {
      icon: <Gamepad2 size={32} />,
      title: "Juegos Interactivos",
      description: "Aprende pictogramas de seguridad industrial de forma divertida y dinámica",
      color: "#10b981"
    },
    {
      icon: <Users size={32} />,
      title: "Multijugador",
      description: "Compite con amigos en tiempo real y demuestra tus conocimientos",
      color: "#6366f1"
    },
    {
      icon: <Trophy size={32} />,
      title: "Sistema de Puntos",
      description: "Gana puntos basados en velocidad y precisión para subir en el ranking",
      color: "#f59e0b"
    },
    {
      icon: <Zap size={32} />,
      title: "Respuesta Rápida",
      description: "Partidas dinámicas con tiempo limitado que pondrán a prueba tus reflejos",
      color: "#ef4444"
    }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <img src={logo} alt="DOT'S GO Logo" className={styles.headerLogo} />
          <span className={styles.headerTitle}>DOT'S GO!!</span>
        </div>
        <button className={styles.createGameBtn} onClick={handleCreateGame}>
          <Gamepad2 size={20} />
          Crear Partida
        </button>
      </header>

      {/* Hero Section */}
      <main className={styles.heroSection}>
        <div className={styles.heroContent}>
          {/* Left Side - Content */}
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>
              Aprende <span className={styles.highlight}>Seguridad Industrial</span>
              <br />
              Jugando
            </h1>
            <p className={styles.heroDescription}>
              Domina los 17 pictogramas de sustancias peligrosas en partidas multijugador 
              emocionantes. Compite, aprende y conviértete en un experto en seguridad.
            </p>
          </div>

          {/* Right Side - PIN Input Card */}
          <div className={styles.pinCard}>
            <div className={styles.pinCardHeader}>
              <Play size={24} />
              <h3>Únete a una Partida</h3>
            </div>
            
            <div className={styles.pinInputSection}>
              <input
                type="text"
                placeholder="Ingresa el PIN"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                className={`${styles.pinInput} ${pinError ? styles.pinInputError : ""}`}
                maxLength="6"
                onKeyDown={(e) => e.key === "Enter" && handleSubmitPin()}
              />
              {pinError && <p className={styles.pinErrorMessage}>{pinError}</p>}
              <button
                onClick={handleSubmitPin}
                disabled={isLoading || pin.length !== 6}
                className={`${styles.joinBtn} ${isLoading ? styles.loading : ''}`}
              >
                {isLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <>
                    Unirse
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>

            <div className={styles.pinHelp}>
            <p>¿No tienes un PIN? <span className={styles.link} onClick={handleCreateGame}>Crea una partida</span></p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>¿Por qué elegir DOT'S GO!!?</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon} style={{backgroundColor: `${feature.color}20`, color: feature.color}}>
                {feature.icon}
              </div>
              <h4 className={styles.featureTitle}>{feature.title}</h4>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>

    {/* Floating particles animation */}
    <div className={styles.particles}>
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`${styles.particle} ${styles[`particle${i + 1}`]}`}></div>
      ))}
    </div>

    {showLogin && (
      <div className={styles.loginOverlay} onClick={handleCloseLogin}>
        <div className={styles.loginModal} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className={styles.loginCloseButton}
            onClick={handleCloseLogin}
            aria-label="Cerrar formulario de inicio de sesión"
          >
            ×
          </button>
          <div className={styles.loginHeader}>
            <h2>Iniciar sesión</h2>
            <p>Solo usuarios autorizados pueden crear partidas nuevas.</p>
          </div>
          <form className={styles.loginForm} onSubmit={handleLoginSubmit}>
            <label className={styles.loginLabel} htmlFor="login-username">
              Usuario
            </label>
            <input
              id="login-username"
              type="text"
              value={credentials.username}
              onChange={(event) => handleLoginChange("username", event.target.value)}
              placeholder="Ingresa tu usuario"
              className={styles.loginInput}
              autoComplete="username"
              required
            />

            <label className={styles.loginLabel} htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={credentials.password}
              onChange={(event) => handleLoginChange("password", event.target.value)}
              placeholder="Ingresa tu contraseña"
              className={styles.loginInput}
              autoComplete="current-password"
              required
            />

            {loginError && <p className={styles.loginError}>{loginError}</p>}

            <button type="submit" className={styles.loginButton} disabled={isLoginLoading}>
              {isLoginLoading ? "Validando..." : "Acceder"}
            </button>
          </form>
        </div>
      </div>
    )}
    </div>
  );
}