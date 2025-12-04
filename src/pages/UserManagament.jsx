import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { User, Search, Edit2, Ticket, Calendar, CreditCard, X, Trash2 } from 'lucide-react';

// -----------------------------------------------------------------------------
// CONFIGURAÇÃO FIREBASE (INLINE PARA VISUALIZAÇÃO)
// -----------------------------------------------------------------------------
// ⚠️ NO SEU PROJETO LOCAL: Use o import limpo: import { db } from '../config/firebase';

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: 'AIzaSyAtsPRF3LpBHxSJ86y6jwJDIdfxBsGdeJ0',
  appId: '1:657425286496:web:6f96ca895db0f1bf9cca05',
  messagingSenderId: '657425286496',
  projectId: 'cinepasse-51665',
  authDomain: 'cinepasse-51665.firebaseapp.com',
  storageBucket: 'cinepasse-51665.firebasestorage.app',
  measurementId: 'G-4W5QB205TQ',
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  // Ignora se já estiver inicializado
}
const db = getFirestore(app);
// -----------------------------------------------------------------------------

// --- ANIMAÇÕES ---
const slideUp = keyframes` from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } `;
const fadeIn = keyframes` from { opacity: 0; } to { opacity: 1; } `;

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
  @media (min-width: 768px) { flex-direction: row; justify-content: space-between; align-items: center; }
`;

const TitleGroup = styled.div`
  h2 { font-size: 1.875rem; font-weight: 700; color: white; margin-bottom: 0.25rem; }
  p { color: #9ca3af; font-size: 0.875rem; }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  width: 100%;
  @media (min-width: 640px) { width: auto; }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  svg { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #6b7280; }
  &:focus-within svg { color: var(--primary); }
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background-color: #0a0a0a;
  border: 1px solid #333;
  border-radius: 0.5rem;
  color: white;
  width: 100%;
  outline: none;
  &:focus { border-color: var(--primary); }
  @media (min-width: 640px) { width: 20rem; }
`;

const TableContainer = styled.div`
  background-color: #111;
  border-radius: 0.75rem;
  border: 1px solid #333;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  th { background-color: rgba(0,0,0,0.4); padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; }
  td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #1f1f1f; color: #d1d5db; font-size: 0.875rem; }
  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover { background-color: rgba(255, 255, 255, 0.02); }
    
    /* Permite selecionar a linha para o modal */
    &.user-row { cursor: pointer; }
  }
`;

const PlanBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid;

  ${props => {
    if (props.$plan === 'Passe Premium') return css`background: rgba(234, 179, 8, 0.1); color: #fbbf24; border-color: rgba(234, 179, 8, 0.2);`;
    if (props.$plan === 'Família') return css`background: rgba(168, 85, 247, 0.1); color: #c084fc; border-color: rgba(168, 85, 247, 0.2);`;
    return css`background: #1f2937; color: #9ca3af; border-color: #374151;`; // Gratuito
  }}
`;

// --- MODAL DE DETALHES ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.85);
  backdrop-filter: blur(5px);
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalCard = styled.div`
  background-color: #111;
  border: 1px solid #333;
  border-radius: 1rem;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 { font-size: 1.25rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.5rem; }
  button { background: transparent; border: none; color: #6b7280; cursor: pointer; &:hover { color: white; } }
`;

const ModalBody = styled.div`
  padding: 0;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) { grid-template-columns: 350px 1fr; min-height: 500px; }
`;

const SidebarInfo = styled.div`
  background-color: #0a0a0a;
  padding: 2rem;
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  min-height: 500px;
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #222;
    padding-bottom: 1rem;
  }
