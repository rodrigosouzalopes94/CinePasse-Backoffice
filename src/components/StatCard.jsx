import React from 'react';
import styled from 'styled-components';

// Container Principal do Card
const CardContainer = styled.div`
  background-color: #111; /* Cor de fundo do card (bg-dark-light aproximado) */
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
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  }
`;

// Wrapper do Ícone com Cores Dinâmicas
// Recebe a prop $colorType (com $ para indicar que é prop de estilo e não passar pro DOM)
const IconWrapper = styled.div`
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Lógica de Cores de Fundo */
  background-color: ${props => {
    switch(props.$colorType) {
      case 'blue': return 'rgba(59, 130, 246, 0.1)';   // Azul transparente
      case 'orange': return 'rgba(249, 115, 22, 0.1)'; // Laranja transparente
      case 'purple': return 'rgba(168, 85, 247, 0.1)'; // Roxo transparente
      case 'green': return 'rgba(34, 197, 94, 0.1)';   // Verde transparente
      default: return 'rgba(107, 114, 128, 0.1)';      // Cinza padrão
    }
  }};
  
  /* Lógica de Cores do Ícone */
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

// Área de Conteúdo (Texto)
const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;
  color: #9ca3af; /* text-gray-400 */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const Value = styled.p`
  font-size: 1.875rem; /* text-3xl */
  font-weight: 700;
  color: white;
  line-height: 1;
`;

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <CardContainer>
      {/* Passamos a prop com $ para o styled-component */}
      <IconWrapper $colorType={color}>
        <Icon size={32} />
      </IconWrapper>
      <Content>
        <Title>{title}</Title>
        <Value>{value}</Value>
      </Content>
    </CardContainer>
  );
};

export default StatCard;