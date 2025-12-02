import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from '../config/firebase'; // Certifique-se de que este arquivo existe
import { Plus, Trash2, X, Film, Star, Clock, AlertCircle } from 'lucide-react';

// --- ANIMAÇÕES ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- STYLED COMPONENTS ---

const Container = styled.div`
  animation: ${slideUp} 0.6s ease-out;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #333;

  @media (min-width: 640px) {
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

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 700;
  color: white;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;

  /* Estilo condicional para botão "Cancelar" (cinza) ou "Adicionar" (rosa) */
  ${props => props.$isAdding ? css`
    background-color: #374151;
    &:hover { background-color: #4b5563; }
  ` : css`
    background-color: var(--primary);
    box-shadow: 0 4px 14px 0 rgba(255, 45, 85, 0.39);
    &:hover { background-color: var(--primary-dark); transform: translateY(-1px); }
  `}
`;

// --- FORMULÁRIO (MODAL INLINE) ---

const FormContainer = styled.div`
  background-color: #111;
  border: 1px solid #333;
  border-radius: 0.75rem;
  padding: 1.5rem;
  animation: ${slideDown} 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const FormHeader = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg { color: var(--primary); }
`;

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  
  /* Ocupa 2 colunas se tiver a prop $fullWidth */
  grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  width: 100%;
  background-color: var(--bg-dark);
  border: 1px solid #333;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  outline: none;
  transition: all 0.2s;

  &::placeholder { color: #4b5563; }
  &:focus { border-color: var(--primary); }
`;

const Select = styled.select`
  width: 100%;
  background-color: var(--bg-dark);
  border: 1px solid #333;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  outline: none;
  cursor: pointer;
  &:focus { border-color: var(--primary); }
`;

const TextArea = styled.textarea`
  width: 100%;
  background-color: var(--bg-dark);
  border: 1px solid #333;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  outline: none;
  resize: vertical;
  min-height: 80px;
  &:focus { border-color: var(--primary); }
`;

const SubmitButton = styled.button`
  grid-column: 1 / -1;
  padding: 1rem;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(255, 45, 85, 0.4);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(255, 45, 85, 0.6);
  }
`;

// --- MOVIE CARD ---

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 1024px) { grid-template-columns: repeat(3, 1fr); }
  @media (min-width: 1280px) { grid-template-columns: repeat(4, 1fr); }
`;

const MovieCardContainer = styled.div`
  background-color: #111;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #333;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    border-color: #555;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    
    /* Revela o botão de delete */
    .delete-overlay { opacity: 1; }
    /* Zoom na imagem */
    img { transform: scale(1.1); }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 16rem;
  overflow: hidden;
`;

const PosterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  opacity: 0.9;
`;

const RatingBadge = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  color: #facc15; /* yellow-400 */
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const DeleteOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const DeleteButton = styled.button`
  background-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 0.75rem;
  border-radius: 9999px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #ef4444;
    color: white;
    transform: scale(1.1);
  }
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const MovieTitle = styled.h3`
  font-weight: 700;
  color: white;
  font-size: 1.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
`;

const MovieGenre = styled.p`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 1rem;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #333;
`;

const Duration = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ClassificacaoBadge = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid;
  
  ${props => {
    if (props.$rating === 'Livre') return 'color: #4ade80; border-color: rgba(74, 222, 128, 0.3); background: rgba(74, 222, 128, 0.1);';
    if (props.$rating === '18') return 'color: #f87171; border-color: rgba(248, 113, 113, 0.3); background: rgba(248, 113, 113, 0.1);';
    return 'color: #facc15; border-color: rgba(250, 204, 21, 0.3); background: rgba(250, 204, 21, 0.1);';
  }}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  color: #6b7280;
  border: 2px dashed #333;
  border-radius: 1rem;
  
  p {
    font-size: 1.125rem;
    margin-top: 1rem;
  }
  
  span {
    font-size: 0.875rem;
    opacity: 0.7;
  }
