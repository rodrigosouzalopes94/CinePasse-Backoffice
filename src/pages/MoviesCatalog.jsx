import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; 
import { Plus, Trash2, X, Film, Star, Clock, AlertCircle, Edit2 } from 'lucide-react';
import { db } from '../config/firebase'; // Sua conexão real

// --- ANIMAÇÕES ---

const slideDown = keyframes` from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } `;
const slideUp = keyframes` from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } `;

// --- STYLED COMPONENTS ---

const Container = styled.div`
  animation: ${slideUp} 0.6s ease-out;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
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

  ${props => props.$isAdding ? css`
    background-color: #374151;
    &:hover { background-color: #4b5563; }
  ` : css`
    background-color: var(--primary);
    box-shadow: 0 4px 14px 0 rgba(255, 45, 85, 0.39);
    &:hover { background-color: var(--primary-dark); transform: translateY(-1px); }
  `}
`;

// --- FORMULÁRIO ---

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
  
  /* Se $fullWidth for true, ocupa as 2 colunas */
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
  background-color: #0a0a0a;
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
  background-color: #0a0a0a;
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
  background-color: #0a0a0a;
  border: 1px solid #333;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: white;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  &:focus { border-color: var(--primary); }
`;

const SubmitButton = styled.button`
  width: 200px; /* Largura fixa no botão de submit */
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

const CancelButton = styled.button`
  width: 200px; /* Largura fixa no botão de cancelar */
  padding: 1rem;
  background-color: #374151;
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: #4b5563;
  }
`;

// --- GRID DE FILMES ---

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
    
    /* Revela o botão de delete e dá zoom na imagem */
    .action-overlay { opacity: 1; }
    img { transform: scale(1.1); opacity: 1; }
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
  transition: transform 0.5s ease, opacity 0.3s ease;
  opacity: 0.8;
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

const ActionOverlay = styled.div` /* Renomeado de DeleteOverlay */
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const ActionButton = styled.button`
  background-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.5);
  padding: 0.75rem;
  border-radius: 9999px;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => props.$variant === 'edit' ? css`
    background-color: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.5);
    &:hover { background-color: #3b82f6; color: white; }
  ` : css`
    background-color: rgba(239, 68, 68, 0.2);
    color: #f87171;
    &:hover { background-color: #ef4444; color: white; }
  `}

  &:hover {
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
`;

// --- COMPONENTE PRINCIPAL ---

const MoviesCatalog = () => {
  // Estado inicial do formulário vazio (para modo Adição)
  const emptyFormState = {
    titulo: '', sinopse: '', imagemUrl: '', backdropUrl: '', genero: '', duracao: '', classificacao: 'Livre', mediaAvaliacao: '0.0'
  };

  // Use um objeto para gerenciar o estado do formulário e o ID do filme
  const [movieModalState, setMovieModalState] = useState({
    isOpen: false,
    isEditing: false,
    currentMovieId: null,
    form: emptyFormState
  });

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); 
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Função que lida com a seleção do arquivo
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Função centralizada para upload no Firebase Storage
  const uploadImage = async (file) => {
    if (!file) return null;

    setUploading(true);
    // ⚠️ Importante: storage deve estar definido e exportado no seu firebase.js
    const storageInstance = getStorage(); 
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storageInstance, 'movie_posters/' + fileName);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setUploading(false);
      return url;
    } catch (error) {
      setUploading(false);
      console.error("Erro no upload do Storage:", error);
      throw new Error("Falha ao enviar imagem. Verifique as Regras do Storage.");
    }
  };


  useEffect(() => {
    // Proteção caso o db não esteja inicializado (ex: erro de config)
    if (!db) { 
      setLoading(false); 
      return; 
    }

    const q = query(collection(db, "filmes"), orderBy("titulo"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMovies(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar filmes:", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Ação de Abrir o Modal de Adição/Edição
  const openModal = (movie = null) => {
    // ⚠️ CORREÇÃO 1: Limpar o selectedFile ao abrir o modal
    setSelectedFile(null); 
    
    if (movie) {
      // Modo Edição
      setMovieModalState({
        isOpen: true,
        isEditing: true,
        currentMovieId: movie.id,
        // Converte nota para string para o input
        form: { ...movie, mediaAvaliacao: String(movie.mediaAvaliacao || 0) } 
      });
    } else {
      // Modo Adição
      setMovieModalState({
        isOpen: true,
        isEditing: false,
        currentMovieId: null,
        form: emptyFormState // ✅ USANDO O ESTADO VAZIO
      });
    }
  };

  const closeModal = () => {
    // 🚀 CORREÇÃO 2: Resetar o estado do modal para o default (adição)
    setMovieModalState({ isOpen: false, isEditing: false, currentMovieId: null, form: emptyFormState });
    setSelectedFile(null);
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    const { isEditing, currentMovieId, form } = movieModalState;
    
    if (!form.titulo) {
      alert("O título é obrigatório.");
      return;
    }
    
    let posterUrl = form.imagemUrl;

    try {
      // 1. Upload para o Firebase Storage se um arquivo foi selecionado
      if (selectedFile) {
        posterUrl = await uploadImage(selectedFile);
      } else if (!form.imagemUrl) {
         // Se não selecionou arquivo e o campo URL está vazio, usamos placeholder
         posterUrl = 'https://placehold.co/400x600?text=Sem+Imagem';
      }
      
      const dataToSave = {
        ...form,
        imagemUrl: posterUrl,
        mediaAvaliacao: parseFloat(form.mediaAvaliacao),
        backdropUrl: form.backdropUrl || null, 
      };
      
      if (isEditing) {
        // Modo EDIÇÃO
        await updateDoc(doc(db, "filmes", currentMovieId), dataToSave);
      } else {
        // Modo ADIÇÃO
        await addDoc(collection(db, "filmes"), {
          ...dataToSave,
          dataCriacao: serverTimestamp()
        });
      }
      
      closeModal();
      alert(`Filme ${isEditing ? 'atualizado' : 'adicionado'} com sucesso!`);
    } catch (error) {
      alert(`Erro ao salvar filme: ${error.message}`);
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setMovieModalState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [name]: value,
      }
    }));
  };
  
  const handleDelete = async (id) => {
    if(confirm("Excluir filme permanentemente?")) {
      try {
        await deleteDoc(doc(db, "filmes", id));
      } catch (error) {
        alert("Erro ao excluir. Verifique permissões de Admin.");
      }
    }
  };

  if (loading) {
    return (
      <LoadingState>
        <Film size={24} /> Carregando catálogo...
      </LoadingState>
    );
  }

  return (
    <Container>
      <Header>
        <TitleGroup>
          <h2>Catálogo de Filmes</h2>
          <p>Gerencie os títulos disponíveis no app.</p>
        </TitleGroup>
        
        {/* Botão Principal: Adicionar Novo Filme */}
        <AddButton onClick={() => openModal()}>
          <Plus size={18} /> Adicionar Filme
        </AddButton>
      </Header>

      {movieModalState.isOpen && (
        <FormContainer style={{gridColumn: '1 / -1'}}>
          <FormHeader>
            <Film size={20} /> {movieModalState.isEditing ? 'Editar Filme' : 'Novo Filme'}
          </FormHeader>
          
          <FormGrid onSubmit={handleSave}>
            {/* Coluna 1 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <InputGroup>
                <Label>Título</Label>
                <Input required name="titulo" placeholder="Ex: Duna" value={movieModalState.form.titulo} onChange={handleFormChange} />
              </InputGroup>
              
              <InputGroup>
                <Label>Gênero</Label>
                <Input required name="genero" placeholder="Ex: Ficção" value={movieModalState.form.genero} onChange={handleFormChange} />
              </InputGroup>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <InputGroup>
                  <Label>Duração</Label>
                  <Input name="duracao" placeholder="2h 30min" value={movieModalState.form.duracao} onChange={handleFormChange} />
                </InputGroup>
                <InputGroup>
                  <Label>Classif.</Label>
                  <Select name="classificacao" value={movieModalState.form.classificacao} onChange={handleFormChange}>
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
                <Label>Upload Poster</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{paddingTop: '0.9rem', paddingBottom: '0.9rem'}}
                />
                {(selectedFile || movieModalState.form.imagemUrl) && (
                   <p style={{color: '#4ade80', fontSize: '0.75rem'}}>
                     {selectedFile ? `Arquivo selecionado: ${selectedFile.name}` : `URL Atual: ${movieModalState.form.imagemUrl.slice(0, 30)}...`}
                   </p>
                )}
              </InputGroup>

              <InputGroup>
                <Label>Nota (0-5)</Label>
                <Input name="mediaAvaliacao" type="number" step="0.1" max="5" value={movieModalState.form.mediaAvaliacao} onChange={handleFormChange} />
              </InputGroup>
              
              <InputGroup>
                <Label>Sinopse</Label>
                <TextArea name="sinopse" rows="3" placeholder="Descrição..." value={movieModalState.form.sinopse} onChange={handleFormChange} />
              </InputGroup>
              
            </div>

            <InputGroup $fullWidth style={{display: 'flex', flexDirection: 'row', gap: '1rem', justifyContent: 'flex-end'}}>
              {/* Botão de Cancelar sempre visível e funcional no modal */}
              <CancelButton onClick={closeModal} type="button">CANCELAR</CancelButton>
              <SubmitButton disabled={uploading}>
                {uploading ? <><span style={{display:'inline-block', width:'1.2em', height:'1.2em', border:'2px solid rgba(255,255,255,0.7)', borderTopColor:'white', borderRadius:'50%', animation:'spin 1s linear infinite', marginRight:'0.5rem'}}></span> ENVIANDO IMAGEM...</> : movieModalState.isEditing ? 'Salvar Edição' : 'Adicionar Filme'}
              </SubmitButton>
            </InputGroup>
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
              <ActionOverlay className="action-overlay">
                <ActionButton $variant="edit" onClick={() => openModal(m)} title="Editar Filme">
                  <Edit2 size={20} />
                </ActionButton>
                <ActionButton $variant="delete" onClick={() => handleDelete(m.id)} title="Excluir">
                  <Trash2 size={20} />
                </ActionButton>
              </ActionOverlay>
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