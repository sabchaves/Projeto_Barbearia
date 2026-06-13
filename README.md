# Cabeludo's - Barbearia Premium & Club 💈

Sistema completo, moderno, responsivo e tecnológico para gestão de atendimentos e relatórios financeiros da barbearia **Cabeludo's**. Construído como uma aplicação Fullstack utilizando **React (Vite)** no frontend e **Node.js (Express)** no backend, integrado com banco de dados **MongoDB Atlas**.

---

## 🎨 Design & Visual
O sistema possui uma identidade visual elegante e moderna baseada no contraste de **Roxo e Preto/Grafite**, com efeitos refinados de **Glassmorphism**, transições animadas e suavizadas.

### Diferenciais de Interface:
* **Tema Escuro & Claro**: Alternância em tempo real pelo cabeçalho sem quebras ou travamentos de layout.
* **Layout 100% Responsivo**: Otimizado para computadores, tablets e smartphones (com menu lateral adaptável em telas menores).
* **Gráficos Dinâmicos**: Exibição visual de faturamento acumulado por dia da semana e ranking de popularidade dos serviços com dados vindos diretamente do MongoDB.
* **Micro-animações & Feedbacks**: Animações fluidas de entrada, estados de carregamento (spinners) e banners de notificação (toasts) que surgem na tela para confirmar ações de sucesso ou expor erros.

---

## 🛠️ Tecnologias Utilizadas
### Frontend:
* **React** (Biblioteca principal)
* **Vite** (Ambiente de desenvolvimento rápido)
* **CSS Moderno / Vanilla Variables** (Visual customizado, flexbox, grid, temas dinâmicos)
* **Axios** (Integração e requisições HTTP)
* **React Router Dom v6** (Controle de rotas e navegação SPA)
* **Lucide React** (Pacote moderno de ícones vetoriais)

### Backend:
* **Node.js** com **Express**
* **MongoDB** & **Mongoose** (Banco de dados de agendamentos e profissionais)
* **JWT (JSON Web Token)** (Sessões persistentes e rotas protegidas)
* **Bcryptjs** (Criptografia segura de senhas no cadastro)
* **Dotenv** (Gerenciamento de variáveis de ambiente)

---

## 📂 Organização do Projeto

O projeto segue a estrutura exata exigida, separando de forma clara as responsabilidades:

```text
/
├── package.json (Configuração de execução concorrente)
├── README.md (Este guia de execução)
│
├── /backend
│   ├── package.json
│   ├── .env (Configurações locais)
│   └── /src
│       ├── server.js (Ponto de entrada do backend)
│       ├── /config (Conexão com banco - db.js)
│       ├── /controllers (Lógica de negócios - auth e appointments)
│       ├── /models (Esquemas Mongoose - User.js e Appointment.js)
│       ├── /routes (Rotas de API - authRoutes.js e appointmentRoutes.js)
│       ├── /middlewares (Proteção JWT - authMiddleware.js)
│       ├── /services (Espaço reservado para integrações)
│       └── /utils (Script de semeadura de dados - seed.js)
│
└── /frontend
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── /src
        ├── main.jsx (Inicializador React)
        ├── App.jsx (Orquestrador de rotas e contextos)
        ├── /components (Navbar, Sidebar, ProtectedRoute)
        ├── /pages (Login, Register, Dashboard)
        ├── /services (Instância Axios configurada - api.js)
        ├── /routes (Arquivos de rotas auxiliares)
        ├── /assets (Arquivos de imagem/logo)
        ├── /styles (Estilos globais e modo escuro - index.css)
        ├── /context (ThemeContext e AuthContext com Toasts)
        └── /hooks (Custom hooks - useDocumentTitle)
```

---

## 🚀 Instalação e Execução

### Passo 1: Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 18 ou superior recomendada)
* Um banco de dados [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) criado (ou uma instância local do MongoDB)

### Passo 2: Configurar Variáveis de Ambiente
1. Vá até a pasta `backend/`
2. Abra o arquivo `.env` (ou crie um se não existir)
3. Altere o valor de `MONGODB_URI` para a URL de conexão do seu cluster do MongoDB Atlas.
4. Ajuste a chave secreta `JWT_SECRET` se preferir:

```env
PORT=5000
MONGODB_URI=SUA_STRING_DE_CONEXAO_DO_MONGODB_ATLAS
JWT_SECRET=super_secret_cabeludos_jwt_key_2026
```

### Passo 3: Instalar Dependências e Configurar
A partir do diretório **raiz** (`/Projeto_Barbearia`), execute o script de instalação automática. Ele fará o download de todos os pacotes necessários no backend e frontend:

```bash
npm run setup
```

### Passo 4: Semear Banco de Dados (Demonstração Completa)
Para facilitar seu teste e já abrir o painel com gráficos preenchidos de faturamento diário e histórico de clientes, execute o script seed. Ele limpará os dados temporários antigos e inserirá dados reais de demonstração no seu MongoDB:

```bash
cd backend
npm run seed
```

**Credenciais padrão criadas pelo Seed:**
* **Email**: `admin@cabeludos.com`
* **Senha**: `admin123`

*(Após executar o seed, retorne para a raiz com `cd ..`)*

### Passo 5: Iniciar o Sistema Concorrentemente
Para rodar tanto o servidor Backend quanto o Frontend React ao mesmo tempo com apenas um comando, execute na **raiz do projeto**:

```bash
npm run dev
```

O terminal abrirá automaticamente a aplicação no navegador em `http://localhost:3000/` (Frontend), que se comunicará com o servidor em `http://localhost:5000/` (Backend).

---

## 📦 Preparando para subir no GitHub

Para publicar o projeto em seu repositório pessoal:

1. Inicialize o Git no repositório raiz (caso já não esteja inicializado):
   ```bash
   git init
   ```
2. Adicione todos os arquivos criados (as dependências `node_modules` e arquivos locais `.env` já estão sendo ignorados pelo `.gitignore` estruturado):
   ```bash
   git add .
   ```
3. Realize o primeiro commit:
   ```bash
   git commit -m "feat: implementacao completa do sistema Cabeludos Barbearia"
   ```
4. Vincule seu repositório remoto do GitHub e envie as alterações:
   ```bash
   git branch -M main
   git remote add origin https://github.com/seu-usuario/seu-repositorio.git
   git push -u origin main
   ```

---
*Desenvolvido com dedicação profissional para a barbearia **Cabeludo's**. Aproveite o painel moderno de agendamento premium!* 🚀