`;

// --- COMPONENTE ---

const MoviesCatalog = () => {
  const [movies, setMovies] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    titulo: '',
    sinopse: '',
    imagemUrl: '',
    backdropUrl: '',
    genero: '',
    duracao: '',
    classificacao: 'Livre',
    mediaAvaliacao: 0
  });

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    const q = query(collection(db, "filmes"), orderBy("titulo"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMovies(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.titulo || !form.imagemUrl) {
      alert("Preencha pelo menos o título e a imagem.");
      return;
    }

    try {
      await addDoc(collection(db, "filmes"), {
        ...form,
        mediaAvaliacao: parseFloat(form.mediaAvaliacao),
        dataCriacao: serverTimestamp()
      });
      
      setIsAdding(false);
      setForm({ titulo: '', sinopse: '', imagemUrl: '', backdropUrl: '', genero: '', duracao: '', classificacao: 'Livre', mediaAvaliacao: 0 });
      alert("Filme adicionado!");
    } catch (error) {
      alert("Erro ao adicionar filme.");
    }
  };

  const handleDelete = async (id) => {
    if(confirm("Excluir filme permanentemente?")) {
      try {
        await deleteDoc(doc(db, "filmes", id));
      } catch (error) {
        alert("Erro ao excluir.");
      }
    }
  };

  if (loading) return <div style={{display:'flex', height:'16rem', justifyContent:'center', alignItems:'center', color:'#6b7280'}}>Carregando...</div>;

  return (
    <Container>
      <Header>
        <TitleGroup>
          <h2>Catálogo de Filmes</h2>
          <p>Gerencie os títulos disponíveis no app.</p>
        </TitleGroup>
        
        <AddButton onClick={() => setIsAdding(!isAdding)} $isAdding={isAdding}>
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancelar' : 'Adicionar Filme'}
        </AddButton>
      </Header>

      {isAdding && (
        <FormContainer>
          <FormHeader>
            <Film size={20} /> Novo Filme
          </FormHeader>
          
          <FormGrid onSubmit={handleSave}>
            {/* Coluna 1 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <InputGroup>
                <Label>Título</Label>
                <Input required placeholder="Ex: Duna" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
              </InputGroup>
              
              <InputGroup>
                <Label>Gênero</Label>
                <Input required placeholder="Ex: Ficção" value={form.genero} onChange={e => setForm({...form, genero: e.target.value})} />
              </InputGroup>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <InputGroup>
                  <Label>Duração</Label>
                  <Input placeholder="2h 30min" value={form.duracao} onChange={e => setForm({...form, duracao: e.target.value})} />
                </InputGroup>
                <InputGroup>
                  <Label>Classif.</Label>
                  <Select value={form.classificacao} onChange={e => setForm({...form, classificacao: e.target.value})}>
                    <option value="Livre">Livre</option>
                    <option value="10">10</option>
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                  </Select>
                </InputGroup>
              </div>
            </div>

            {/* Coluna 2 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <InputGroup>
                <Label>Poster URL</Label>
                <Input required placeholder="https://..." value={form.imagemUrl} onChange={e => setForm({...form, imagemUrl: e.target.value})} />
              </InputGroup>
              
              <InputGroup>
                <Label>Backdrop URL</Label>
                <Input placeholder="https://..." value={form.backdropUrl} onChange={e => setForm({...form, backdropUrl: e.target.value})} />
              </InputGroup>

              <InputGroup>
                <Label>Nota (0-5)</Label>
                <Input type="number" step="0.1" max="5" value={form.mediaAvaliacao} onChange={e => setForm({...form, mediaAvaliacao: e.target.value})} />
              </InputGroup>
            </div>

            <InputGroup $fullWidth>
              <Label>Sinopse</Label>
              <TextArea rows="3" placeholder="Descrição..." value={form.sinopse} onChange={e => setForm({...form, sinopse: e.target.value})} />
            </InputGroup>

            <SubmitButton>Salvar Filme</SubmitButton>
          </FormGrid>
        </FormContainer>
      )}

      <Grid>
        {movies.map(m => (
          <MovieCardContainer key={m.id}>
            <ImageContainer>
              <PosterImage 
                src={m.imagemUrl} 
                alt={m.titulo}
                onError={(e) => {e.target.src = 'https://placehold.co/400x600?text=Sem+Imagem'}}
              />
              <RatingBadge>
                <Star size={10} fill="currentColor" /> {m.mediaAvaliacao}
              </RatingBadge>
              <DeleteOverlay className="delete-overlay">
                <DeleteButton onClick={() => handleDelete(m.id)} title="Excluir">
                  <Trash2 size={20} />
                </DeleteButton>
              </DeleteOverlay>
            </ImageContainer>

            <CardContent>
              <MovieTitle title={m.titulo}>{m.titulo}</MovieTitle>
              <MovieGenre>{m.genero || 'Gênero não def.'}</MovieGenre>
              
              <CardFooter>
                 <Duration>
                    <Clock size={12} /> {m.duracao || '--'}
                 </Duration>
                 <ClassificacaoBadge $rating={m.classificacao}>
                   {m.classificacao}
                 </ClassificacaoBadge>
              </CardFooter>
            </CardContent>
          </MovieCardContainer>
        ))}
      </Grid>

      {movies.length === 0 && !loading && (
        <EmptyState>
          <AlertCircle size={48} style={{opacity: 0.5, marginBottom: '1rem'}} />
          <p>Nenhum filme encontrado.</p>
          <span>Clique em "Adicionar Filme" para começar.</span>
        </EmptyState>
      )}
    </Container>
  );
};

export default MoviesCatalog;