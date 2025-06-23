import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2, Users, Zap, Trophy, Play, ArrowRight } from "lucide-react";
import styles from "./Home.module.css";
import logo from "../../assets/images/logo.png";

export default function Home() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmitPin = () => {
    if (!pin.trim()) {
      alert("Por favor, ingresa un PIN válido.");
      return;
    }
    setIsLoading(true);
    localStorage.setItem("gamePin", pin);
    
    // Simular carga y navegar
    setTimeout(() => {
      setIsLoading(false);
      navigate("/join");
    }, 1000);
  };

  const handleCreateGame = () => {
    navigate("/admin");
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
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                className={styles.pinInput}
                maxLength="8"
                onKeyDown={(e) => e.key === "Enter" && handleSubmitPin()}
              />
              <button 
                onClick={handleSubmitPin}
                disabled={isLoading || !pin.trim()}
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
    </div>
  );
}