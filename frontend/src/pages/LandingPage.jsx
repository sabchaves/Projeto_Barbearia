import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import '../styles/landing.css';
import {
  Scissors,
  Instagram,
  Phone,
  MapPin,
  Clock,
  Award,
  Coffee,
  Sparkles,
  ShieldCheck,
  Check,
  LogOut,
  X,
  Calendar,
  User,
  MessageCircle,
  Moon,
  Sun,
  Lock,
  Mail,
  Smartphone,
  Droplet,
  Wind
} from 'lucide-react';

// Import local assets
import heroBg from '../assets/hero_barber_bg.png';
import aboutImg from '../assets/barbershop_interior.png';
import barberDiegoImg from '../assets/barber_diego.png';
import barberMarcosImg from '../assets/barber_marcos.png';
import barberThiagoImg from '../assets/barber_thiago.png';
import barberAlineImg from '../assets/barber_aline.png';

// Clipper Logo SVG
const ClipperLogo = ({ size = 36, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M30 15 h40 v8 h-40 z" fill="currentColor"/>
    <path d="M33 8 v7 h4 v-7 z" fill="currentColor"/>
    <path d="M41 8 v7 h4 v-7 z" fill="currentColor"/>
    <path d="M49 8 v7 h4 v-7 z" fill="currentColor"/>
    <path d="M57 8 v7 h4 v-7 z" fill="currentColor"/>
    <path d="M65 8 v7 h4 v-7 z" fill="currentColor"/>
    <path d="M25 26 l5 3 v8 l-5 -3 z" fill="currentColor" opacity="0.7"/>
    <path d="M32 23 L37 82 C38 86, 62 86, 63 82 L68 23 Z" fill="currentColor"/>
    <rect x="46" y="40" width="8" height="18" rx="4" fill="currentColor" opacity="0.2"/>
    <circle cx="50" cy="46" r="3" fill="currentColor"/>
  </svg>
);

// Straight Razor SVG
const RazorIcon = ({ size = 26, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M25 75 L65 40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M45 42 L80 15 C83 12, 88 15, 85 20 L65 58 Z" fill="currentColor" opacity="0.95" />
    <circle cx="45" cy="42" r="3" fill="currentColor" />
  </svg>
);

// Hot Towel Spa SVG
const SpaTowelIcon = ({ size = 26, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="25" y="50" width="50" height="20" rx="6" fill="currentColor" />
    <rect x="30" y="62" width="40" height="15" rx="5" fill="currentColor" opacity="0.6" />
    <path d="M35 40 Q38 30 35 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M50 42 Q53 32 50 22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    <path d="M65 40 Q68 30 65 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
  </svg>
);

// Skincare Exfoliation Jar SVG
const SkincareIcon = ({ size = 26, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M25 45 H75 V75 C75 80, 70 85, 65 85 H35 C30 85, 25 80, 25 75 Z" fill="currentColor" opacity="0.9" />
    <rect x="20" y="32" width="60" height="10" rx="3" fill="currentColor" />
    <path d="M50 12 C55 22, 45 22, 50 32" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="62" r="8" fill="currentColor" opacity="0.3" />
  </svg>
);

// High Frequency Tech SVG
const HighFrequencyIcon = ({ size = 26, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M50 85 V35 Q50 15 75 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M20 85 H80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M30 40 L38 48 L28 56 L36 64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M70 42 L62 50 L72 58 L64 66" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Restricted Portfolio cuts (Exactly 6 results of finished haircut, beard, and eyebrow)
const portfolioCuts = [
  {
    url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
    title: 'Corte Degradê Clássico',
    tag: 'Corte de Cabelo'
  },
  {
    url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
    title: 'Design de Barba Alinhada',
    tag: 'Barba'
  },
  {
    url: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=600&auto=format&fit=crop&q=80',
    title: 'Sobrancelha Navalhada',
    tag: 'Sobrancelha'
  },
  {
    url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
    title: 'Corte Moderno Executivo',
    tag: 'Corte de Cabelo'
  },
  {
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    title: 'Barba Cheia Modelada',
    tag: 'Barba'
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    title: 'Alinhamento de Sobrancelha',
    tag: 'Sobrancelha'
  }
];

const LandingPage = () => {
  const { user, login, logout, showToast } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Scroll detection state
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  // Modal Agendamento State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Agendamento State
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    service: 'Corte Clássico',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    price: 50,
    email: '',
    password: ''
  });

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Detect active section on scroll
      const sections = ['inicio', 'sobre', 'servicos', 'equipe', 'portfolio', 'contato'];
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update price automatically based on selected service
  const handleServiceChange = (serviceName) => {
    let price = 50;
    switch (serviceName) {
      case 'Corte Clássico':
        price = 50;
        break;
      case 'Barba Terapia':
        price = 45;
        break;
      case 'Cabelo e Barba':
        price = 85;
        break;
      case 'Sobrancelha Navallada':
        price = 25;
        break;
      case 'Tratamento Capilar':
        price = 120;
        break;
      default:
        price = 50;
    }
    setFormData({ ...formData, service: serviceName, price });
  };

  // Scroll smoothly to target section
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // Handle quick booking modal submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientName || !formData.clientPhone || !formData.date || !formData.time) {
      showToast('Por favor, preencha todos os campos do agendamento.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        if (!formData.email || !formData.password) {
          showToast('Informe seu e-mail e crie uma senha para confirmar seu agendamento.', 'error');
          setIsSubmitting(false);
          return;
        }

        if (formData.password.length < 6) {
          showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
          setIsSubmitting(false);
          return;
        }

        const loginRes = await login(formData.email, formData.password);
        if (!loginRes.success) {
          setIsSubmitting(false);
          return;
        }
      }

      const bookingPayload = {
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        service: formData.service,
        date: formData.date,
        time: formData.time,
        price: formData.price,
        status: 'Confirmado'
      };

      await api.post('/appointments', bookingPayload);
      showToast('Seu horário foi agendado e confirmado com sucesso!');
      setIsModalOpen(false);
      
      setFormData({
        clientName: '',
        clientPhone: '',
        service: 'Corte Clássico',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        price: 50,
        email: '',
        password: ''
      });
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Erro ao realizar o agendamento.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-wrapper">
      {/* NAVBAR */}
      <nav className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="landing-brand" onClick={() => scrollToSection('inicio')}>
          <div className="landing-brand-logo">
            <ClipperLogo size={36} />
          </div>
          <span className="landing-brand-name">Cabeludo's</span>
        </div>

        <div className="landing-nav-links">
          <button
            onClick={() => scrollToSection('inicio')}
            className={`landing-nav-link ${activeSection === 'inicio' ? 'active' : ''}`}
          >
            Início
          </button>
          <button
            onClick={() => scrollToSection('sobre')}
            className={`landing-nav-link ${activeSection === 'sobre' ? 'active' : ''}`}
          >
            Sobre
          </button>
          <button
            onClick={() => scrollToSection('servicos')}
            className={`landing-nav-link ${activeSection === 'servicos' ? 'active' : ''}`}
          >
            Serviços
          </button>
          <button
            onClick={() => scrollToSection('equipe')}
            className={`landing-nav-link ${activeSection === 'equipe' ? 'active' : ''}`}
          >
            Equipe
          </button>
          <button
            onClick={() => scrollToSection('portfolio')}
            className={`landing-nav-link ${activeSection === 'portfolio' ? 'active' : ''}`}
          >
            Portfólio
          </button>
          <button
            onClick={() => scrollToSection('contato')}
            className={`landing-nav-link ${activeSection === 'contato' ? 'active' : ''}`}
          >
            Contato
          </button>

          {/* Theme toggler */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--landing-gold)',
              display: 'flex',
              alignItems: 'center',
              padding: '5px'
            }}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/dashboard" className="landing-nav-login" style={{ textDecoration: 'none' }}>
                Painel
              </Link>
              <button
                onClick={logout}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ef4444'
                }}
                title="Sair da sessão"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="landing-nav-login" style={{ textDecoration: 'none' }}>
              Fazer Login
            </Link>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="inicio" className="landing-hero">
        <div className="landing-hero-content animate-fade-in-up">
          <h1 className="landing-hero-title">
            Contribuindo para a sua autoestima através do seu estilo.
          </h1>
          <p className="landing-hero-subtitle">
            Não perca seu horário. Agende agora mesmo.
          </p>
          <button onClick={() => setIsModalOpen(true)} className="landing-btn-gold">
            Agendar horário
          </button>
        </div>
        <div className="landing-hero-image-side animate-fade-in-up animate-delay-1">
          <img src={heroBg} alt="Barbeiro profissional trabalhando na Cabeludo's" className="landing-hero-img-split" />
          <div className="landing-hero-img-overlay"></div>
        </div>
      </header>

      {/* SOBRE SECTION */}
      <section id="sobre" className="landing-section">
        <div className="landing-about-grid">
          <div className="landing-about-image-wrapper animate-fade-in-up">
            <img src={aboutImg} alt="Interior da Cabeludo's" className="landing-about-img" />
          </div>
          <div className="landing-about-content animate-fade-in-up animate-delay-1">
            <span className="section-subtitle">Nossa História</span>
            <h2 className="section-main-title" style={{ textAlign: 'left', marginBottom: '20px' }}>
              Sobre a Cabeludo's
            </h2>
            <h3>Empreendedorismo Feminino na Estética Masculina</h3>
            <p className="landing-about-text">
              A Cabeludo's nasceu da visão de uma mulher empreendedora determinada a revolucionar o mercado de barbearias. Com foco absoluto em autoestima, estilo e conforto, criamos um espaço onde o atendimento premium e a transformação visual se encontram. Acreditamos que o cuidado pessoal masculino merece excelência, precisão e um ambiente acolhedor.
            </p>
            <div className="landing-about-stats">
              <div className="landing-about-stat-item">
                <h4>100%</h4>
                <p>Foco na Autoestima</p>
              </div>
              <div className="landing-about-stat-item">
                <h4>Premium</h4>
                <p>Atendimento Único</p>
              </div>
              <div className="landing-about-stat-item">
                <h4>Conforto</h4>
                <p>Espaço Completo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS SECTION */}
      <section id="servicos" className="landing-section" style={{ borderTop: '1px solid var(--landing-border-color)' }}>
        <div className="section-title-wrapper animate-fade-in-up">
          <span className="section-subtitle">Tabela de Valores</span>
          <h2 className="section-main-title">Nossos melhores serviços</h2>
        </div>
        <div className="landing-services-grid">
          {/* Card 1 - Corte */}
          <div className="landing-service-card animate-fade-in-up animate-delay-1">
            <div className="landing-service-icon-box">
              <Scissors size={26} />
            </div>
            <div className="landing-service-header">
              <h3 className="landing-service-name">Corte de cabelo</h3>
              <span className="landing-service-price">R$ 50,00</span>
            </div>
            <p className="landing-service-desc">
              Corte tradicional ou moderno feito à máquina e tesoura por barbeiros experientes, finalizado com lavagem e pomada.
            </p>
          </div>

          {/* Card 2 - Barba (Custom Razor Icon) */}
          <div className="landing-service-card animate-fade-in-up animate-delay-2">
            <div className="landing-service-icon-box">
              <RazorIcon />
            </div>
            <div className="landing-service-header">
              <h3 className="landing-service-name">Barba</h3>
              <span className="landing-service-price">R$ 40,00</span>
            </div>
            <p className="landing-service-desc">
              Aparação, alinhamento e design completo da sua barba com acabamento na lâmina e higienização.
            </p>
          </div>

          {/* Card 3 - Barbaterapia (Custom Towel/Spa Icon) */}
          <div className="landing-service-card animate-fade-in-up animate-delay-3">
            <div className="landing-service-icon-box">
              <SpaTowelIcon />
            </div>
            <div className="landing-service-header">
              <h3 className="landing-service-name">Barbaterapia</h3>
              <span className="landing-service-price">R$ 45,00</span>
            </div>
            <p className="landing-service-desc">
              Um verdadeiro ritual relaxante com toalha quente, cremes emolientes, óleos hidratantes e massagem facial profunda.
            </p>
          </div>

          {/* Card 4 - Hidratação */}
          <div className="landing-service-card animate-fade-in-up animate-delay-1">
            <div className="landing-service-icon-box">
              <Droplet size={26} />
            </div>
            <div className="landing-service-header">
              <h3 className="landing-service-name">Hidratação</h3>
              <span className="landing-service-price">R$ 35,00</span>
            </div>
            <p className="landing-service-desc">
              Tratamento de restauração e nutrição profunda para devolver a saúde, o brilho e o aspecto sedoso aos cabelos.
            </p>
          </div>

          {/* Card 5 - Esfoliação (Custom Skincare Jar Icon) */}
          <div className="landing-service-card animate-fade-in-up animate-delay-2">
            <div className="landing-service-icon-box">
              <SkincareIcon />
            </div>
            <div className="landing-service-header">
              <h3 className="landing-service-name">Esfoliação</h3>
              <span className="landing-service-price">R$ 30,00</span>
            </div>
            <p className="landing-service-desc">
              Remoção de células mortas e limpeza profunda da pele do rosto, reduzindo cravos e preparando os poros para o barbear.
            </p>
          </div>

          {/* Card 6 - Alta Frequência (Custom Capillary Tech Icon) */}
          <div className="landing-service-card animate-fade-in-up animate-delay-3">
            <div className="landing-service-icon-box">
              <HighFrequencyIcon />
            </div>
            <div className="landing-service-header">
              <h3 className="landing-service-name">Tratamento de alta frequência</h3>
              <span className="landing-service-price">R$ 80,00</span>
            </div>
            <p className="landing-service-desc">
              Tecnologia de ozônio de alta frequência para o couro cabeludo, estimulando o crescimento capilar e combatendo caspas.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPE SECTION */}
      <section id="equipe" className="landing-section" style={{ borderTop: '1px solid var(--landing-border-color)' }}>
        <div className="section-title-wrapper animate-fade-in-up">
          <span className="section-subtitle">Profissionais Especialistas</span>
          <h2 className="section-main-title">Nossa Equipe</h2>
        </div>
        <div className="landing-team-grid">
          {/* Diego */}
          <div className="landing-team-card animate-fade-in-up animate-delay-1">
            <div className="landing-team-img-wrapper">
              <img src={barberDiegoImg} alt="Diego Alcântara" className="landing-team-img" />
            </div>
            <div className="landing-team-info">
              <h3 className="landing-team-name">Diego Alcântara</h3>
              <span className="landing-team-role">Especialista em Cabelo / Master Barber</span>
            </div>
          </div>

          {/* Marcos */}
          <div className="landing-team-card animate-fade-in-up animate-delay-2">
            <div className="landing-team-img-wrapper">
              <img src={barberMarcosImg} alt="Marcos Rangel" className="landing-team-img" />
            </div>
            <div className="landing-team-info">
              <h3 className="landing-team-name">Marcos Rangel</h3>
              <span className="landing-team-role">Especialista em Barba</span>
            </div>
          </div>

          {/* Thiago */}
          <div className="landing-team-card animate-fade-in-up animate-delay-3">
            <div className="landing-team-img-wrapper">
              <img src={barberThiagoImg} alt="Thiago Souza" className="landing-team-img" />
            </div>
            <div className="landing-team-info">
              <h3 className="landing-team-name">Thiago Souza</h3>
              <span className="landing-team-role">Especialista em Sobrancelha</span>
            </div>
          </div>

          {/* Aline */}
          <div className="landing-team-card animate-fade-in-up animate-delay-1">
            <div className="landing-team-img-wrapper">
              <img src={barberAlineImg} alt="Aline Mendes" className="landing-team-img" />
            </div>
            <div className="landing-team-info">
              <h3 className="landing-team-name">Aline Mendes</h3>
              <span className="landing-team-role">Especialista em Massagem de Barba / Barbaterapia</span>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFÓLIO SECTION */}
      <section id="portfolio" className="landing-section" style={{ borderTop: '1px solid var(--landing-border-color)' }}>
        <div className="section-title-wrapper animate-fade-in-up">
          <span className="section-subtitle">Galeria de Resultados</span>
          <h2 className="section-main-title">Nosso Portfólio</h2>
        </div>
        <div className="landing-portfolio-grid">
          {portfolioCuts.map((item, idx) => (
            <div key={idx} className="landing-portfolio-item animate-fade-in-up">
              <img src={item.url} alt={item.title} className="landing-portfolio-img" />
              <div className="landing-portfolio-overlay">
                <span className="landing-portfolio-tag">{item.tag}</span>
                <h4 className="landing-portfolio-title">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT / FOOTER */}
      <footer id="contato" className="landing-footer-bg">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <h4>Cabeludo's</h4>
            <p>
              Oferecemos mais do que cortes e barbas. Entregamos autoestima, bem-estar e a experiência que um homem moderno e exigente merece em um ambiente sofisticado.
            </p>
            <div className="landing-footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="landing-footer-social-btn">
                <Instagram size={18} />
              </a>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="landing-footer-social-btn">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div className="landing-footer-column">
            <h5>Horários</h5>
            <ul className="landing-footer-list">
              <li className="landing-footer-item">
                <Clock className="landing-footer-item-icon" size={16} />
                <div>
                  <strong>Terça a Sexta:</strong>
                  <br />09:00 às 20:00
                </div>
              </li>
              <li className="landing-footer-item">
                <Clock className="landing-footer-item-icon" size={16} />
                <div>
                  <strong>Sábado:</strong>
                  <br />08:00 às 19:00
                </div>
              </li>
              <li className="landing-footer-item">
                <Clock className="landing-footer-item-icon" size={16} />
                <div>
                  <strong>Domingo e Segunda:</strong>
                  <br />Fechado
                </div>
              </li>
            </ul>
          </div>

          <div className="landing-footer-column">
            <h5>Contato & Local</h5>
            <ul className="landing-footer-list">
              <li className="landing-footer-item">
                <Phone className="landing-footer-item-icon" size={16} />
                <div>
                  <strong>Telefone:</strong>
                  <br />(11) 3456-7890
                </div>
              </li>
              <li className="landing-footer-item">
                <MessageCircle className="landing-footer-item-icon" size={16} />
                <div>
                  <strong>WhatsApp:</strong>
                  <br />(11) 99999-9999
                </div>
              </li>
              <li className="landing-footer-item">
                <MapPin className="landing-footer-item-icon" size={16} />
                <div>
                  <strong>Endereço:</strong>
                  <br />Av. Paulista, 1000 - Bela Vista
                  <br />São Paulo - SP
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Cabeludo's. Todos os direitos reservados.</p>
          <Link to="/login" className="landing-footer-admin-link">
            Acesso Restrito
          </Link>
        </div>
      </footer>

      {/* WHATSAPP FLOAT BUTTON */}
      <a
        href="https://wa.me/5511999999999?text=Ol%C3%A1%21+Gostaria+de+agendar+um+hor%C3%A1rio+na+barbearia+Cabeludo%27s."
        target="_blank"
        rel="noreferrer"
        className="whatsapp-float"
      >
        <MessageCircle size={28} />
      </a>

      {/* MODAL AGENDAMENTO RÁPIDO */}
      {isModalOpen && (
        <div className="landing-modal-overlay">
          <div className="landing-modal">
            <div className="landing-modal-header">
              <h3>Agendar Horário</h3>
              <button onClick={() => setIsModalOpen(false)} className="landing-modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="landing-modal-body">
                <div className="form-group">
                  <label>Seu Nome Completo</label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nome do cliente"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Seu Telefone/WhatsApp</label>
                  <div className="input-with-icon">
                    <Smartphone size={16} className="input-icon" />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="(11) 99999-9999"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Serviço Desejado</label>
                  <select
                    className="form-control"
                    value={formData.service}
                    onChange={(e) => handleServiceChange(e.target.value)}
                  >
                    <option value="Corte Clássico">Corte de cabelo - R$ 50,00</option>
                    <option value="Barba Terapia">Barba - R$ 40,00</option>
                    <option value="Cabelo e Barba">Barbaterapia - R$ 45,00</option>
                    <option value="Sobrancelha Navallada">Sobrancelha Navallada - R$ 25,00</option>
                    <option value="Tratamento Capilar">Tratamento de alta frequência - R$ 80,00</option>
                  </select>
                </div>

                <div className="landing-modal-form-row">
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Horário</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* AUTHENTICATION SECTION INTEGRATED */}
                {!user ? (
                  <>
                    <div className="landing-modal-divider">
                      <span className="landing-modal-divider-text">Confirmação de Segurança</span>
                    </div>

                    <div className="landing-modal-auth-alert">
                      <Sparkles className="landing-modal-auth-alert-icon" size={18} />
                      <div className="landing-modal-auth-alert-text">
                        Para confirmar seu horário na <strong>Cabeludo's</strong>, digite seu <strong>E-mail</strong> e escolha <strong>qualquer senha</strong>. Ela ficará salva no banco de dados!
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Seu E-mail</label>
                      <div className="input-with-icon">
                        <Mail size={16} className="input-icon" />
                        <input
                          type="email"
                          className="form-control"
                          placeholder="email@exemplo.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Escolha uma Senha (mín. 6 caracteres)</label>
                      <div className="input-with-icon">
                        <Lock size={16} className="input-icon" />
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Sua senha de acesso"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      background: 'rgba(37, 211, 102, 0.05)',
                      border: '1px dashed rgba(37, 211, 102, 0.3)',
                      padding: '12px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      color: '#25d366',
                      marginTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Check size={14} />
                    Você está conectado como <strong>{user.email}</strong>.
                  </div>
                )}
              </div>

              <div className="landing-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="landing-btn-outline"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', border: '1px solid var(--landing-border-color)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="landing-btn-gold"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem' }}
                >
                  {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
