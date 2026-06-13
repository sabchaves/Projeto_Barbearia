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
  X,
  FileText
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
  
  // Dashboard & appointments data
  const [appointments, setAppointments] = useState([]);
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
        const [appRes, statsRes] = await Promise.all([
          api.get(`/appointments?search=${searchTerm}&status=${statusFilter}`),
          api.get('/appointments/stats')
        ]);
        setAppointments(appRes.data);
        setStats(statsRes.data);
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

              {/* Real-time Appointments Section */}
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
                  <h2>Relatórios Estatísticos</h2>
                  <p className="text-secondary">Informações de faturamento e serviços consolidadas direto do banco de dados</p>
                </div>
              </div>

              <div className="reports-grid">
                {/* 1. Bar Chart of Weekly Revenue */}
                <div className="report-card glass-panel">
                  <div className="report-card-header">
                    <h3>Faturamento Diário (Últimos 7 dias)</h3>
                    <FileText size={20} className="text-muted" />
                  </div>
                  
                  {stats.weeklyRevenueByDay.length === 0 ? (
                    <div className="empty-container">Sem dados disponíveis</div>
                  ) : (
                    <div className="chart-container">
                      <div className="bar-chart">
                        {stats.weeklyRevenueByDay.map((day, idx) => {
                          // Find max value to normalize height
                          const maxRevenue = Math.max(...stats.weeklyRevenueByDay.map(d => d.revenue), 1);
                          const pct = (day.revenue / maxRevenue) * 100;
                          
                          return (
                            <div key={idx} className="chart-bar-col">
                              <span className="bar-label-top">{formatCurrency(day.revenue)}</span>
                              <div className="bar-wrapper">
                                <div 
                                  className="bar-fill" 
                                  style={{ height: `${Math.max(pct, 5)}%` }}
                                ></div>
                              </div>
                              <span className="bar-day-name">{day.dayName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Service Popularity List */}
                <div className="report-card glass-panel">
                  <div className="report-card-header">
                    <h3>Popularidade de Serviços</h3>
                    <FileText size={20} className="text-muted" />
                  </div>

                  {stats.servicesDistribution.length === 0 ? (
                    <div className="empty-container">Nenhum atendimento realizado ainda</div>
                  ) : (
                    <div className="services-rank-list">
                      {stats.servicesDistribution.map((item, idx) => (
                        <div key={idx} className="rank-item">
                          <div className="rank-item-info">
                            <span className="rank-number">#{idx + 1}</span>
                            <div>
                              <div className="rank-service-name">{item.serviceName}</div>
                              <span className="text-secondary">{item.count} atendimentos</span>
                            </div>
                          </div>
                          <span className="rank-service-revenue">{formatCurrency(item.revenue)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
