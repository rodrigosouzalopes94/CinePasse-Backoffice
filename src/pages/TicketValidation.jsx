import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { CheckCircle, XCircle, Search, Filter, Ticket, Clock, User } from 'lucide-react';

// ✅ IMPORTAÇÃO CORRETA (Para seu projeto local)
import { db } from '../config/firebase';

// --- ANIMAÇÕES ---

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- STYLED COMPONENTS ---

const Container = styled.div`
  animation: ${slideUp} 0.6s ease-out;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
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
    align-items: center;
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
    font-size: 0.875rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;

  @media (min-width: 640px) {
    flex-direction: row;
    width: auto;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    transition: color 0.3s;
    pointer-events: none;
  }

  &:focus-within svg {
    color: var(--primary);
  }
`;

const StyledInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background-color: #0a0a0a;
  border: 1px solid #333;
  border-radius: 0.5rem;
  color: white;
  width: 100%;
  outline: none;
  transition: all 0.3s;
  font-size: 0.875rem;

  &:focus {
    border-color: var(--primary);
  }
  
  &::placeholder {
    color: #4b5563;
  }

  @media (min-width: 640px) {
    width: 18rem;
  }
`;

const StyledSelect = styled.select`
  padding: 0.75rem 2.5rem 0.75rem 2.5rem;
  background-color: #0a0a0a;
  border: 1px solid #333;
  border-radius: 0.5rem;
  color: white;
  width: 100%;
  outline: none;
  cursor: pointer;
  appearance: none; 
  transition: all 0.3s;
  font-size: 0.875rem;

  &:focus {
    border-color: var(--primary);
  }

  @media (min-width: 640px) {
    width: auto;
    min-width: 10rem;
  }
`;

const TableContainer = styled.div`
  background-color: #111;
  border-radius: 0.75rem;
  border: 1px solid #333;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    background-color: rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid #333;
    padding: 1rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  td {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #1f1f1f;
    color: #d1d5db;
    font-size: 0.875rem;
    vertical-align: middle;
  }

  tbody tr {
    transition: background-color 0.2s;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.02);
    }

    &:last-child td {
      border-bottom: none;
    }
  }
`;

const InfoCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  .primary {
    font-weight: 600;
    color: white;
    font-size: 0.95rem;
  }

  .secondary {
    color: #6b7280;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
`;

