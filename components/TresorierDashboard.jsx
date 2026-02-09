import React, { useEffect, useMemo, useState } from 'react';
import { Search, Bell, Plus, Filter, FileText, FileSpreadsheet, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, apiGet, apiPost } from '../src/api';

const CotisationsTracker = () => {
  const [activeTab, setActiveTab] = useState('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [users, setUsers] = useState([]);
  const [usersError, setUsersError] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentForm, setPaymentForm] = useState({ user_id: '', montant: '' });
  const navigate = useNavigate();

  const getInitials = (lastName, firstName) => {
    const first = (lastName || '').trim().charAt(0);
    const second = (firstName || '').trim().charAt(0);
    return `${first}${second}`.toUpperCase() || '--';
  };

  const normalizeStatus = (value) => {
    if (!value) return '';
    return value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const mapStatus = (value) => {
    const normalized = normalizeStatus(value);
    if (!normalized) return '';
    if (['paye', 'payee', 'paid', 'valide', 'validee'].includes(normalized)) return 'paid';
    if (['retard', 'late'].includes(normalized)) return 'late';
    if (['attente', 'pending', 'en_attente'].includes(normalized)) return 'pending';
    return '';
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return `${value}`;
    return `${numberValue.toFixed(2)} €`;
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return `${value}`;
    return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fetchPayments = async () => {
    setIsLoadingPayments(true);
    setPaymentsError('');
    try {
      const data = await apiGet('/api/cotisations');
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setPayments(Array.isArray(list) ? list : []);
    } catch (error) {
      setPaymentsError("Impossible de charger les paiements.");
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const fetchUsers = async () => {
    setUsersError('');
    try {
      const data = await apiGet('/api/users');
      const list = Array.isArray(data) ? data : data?.data ?? [];
      const activeUsers = Array.isArray(list)
        ? list.filter((user) => (user?.statut ?? '').toLowerCase() === 'actif')
        : [];
      setUsers(activeUsers);
    } catch (error) {
      setUsersError("Impossible de charger les utilisateurs.");
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await apiFetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggingOut(false);
      navigate('/');
    }
  };

  const handlePaymentFieldChange = (field, value) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (isSubmittingPayment) return;
    setIsSubmittingPayment(true);
    setPaymentError('');
    try {
      const payload = {
        user_id: Number(paymentForm.user_id),
        montant: Number(paymentForm.montant),
      };
      await apiPost('/api/cotisations', payload);
      setIsAddPaymentOpen(false);
      setPaymentForm({ user_id: '', montant: '' });
      await fetchPayments();
    } catch (error) {
      setPaymentError("Impossible d'enregistrer le paiement.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const paymentsDisplay = useMemo(() => {
    return payments.map((payment) => {
      const userId = payment?.user_id ?? payment?.membre_id ?? payment?.member_id ?? payment?.adherente_id;
      const user =
        payment?.user ||
        payment?.membre ||
        payment?.member ||
        payment?.adherente ||
        users.find((item) => item?.id === userId) ||
        null;
      const fullName = `${payment?.nom ?? user?.nom ?? ''} ${payment?.prenom ?? user?.prenom ?? ''}`.trim();
      const memberId = payment?.memberId || payment?.member_id || userId || '-';
      const statusValue = payment?.statut ?? payment?.status;
      return {
        id: payment?.id ?? `${userId}-${payment?.date ?? payment?.created_at ?? Math.random()}`,
        initials: getInitials(user?.nom, user?.prenom),
        name: fullName || '-',
        memberId: memberId ? `ID: ${memberId}` : 'ID: -',
        date: formatDate(payment?.date ?? payment?.created_at),
        period: payment?.periode ?? payment?.period ?? '-',
        amount: formatAmount(payment?.montant ?? payment?.amount),
        status: mapStatus(statusValue),
        rawStatus: statusValue ?? '',
        color: '#E9D5FF',
      };
    });
  }, [payments, users]);

  const filteredPaymentsDisplay = useMemo(() => {
    if (activeTab === 'payes') {
      return paymentsDisplay.filter((payment) => payment.status === 'paid');
    }
    if (activeTab === 'attente') {
      return paymentsDisplay.filter((payment) => payment.status === 'pending');
    }
    if (activeTab === 'retard') {
      return paymentsDisplay.filter((payment) => payment.status === 'late');
    }
    return paymentsDisplay;
  }, [activeTab, paymentsDisplay]);

  const stats = [
    {
      title: "TOTAL COLLECTÉ (ANNUEL)",
      amount: "15.400,00 €",
      change: "+12%",
      subtitle: "Dernière mise à jour: Aujourd'hui, 09:41",
      icon: "💰",
      color: "purple"
    },
    {
      title: "IMPAYÉS / RETARD",
      amount: "2.150,00 €",
      change: "+5%",
      subtitle: "14 membres en retard de paiement",
      icon: "⚠️",
      color: "orange"
    },
    {
      title: "MEMBRES ACTIVES",
      amount: "124",
      change: "-2%",
      subtitle: "Nouvelles adhésions ce mois: 3",
      icon: "👥",
      color: "blue"
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" 
                style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: '#059669' }}></span>
            Payé
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: '#DC2626' }}></span>
            En retard
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
            <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: '#F59E0B' }}></span>
            En attente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#E5E7EB', color: '#374151' }}>
            Inconnu
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Suivi des Cotisations</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une membre ou une transaction..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={{ fontSize: '14px' }}
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </button>
            <button
              type="button"
              onClick={() => setIsAddPaymentOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#9333EA' }}>
              <Plus size={20} />
              Enregistrer un paiement
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {stat.title}
                </span>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                     style={{ 
                       backgroundColor: stat.color === 'purple' ? '#F3E8FF' : 
                                       stat.color === 'orange' ? '#FFF7ED' : '#EFF6FF'
                     }}>
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.amount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.subtitle}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-8">
                {[
                  { key: 'tous', label: 'Tous les paiements' },
                  { key: 'payes', label: 'Payés' },
                  { key: 'attente', label: 'En attente' },
                  { key: 'retard', label: 'En retard' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Filter size={16} />
                  Filtres
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <FileText size={16} />
                  PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <FileSpreadsheet size={16} />
                  Excel
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoadingPayments && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Chargement des paiements...
                    </td>
                  </tr>
                )}
                {!isLoadingPayments && paymentsError && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-red-600">
                      {paymentsError}
                    </td>
                  </tr>
                )}
                {!isLoadingPayments && !paymentsError && filteredPaymentsDisplay.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Aucun paiement enregistré.
                    </td>
                  </tr>
                )}
                {!isLoadingPayments && !paymentsError && filteredPaymentsDisplay.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{ backgroundColor: payment.color, color: '#374151' }}
                        >
                          {payment.initials}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {payment.memberId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.period}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {payment.amount}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical size={18} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de 4 sur 124 membres
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </main>

      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            onClick={() => setIsAddPaymentOpen(false)}
            className="absolute inset-0 z-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-black/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Enregistrer un paiement</h3>
              <p className="text-sm text-slate-500 mt-1">
                Sélectionnez l'adhérente et saisissez le montant.
              </p>
            </div>
            <form onSubmit={handleAddPayment} className="px-6 py-5 space-y-4">
              <div>
                <label htmlFor="payment-user" className="block text-sm font-semibold text-slate-900 mb-2">
                  Utilisatrice
                </label>
                <select
                  id="payment-user"
                  value={paymentForm.user_id}
                  onChange={(e) => handlePaymentFieldChange('user_id', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/60 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all text-base text-slate-900"
                  required
                >
                  <option value="">Sélectionner une utilisatrice</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {`${user?.nom ?? ''} ${user?.prenom ?? ''}`.trim()} {user?.email ? `- ${user.email}` : ''}
                    </option>
                  ))}
                </select>
                {usersError && (
                  <p className="text-xs text-red-600 mt-2">{usersError}</p>
                )}
              </div>
              <div>
                <label htmlFor="payment-amount" className="block text-sm font-semibold text-slate-900 mb-2">
                  Montant
                </label>
                <input
                  id="payment-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.montant}
                  onChange={(e) => handlePaymentFieldChange('montant', e.target.value)}
                  placeholder="150.00"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/60 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all text-base text-slate-900"
                  required
                />
              </div>
              {paymentError && (
                <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium border border-red-200">
                  {paymentError}
                </div>
              )}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPaymentOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-all duration-200 font-medium bg-gray-200 text-base"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-base"
                >
                  {isSubmittingPayment ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CotisationsTracker;