`;

const ContentInfo = styled.div`
  padding: 2rem;
  background-color: #111;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const InfoGroup = styled.div`
  label { display: block; font-size: 0.75rem; color: #6b7280; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem; }
  p, input, select { 
    width: 100%;
    background: #161616;
    border: 1px solid #333;
    padding: 0.75rem;
    border-radius: 0.5rem;
    color: white;
    font-size: 0.9rem;
  }
  input:focus, select:focus { outline: none; border-color: var(--primary); background: #0a0a0a; }
`;

const HistorySection = styled.div`
  flex: 1;
  background-color: #0a0a0a;
  border-radius: 0.75rem;
  border: 1px solid #333;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  
  h4 { font-size: 0.9rem; color: #9ca3af; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
`;

const TicketHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem 0;
`;

const TicketItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #222;
  
  &:last-child { border-bottom: none; }
  
  .movie { font-weight: 600; color: white; font-size: 0.9rem; }
  .date { font-size: 0.75rem; color: #6b7280; display: flex; align-items: center; gap: 0.25rem; }
  .status { font-size: 0.7rem; font-weight: 700; }
  
  .approved { color: #4ade80; }
  .pending { color: #facc15; }
  .rejected { color: #ef4444; }
`;

const ActionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DeleteTableButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary);
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 0.5rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(255, 45, 85, 0.3);
  
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 45, 85, 0.4); }
`;

// --- COMPONENTE PRINCIPAL ---

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Carregar Usuários
  useEffect(() => {
    if (!db) { setLoading(false); return; }
    
    const unsub = onSnapshot(collection(db, "users"), 
      (snap) => {
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Erro users:", error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // 2. Carregar Histórico
  useEffect(() => {
    if (!selectedUser?.id) {
      setUserHistory([]);
      return;
    }

    // Query para buscar histórico ordenado (Exige índice composto no Firebase)
    try {
      const q = query(
        collection(db, "tickets"), 
        where("usuarioId", "==", selectedUser.id),
        orderBy("dataCriacao", "desc")
      );

      const unsub = onSnapshot(q, (snap) => {
        setUserHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (e) => {
        console.warn("Índice faltando. Fallback sem ordenação...");
        const qFallback = query(collection(db, "tickets"), where("usuarioId", "==", selectedUser.id));
        onSnapshot(qFallback, (snap) => setUserHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
      });
      
      return () => unsub && unsub();
    } catch (e) {}
  }, [selectedUser?.id]);

  // 3. Atualizar/Editar Usuário
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if(!selectedUser) return;

    try {
      await updateDoc(doc(db, "users", selectedUser.id), {
        nome: selectedUser.nome,
        idade: parseInt(selectedUser.idade),
        planoAtual: selectedUser.planoAtual,
        isAdmin: selectedUser.isAdmin || false
      });
      alert("Usuário atualizado com sucesso!");
      setSelectedUser(null);
    } catch (error) {
      alert("Erro ao atualizar. Verifique permissões.");
    }
  };
  
  // 4. Deletar Usuário
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`ATENÇÃO: Deseja realmente DELETAR o usuário ${userName}? Isso é irreversível e removerá todos os dados do Firestore.`)) return;

    try {
      // Deleta o documento do perfil no Firestore
      await deleteDoc(doc(db, "users", userId));
      
      // NOTA: A conta de autenticação do Firebase (Auth) precisaria ser deletada via Cloud Functions ou Admin SDK.

      alert(`Usuário ${userName} foi removido do Firestore.`);
      setSelectedUser(null);
    } catch (error) {
      alert("Erro ao deletar. Verifique as Regras de Segurança do Firestore.");
    }
  };


  const filteredUsers = users.filter(u => 
    (u.nome && u.nome.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.cpf && u.cpf.includes(searchTerm))
  );

  if (loading) return <div style={{color:'#666', textAlign:'center', marginTop:'4rem'}}>Carregando usuários...</div>;

  return (
    <Container>
      <Header>
        <TitleGroup>
          <h2>Gestão de Usuários</h2>
          <p>Consulte dados, planos e histórico de compras.</p>
        </TitleGroup>
        <FilterGroup>
          <InputWrapper>
            <Search size={18} />
            <SearchInput 
              placeholder="Buscar por nome, email ou CPF..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </InputWrapper>
        </FilterGroup>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Nome / Email</th>
              <th>CPF</th>
              <th>Idade</th>
              <th>Plano</th>
              <th>Permissão</th>
              <th style={{textAlign:'right'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              // Ao clicar na linha, abre o modal
              <tr key={user.id} onClick={() => setSelectedUser(user)} className="user-row">
                <td>
                  <div style={{fontWeight: 600, color: 'white'}}>{user.nome || 'Sem Nome'}</div>
                  <div style={{fontSize:'0.75rem', color:'#6b7280'}}>{user.email}</div>
                </td>
                <td>{user.cpf || '---'}</td>
                <td>{user.idade || '-'}</td>
                <td>
                  <PlanBadge $plan={user.planoAtual}>
                    {user.planoAtual === 'Passe Premium' && <CreditCard size={10} />}
                    {user.planoAtual || 'Gratuito'}
                  </PlanBadge>
                </td>
                <td>
                   {user.isAdmin 
                     ? <span style={{color:'#818cf8', fontSize:'0.75rem', fontWeight:700}}>ADMIN</span>
                     : <span style={{color:'#4ade80', fontSize:'0.75rem'}}>Cliente</span>
                   }
                </td>
                <td style={{textAlign:'right'}}>
                  <Edit2 size={16} style={{color:'#6b7280', verticalAlign:'middle'}} />
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
               <tr><td colSpan="6" style={{textAlign:'center', padding:'3rem', color:'#555'}}>Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* MODAL DE DETALHES */}
      {selectedUser && (
        <ModalOverlay onClick={() => setSelectedUser(null)}>
          <ModalCard onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3><User size={20} /> Detalhes do Cliente</h3>
              <button onClick={() => setSelectedUser(null)}><X size={24} /></button>
            </ModalHeader>
            
            <ModalBody>
              {/* Lado Esquerdo: Dados Pessoais */}
              <form onSubmit={handleUpdateUser}>
                <SidebarInfo>
                  <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem'}}>
                    <div style={{width:'64px', height:'64px', borderRadius:'50%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold', color:'#666'}}>
                      {selectedUser.nome?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{fontSize:'1.25rem', fontWeight:700, color:'white'}}>{selectedUser.nome}</div>
                      <div style={{color:'#6b7280', fontSize:'0.85rem'}}>ID: {selectedUser.id.slice(0,8)}...</div>
                    </div>
                  </div>
                  
                  <ActionGroup>
                    {/* Botão de Excluir */}
                    <DeleteTableButton 
                      onClick={() => handleDeleteUser(selectedUser.id, selectedUser.nome)}
                      type="button" // Previne submissão do form
                    >
                      <Trash2 size={16} /> EXCLUIR ESTE USUÁRIO
                    </DeleteTableButton>
                  </ActionGroup>

                  <InfoGroup>
                    <label>Nome Completo</label>
                    <input value={selectedUser.nome} onChange={e => setSelectedUser({...selectedUser, nome: e.target.value})} />
                  </InfoGroup>

                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    <InfoGroup>
                      <label>CPF</label>
                      <input value={selectedUser.cpf} disabled />
                    </InfoGroup>
                    <InfoGroup>
                      <label>Idade</label>
                      <input type="number" value={selectedUser.idade} onChange={e => setSelectedUser({...selectedUser, idade: e.target.value})} />
                    </InfoGroup>
                  </div>

                  <InfoGroup>
                    <label>Plano Atual</label>
                    <select 
                      value={selectedUser.planoAtual || 'Nenhum'} 
                      onChange={e => setSelectedUser({...selectedUser, planoAtual: e.target.value})}
                    >
                      <option value="Nenhum">Gratuito (Sem Plano)</option>
                      <option value="Passe Premium">Passe Premium</option>
                      <option value="Família">Plano Família</option>
                    </select>
                  </InfoGroup>

                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.5rem'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedUser.isAdmin || false} 
                      onChange={e => setSelectedUser({...selectedUser, isAdmin: e.target.checked})}
                      style={{width:'1.2rem', height:'1.2rem'}}
                    />
                    <label style={{marginBottom:0, color:'white', textTransform:'none', fontSize:'0.9rem'}}>Acesso Administrativo</label>
                  </div>

                  <SaveButton type="submit">Salvar Alterações</SaveButton>
                </SidebarInfo>
              </form>

              {/* Coluna Direita: Histórico */}
              <ContentInfo>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <h4 style={{fontSize:'1rem', fontWeight:700, color:'white', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                    <Ticket size={18} className="text-primary" /> Histórico de Ingressos
                  </h4>
                  <span style={{color:'#6b7280', fontSize:'0.75rem'}}>{userHistory.length} tickets</span>
                </div>
                
                <TicketHistoryList>
                  {userHistory.length === 0 ? (
                    <div style={{textAlign:'center', padding:'3rem', color:'#444', border:'2px dashed #222', borderRadius:'0.75rem', marginTop:'1rem'}}>
                      <p>Nenhuma compra registrada.</p>
                    </div>
                  ) : (
                    userHistory.map(ticket => (
                      <TicketItem key={ticket.id}>
                        <div>
                          <div className="movie">{ticket.movieTitle || ticket.filmeId}</div>
                          <span>
                            <Calendar size={12} /> 
                            {ticket.dataSessao?.seconds 
                              ? new Date(ticket.dataSessao.seconds * 1000).toLocaleDateString('pt-BR')
                              : 'Data N/A'
                            }
                          </span>
                        </div>
                        <div className={`status ${ticket.statusAprovacao === 'Aprovado' ? 'approved' : ticket.statusAprovacao === 'Rejeitado' ? 'rejected' : 'pending'}`}>
                          {ticket.statusAprovacao}
                        </div>
                      </TicketItem>
                    ))
                  )}
                </TicketHistoryList>
              </ContentInfo>
            </ModalBody>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default UsersManagement;