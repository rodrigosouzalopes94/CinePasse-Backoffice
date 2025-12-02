import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Ticket, Clock, Film, Users, Activity } from 'lucide-react';

// -----------------------------------------------------------------------------
// 1. CONFIGURAÇÃO DO FIREBASE (Inline para evitar erro de importação)
// -----------------------------------------------------------------------------
// No seu projeto final, você pode mover isso de volta para src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: 'AIzaSyAtsPRF3LpBHxSJ86y6jwJDIdfxBsGdeJ0',
  appId: '1:657425286496:web:6f96ca895db0f1bf9cca05',
  messagingSenderId: '657425286496',
  projectId: 'cinepasse-51665',
  authDomain: 'cinepasse-51665.firebaseapp.com',
  storageBucket: 'cinepasse-51665.firebasestorage.app',
  measurementId: 'G-4W5QB205TQ',
};

// Inicialização segura (Singleton pattern simples)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  // Ignora erro se já estiver inicializado
}
const db = getFirestore(app);

// -----------------------------------------------------------------------------
// 2. COMPONENTES VISUAIS (Styled Components)
// -----------------------------------------------------------------------------

// Animações
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ping = keyframes`
  75%, 100% { transform: scale(2); opacity: 0; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Layout
const Container = styled.div`
  animation: ${slideUp} 0.7s ease-out;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  background-color: var(--bg-dark);
  min-height: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #333;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
`;

const TitleGroup = styled.div`
  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
  }
  p {
    color: #9ca3af;
    font-size: 1rem;
  }
`;

// Badge "Sistema Online"
const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4ade80;
  background-color: rgba(74, 222, 128, 0.1);
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(74, 222, 128, 0.2);
  width: fit-content;

  .indicator {
    position: relative;
    display: flex;
    height: 0.625rem;
    width: 0.625rem;
  }

  .ping {
    position: absolute;
    display: inline-flex;
    height: 100%;
    width: 100%;
    border-radius: 9999px;
    background-color: #4ade80;
    opacity: 0.75;
    animation: ${ping} 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .dot {
    position: relative;
    display: inline-flex;
    border-radius: 9999px;
    height: 0.625rem;
    width: 0.625rem;
    background-color: #22c55e;
  }
  
  span.text {
    font-weight: 500;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  height: 16rem;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  
  svg {
    margin-right: 0.5rem;
    animation: ${spin} 1s linear infinite;
  }
`;

// --- StatCard (Inline para evitar erro de import) ---
const CardContainer = styled.div`
  background-color: #111;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: #555;
    transform: translateY(-2px) scale(1.02);
  }
`;

const IconWrapper = styled.div`
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  background-color: ${props => {
    switch(props.$colorType) {
      case 'blue': return 'rgba(59, 130, 246, 0.1)';
      case 'orange': return 'rgba(249, 115, 22, 0.1)';
      case 'purple': return 'rgba(168, 85, 247, 0.1)';
      case 'green': return 'rgba(34, 197, 94, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  
  color: ${props => {
    switch(props.$colorType) {
      case 'blue': return '#3b82f6';
      case 'orange': return '#f97316';
      case 'purple': return '#a855f7';
      case 'green': return '#22c55e';
      default: return '#9ca3af';
    }
  }};
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const CardValue = styled.p`
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
  line-height: 1;
`;

const StatCard = ({ title, value, icon: Icon, color }) => (
  <CardContainer>
    <IconWrapper $colorType={color}>
      <Icon size={32} />
    </IconWrapper>
    <CardContent>
      <CardTitle>{title}</CardTitle>
      <CardValue>{value}</CardValue>
    </CardContent>
  </CardContainer>
);

// -----------------------------------------------------------------------------
// 3. LÓGICA DO DASHBOARD
// -----------------------------------------------------------------------------

const Dashboard = () => {
  const [stats, setStats] = useState({ tickets: 0, pending: 0, movies: 0, users: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listener 1: Tickets
    const unsubTickets = onSnapshot(collection(db, "tickets"), (snap) => {
      const total = snap.size;
      const pending = snap.docs.filter(d => d.data().statusAprovacao === 'Pendente').length;
      setStats(prev => ({ ...prev, tickets: total, pending }));
      setIsLoading(false);
    }, (err) => {
      console.error("Erro Tickets:", err);
      setIsLoading(false);
    });

    // Listener 2: Filmes
    const unsubMovies = onSnapshot(collection(db, "filmes"), (snap) => 
      setStats(prev => ({ ...prev, movies: snap.size }))
    );

    // Listener 3: Usuários
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => 
      setStats(prev => ({ ...prev, users: snap.size }))
    );

    return () => { unsubTickets(); unsubMovies(); unsubUsers(); };
  }, []);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Activity size={24} /> Conectando ao banco de dados...
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <TitleGroup>
          <h2>Dashboard</h2>
          <p>Visão geral do sistema em tempo real.</p>
        </TitleGroup>
        
        <StatusBadge>
          <div className="indicator">
            <span className="ping"></span>
            <span className="dot"></span>
          </div>
          <span className="text">Conectado</span>
        </StatusBadge>
      </Header>

      <Grid>
        <StatCard 
          title="Vendas Totais" 
          value={stats.tickets} 
          icon={Ticket} 
          color="blue" 
        />
        <StatCard 
          title="Pendentes" 
          value={stats.pending} 
          icon={Clock} 
          color="orange" 
        />
        <StatCard 
          title="Filmes Ativos" 
          value={stats.movies} 
          icon={Film} 
          color="purple" 
        />
        <StatCard 
          title="Base Usuários" 
          value={stats.users} 
          icon={Users} 
          color="green" 
        />
      </Grid>
    </Container>
  );
};

export default Dashboard;