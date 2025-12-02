🎬 CinePasse Admin (Backoffice)

O CinePasse Admin é o painel de controle web para a gestão da plataforma de cinema CinePasse. Ele permite que administradores gerenciem o catálogo de filmes, validem ingressos em tempo real e acompanhem as métricas de vendas.

Este projeto opera em conjunto com o App Mobile CinePasse (Flutter), compartilhando o mesmo banco de dados Firebase.

🖥️ Funcionalidades

1. Dashboard

Visão geral em tempo real.

Contadores de vendas, tickets pendentes e usuários ativos.

Indicador de status do sistema.

2. Validação de Tickets (Core Business)

Listagem de todas as reservas feitas pelo App Mobile.

Aprovação: Confirma o pagamento ou assinatura e libera o ingresso para o usuário.

Rejeição: Cancela a reserva.

Filtros por status (Pendente, Aprovado, Rejeitado) e busca por código.

3. Catálogo de Filmes

Adição de novos filmes (Título, Gênero, Poster, Sinopse).

Exclusão de filmes.

Atualização instantânea no App Mobile.

🛠️ Tecnologias

Frontend: React.js (Vite)

Estilização: Styled Components (CSS-in-JS)

Ícones: Lucide React

Backend: Firebase (Auth & Firestore)

🚀 Como Rodar Localmente

Pré-requisitos

Node.js instalado (versão 16+).

Projeto configurado no Firebase.

Instalação

Clone o repositório:

git clone [https://github.com/rodrigosouzalopes94/CinePasse-Backoffice.git](https://github.com/rodrigosouzalopes94/CinePasse-Backoffice.git)
cd CinePasse-Backoffice


Instale as dependências:

npm install


Configure o Firebase:

Crie o arquivo src/config/firebase.js.

Cole suas chaves de API (veja o arquivo FIREBASE_SETUP.md se disponível ou consulte o console do Firebase).

Inicie o servidor de desenvolvimento:

npm run dev


Acesse http://localhost:5173 no navegador.

📦 Deploy

Este projeto está configurado para deploy fácil na Vercel ou Firebase Hosting.

Build de Produção

npm run build


Isso gerará a pasta dist/ pronta para publicação.

🔐 Regras de Segurança

O acesso ao painel é restrito.

Login: Requer autenticação via Firebase Auth.

Permissões: As operações de escrita (Aprovar Ticket, Adicionar Filme) são protegidas por Firestore Security Rules e exigem que o usuário tenha o UID de Administrador.

Desenvolvido para o ecossistema CinePasse.