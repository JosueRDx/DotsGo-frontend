import React from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Admin from "./pages/Admin/Admin";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";
import Layout from "./layouts/layout/Layout";
import Game from "./pages/Game/Game";
import JoinGame from "./pages/Home/JoinGame";
import GameResults from "./pages/GameResults/GameResults";
import CharacterSelection from './pages/CharacterSelection/CharacterSelection';
import WaitingRoom from './pages/WaitingRoom/WaitingRoom'; // NUEVA IMPORTACIÓN

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <NotFound />
  },
  {
    path: '/join',
    element: <JoinGame />
  },
  {
    path: '/character-selection',
    element: <CharacterSelection />
  },
  {
    path: '/waiting-room', // NUEVA RUTA
    element: <WaitingRoom />
  },
  {
    path: '/login',
    element: (
      <Layout>
        <Login />
      </Layout>
    )
  },
  {
    path: '/register',
    element: (
      <Layout>
        <Register/>
      </Layout>
    )
  },
  {
    path: '/admin',
    element: <Admin />
  },
  {
    path: '/game',
    element: <Game />
  },
  {
    path: '/game-results',
    element: (
      <Layout>
        <GameResults />
      </Layout>
    )
  }
]);

export default function App() { 
  return (
    <div className="App">
      <RouterProvider router={router}/>
    </div>
  );
}