const Tag = styled.span`
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  border: 1px solid;

  ${props => props.$isSubscription ? css`
    background-color: rgba(139, 92, 246, 0.1);
    color: #a78bfa;
    border-color: rgba(139, 92, 246, 0.2);
  ` : css`
    background-color: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.2);
  `}
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid;
  text-transform: uppercase;
  letter-spacing: 0.025em;

  ${props => {
    switch (props.$status) {
      case 'Pendente':
        return css`background: rgba(234, 179, 8, 0.1); color: #facc15; border-color: rgba(234, 179, 8, 0.2);`;
      case 'Aprovado':
        return css`background: rgba(34, 197, 94, 0.1); color: #4ade80; border-color: rgba(34, 197, 94, 0.2);`;
      case 'Rejeitado':
        return css`background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2);`;
      default:
        return css`background: #1f2937; color: #9ca3af; border-color: #374151;`;
    }
  }}
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid;
  background-color: transparent;
  transition: all 0.2s;
  margin-left: 0.5rem;
  cursor: pointer;

  ${props => props.$variant === 'approve' ? css`
    color: #22c55e; 
    border-color: rgba(34, 197, 94, 0.3); 
    background: rgba(34, 197, 94, 0.05);
    
    &:hover { 
      background: #22c55e; 
      color: white; 
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
    }
  ` : css`
    color: #ef4444; 
    border-color: rgba(239, 68, 68, 0.3); 
    background: rgba(239, 68, 68, 0.05);
    
    &:hover { 
      background: #ef4444; 
      color: white; 
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }
  `}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.3;
  }
  
  p {
    font-size: 1rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16rem;
  color: #6b7280;
  gap: 0.75rem;
  
  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// --- COMPONENTE PRINCIPAL ---

const TicketValidation = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [usersMap, setUsersMap] = useState({});


  useEffect(() => {
    // Verificação de segurança para evitar crash se o db não carregar
    if (!db) {
      setLoading(false);
      return;
    }

    // Ordena do mais recente para o mais antigo
    const q = query(collection(db, "tickets"), orderBy("dataCriacao", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsData);

      ticketsData.forEach(async (ticket) => {
        if (ticket.usuarioId && !usersMap[ticket.usuarioId]) {
          const userRef = doc(db, "users", ticket.usuarioId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUsersMap(prev => ({
              ...prev,
              [ticket.usuarioId]: userSnap.data().nome
            }));
          }
        }
      });
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar tickets:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatus = async (id, newStatus) => {
    const action = newStatus === 'Aprovado' ? 'aprovar' : 'rejeitar';
    if (!confirm(`Tem certeza que deseja ${action} este ticket?`)) return;

    try {
      const ticketRef = doc(db, "tickets", id);
      await updateDoc(ticketRef, { statusAprovacao: newStatus });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro: Permissão negada. Verifique se você está logado com a conta Admin.");
    }
  };

  // Lógica de Filtragem (Frontend)
  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      (ticket.movieTitle && ticket.movieTitle.toLowerCase().includes(searchLower)) ||
      (ticket.usuarioId && ticket.usuarioId.toLowerCase().includes(searchLower)) ||
      (ticket.codigoCompra && ticket.codigoCompra.toLowerCase().includes(searchLower));

    const matchesFilter = filterStatus === 'Todos' || ticket.statusAprovacao === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <LoadingState>
        <Ticket size={24} /> Carregando tickets...
      </LoadingState>
    );
  }

  return (
    <Container>
      <Header>
        <TitleGroup>
          <h2>Validação de Tickets</h2>
          <p>Gerencie e aprove as solicitações de reserva.</p>
        </TitleGroup>

        <FilterGroup>
          <InputWrapper>
            <Search size={18} />
            <StyledInput
              type="text"
              placeholder="Buscar código, filme ou UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputWrapper>

          <InputWrapper>
            <Filter size={18} />
            <StyledSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Todos">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Rejeitado">Rejeitado</option>
            </StyledSelect>
          </InputWrapper>
        </FilterGroup>
      </Header>

      <TableContainer>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>Filme / Sessão</th>
                <th>Cliente</th>
                <th>Tipo / Código</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <InfoCell>
                      <span className="primary">{ticket.movieTitle || "Filme Desconhecido"}</span>
                      <span className="secondary">
                        <Clock size={12} />
                        {ticket.dataSessao?.seconds
                          ? new Date(ticket.dataSessao.seconds * 1000).toLocaleDateString('pt-BR')
                          : 'Data N/A'
                        }
                        {ticket.sessionTime && ` • ${ticket.sessionTime}`}
                      </span>
                    </InfoCell>
                  </td>

                  <td>
                    <InfoCell>
                      <span className="primary" style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        {usersMap[ticket.usuarioId] || 'Carregando...'}
                      </span>
                      <span className="secondary">
                        <User size={12} /> Cliente
                      </span>
                    </InfoCell>
                  </td>

                  <td>
                    <Tag $isSubscription={ticket.tipoReserva === 'Plano Assinatura'}>
                      {ticket.ticketType || ticket.tipoReserva || 'Reserva Normal'}
                    </Tag>
                    <div style={{ fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {ticket.codigoCompra || ticket.code || '---'}
                    </div>
                  </td>

                  <td>
                    <Badge $status={ticket.statusAprovacao}>
                      {ticket.statusAprovacao}
                    </Badge>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    {ticket.statusAprovacao === 'Pendente' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <ActionButton
                          $variant="approve"
                          onClick={() => handleStatus(ticket.id, 'Aprovado')}
                          title="Aprovar Reserva"
                        >
                          <CheckCircle size={18} />
                        </ActionButton>
                        <ActionButton
                          $variant="reject"
                          onClick={() => handleStatus(ticket.id, 'Rejeitado')}
                          title="Rejeitar Reserva"
                        >
                          <XCircle size={18} />
                        </ActionButton>
                      </div>
                    ) : (
                      <span style={{ color: '#4b5563', fontSize: '0.75rem', fontStyle: 'italic', paddingRight: '0.5rem' }}>
                        Processado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {filteredTickets.length === 0 && (
            <EmptyState>
              <Ticket size={48} />
              <p>Nenhum ticket encontrado com os filtros atuais.</p>
            </EmptyState>
          )}
        </TableWrapper>
      </TableContainer>
    </Container>
  );
};

export default TicketValidation;