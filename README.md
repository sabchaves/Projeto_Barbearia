# Cabeludo's - Barbearia Premium & Club 💈

Sistema completo, moderno, responsivo e tecnológico para gestão de atendimentos e relatórios financeiros da barbearia **Cabeludo's**. Construído como uma aplicação Fullstack utilizando **React (Vite)** no frontend e **Node.js (Express)** no backend, integrado com banco de dados **MongoDB Atlas**.

Este projeto foi desenvolvido com o objetivo de facilitar o atendimento e a organização de uma barbearia. O sistema permite cadastrar clientes, registrar barbeiros e realizar agendamentos de horários de forma prática e rápida, ajudando no controle dos atendimentos do dia a dia.

Entre as funcionalidades do sistema estão o cadastro de clientes com informações básicas, cadastro de barbeiros e serviços oferecidos pela barbearia, além do agendamento de horários para evitar conflitos e melhorar a organização dos atendimentos.

O sistema também permite visualizar os horários disponíveis, consultar agendamentos já marcados, editar informações de clientes e cancelar atendimentos quando necessário. Além disso, possui uma área de relatórios semanais que ajuda no acompanhamento do funcionamento da barbearia, mostrando dados como quantidade de atendimentos realizados, serviços mais procurados, dias e horários com maior movimento e desempenho geral dos atendimentos.

Outra funcionalidade importante é o histórico de atendimentos, permitindo acompanhar os serviços já realizados para cada cliente, ajudando na organização e no atendimento personalizado.

O sistema foi criado para tornar o gerenciamento mais eficiente, evitando confusões com horários, reduzindo problemas na organização e melhorando a experiência tanto dos clientes quanto dos profissionais da barbearia.

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
*Desenvolvido com dedicação profissional para a barbearia **Cabeludo's**. Aproveite o painel moderno de agendamento premium!* 🚀
