import { useEffect, useState, useMemo } from 'react';
import pointService from '../../../../../configurations/Services/pointService.js';
import authService from '../../../../../configurations/Services/authServices.js';
import { useLocation } from 'react-router-dom';
import {
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSkull,
  FaBan,
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaUserShield,
  FaUserCog,
  FaSyncAlt,
  FaUpload,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../../../../../configurations/Context/AuthProvider';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { jwtDecode } from 'jwt-decode';
import { usePopup } from '../../../../../configurations/Context/PopupContext.jsx';

const KpiCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-current/20 transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const { setActivePopup } = usePopup();
  const handleImport = () => setActivePopup('importUser');

  // ==================== HOOKS ====================
  const { allUsers } = useAuth();

  // Autorisation: uniquement si role === 'admin'
  const isAdmin = useMemo(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const decoded = jwtDecode(token);
      return decoded?.role === 'admin';
    } catch (error) {
      console.error('Erreur de décodage du token :', error);
      return false;
    }
  }, []);
  const location = useLocation();

  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkMode, setBulkMode] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    email: '',
    role: 'user',
    status: 'active',
    is_active: 1,
    number: '',
  });
  const [deleteReason, setDeleteReason] = useState('admin_remove');
  const [deleteComment, setDeleteComment] = useState('');

  const handleToggleActive = async (user) => {
    if (!isAdmin) {
      alert('Action réservée aux administrateurs.');
      return;
    }
    const id = user?.user_id || user?.id;
    if (!id) return;

    const isActive = user.is_active === 1;
    const actionLabel = isActive ? 'Bannir' : 'Activer';
    const newStatus = isActive ? 'suspended' : 'active';
    const newActiveState = isActive ? 0 : 1;

    const confirmed = window.confirm(`${actionLabel} ${user.name || 'cet utilisateur'} ?`);
    if (!confirmed) return;

    try {
      await authService.updateUserAdmin(id, { is_active: newActiveState, status: newStatus });
      setUsers((prev) =>
        prev.map((u) =>
          (u.user_id || u.id) === id ? { ...u, is_active: newActiveState, status: newStatus } : u
        )
      );
    } catch (err) {
      console.error('Erreur changement statut:', err);
      alert(err?.message || 'Erreur lors du changement de statut');
    }
  };

  const handleBanSingle = async (user) => {
    if (!isAdmin) {
      alert('Action réservée aux administrateurs.');
      return;
    }
    const id = user?.user_id || user?.id;
    if (!id) return;
    const confirmed = window.confirm(`Bannir ${user.name || 'cet utilisateur'} ?`);
    if (!confirmed) return;
    try {
      await authService.updateUserAdmin(id, { is_active: 0, status: 'suspended' });
      setUsers((prev) =>
        prev.map((u) =>
          (u.user_id || u.id) === id ? { ...u, is_active: 0, status: 'suspended' } : u
        )
      );
    } catch (err) {
      console.error('Erreur bannissement:', err);
      alert(err?.message || 'Erreur lors du bannissement');
    }
  };

  const handleBulkBan = async () => {
    if (!isAdmin) {
      alert('Action réservée aux administrateurs.');
      return;
    }
    if (!selectedUsers.length) return;
    const confirmed = window.confirm(`Bannir ${selectedUsers.length} utilisateur(s) ?`);
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedUsers.map((id) =>
          authService.updateUserAdmin(id, { is_active: 0, status: 'suspended' })
        )
      );
      setUsers((prev) =>
        prev.map((u) =>
          selectedUsers.includes(u.user_id || u.id)
            ? { ...u, is_active: 0, status: 'suspended' }
            : u
        )
      );
      setSelectedUsers([]);
    } catch (err) {
      console.error('Erreur bannissement en masse:', err);
      alert(err?.message || 'Erreur lors du bannissement');
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Management des utilisateurs';
  }, []);

  useEffect(() => {
    // Ouvrir la modale d'ajout si on vient du Dashboard avec state.openAdd
    if (location.state?.openAdd) {
      openModal('add');
    }
  }, [location.state]);

  // Bloque le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (showModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev || 'auto';
      };
    }
  }, [showModal]);

  useEffect(() => {
    const fetchUsersWithPoints = async () => {
      try {
        setLoading(true);
        let fetchedUsers = [];

        if (typeof allUsers === 'function') {
          const data = await allUsers();
          fetchedUsers = Array.isArray(data) ? data : [];
        } else if (Array.isArray(allUsers)) {
          fetchedUsers = allUsers;
        } else {
          fetchedUsers = [];
        }

        const usersWithPoints = await Promise.all(
          fetchedUsers.map(async (user) => {
            try {
              const pointsData = await pointService.getUserPoints(user.user_id);
              const totalPoints = Number(pointsData?.total_points) || 0;
              const totalGamesPlayed = Number(pointsData?.total_games_played) || 0;
              return { ...user, total_points: totalPoints, quiz_completed: totalGamesPlayed };
            } catch (error) {
              return {
                ...user,
                total_points: 0,
                quiz_completed: Number(user?.quiz_completed) || 0,
              };
            }
          })
        );

        setUsers(usersWithPoints);
      } catch (error) {
        console.error('❌ Erreur générale lors du chargement des utilisateurs:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersWithPoints();
  }, []);

  // ==================== COMPUTED VALUES ====================
  const safeUsers = Array.isArray(users) ? users : [];

  const stats = {
    total: safeUsers.length,
    active: safeUsers.filter((u) => u.status === 'active' && u.is_active !== 0).length,
    inactive: safeUsers.filter((u) => u.status === 'inactive').length,
    banned: safeUsers.filter((u) => u.is_active === 0 || u.status === 'suspended').length,
    admins: safeUsers.filter((u) => u.role === 'admin').length,
    moderators: safeUsers.filter((u) => u.role === 'moderator').length,
    regularUsers: safeUsers.filter((u) => u.role === 'user').length,
  };

  const roleDistribution = [
    { name: 'Admins', value: stats.admins, color: '#3b82f6' },
    { name: 'Modérateurs', value: stats.moderators, color: '#8b5cf6' },
    { name: 'Utilisateurs', value: stats.regularUsers, color: '#f59e0b' },
  ];

  const getUserDate = (u) =>
    u?.created_at || u?.date_cx || u?.dateCx || u?.last_login || u?.lastLogin || null;

  const getMonthName = (rawDate) => {
    const date = new Date(rawDate);
    if (isNaN(date)) return null;
    return date.toLocaleString('fr-FR', { month: 'short' });
  };

  const getYear = (rawDate) => {
    const date = new Date(rawDate);
    return isNaN(date) ? null : date.getFullYear();
  };

  const orderedMonths = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
  ];

  const availableYears = [
    ...new Set(users.map((u) => getYear(getUserDate(u))).filter((y) => y !== null)),
  ].sort((a, b) => a - b);

  const [selectedYear, setSelectedYear] = useState(
    availableYears.at(-1) ?? new Date().getFullYear()
  );

  const selectedYearValue = Number.isFinite(selectedYear)
    ? selectedYear
    : (availableYears.at(-1) ?? new Date().getFullYear());

  useEffect(() => {
    if (availableYears.length && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears.at(-1));
    }
  }, [users]);

  const filteredUserss = users.filter((u) => getYear(getUserDate(u)) === selectedYearValue);

  const monthlyRegistrations = orderedMonths.map((month) => ({
    month,
    users: filteredUserss.filter((u) => getMonthName(getUserDate(u)) === month).length,
  }));

  const orderedDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getMondayBasedIndex = (date) => {
    const d = new Date(date);
    return (d.getDay() + 6) % 7;
  };

  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const usersByDay = users.reduce((acc, user) => {
    const raw = user.date_cx || user.dateCx || user.lastLogin || user.last_login;
    if (!raw) return acc;
    const d = new Date(raw);
    if (isNaN(d) || d < startOfWeek) return acc;
    const idx = getMondayBasedIndex(d);
    const label = orderedDays[idx];
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const activityData = orderedDays.map((day) => ({
    day,
    logins: usersByDay[day] || 0,
  }));

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    setFilterActive('all');
    setFilterDate('');
    setSortConfig({ key: 'created_at', direction: 'desc' });
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = ['id', 'user_id', 'name', 'first_name', 'email', 'role', 'status', 'is_active', 'created_at'];
    const rows = filteredUsers.map((u) => {
      const created = getUserDate(u);
      return [
        u.id ?? '', u.user_id ?? '', u.name ?? '', u.first_name ?? '', u.email ?? '',
        u.role ?? '', u.status ?? '', u.is_active ?? '', created ? new Date(created).toISOString() : '',
      ];
    });
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = useMemo(() => {
    const normalizeStr = (s) => String(s || '').toLowerCase().trim();
    const toDayStr = (d) => {
      const date = new Date(d);
      return isNaN(date) ? null : date.toISOString().slice(0, 10);
    };

    const base = safeUsers.filter((user) => {
      const matchesSearch = !searchTerm || normalizeStr(user.name).includes(normalizeStr(searchTerm)) || normalizeStr(user.first_name).includes(normalizeStr(searchTerm)) || normalizeStr(user.email).includes(normalizeStr(searchTerm));
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesActive = filterActive === 'all' || String(user.is_active ?? '').trim() === filterActive;
      const matchesDate = !filterDate || toDayStr(getUserDate(user)) === filterDate;
      return matchesSearch && matchesRole && matchesStatus && matchesActive && matchesDate;
    });

    const sorted = [...base];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'user') {
          aVal = normalizeStr(a.name || a.first_name || a.email);
          bVal = normalizeStr(b.name || b.first_name || b.email);
        } else if (['created_at', 'date_cx', 'last_login'].includes(sortConfig.key)) {
          aVal = new Date(getUserDate(a) || 0).getTime();
          bVal = new Date(getUserDate(b) || 0).getTime();
        } else if (sortConfig.key === 'score') {
          aVal = Number(a.total_points || a.score || 0);
          bVal = Number(b.total_points || b.score || 0);
        } else if (sortConfig.key === 'quiz') {
          aVal = Number(a.quiz_completed || a.quizCompleted || 0);
          bVal = Number(b.quiz_completed || b.quizCompleted || 0);
        }
        if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [safeUsers, searchTerm, filterRole, filterStatus, filterActive, filterDate, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages || 1);
  }, [totalPages, currentPage]);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const handleSelectAllCurrentPage = () => {
    const ids = displayedUsers.map((u) => u.user_id || u.id);
    const allSelected = ids.every((id) => selectedUsers.includes(id));
    if (allSelected) setSelectedUsers((prev) => prev.filter((id) => !ids.includes(id)));
    else setSelectedUsers((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleApplyBulkMode = async () => {
    if (!isAdmin || !selectedUsers.length) return;
    try {
      const updates = {
        active: { is_active: 1, status: 'active' },
        not_valid: { is_active: 0 },
        suspended: { status: 'suspended', is_active: 1 },
        deleted: { status: 'deleted' },
      };
      await Promise.all(selectedUsers.map((id) => authService.updateUserAdmin(id, updates[bulkMode])));
      setUsers((prev) => prev.map((u) => selectedUsers.includes(u.user_id || u.id) ? { ...u, ...updates[bulkMode] } : u));
      setSelectedUsers([]);
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'Erreur lors de l\'action groupée');
    }
  };

  const handleBulkHardDelete = async () => {
    if (!isAdmin || !selectedUsers.length) return;
    if (!window.confirm(`Suppression DÉFINITIVE de ${selectedUsers.length} utilisateurs ?`)) return;
    try {
      await Promise.all(selectedUsers.map((id) => authService.hardDeleteUser(id)));
      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.user_id || u.id)));
      setSelectedUsers([]);
      alert('Utilisateurs supprimés définitivement.');
    } catch (err) {
      alert(err?.message || 'Erreur lors de la suppression');
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setCurrentUser(user);
    setShowModal(true);
    if (type === 'edit' && user) {
      setFormData({
        name: user.name || '', firstName: user.first_name || '', email: user.email || '',
        role: user.role || 'user', status: user.status || 'active', is_active: user.is_active ?? 1, number: user.number || '',
      });
    }
  };

  const closeModal = () => { setShowModal(false); setCurrentUser(null); setModalType(''); };

  const handleSave = async () => {
    try {
      const id = currentUser?.user_id || currentUser?.id;
      if (modalType === 'edit') {
        const payload = isAdmin ? {
          name: formData.name, first_name: formData.firstName, email: formData.email,
          role: formData.role, status: formData.status, is_active: formData.is_active, number: formData.number || null,
        } : {
          name: formData.name, first_name: formData.firstName, email: formData.email, number: formData.number || null,
        };
        const res = await (isAdmin ? authService.updateUserAdmin(id, payload) : authService.putUserById(id, payload));
        const updated = res?.user || { ...currentUser, ...payload };
        setUsers((prev) => prev.map((u) => ((u.user_id || u.id) === id ? { ...u, ...updated } : u)));
      } else if (modalType === 'add') {
        const password = Math.random().toString(36).slice(-12);
        const payload = { first_name: formData.firstName, name: formData.name, email: formData.email, role: formData.role, password, number: null };
        const response = await authService.register(payload);
        setUsers((prev) => [{ ...response.user, status: formData.status }, ...prev]);
      } else if (modalType === 'delete') {
        await authService.deleteUserSoft({ user_id: id, reason: deleteReason, comment: deleteComment });
        setUsers((prev) => prev.map((u) => ((u.user_id || u.id) === id ? { ...u, status: 'deleted' } : u)));
      }
      closeModal();
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Erreur lors de l'action");
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-blue-600', label: 'Admin', icon: FaUserShield },
      moderator: { bg: 'bg-purple-600', label: 'Modérateur', icon: FaUserCog },
      user: { bg: 'bg-slate-500', label: 'Utilisateur', icon: FaUserCog },
    };
    const badge = badges[role] || badges.user;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${badge.bg}`}>
        <Icon size={10} /> {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status, is_active) => {
    if (is_active === 0 || status === 'suspended') return <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-white uppercase tracking-wider">Suspendu</span>;
    const badges = {
      active: { bg: 'bg-emerald-500', label: 'Actif' },
      inactive: { bg: 'bg-slate-400', label: 'Inactif' },
      deleted: { bg: 'bg-red-600', label: 'Supprimé' },
    };
    const badge = badges[status] || badges.active;
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${badge.bg}`}>{badge.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Chargement des utilisateurs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Utilisateurs</h1>
          <p className="text-slate-500 font-medium">Gérez votre communauté et les permissions</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <FaUserPlus /> <span>Ajouter un utilisateur</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total" value={stats.total} icon={FaUsers} color="bg-slate-900" />
        <KpiCard title="Actifs" value={stats.active} icon={FaCheckCircle} color="bg-emerald-500" />
        <KpiCard title="Admins" value={stats.admins} icon={FaUserShield} color="bg-blue-600" />
        <KpiCard title="Modérateurs" value={stats.moderators} icon={FaUserCog} color="bg-purple-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Inscriptions mensuelles</h3>
            <div className="flex gap-2">
              {availableYears.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${year === selectedYearValue ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRegistrations}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Inscriptions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Répartition</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {roleDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/20"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Modérateur</option>
              <option value="user">Utilisateur</option>
            </select>
            <select
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/20"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="deleted">Supprimé</option>
            </select>
            <button
              onClick={resetFilters}
              className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
              title="Réinitialiser"
            >
              <FaSyncAlt />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all"
            >
              <FaUpload /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                    checked={displayedUsers.length > 0 && displayedUsers.every(u => selectedUsers.includes(u.user_id || u.id))}
                    onChange={handleSelectAllCurrentPage}
                  />
                </th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => requestSort('user')}>
                  <div className="flex items-center gap-2">
                    Utilisateur
                    <FaSort className={`transition-colors ${sortConfig.key === 'user' ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
                  </div>
                </th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rôle & Statut</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => requestSort('last_login')}>
                  <div className="flex items-center gap-2">
                    Activité
                    <FaSort className={`transition-colors ${sortConfig.key === 'last_login' ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`} />
                  </div>
                </th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stats</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedUsers.map((user) => {
                const userId = user.user_id || user.id;
                return (
                  <tr key={userId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                        checked={selectedUsers.includes(userId)}
                        onChange={() => handleSelectUser(userId)}
                      />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg overflow-hidden ring-2 ring-white shadow-sm">
                          {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : (user.first_name?.[0] || user.name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{user.first_name} {user.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5 items-start">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status, user.is_active)}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-700">
                        {user.date_cx ? new Date(user.date_cx).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Jamais'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dernière connexion</p>
                    </td>
                    <td className="p-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-black text-blue-600">{user.total_points || 0}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Points</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal('view', user)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Détails"><FaEye size={16} /></button>
                        <button onClick={() => openModal('edit', user)} className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all" title="Modifier"><FaEdit size={16} /></button>
                        {isAdmin && (
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`p-2.5 rounded-xl transition-all ${user.is_active ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                            title={user.is_active ? 'Bannir' : 'Activer'}
                          >
                            {user.is_active ? <FaBan size={16} /> : <FaCheckCircle size={16} />}
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Supprimer définitivement ${user.first_name} ?`)) {
                                authService.hardDeleteUser(userId).then(() => setUsers(prev => prev.filter(u => (u.user_id || u.id) !== userId)));
                              }
                            }}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Suppression définitive"
                          >
                            <FaSkull size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Affichage {Math.min(filteredUsers.length, (currentPage - 1) * pageSize + 1)} - {Math.min(filteredUsers.length, currentPage * pageSize)} sur {filteredUsers.length}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Précédent
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-slate-900 text-white rounded-3xl shadow-2xl shadow-slate-900/40 animate-in slide-in-from-bottom-8 duration-300 z-50">
          <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">{selectedUsers.length}</div>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">Sélectionnés</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="bg-slate-800 border-none rounded-xl text-xs font-bold text-white px-4 py-2 focus:ring-2 focus:ring-blue-600/40"
              value={bulkMode}
              onChange={(e) => setBulkMode(e.target.value)}
              disabled={!isAdmin}
            >
              <option value="active">Activer</option>
              <option value="not_valid">Invalider</option>
              <option value="suspended">Suspendre</option>
              <option value="deleted">Corbeille</option>
            </select>
            <button
              onClick={handleApplyBulkMode}
              disabled={!isAdmin}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Appliquer
            </button>
            <button
              onClick={handleBulkHardDelete}
              disabled={!isAdmin}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Suppression définitive"
            >
              <FaSkull />
            </button>
          </div>
          <button
            onClick={() => setSelectedUsers([])}
            className="p-2 text-slate-400 hover:text-white transition-colors border-l border-slate-700 pl-6"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {modalType === 'add' && 'Nouvel utilisateur'}
                {modalType === 'edit' && 'Modifier le profil'}
                {modalType === 'view' && 'Profil utilisateur'}
                {modalType === 'delete' && 'Confirmation'}
              </h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><FaTimes /></button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {modalType === 'delete' ? (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FaTrash size={32} />
                  </div>
                  <p className="text-slate-600 font-medium">Êtes-vous sûr de vouloir supprimer <strong>{currentUser?.first_name} {currentUser?.name}</strong> ?</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cette action peut être annulée ultérieurement.</p>
                </div>
              ) : modalType === 'view' && currentUser ? (
                <div className="space-y-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[32px] bg-slate-100 ring-4 ring-white shadow-xl overflow-hidden mb-4">
                      {currentUser.avatar_url ? <img src={currentUser.avatar_url} className="w-full h-full object-cover" /> : (currentUser.first_name?.[0] || '?').toUpperCase()}
                    </div>
                    <h4 className="text-2xl font-bold text-slate-900">{currentUser.first_name} {currentUser.name}</h4>
                    <p className="text-slate-500 font-medium">{currentUser.email}</p>
                    <div className="mt-4 flex gap-2">
                      {getRoleBadge(currentUser.role)}
                      {getStatusBadge(currentUser.status, currentUser.is_active)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Score Total</p>
                      <p className="text-lg font-black text-blue-600">{currentUser.total_points || 0} pts</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Quiz finis</p>
                      <p className="text-lg font-black text-slate-900">{currentUser.quiz_completed || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl col-span-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Dernière activité</p>
                      <p className="text-sm font-bold text-slate-700">{currentUser.date_cx ? new Date(currentUser.date_cx).toLocaleString('fr-FR') : 'Aucune'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Prénom</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Nom</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Rôle</label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="moderator">Modérateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Statut</label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
                        value={formData.status}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="deleted">Supprimé</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 flex gap-3">
              <button onClick={closeModal} className="flex-1 px-6 py-4 bg-white text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all">Annuler</button>
              {modalType !== 'view' && (
                <button
                  onClick={handleSave}
                  className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${modalType === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
                >
                  {modalType === 'delete' ? 'Supprimer' : modalType === 'add' ? 'Créer' : 'Enregistrer'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
