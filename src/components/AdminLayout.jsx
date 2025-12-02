import React from 'react';
import styled from 'styled-components';
import { LayoutDashboard, Ticket, Film, LogOut, Users } from 'lucide-react';

// --- Styled Components ---

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-dark); /* Usando variáveis globais */
`;

const Sidebar = styled.aside`
  width: 260px;
  background-color: #050505; /* Um pouco mais escuro que o bg-dark */
  border-right: 1px solid var(--border-dark);
  color: white;
  position: fixed;
  height: 100%;
  z-index: 20;
  display: none;
  flex-direction: column;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const SidebarHeader = styled.div`
  padding: 2rem 1.5rem;
  margin-bottom: 1rem;

  h1 {
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    line-height: 1.2;
    
    span.highlight { 
      color: var(--primary); 
    }
    
    span.subtitle {
      color: #6b7280;
      font-size: 0.7rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      display: block;
      margin-top: 0.25rem;
    }
  }
`;

const Nav = styled.nav`
  flex: 1;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// Botão de Navegação com props dinâmicas ($active)
const NavButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  /* Estilo Condicional baseado na prop $active */
  background-color: ${props => props.$active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#9ca3af'};
  box-shadow: ${props => props.$active ? '0 4px 12px rgba(255, 45, 85, 0.3)' : 'none'};

  &:hover {
    background-color: ${props => props.$active ? 'var(--primary-dark)' : 'rgba(255, 255, 255, 0.05)'};
    color: white;
    transform: translateX(4px);
  }

  svg {
    /* Animação sutil no ícone quando ativo */
    opacity: ${props => props.$active ? '1' : '0.7'};
  }
`;

const SidebarFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-dark);
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 0.75rem;
  padding: 0.875rem;
  color: #ef4444; /* Vermelho suave */
  background-color: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
  min-height: 100vh;
  background-color: var(--bg-dark);
  
  /* Compensa a largura da sidebar fixa em telas grandes */
  @media (min-width: 768px) {
    margin-left: 260px;
  }
`;

// --- Componente ---

const AdminLayout = ({ children, currentView, onViewChange, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tickets', label: 'Validar Tickets', icon: Ticket },
        { id: 'movies', label: 'Catálogo de Filmes', icon: Film },
        { id: 'users', label: 'Usuários', icon: Users },
    ];

    return (
        <LayoutContainer>
            <Sidebar>
                <SidebarHeader>
                    <h1>
                        CINE<span className="highlight">PASSE</span>
                        <span className="subtitle">BACKOFFICE</span>
                    </h1>
                </SidebarHeader>

                <Nav>
                    {menuItems.map(item => (
                        <NavButton
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            $active={currentView === item.id}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavButton>
                    ))}
                </Nav>

                <SidebarFooter>
                    <LogoutButton onClick={onLogout}>
                        <LogOut size={18} />
                        <span>Sair do Sistema</span>
                    </LogoutButton>
                </SidebarFooter>
            </Sidebar>

            <MainContent>
                {children}
            </MainContent>
        </LayoutContainer>
    );
};

export default AdminLayout;