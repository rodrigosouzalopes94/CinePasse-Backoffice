import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../config/firebase'; // Certifique-se que este arquivo existe
import { Mail, Lock } from 'lucide-react';

// --- ANIMAÇÕES ---

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// --- STYLED COMPONENTS ---

const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-image: url('https://i.imgur.com/UftFEv9.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;

  /* Overlay Escuro */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 2;
  animation: ${fadeIn} 0.6s cubic-bezier(0.22, 1, 0.36, 1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;

  h1 {
    font-size: 3.5rem;
    font-weight: 900;
    color: white;
    margin: 0;
    line-height: 1.1;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
    letter-spacing: -0.03em;

    span {
      color: var(--primary); /* #ff2d55 */
    }
  }

  p {
    color: #d1d5db; /* gray-300 */
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-top: 0.5rem;
    font-weight: 500;
    opacity: 0.8;
  }
`;

const LoginPanel = styled.div`
  background: rgba(28, 28, 28, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;

  /* Estilo do ícone SVG */
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280; /* gray-500 */
    transition: color 0.3s ease;
    z-index: 10;
    pointer-events: none;
  }

  /* Muda cor do ícone quando o input tem foco */
  &:focus-within svg {
    color: var(--primary);
  }
`;

const Input = styled.input`
  width: 100%;
  background-color: #1f1f1f; /* Um pouco mais escuro que o painel */
  border: 1px solid #444;
  color: #F5F5F5;
  padding: 1rem 1rem 1rem 3rem; /* Espaço à esquerda para o ícone */
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-family: inherit;

  &::placeholder {
    color: #6b7280;
  }

  &:focus {
    border-color: var(--primary);
    background-color: #1a1a1a;
    box-shadow: 0 0 0 4px rgba(255, 45, 85, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  
  /* Efeito Glow */
  box-shadow: 0 0 20px rgba(255, 45, 85, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 10px 30px rgba(255, 45, 85, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.99);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: #444;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 0.8s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
`;

const Footer = styled.div`
  margin-top: 2rem;
  text-align: center;
  
  p {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }
`;

// --- COMPONENTE ---

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirecionamento automático via onAuthStateChanged no App.jsx
    } catch (error) {
      let msg = "Falha no login.";
      if (error.code === 'auth/invalid-credential') msg = "Email ou senha incorretos.";
      if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
      if (error.code === 'auth/wrong-password') msg = "Senha incorreta.";
      if (error.code === 'auth/too-many-requests') msg = "Muitas tentativas. Tente mais tarde.";
      
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Content>
        <Header>
          <h1>CINE<span>PASSE</span></h1>
          <p>Painel Administrativo</p>
        </Header>
        
        <LoginPanel>
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Mail size={20} />
              <Input 
                type="email" 
                required
                placeholder="admin@cinepasse.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </InputGroup>

            <InputGroup>
              <Lock size={20} />
              <Input 
                type="password" 
                required
                placeholder="Senha de acesso"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </InputGroup>
            
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner />
                  Entrando...
                </>
              ) : 'Acessar Painel'}
            </Button>
          </Form>

          <Footer>
             <p>Acesso restrito a administradores.</p>
          </Footer>
        </LoginPanel>
      </Content>
    </Container>
  );
};

export default LoginScreen;