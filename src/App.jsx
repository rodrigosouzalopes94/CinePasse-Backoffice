import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from './config/firebase';

// Estilos Globais
import GlobalStyles from './styles/GlobalStyles';

// Páginas
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';
import TicketValidation from './pages/TicketValidation';
import MoviesCatalog from './pages/MoviesCatalog';
import UsersManagement from './pages/UserManagament';

// Layout
import AdminLayout from './components/AdminLayout';

// Ícones para o Menu de Debug
import { Eye, Lock, LayoutGrid, Film, Ticket as TicketIcon } from 'lucide-react';

// --- STYLED COMPONENTS DO LOADING ---
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  background-color: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 4px solid rgba(255, 45, 85, 0.3);
  border-top-color: #ff2d55;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// --- COMPONENTE DE MENU FLUTUANTE (DEV TOOLS) ---
const DevMenuContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 12px;
  z-index: 9999;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;

  h4 {
    color: #6b7280;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const DevButton = styled.button`
  background: #1a1a1a;
  color: #e5e5e5;
  border: 1px solid #333;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: #ff2d55;
    color: white;
    border-color: #ff2d55;
  }

  svg { width: 14px; height: 14px; }
`;

// --- APP PRINCIPAL ---

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Só atualiza se não tivermos forçado um usuário mockado via Debug
      if (user?.isMock) return; 
      
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]); // Adicionado dependência para respeitar o mock

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  // --- FUNÇÕES DE NAVEGAÇÃO RÁPIDA (DEBUG) ---
  const goToLogin = () => {
    setUser(null);
  };

  const forcePage = (pageName) => {
    // Cria um usuário falso para "enganar" a verificação de login
    setUser({ uid: 'debug-user', email: 'dev@teste.com', isMock: true });
    setView(pageName);
  };

  // --- RENDERIZAÇÃO DO CONTEÚDO PRINCIPAL ---
  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      );
    }

    if (!user) {
      // Passa função de debug para o LoginScreen também, caso queira usar o botão de lá
      return <LoginScreen onDebugLogin={() => forcePage('dashboard')} />;
    }

    return (
      <AdminLayout 
        currentView={view} 
        onViewChange={setView} 
        onLogout={handleLogout}
      >
        {view === 'dashboard' && <Dashboard />}
        {view === 'tickets' && <TicketValidation />}
        {view === 'movies' && <MoviesCatalog />}
        {view === 'users' && <UsersManagement />}
      </AdminLayout>
    );
  };

  return (
    <>
      <GlobalStyles />
      
      {/* 1. O App Real */}
      {renderContent()}

    
    </>
  );
}

export default App;