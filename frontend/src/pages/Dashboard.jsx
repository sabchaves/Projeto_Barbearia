//O painel principal elegante com gráficos de faturamento por dia, 
//ranking de serviços populares e a lista/calendário de agendamentos.

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  X,
  FileText,
  Download,
  Printer,
  Percent
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Dashboard = () => {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return user?.role === 'client' ? 'bookings' : 'dashboard';
  });
  
  useDocumentTitle(
    activeTab === 'dashboard'
      ? 'Painel Geral'
      : activeTab === 'bookings'
      ? (user?.role === 'client' ? 'Meus Agendamentos' : 'Gestão de Agendamentos')
      : 'Relatórios Semanais'
  );
  
  // --- ESTADOS DOS DADOS DE AGENDAMENTO ---
  // appointments: Lista filtrada e buscada de agendamentos exibida na tabela principal.
  const [appointments, setAppointments] = useState([]);
  // allAppointments: Lista completa e não filtrada de agendamentos para cálculos e relatórios estatísticos (admin).
  const [allAppointments, setAllAppointments] = useState([]);
  
  // --- ESTADOS DO GRÁFICO DE LINHA/ÁREA INTERATIVO ---
  // chartMetric: Define a métrica ativa a ser plotada no gráfico principal ('revenue' para Faturamento em R$ ou 'count' para quantidade de atendimentos).
  const [chartMetric, setChartMetric] = useState('revenue'); 
  // tooltipState: Controla o balão de informações flutuante (tooltip) que aparece no gráfico ao passar o mouse.
  const [tooltipState, setTooltipState] = useState({
    x: 0,         // Posição horizontal (em pixels) em relação ao container do gráfico.
    y: 0,         // Posição vertical (em pixels) em relação ao container do gráfico.
    visible: false, // Controla se o tooltip está visível ou oculto.
    value: '',    // Texto formatado com o valor financeiro ou contagem do ponto de dados.
    date: ''      // A data do ponto de dados correspondente.
  });
  // activePointIndex: Armazena o índice do ponto do gráfico que está atualmente focado (hover).
  const [activePointIndex, setActivePointIndex] = useState(null);
  
  // --- ESTADO DO GRÁFICO DE ROSCA (DONUT) ---
  // hoveredDonutSegment: Armazena os dados do segmento (serviço) atualmente sob o cursor do mouse para exibir na legenda central.
  const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);
  
  // --- ESTADO DA ABA DE RELATÓRIOS ---
  // reportPeriod: Determina o período ativo para análise dos relatórios semanais/mensais (7, 14 ou 30 dias).
  const [reportPeriod, setReportPeriod] = useState(7);

  const [stats, setStats] = useState({
    summary: {
      totalAppointments: 0,
      totalRevenue: 0,
      pendingCount: 0,
      confirmedCount: 0,
      completedCount: 0,
      cancelledCount: 0
    },
    weeklyRevenueByDay: [],
    servicesDistribution: []
  });
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    service: 'Corte Clássico',
    date: '',
    time: '',
    price: 50,
    status: 'Confirmado'
  });

  // Load dashboard stats & appointments
  const fetchData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'admin') {
        const [appRes, statsRes, allRes] = await Promise.all([
          api.get(`/appointments?search=${searchTerm}&status=${statusFilter}`),
          api.get('/appointments/stats'),
          api.get('/appointments') // unfiltered for admin analytics
        ]);
        setAppointments(appRes.data);
        setStats(statsRes.data);
        setAllAppointments(allRes.data);
      } else {
        const appRes = await api.get(`/appointments?search=${searchTerm}&status=${statusFilter}`);
        setAppointments(appRes.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar dados do servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [searchTerm, statusFilter, user]);

  // ==========================================
  // ANALYTICS & REPORTS COMPUTED PROPERTIES
  // ==========================================

  // Group appointments by date over a specific days count
  const getPeriodData = (daysCount) => {
    const list = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      list.push({
        dateString: date.toISOString().split('T')[0],
        dayLabel: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        revenue: 0,
        count: 0
      });
    }

    allAppointments.forEach(app => {
      const appDate = new Date(app.date);
      // Adjust to UTC/local zone offsets
      appDate.setMinutes(appDate.getMinutes() + appDate.getTimezoneOffset());
      appDate.setHours(0, 0, 0, 0);
      
      const appDateStr = appDate.toISOString().split('T')[0];
      const match = list.find(d => d.dateString === appDateStr);
      if (match) {
        if (app.status === 'Confirmado' || app.status === 'Finalizado') {
          match.revenue += app.price;
        }
        if (app.status !== 'Cancelado') {
          match.count += 1;
        }
      }
    });

    return list;
  };

  // Compute statistics (KPIs) for selected daysCount vs previous period of same duration
  const getPeriodKPIs = (daysCount) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const limitCurrent = new Date();
    limitCurrent.setDate(today.getDate() - daysCount);
    limitCurrent.setHours(0, 0, 0, 0);

    const limitPrevious = new Date();
    limitPrevious.setDate(today.getDate() - (2 * daysCount));
    limitPrevious.setHours(0, 0, 0, 0);

    // Current period metrics
    let currentRevenue = 0;
    let currentApptsCount = 0;
    let currentCompleted = 0;
    let currentTotal = 0;
    
    // Day of week distribution (0-6)
    const weekdayRevenue = Array(7).fill(0);

    // Previous period metrics
    let prevRevenue = 0;
    let prevApptsCount = 0;

    allAppointments.forEach(app => {
      const appDate = new Date(app.date);
      appDate.setMinutes(appDate.getMinutes() + appDate.getTimezoneOffset());
      appDate.setHours(0, 0, 0, 0);

      if (appDate > limitCurrent && appDate <= today) {
        currentTotal += 1;
        if (app.status === 'Confirmado' || app.status === 'Finalizado') {
          currentRevenue += app.price;
          currentApptsCount += 1;
          const dayIndex = appDate.getDay();
          weekdayRevenue[dayIndex] += app.price;
        }
        if (app.status === 'Finalizado') {
          currentCompleted += 1;
        }
      } else if (appDate > limitPrevious && appDate <= limitCurrent) {
        if (app.status === 'Confirmado' || app.status === 'Finalizado') {
          prevRevenue += app.price;
          prevApptsCount += 1;
        }
      }
    });

    const currentTicket = currentApptsCount > 0 ? currentRevenue / currentApptsCount : 0;
    const prevTicket = prevApptsCount > 0 ? prevRevenue / prevApptsCount : 0;

    const completionRate = currentTotal > 0 ? (currentCompleted / currentTotal) * 100 : 0;

    // Busiest Day of week
    const weekdaysNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    let maxDayIndex = 5; // Default: Friday
    let maxDayRev = 0;
    weekdayRevenue.forEach((rev, idx) => {
      if (rev > maxDayRev) {
        maxDayRev = rev;
        maxDayIndex = idx;
      }
    });
    const busiestDay = weekdayRevenue[maxDayIndex] > 0 ? weekdaysNames[maxDayIndex] : 'Sexta-feira';

    // Growths
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ticketGrowth = prevTicket > 0 ? ((currentTicket - prevTicket) / prevTicket) * 100 : 0;
    const countGrowth = prevApptsCount > 0 ? ((currentApptsCount - prevApptsCount) / prevApptsCount) * 100 : 0;

    return {
      revenue: currentRevenue,
      revenueGrowth,
      ticket: currentTicket,
      ticketGrowth,
      apptsCount: currentApptsCount,
      countGrowth,
      completionRate,
      busiestDay
    };
  };

  // Generate day-by-day table breakdown
  const getDailyBreakdown = (daysCount) => {
    const list = getPeriodData(daysCount);
    
    // Group all appointments by date to find details
    return list.map(day => {
      const dayAppointments = allAppointments.filter(app => {
        const appDate = new Date(app.date);
        appDate.setMinutes(appDate.getMinutes() + appDate.getTimezoneOffset());
        appDate.setHours(0, 0, 0, 0);
        return appDate.toISOString().split('T')[0] === day.dateString;
      });

      const completed = dayAppointments.filter(app => app.status === 'Finalizado').length;
      const cancelled = dayAppointments.filter(app => app.status === 'Cancelado').length;
      const count = dayAppointments.filter(app => app.status === 'Confirmado' || app.status === 'Finalizado').length;

      // Find top service of the day
      const serviceCounts = {};
      dayAppointments.forEach(app => {
        if (app.status !== 'Cancelado') {
          serviceCounts[app.service] = (serviceCounts[app.service] || 0) + 1;
        }
      });
      let topService = '-';
      let maxCount = 0;
      Object.entries(serviceCounts).forEach(([name, val]) => {
        if (val > maxCount) {
          maxCount = val;
          topService = name;
        }
      });

      const dayNamesLong = {
        'dom': 'Domingo',
        'seg': 'Segunda',
        'ter': 'Terça',
        'qua': 'Quarta',
        'qui': 'Quinta',
        'sex': 'Sexta',
        'sáb': 'Sábado'
      };

      return {
        date: day.dateString,
        dayLabel: day.dayLabel,
        dayName: dayNamesLong[day.dayName] || day.dayName,
        revenue: day.revenue,
        completed,
        cancelled,
        ticket: count > 0 ? day.revenue / count : 0,
        topService
      };
    }).reverse(); // Latest dates first in table
  };

  // Export report to CSV file
  const handleExportCSV = (daysCount) => {
    const data = getDailyBreakdown(daysCount);
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Dia da Semana;Data;Concluídos;Cancelados;Faturamento (R$);Ticket Médio (R$);Serviço Mais Procurado\r\n';

    data.forEach(item => {
      const formattedDate = formatDate(item.date);
      const row = [
        item.dayName,
        formattedDate,
        item.completed,
        item.cancelled,
        item.revenue.toFixed(2).replace('.', ','),
        item.ticket.toFixed(2).replace('.', ','),
        item.topService
      ];
      csvContent += row.join(';') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_barbearia_${daysCount}_dias.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório CSV exportado e pronto para download!');
  };

  // Print current report view
  const handlePrintReport = () => {
    window.print();
  };

  // Adjust price automatically based on selected service
  const handleServiceChange = (serviceName) => {
    let price = 50;
    switch(serviceName) {
      case 'Corte Clássico': price = 50; break;
      case 'Barba Terapia': price = 45; break;
      case 'Cabelo e Barba': price = 85; break;
      case 'Sobrancelha Navallada': price = 25; break;
      case 'Tratamento Capilar': price = 120; break;
      default: price = 50;
    }
    setFormData({ ...formData, service: serviceName, price });
  };

  // Open modal for new appointment
  const handleOpenAddModal = () => {
    setEditingAppointment(null);
    setFormData({
      clientName: user?.role === 'client' ? user.name || '' : '',
      clientPhone: '',
      service: 'Corte Clássico',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      price: 50,
      status: 'Confirmado'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone || '',
      service: appointment.service,
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: appointment.time,
      price: appointment.price,
      status: appointment.status
    });
    setIsModalOpen(true);
  };

  // Submit appointment (Create/Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment._id}`, formData);
        showToast('Agendamento atualizado com sucesso!');
      } else {
        await api.create('/appointments', formData); // using api axios wrapper config
        // Actually api post helper:
        await api.post('/appointments', formData);
        showToast('Novo agendamento criado com sucesso!');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erro ao salvar agendamento.', 'error');
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este agendamento permanentemente?')) {
      try {
        await api.delete(`/appointments/${id}`);
        showToast('Agendamento removido.');
        fetchData();
      } catch (err) {
        showToast('Erro ao remover agendamento.', 'error');
      }
    }
  };

  // Quick action: Change status directly
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status: newStatus });
      showToast(`Status atualizado para: ${newStatus}`);
      fetchData();
    } catch (err) {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  // Formatting helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Adjust to local zone offsets
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="main-content fade-in">
          {/* TAB 1: DASHBOARD OR TAB 2: BOOKINGS (combined into a robust workspace) */}
          {activeTab === 'dashboard' && user?.role === 'admin' && (
            <>
              <div className="content-header">
                <div>
                  <h2>Painel Cabeludo's</h2>
                  <p className="text-secondary">Visão geral do faturamento e atendimentos hoje</p>
                </div>
                <button onClick={handleOpenAddModal} className="btn-primary">
                  <Plus size={18} /> Novo Agendamento
                </button>
              </div>

              {/* Cards Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card glass-panel">
                  <div className="metric-card-header">
                    <span className="metric-title">Faturamento Total</span>
                    <div className="metric-icon gold-bg">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="metric-value">{formatCurrency(stats.summary.totalRevenue)}</div>
                  <div className="metric-footer success-text">
                    <TrendingUp size={14} /> Atendimentos Concluídos
                  </div>
                </div>

                <div className="metric-card glass-panel">
                  <div className="metric-card-header">
                    <span className="metric-title">Total de Agendamentos</span>
                    <div className="metric-icon gold-bg">
                      <Calendar size={20} />
                    </div>
                  </div>
                  <div className="metric-value">{stats.summary.totalAppointments}</div>
                  <div className="metric-footer text-secondary">
                    Registrados no sistema
                  </div>
                </div>

                <div className="metric-card glass-panel">
                  <div className="metric-card-header">
                    <span className="metric-title">Confirmados</span>
                    <div className="metric-icon green-bg">
                      <CheckCircle size={20} />
                    </div>
                  </div>
                  <div className="metric-value">{stats.summary.confirmedCount}</div>
                  <div className="metric-footer info-text">
                    Aguardando clientes
                  </div>
                </div>

                <div className="metric-card glass-panel">
                  <div className="metric-card-header">
                    <span className="metric-title">Pendentes</span>
                    <div className="metric-icon orange-bg">
                      <Clock size={20} />
                    </div>
                  </div>
                  <div className="metric-value">{stats.summary.pendingCount}</div>
                  <div className="metric-footer warning-text">
                    Aguardando confirmação
                  </div>
                </div>
              </div>

              {/* CHARTS CONTAINER SECTION */}
              <div className="dashboard-charts-row">
                
                {/* 1. Line/Area Chart of Weekly Revenue & Volume */}
                <div className="chart-card glass-panel">
                  <div className="chart-card-header">
                    <div className="chart-card-title">
                      <h3>Desempenho Semanal</h3>
                      <p>Acompanhamento de faturamento e volume de atendimentos dos últimos 7 dias</p>
                    </div>
                    
                    <div className="chart-controls">
                      <button 
                        onClick={() => setChartMetric('revenue')} 
                        className={`chart-btn ${chartMetric === 'revenue' ? 'active' : ''}`}
                      >
                        Faturamento
                      </button>
                      <button 
                        onClick={() => setChartMetric('count')} 
                        className={`chart-btn ${chartMetric === 'count' ? 'active' : ''}`}
                      >
                        Atendimentos
                      </button>
                    </div>
                  </div>

                  <div className="svg-chart-container">
                    {(() => {
                      const chartData = getPeriodData(7);
                      const maxVal = Math.max(...chartData.map(d => chartMetric === 'revenue' ? d.revenue : d.count), 1);
                      
                      // Round maxVal to a nice clean number for lines (e.g. nearest 50 or 5)
                      const roundedMax = chartMetric === 'revenue' 
                        ? Math.ceil(maxVal / 100) * 100 
                        : Math.ceil(maxVal / 5) * 5;
                      
                      const width = 600;
                      const height = 240;
                      const padding = { top: 20, right: 20, bottom: 30, left: 50 };
                      const chartW = width - padding.left - padding.right;
                      const chartH = height - padding.top - padding.bottom;

                      // Map data points
                      const points = chartData.map((d, index) => {
                        const val = chartMetric === 'revenue' ? d.revenue : d.count;
                        const x = padding.left + (index / (chartData.length - 1)) * chartW;
                        const y = padding.top + chartH - (val / (roundedMax || 1)) * chartH;
                        return { x, y, value: val, date: formatDate(d.dateString), raw: d };
                      });

                      // Build spline/horizontal bezier curve path
                      let linePath = '';
                      if (points.length > 0) {
                        linePath = `M ${points[0].x} ${points[0].y}`;
                        for (let i = 0; i < points.length - 1; i++) {
                          const p1 = points[i];
                          const p2 = points[i + 1];
                          const cpX1 = p1.x + (p2.x - p1.x) / 3;
                          const cpY1 = p1.y;
                          const cpX2 = p1.x + 2 * (p2.x - p1.x) / 3;
                          const cpY2 = p2.y;
                          linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p2.x} ${p2.y}`;
                        }
                      }

                      const areaPath = points.length > 0 
                        ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
                        : '';

                      return (
                        <>
                          <svg className="svg-chart" viewBox={`0 0 ${width} ${height}`}>
                            <defs>
                              <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary-purple)" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="var(--primary-purple)" stopOpacity="0.0" />
                              </linearGradient>
                              <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="var(--primary-purple)" />
                                <stop offset="100%" stopColor="#8c6b12" />
                              </linearGradient>
                            </defs>

                            {/* Gridlines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                              const y = padding.top + chartH * ratio;
                              const labelVal = roundedMax - roundedMax * ratio;
                              return (
                                <g key={index}>
                                  <line 
                                    className="chart-gridline" 
                                    x1={padding.left} 
                                    y1={y} 
                                    x2={width - padding.right} 
                                    y2={y} 
                                  />
                                  <text 
                                    className="chart-axis-text text-right" 
                                    x={padding.left - 10} 
                                    y={y + 4} 
                                    textAnchor="end"
                                  >
                                    {chartMetric === 'revenue' ? formatCurrency(labelVal) : labelVal}
                                  </text>
                                </g>
                              );
                            })}

                            {/* X Axis labels */}
                            {points.map((p, index) => (
                              <text 
                                key={index} 
                                className="chart-axis-text text-center" 
                                x={p.x} 
                                y={height - 10} 
                                textAnchor="middle"
                              >
                                {chartData[index].dayLabel} ({chartData[index].dayName})
                              </text>
                            ))}

                            {/* Paths */}
                            {points.length > 0 && (
                              <>
                                <path className="chart-path-area" d={areaPath} />
                                <path className="chart-path-line" d={linePath} />
                              </>
                            )}

                            {/* Points on Line */}
                            {points.map((p, index) => (
                              <circle
                                key={index}
                                className={`chart-point ${activePointIndex === index ? 'chart-point-active' : ''}`}
                                cx={p.x}
                                cy={p.y}
                                r={activePointIndex === index ? 6 : 4}
                                onMouseEnter={(e) => {
                                  setActivePointIndex(index);
                                  const rect = e.target.getBoundingClientRect();
                                  const containerRect = e.target.ownerSVGElement.parentNode.getBoundingClientRect();
                                  setTooltipState({
                                    visible: true,
                                    x: rect.left - containerRect.left + rect.width / 2,
                                    y: rect.top - containerRect.top,
                                    value: chartMetric === 'revenue' ? formatCurrency(p.value) : `${p.value} atendimentos`,
                                    date: p.date
                                  });
                                }}
                                onMouseLeave={() => {
                                  setActivePointIndex(null);
                                  setTooltipState(prev => ({ ...prev, visible: false }));
                                }}
                              />
                            ))}
                          </svg>
                          
                          {/* Interactive HTML Tooltip */}
                          <div 
                            className="chart-tooltip" 
                            style={{ 
                              opacity: tooltipState.visible ? 1 : 0,
                              left: `${tooltipState.x}px`,
                              top: `${tooltipState.y}px`
                            }}
                          >
                            <span className="chart-tooltip-date">{tooltipState.date}</span>
                            <span className="chart-tooltip-value">{tooltipState.value}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* 2. Donut Chart for Service Distribution */}
                <div className="chart-card glass-panel">
                  <div className="chart-card-header">
                    <div className="chart-card-title">
                      <h3>Serviços Mais Procurados</h3>
                      <p>Distribuição de atendimentos por modalidade</p>
                    </div>
                  </div>

                  <div className="donut-container">
                    {(() => {
                      const serviceStats = stats.servicesDistribution || [];
                      const totalCount = serviceStats.reduce((sum, s) => sum + s.count, 0);
                      const colors = ['var(--primary-purple, #d4af37)', '#3b82f6', '#10b981', '#a855f7', '#f97316'];
                      
                      // Precompute segment percentages and cumulative offsets
                      let accumulatedPct = 0;

                      return (
                        <>
                          <div className="donut-svg-wrapper">
                            <svg className="donut-svg" viewBox="0 0 120 120">
                              <circle className="donut-segment-bg" cx="60" cy="60" r="48" />
                              
                              {serviceStats.map((item, index) => {
                                const pct = totalCount > 0 ? item.count / totalCount : 0;
                                const strokeDasharray = `${pct * 301.59} 301.59`;
                                const strokeDashoffset = -accumulatedPct * 301.59;
                                accumulatedPct += pct;
                                const strokeColor = colors[index % colors.length];

                                return (
                                  <circle 
                                    key={index}
                                    className="donut-segment" 
                                    cx="60" 
                                    cy="60" 
                                    r="48" 
                                    stroke={strokeColor}
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    onMouseEnter={() => {
                                      setHoveredDonutSegment({
                                        serviceName: item.serviceName,
                                        count: item.count,
                                        pct: (pct * 100).toFixed(0) + '%',
                                        revenue: formatCurrency(item.revenue)
                                      });
                                    }}
                                    onMouseLeave={() => setHoveredDonutSegment(null)}
                                  />
                                );
                              })}
                            </svg>

                            <div className="donut-center-text">
                              <span className="donut-center-value">
                                {hoveredDonutSegment ? hoveredDonutSegment.count : totalCount}
                              </span>
                              <span className="donut-center-label">
                                {hoveredDonutSegment ? hoveredDonutSegment.pct : 'Total'}
                              </span>
                            </div>
                          </div>

                          {/* Legend / Stats breakdown list */}
                          <div className="donut-legend-grid">
                            {serviceStats.map((item, index) => {
                              const pct = totalCount > 0 ? (item.count / totalCount * 100).toFixed(0) : '0';
                              const strokeColor = colors[index % colors.length];
                              return (
                                <div 
                                  key={index} 
                                  className="donut-legend-item"
                                  onMouseEnter={() => {
                                    setHoveredDonutSegment({
                                      serviceName: item.serviceName,
                                      count: item.count,
                                      pct: pct + '%',
                                      revenue: formatCurrency(item.revenue)
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredDonutSegment(null)}
                                >
                                  <div className="donut-legend-color" style={{ backgroundColor: strokeColor }} />
                                  <span className="donut-legend-name" title={item.serviceName}>{item.serviceName}</span>
                                  <span className="donut-legend-pct">{pct}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

              </div>
              <div className="appointments-section glass-panel">
                <div className="section-header">
                  <h3>Próximos Clientes</h3>
                  
                  <div className="filters-container">
                    <div className="search-bar">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Buscar cliente ou serviço..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Todos os Status</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="loading-container">
                    <div className="spinner spinner-primary" />
                    <span>Carregando dados...</span>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="empty-container">
                    <p className="text-secondary">Nenhum agendamento encontrado.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="appointments-table">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Telefone</th>
                          <th>Serviço</th>
                          <th>Data</th>
                          <th>Horário</th>
                          <th>Preço</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((app) => (
                          <tr key={app._id}>
                            <td className="font-bold">{app.clientName}</td>
                            <td className="text-secondary">{app.clientPhone || 'Não informado'}</td>
                            <td>
                              <span className="service-tag">{app.service}</span>
                            </td>
                            <td>{formatDate(app.date)}</td>
                            <td className="font-bold">{app.time}</td>
                            <td>{formatCurrency(app.price)}</td>
                            <td>
                              <span className={`badge badge-${app.status.toLowerCase()}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                {app.status !== 'Finalizado' && app.status !== 'Cancelado' && (
                                  <>
                                    <button 
                                      onClick={() => handleStatusChange(app._id, 'Finalizado')} 
                                      className="action-btn text-success" 
                                      title="Finalizar atendimento"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleStatusChange(app._id, 'Cancelado')} 
                                      className="action-btn text-danger" 
                                      title="Cancelar agendamento"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => handleOpenEditModal(app)} 
                                  className="action-btn text-info" 
                                  title="Editar detalhes"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteAppointment(app._id)} 
                                  className="action-btn text-danger" 
                                  title="Excluir do sistema"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'bookings' && (
            <>
              <div className="content-header">
                <div>
                  <h2>{user?.role === 'client' ? 'Meus Agendamentos' : 'Agendamento de Serviços'}</h2>
                  <p className="text-secondary">
                    {user?.role === 'client' 
                      ? 'Faça novas marcações ou gerencie seus horários na Cabeludo\'s' 
                      : 'Faça novas marcações ou gerencie os horários da Cabeludo\'s'}
                  </p>
                </div>
                <button onClick={handleOpenAddModal} className="btn-primary">
                  <Plus size={18} /> {user?.role === 'client' ? 'Agendar Horário' : 'Novo Agendamento'}
                </button>
              </div>

              {/* Booking Dashboard list focus */}
              <div className="appointments-section glass-panel">
                <div className="section-header">
                  <h3>{user?.role === 'client' ? 'Meus Horários Marcados' : 'Lista Geral de Reservas'}</h3>
                </div>
                
                {loading ? (
                  <div className="loading-container">
                    <div className="spinner spinner-primary" />
                    <span>Carregando dados...</span>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="empty-container">
                    <p className="text-secondary">Nenhum agendamento cadastrado.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="appointments-table">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Serviço</th>
                          <th>Data / Horário</th>
                          <th>Valor</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((app) => (
                          <tr key={app._id}>
                            <td className="font-bold">{app.clientName}</td>
                            <td>
                              <span className="service-tag">{app.service}</span>
                            </td>
                            <td>{formatDate(app.date)} às {app.time}</td>
                            <td>{formatCurrency(app.price)}</td>
                            <td>
                              <span className={`badge badge-${app.status.toLowerCase()}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button onClick={() => handleOpenEditModal(app)} className="btn-secondary btn-sm-text">
                                  Alterar
                                </button>
                                <button onClick={() => handleDeleteAppointment(app._id)} className="action-btn text-danger">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'reports' && user?.role === 'admin' && (
            <>
              <div className="content-header">
                <div>
                  <h2>Relatórios de Desempenho</h2>
                  <p className="text-secondary">Consolidação estatística e análise financeira do estabelecimento</p>
                </div>
              </div>

              {/* Action row with Period selector and buttons */}
              <div className="reports-actions-row glass-panel" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2rem' }}>
                <div className="reports-selector-box">
                  <span className="reports-selector-label">Período de Análise:</span>
                  <select
                    className="filter-select"
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(Number(e.target.value))}
                  >
                    <option value={7}>Últimos 7 dias (Esta Semana)</option>
                    <option value={14}>Últimos 14 dias (2 Semanas)</option>
                    <option value={30}>Últimos 30 dias (1 Mês)</option>
                  </select>
                </div>

                <div className="reports-buttons">
                  <button 
                    onClick={() => handleExportCSV(reportPeriod)} 
                    className="btn-report-action"
                    title="Exportar para arquivo CSV"
                  >
                    <Download size={16} /> Exportar CSV
                  </button>
                  <button 
                    onClick={handlePrintReport} 
                    className="btn-report-action"
                    title="Imprimir ou gerar PDF"
                  >
                    <Printer size={16} /> Imprimir Relatório
                  </button>
                </div>
              </div>

              {/* KPIs Grid */}
              {(() => {
                const kpis = getPeriodKPIs(reportPeriod);
                const formatGrowth = (val) => {
                  if (val === 0) return { text: 'Estável', type: 'neutral', icon: null };
                  const sign = val > 0 ? '+' : '';
                  return {
                    text: `${sign}${val.toFixed(1)}% vs anterior`,
                    type: val > 0 ? 'up' : 'down',
                    icon: val > 0 ? TrendingUp : TrendingDown
                  };
                };

                const revGrowth = formatGrowth(kpis.revenueGrowth);
                const countGrowth = formatGrowth(kpis.countGrowth);
                const ticketGrowth = formatGrowth(kpis.ticketGrowth);

                return (
                  <div className="reports-kpi-grid">
                    {/* KPI 1: Faturamento */}
                    <div className="kpi-card glass-panel">
                      <div className="kpi-header">
                        <span>Faturamento Consolidado</span>
                        <DollarSign size={18} className="text-muted" />
                      </div>
                      <div className="kpi-value">{formatCurrency(kpis.revenue)}</div>
                      <div className={`kpi-trend ${revGrowth.type}`}>
                        {revGrowth.icon && <revGrowth.icon size={14} />}
                        <span>{revGrowth.text}</span>
                      </div>
                    </div>

                    {/* KPI 2: Atendimentos */}
                    <div className="kpi-card glass-panel">
                      <div className="kpi-header">
                        <span>Atendimentos Concluídos</span>
                        <Calendar size={18} className="text-muted" />
                      </div>
                      <div className="kpi-value">{kpis.apptsCount}</div>
                      <div className={`kpi-trend ${countGrowth.type}`}>
                        {countGrowth.icon && <countGrowth.icon size={14} />}
                        <span>{countGrowth.text}</span>
                      </div>
                    </div>

                    {/* KPI 3: Ticket Médio */}
                    <div className="kpi-card glass-panel">
                      <div className="kpi-header">
                        <span>Ticket Médio</span>
                        <Percent size={18} className="text-muted" />
                      </div>
                      <div className="kpi-value">{formatCurrency(kpis.ticket)}</div>
                      <div className={`kpi-trend ${ticketGrowth.type}`}>
                        {ticketGrowth.icon && <ticketGrowth.icon size={14} />}
                        <span>{ticketGrowth.text}</span>
                      </div>
                    </div>

                    {/* KPI 4: Pico & Conclusão */}
                    <div className="kpi-card glass-panel">
                      <div className="kpi-header">
                        <span>Dia de Pico e Conclusão</span>
                        <Clock size={18} className="text-muted" />
                      </div>
                      <div className="kpi-value" style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>
                        {kpis.busiestDay}
                      </div>
                      <div className="kpi-trend neutral" style={{ marginTop: '0.75rem' }}>
                        <span>Taxa de conclusão: {kpis.completionRate.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SVGs Bar Chart of Daily Revenue for selected range */}
              <div className="chart-card glass-panel" style={{ marginBottom: '2rem' }}>
                <div className="chart-card-header">
                  <div className="chart-card-title">
                    <h3>Faturamento Diário do Período</h3>
                    <p>Histórico financeiro consolidado por dia</p>
                  </div>
                </div>

                <div className="svg-chart-container" style={{ height: '240px' }}>
                  {(() => {
                    const data = getPeriodData(reportPeriod);
                    const maxVal = Math.max(...data.map(d => d.revenue), 1);
                    const roundedMax = Math.ceil(maxVal / 100) * 100;
                    
                    const width = 800;
                    const height = 240;
                    const padding = { top: 20, right: 20, bottom: 35, left: 60 };
                    const chartW = width - padding.left - padding.right;
                    const chartH = height - padding.top - padding.bottom;

                    // Bar configurations
                    const totalBars = data.length;
                    const barGap = totalBars > 15 ? 4 : 10;
                    const availableWidthForBars = chartW - (barGap * (totalBars - 1));
                    const barW = availableWidthForBars / totalBars;

                    return (
                      <>
                        <svg className="svg-chart" viewBox={`0 0 ${width} ${height}`}>
                          <defs>
                            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--primary-purple)" />
                              <stop offset="100%" stopColor="#ab881e" />
                            </linearGradient>
                          </defs>

                          {/* Grid lines */}
                          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                            const y = padding.top + chartH * ratio;
                            const labelVal = roundedMax - roundedMax * ratio;
                            return (
                              <g key={index}>
                                <line 
                                  className="chart-gridline" 
                                  x1={padding.left} 
                                  y1={y} 
                                  x2={width - padding.right} 
                                  y2={y} 
                                />
                                <text 
                                  className="chart-axis-text text-right" 
                                  x={padding.left - 10} 
                                  y={y + 4} 
                                  textAnchor="end"
                                >
                                  {formatCurrency(labelVal)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Bars */}
                          {data.map((item, index) => {
                            const val = item.revenue;
                            const barH = (val / (roundedMax || 1)) * chartH;
                            const x = padding.left + index * (barW + barGap);
                            const y = padding.top + chartH - barH;

                            return (
                              <g key={index}>
                                <rect
                                  x={x}
                                  y={y}
                                  width={barW}
                                  height={Math.max(barH, 2)}
                                  rx={Math.min(barW / 3, 4)}
                                  fill="url(#bar-gradient)"
                                  style={{ transition: 'all 0.5s ease', cursor: 'pointer' }}
                                  onMouseEnter={(e) => {
                                    setActivePointIndex(index);
                                    const rect = e.target.getBoundingClientRect();
                                    const containerRect = e.target.ownerSVGElement.parentNode.getBoundingClientRect();
                                    setTooltipState({
                                      visible: true,
                                      x: rect.left - containerRect.left + rect.width / 2,
                                      y: rect.top - containerRect.top,
                                      value: formatCurrency(item.revenue),
                                      date: formatDate(item.dateString)
                                    });
                                  }}
                                  onMouseLeave={() => {
                                    setActivePointIndex(null);
                                    setTooltipState(prev => ({ ...prev, visible: false }));
                                  }}
                                />
                              </g>
                            );
                          })}

                          {/* Labels for X-axis (only show subset if too many bars) */}
                          {data.map((item, index) => {
                            const showLabel = reportPeriod === 7 
                              ? true 
                              : reportPeriod === 14 
                              ? index % 2 === 0 
                              : index % 5 === 0;

                            const x = padding.left + index * (barW + barGap) + barW / 2;
                            return showLabel ? (
                              <text
                                key={index}
                                className="chart-axis-text text-center"
                                x={x}
                                y={height - 8}
                                textAnchor="middle"
                              >
                                {item.dayLabel}
                              </text>
                            ) : null;
                          })}
                        </svg>

                        {/* Hover Tooltip */}
                        <div 
                          className="chart-tooltip" 
                          style={{ 
                            opacity: tooltipState.visible ? 1 : 0,
                            left: `${tooltipState.x}px`,
                            top: `${tooltipState.y}px`
                          }}
                        >
                          <span className="chart-tooltip-date">{tooltipState.date}</span>
                          <span className="chart-tooltip-value">{tooltipState.value}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Table section */}
              <div className="reports-detail-section glass-panel">
                <div className="section-header">
                  <h3>Detalhamento Diário Consolidado</h3>
                </div>

                {(() => {
                  const details = getDailyBreakdown(reportPeriod);
                  if (details.length === 0) {
                    return (
                      <div className="empty-container">
                        <p className="text-secondary">Nenhum dado encontrado para o período selecionado.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="table-responsive">
                      <table className="appointments-table reports-table">
                        <thead>
                          <tr>
                            <th>Dia da Semana</th>
                            <th>Data</th>
                            <th className="text-center">Concluídos</th>
                            <th className="text-center">Cancelados</th>
                            <th className="text-right">Faturamento</th>
                            <th className="text-right">Ticket Médio</th>
                            <th>Serviço Mais Procurado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.map((day, idx) => (
                            <tr key={idx}>
                              <td className="font-bold">{day.dayName}</td>
                              <td className="text-secondary">{formatDate(day.date)}</td>
                              <td className="text-center">{day.completed}</td>
                              <td className="text-center text-danger">{day.cancelled}</td>
                              <td className="text-right font-bold">{formatCurrency(day.revenue)}</td>
                              <td className="text-right text-secondary">{formatCurrency(day.ticket)}</td>
                              <td>
                                <span className={day.topService !== '-' ? 'service-tag' : ''}>
                                  {day.topService}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Booking Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>{editingAppointment ? 'Editar Agendamento' : (user?.role === 'client' ? 'Criar Novo Agendamento' : 'Agendar Novo Cliente')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>{user?.role === 'client' ? 'Seu Nome Completo' : 'Nome do Cliente'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nome do cliente"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{user?.role === 'client' ? 'Seu Telefone / WhatsApp' : 'Telefone do Cliente'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="(85) 9 9701-1547"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Serviço Desejado</label>
                <select
                  className="form-control"
                  value={formData.service}
                  onChange={(e) => handleServiceChange(e.target.value)}
                >
                  <option value="Corte Clássico">Corte Clássico - R$ 50,00</option>
                  <option value="Barba Terapia">Barba Terapia - R$ 45,00</option>
                  <option value="Cabelo e Barba">Cabelo e Barba - R$ 85,00</option>
                  <option value="Sobrancelha Navallada">Sobrancelha Navallada - R$ 25,00</option>
                  <option value="Tratamento Capilar">Tratamento Capilar - R$ 120,00</option>
                </select>
              </div>

              <div className="modal-form-row">
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

              {user?.role === 'admin' && (
                <div className="modal-form-row">
                  <div className="form-group">
                    <label>Preço Cobrado</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
