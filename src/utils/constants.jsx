
export const MENU_ITEMS = [
  { id: 'my_games', label: 'Mis Juegos', icon: '🎮' },
  { id: 'analytics', label: 'Analíticas', icon: '📈' },
];

export const HOME_SECTION_DATA = {
  title: "¡Bienvenido a tu Dashboard!",
  description: "Aquí puedes gestionar tus juegos, acceder a tus estadísticas y mucho más. Explora las opciones a continuación para empezar.",
  buttons: [
    { label: "Crear Nuevo Juego", icon: "❤️", gradient: "linear-gradient(to right, #6A11CB, #2575FC)", onClick: () => console.log('Crear Juego clicked from Home data') },
    { label: "Ver Mis Juegos", icon: "📚", gradient: "linear-gradient(to right, #FFC700, #FF9C00)", onClick: () => console.log('Ver Mis Juegos clicked from Home data') }
  ],
  cards: [
    { title: "Juegos Creados", description: "Revisa el estado actual de todos tus juegos y su rendimiento.", color: "#3B82F6" },
    { title: "Jugadores Activos", description: "Monitorea la actividad de los jugadores en tiempo real en tus partidas.", color: "#10B981" },
    { title: "Últimas Partidas", description: "Accede rápidamente a los resultados y resúmenes de tus partidas más recientes.", color: "#EF4444" }
  ],
  tutorialLink: true,
};

export const JOIN_GAME_SECTION_DATA = {
  buttons: [
    // El botón 'Unirse'
    { label: "Unirse", icon: "➡️", onClick: () => console.log('Botón Unirse clickeado desde JOIN_GAME_SECTION_DATA') }
  ],

  tutorialLink: true, // Puedes decidir si quieres un tutorial para unirse
};

export const GAME_SECTION_DATA = {
    title: "Mis Juegos",
    description: "Aquí encontrarás todos los juegos que has creado, organizado por categorías y estado.",
    buttons: [
        { label: "Buscar Juego", icon: "🔍", gradient: "linear-gradient(to right, #FF7B00, #FF007F)", onClick: () => console.log('Buscar Juego') },
        { label: "Importar Juego", icon: "📥", gradient: "linear-gradient(to right, #00C9FF, #92FE9D)", onClick: () => console.log('Importar Juego') }
    ],
    cards: [
        { title: "Juego de Preguntas: Trivia Fun", description: "Un divertido juego de trivial para amigos y familia con temas variados.", color: "#6A11CB" },
        { title: "Aventura Interactiva: El Bosque Encantado", description: "Elige tu propia historia y explora misterios en un bosque mágico.", color: "#2575FC" },
        { title: "Reto Matemático: Suma y Sigue", description: "Pon a prueba tus habilidades numéricas con desafíos progresivos.", color: "#FFC700" }
    ],
    tutorialLink: false,
};

export const ANALYTICS_SECTION_DATA = {
    title: "Analíticas Detalladas",
    description: "Obtén información profunda sobre el rendimiento de tus juegos y el comportamiento de los jugadores.",
    buttons: [
        { label: "Generar Reporte", icon: "📄", gradient: "linear-gradient(to right, #3A5FCD, #007FFF)", onClick: () => console.log('Generar Reporte') },
        { label: "Exportar Datos", icon: "📤", gradient: "linear-gradient(to right, #20B2AA, #00CED1)", onClick: () => console.log('Exportar Datos') }
    ],
    cards: [
        { title: "Rendimiento Global", description: "Métricas generales de uso y engagement de todos tus juegos.", color: "#4CAF50" },
        { title: "Demografía de Jugadores", description: "Conoce a tu audiencia y sus patrones de juego.", color: "#FF9800" },
        { title: "Embudo de Conversión", description: "Visualiza el flujo de jugadores desde el inicio hasta el final.", color: "#7B1FA2" }
    ],
    tutorialLink: true,
};

// Puedes añadir más objetos de datos para otras secciones aquí, siguiendo la misma estructura.
// Por ejemplo, para 'settings', 'help', etc.