import { useEffect, useState, useMemo } from 'react';
import pointService from '../../../../../configurations/Services/pointService.js';
import authService from '../../../../../configurations/Services/authServices.js';
import { useLocation } from 'react-router-dom';
import {
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaUserShield,
  FaUserCog,
  FaSyncAlt,
  FaUpload,
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
} from 'recharts';
import { jwtDecode } from 'jwt-decode';
import { usePopup } from '../../../../../configurations/Context/PopupContext.jsx';

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
  const [sortOrder, setSortOrder] = useState('recent');
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

  useEffect(() => {
    const fetchUsersWithPoints = async () => {
      try {
        setLoading(true);
        //console.log("🌀 Début du chargement des utilisateurs et de leurs points...");

        let fetchedUsers = [];

        // 1️⃣ Récupération des utilisateurs
        if (typeof allUsers === 'function') {
          const data = await allUsers();
          fetchedUsers = Array.isArray(data) ? data : [];
        } else if (Array.isArray(allUsers)) {
          fetchedUsers = allUsers;
        } else {
          fetchedUsers = [];
        }

        console.log('✅ Utilisateurs récupérés:', fetchedUsers.length);

        // 2️⃣ Récupération des points pour chaque utilisateur
        const usersWithPoints = await Promise.all(
          fetchedUsers.map(async (user) => {
            try {
              const pointsData = await pointService.getUserPoints(user.user_id);
              //console.log(`⭐ Points pour ${user.name || "?"} (id:${user.user_id}):`, pointsData?.total_points);
              return { ...user, total_points: pointsData?.total_points || 0 };
            } catch (error) {
              console.error(`❌ Erreur récupération points pour user_id=${user.user_id}:`, error);
              return { ...user, total_points: 0 }; // sécurité en cas d'erreur
            }
          })
        );

        // 3️⃣ Mise à jour du state final
        setUsers(usersWithPoints);
        //console.log("✅ Données finales utilisateurs + points:", usersWithPoints);
      } catch (error) {
        console.error('❌ Erreur générale lors du chargement des utilisateurs:', error);
        setUsers([]);
      } finally {
        setLoading(false);
        console.log('🏁 Chargement terminé.');
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
    { name: 'Administrateurs', value: stats.admins, color: '#ef4444' },
    { name: 'Modérateurs', value: stats.moderators, color: '#f59e0b' },
    { name: 'Utilisateurs', value: stats.regularUsers, color: '#3b82f6' },
  ];

  //___________________________

  // 🧠 Utilitaires : formater les mois et années (robustes)
  const getUserDate = (u) =>
    u?.created_at || u?.date_cx || u?.dateCx || u?.last_login || u?.lastLogin || null;

  const getMonthName = (rawDate) => {
    const date = new Date(rawDate);
    if (isNaN(date)) return null;
    return date.toLocaleString('fr-FR', { month: 'long' });
  };

  const getYear = (rawDate) => {
    const date = new Date(rawDate);
    return isNaN(date) ? null : date.getFullYear();
  };

  // 🧾 Liste des mois dans l'ordre
  const orderedMonths = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];

  // 🧩 Étape 1 : années valides uniquement
  const availableYears = [
    ...new Set(users.map((u) => getYear(getUserDate(u))).filter((y) => y !== null)),
  ].sort((a, b) => a - b);

  // 🧩 Étape 2 : Année sélectionnée (fallback sûr)
  const [selectedYear, setSelectedYear] = useState(
    availableYears.at(-1) ?? new Date().getFullYear()
  );

  // Valeur sûre pour comparaisons
  const selectedYearValue = Number.isFinite(selectedYear)
    ? selectedYear
    : (availableYears.at(-1) ?? new Date().getFullYear());

  // Sync si liste d'années change après chargement des users
  useEffect(() => {
    if (availableYears.length && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears.at(-1));
    }
  }, [users]); // ... ou [availableYears]

  // 🧩 Étape 3 : Filtrer par année
  const filteredUserss = users.filter((u) => getYear(getUserDate(u)) === selectedYearValue);

  // 🧩 Étape 4 : Regrouper par mois
  const monthlyRegistrations = orderedMonths.map((month) => ({
    month,
    users: filteredUserss.filter((u) => getMonthName(getUserDate(u)) === month).length,
  }));

  //_____________________________
  //Utilitaire : formater le jour de la semaine

  // _______________________________________________
  // Utilitaire : jours ordonnés (lundi → dimanche)
  const orderedDays = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

  // Fonction utilitaire pour obtenir l'index de jour (0 = lundi, 6 = dimanche)
  const getMondayBasedIndex = (date) => {
    const d = new Date(date);
    // getDay(): 0 = dimanche, 1 = lundi, ..., 6 = samedi
    // On veut : 0 = lundi, 1 = mardi, ..., 6 = dimanche
    return (d.getDay() + 6) % 7;
  };

  // Calculer le début de la semaine (lundi 00:00:00) sans muter `today`
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = lundi ... 6 = dimanche
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0); // début du lundi

  // Debug : afficher startOfWeek
  //console.log('🔎 startOfWeek:', startOfWeek.toISOString());

  // Étape 1 : compter les connexions (date_cx) pour la semaine courante
  const usersByDay = users.reduce((acc, user) => {
    const raw = user.date_cx || user.dateCx || user.lastLogin || user.last_login;
    if (!raw) return acc;

    const d = new Date(raw);
    if (isNaN(d)) return acc; // ignore si date non valide

    // ignorer si avant le début de la semaine
    if (d < startOfWeek) return acc;

    const idx = getMondayBasedIndex(d); // 0..6
    const label = orderedDays[idx];
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  // Debug : montrer le compteur brut
  //console.log('🔎 usersByDay (brut) :', usersByDay);

  // Étape 2 : construire le tableau pour Recharts (toujours les 7 jours)
  const activityData = orderedDays.map((day) => ({
    day,
    logins: usersByDay[day] || 0,
  }));

  // Debug : afficher le tableau final
  //console.log('📈 activityData :', activityData);

  // _______________________________________________

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
    setFilterActive('all');
    setFilterDate('');
    setSortOrder('recent');
    setCurrentPage(1);
  };

  // Export CSV de la liste filtrée
  const handleExport = () => {
    const headers = [
      'id',
      'user_id',
      'name',
      'first_name',
      'email',
      'role',
      'status',
      'is_active',
      'created_at',
    ];

    const rows = filteredUsers.map((u) => {
      const created = getUserDate(u);
      const createdStr = created ? new Date(created).toISOString() : '';
      return [
        u.id ?? '',
        u.user_id ?? '',
        u.name ?? '',
        u.first_name ?? '',
        u.email ?? '',
        u.role ?? '',
        u.status ?? '',
        u.is_active ?? '',
        createdStr,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const v = String(cell ?? '');
            // Échapper les guillemets et entourer de guillemets
            const escaped = v.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.download = `export-utilisateurs-${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtrage + Tri
  const filteredUsers = useMemo(() => {
    const normalizeStr = (s) =>
      String(s || '')
        .toLowerCase()
        .trim();
    const toDayStr = (d) => {
      const date = new Date(d);
      return isNaN(date) ? null : date.toISOString().slice(0, 10);
    };

    const requestedDay = filterDate || '';
    const requestedDayStr = requestedDay ? requestedDay : '';

    const base = safeUsers.filter((user) => {
      const nameMatch = normalizeStr(user.name).includes(normalizeStr(searchTerm));
      const firstNameMatch = normalizeStr(user.first_name).includes(normalizeStr(searchTerm));
      const emailMatch = normalizeStr(user.email).includes(normalizeStr(searchTerm));
      const matchesSearch = !searchTerm || nameMatch || firstNameMatch || emailMatch;

      const matchesRole = filterRole === 'all' || user.role === filterRole;

      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

      const matchesActive =
        filterActive === 'all' || String(user.is_active ?? '').trim() === filterActive;

      const uDateRaw = getUserDate(user);
      const uDateDay = uDateRaw ? toDayStr(uDateRaw) : null;
      const matchesDate = !requestedDayStr || uDateDay === requestedDayStr;

      return matchesSearch && matchesRole && matchesStatus && matchesActive && matchesDate;
    });

    const byDateVal = (u) => {
      const d = getUserDate(u);
      const nd = new Date(d);
      return isNaN(nd) ? 0 : nd.getTime();
    };

    const byNameVal = (u) => normalizeStr(u.name || u.first_name || u.email || '');

    const sorted = [...base];
    if (sortOrder === 'recent') {
      sorted.sort(
        (a, b) => byDateVal(b) - byDateVal(a) || byNameVal(a).localeCompare(byNameVal(b))
      );
    } else if (sortOrder === 'oldest') {
      sorted.sort(
        (a, b) => byDateVal(a) - byDateVal(b) || byNameVal(a).localeCompare(byNameVal(b))
      );
    } else if (sortOrder === 'az') {
      sorted.sort((a, b) => byNameVal(a).localeCompare(byNameVal(b)));
    } else if (sortOrder === 'za') {
      sorted.sort((a, b) => byNameVal(b).localeCompare(byNameVal(a)));
    }

    return sorted;
  }, [safeUsers, searchTerm, filterRole, filterStatus, filterActive, filterDate, sortOrder]);

  // ==================== HANDLERS ====================
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages, currentPage]);

  const handleSelectAllCurrentPage = () => {
    const ids = displayedUsers.map((u) => u.user_id || u.id);
    const allSelected = ids.every((id) => selectedUsers.includes(id));
    if (allSelected) {
      setSelectedUsers((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedUsers((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  // Suppression en masse
  const handleApplyBulkMode = async () => {
    if (!isAdmin) {
      alert('Action réservée aux administrateurs.');
      return;
    }
    if (!selectedUsers.length) return;

    try {
      if (bulkMode === 'active') {
        await Promise.all(
          selectedUsers.map((id) =>
            authService.updateUserAdmin(id, { is_active: 1, status: 'active' })
          )
        );
        setUsers((prev) =>
          prev.map((u) =>
            selectedUsers.includes(u.user_id || u.id) ? { ...u, is_active: 1, status: 'active' } : u
          )
        );
      } else if (bulkMode === 'not_valid') {
        await Promise.all(
          selectedUsers.map((id) => authService.updateUserAdmin(id, { is_active: 0 }))
        );
        setUsers((prev) =>
          prev.map((u) => (selectedUsers.includes(u.user_id || u.id) ? { ...u, is_active: 0 } : u))
        );
      } else if (bulkMode === 'suspended') {
        await Promise.all(
          selectedUsers.map((id) =>
            authService.updateUserAdmin(id, { status: 'suspended', is_active: 1 })
          )
        );
        setUsers((prev) =>
          prev.map((u) =>
            selectedUsers.includes(u.user_id || u.id)
              ? { ...u, status: 'suspended', is_active: 1 }
              : u
          )
        );
      } else if (bulkMode === 'deleted') {
        await Promise.all(
          selectedUsers.map((id) => authService.updateUserAdmin(id, { status: 'deleted' }))
        );
        setUsers((prev) =>
          prev.map((u) =>
            selectedUsers.includes(u.user_id || u.id) ? { ...u, status: 'deleted' } : u
          )
        );
      }
      setSelectedUsers([]);
    } catch (err) {
      console.error('Erreur changement de mode:', err);
      alert(err?.response?.data?.error || err?.message || 'Erreur lors du changement de mode');
    }
  };

  const handleBulkDelete = async () => {
    if (!isAdmin) {
      alert('Action réservée aux administrateurs.');
      return;
    }
    if (!selectedUsers.length) return;
    const confirmed = window.confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`);
    if (!confirmed) return;

    try {
      await Promise.all(
        selectedUsers.map((id) =>
          authService.deleteUserSoft({
            user_id: id,
            reason: deleteReason || 'admin_remove',
            comment: deleteComment || 'admin_remove',
          })
        )
      );
      // Mettre à jour localement le statut
      setUsers((prev) =>
        prev.map((u) =>
          selectedUsers.includes(u.user_id || u.id) ? { ...u, status: 'deleted' } : u
        )
      );
      setSelectedUsers([]);
    } catch (err) {
      console.error('Erreur suppression en masse:', err);
      alert(err?.message || 'Erreur lors de la suppression');
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setCurrentUser(user);
    setShowModal(true);

    if (type === 'edit' && user) {
      setFormData({
        name: user.name || '',
        firstName: user.first_name || '',
        email: user.email || '',
        role: user.role || 'user',
        status: user.status || 'active',
        is_active: user.is_active ?? 1,
        number: user.number || '',
      });
    }

    if (type === 'delete') {
      setDeleteReason('admin_remove');
      setDeleteComment('');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setModalType('');
    setFormData({ name: '', email: '', role: 'user', status: 'active' });
  };

  const handleSave = async () => {
    if (modalType === 'delete' && !isAdmin) {
      alert('Action réservée aux administrateurs.');
      return;
    }

    try {
      if (modalType === 'edit') {
        const id = currentUser?.user_id || currentUser?.id;
        if (!id) {
          alert('Utilisateur introuvable.');
          return;
        }

        if (isAdmin) {
          // Admin: peut modifier rôle, statut, is_active, etc.
          const payload = {
            name: formData.name,
            first_name: formData.firstName,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            is_active: formData.is_active,
            number: formData.number || null,
          };
          const res = await authService.updateUserAdmin(id, payload);
          const updated = res?.user || { ...currentUser, ...payload };
          setUsers((prev) =>
            prev.map((u) => ((u.user_id || u.id) === id ? { ...u, ...updated } : u))
          );
        } else {
          // Non-admin: modif champs basiques de profil
          const payload = {
            name: formData.name,
            first_name: formData.firstName,
            email: formData.email,
            number: formData.number || null,
          };
          const res = await authService.putUserById(id, payload);
          const updated = res?.user || { ...currentUser, ...payload };
          setUsers((prev) =>
            prev.map((u) => ((u.user_id || u.id) === id ? { ...u, ...updated } : u))
          );
        }

        closeModal();
        return;
      }

      if (modalType === 'add') {
        // Génère un mot de passe fort pour l'inscription admin
        const generatePassword = () =>
          [...Array(12)].map(() => 'admin'[Math.floor(Math.random() * 72)]).join('');

        const payload = {
          first_name: formData?.firstName || '',
          name: formData?.name || '',
          email: formData?.email || '',
          role: formData?.role || 'user',
          password: generatePassword(),
          number: null, // ✅ ne pas envoyer 0, éviter la contrainte unique
        };

        if (!payload.email) {
          alert('Email est requis.');
          return;
        }

        const response = await authService.register(payload);
        const createdUser = {
          ...(response?.user || {}),
          status: formData?.status || 'active',
        };

        setUsers((prev) => [createdUser, ...prev]);
        closeModal();
        return;
      }

      if (modalType === 'delete') {
        const id = currentUser?.user_id || currentUser?.id;
        if (!id) {
          alert('Utilisateur introuvable.');
          return;
        }
        await authService.deleteUserSoft({
          user_id: id,
          reason: deleteReason || 'admin_remove',
          comment: deleteComment || '',
        });
        // Mettre à jour localement le statut
        setUsers((prev) =>
          prev.map((u) => ((u.user_id || u.id) === id ? { ...u, status: 'deleted' } : u))
        );
        closeModal();
        return;
      }

      closeModal();
    } catch (err) {
      console.error('Erreur action utilisateur:', err);
      alert(err?.response?.data?.error || err.message || "Erreur lors de l'action");
    }
  };

  // ==================== RENDER HELPERS ====================
  const getRoleBadge = (role) => {
    const badges = {
      admin: { class: 'bg-danger', label: 'Admin', icon: FaUserShield },
      moderator: { class: 'bg-warning', label: 'Modérateur', icon: FaUserCog },
      user: { class: 'bg-primary', label: 'Utilisateur', icon: FaUserCog },
    };
    const badge = badges[role] || badges.user;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class} d-inline-flex align-items-center gap-1`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status, is_active) => {
    if (is_active === 0 || status === 'suspended') {
      return <span className="badge bg-dark">Suspendu</span>;
    }
    const badges = {
      active: { class: 'bg-success', label: 'Actif' },
      inactive: { class: 'bg-secondary', label: 'Inactif' },
      deleted: { class: 'bg-dark', label: 'Supprimé' },
    };
    const badge = badges[status] || badges.active;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="user-management mt-5">
      <div className="mb-4">
        <h1 style={{ fontSize: '3em' }} className="fw-bold text-dark">
          Gestion des utilisateurs
        </h1>
        <p className="text-muted">
          Gérez les utilisateurs, modifiez leurs rôles et surveillez leur activité.
        </p>
      </div>

      <div className="row g-2 mb-4">
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small text-dark">Total</p>
                  <h3 className="fw-bold mb-0">{stats.total}</h3>
                </div>
                <div className="rounded-3 p-2 bg-primary bg-opacity-10">
                  <FaUserShield size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small text-dark">Actifs</p>
                  <h3 className="fw-bold mb-0">{stats.active}</h3>
                </div>
                <div className="rounded-3 p-2 bg-success bg-opacity-10">
                  <FaCheckCircle size={20} className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small text-dark">Admins</p>
                  <h3 className="fw-bold mb-0">{stats.admins}</h3>
                </div>
                <div className="rounded-3 p-2 bg-danger bg-opacity-10">
                  <FaUserShield size={20} className="text-danger" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small text-dark">Modérateurs</p>
                  <h3 className="fw-bold mb-0">{stats.moderators}</h3>
                </div>
                <div className="rounded-3 p-2 bg-warning bg-opacity-10">
                  <FaUserCog size={20} className="text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small text-dark">Bannis</p>
                  <h3 className="fw-bold mb-0">{stats.banned}</h3>
                </div>
                <div className="rounded-3 p-2 bg-dark bg-opacity-10">
                  <FaBan size={20} className="text-dark" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-4 text-dark">Répartition par rôle</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4 ">
          <div className="d-flex card h-100 border-0 flex-column gap-2 mb-3">
            <div className="d-flex flex-column card-body align-items-start">
              <h5 className="fw-bold text-dark">Inscription par mois</h5>
              {availableYears.map((year) => (
                <button
                  key={String(year)}
                  className={`btn btn-sm fw-semibold rounded-pill px-3 ${
                    year === selectedYearValue ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => setSelectedYear(year)}
                >
                  {String(year)}
                </button>
              ))}

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    tick={{
                      fontSize: 10,
                      fill: '#6b7280',
                      angle: -40,
                      textAnchor: 'end',
                    }}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-4 text-dark">Connexions hebdomadaires</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="logins"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div
        className="card border-0 shadow-sm mb-3"
        style={{ position: 'sticky', top: 0, zIndex: 1000 }}
      >
        <div className="card-body bg-white border-bottom">
          <div className="card-body bg-white">
            <div className="card-body bg-white border-bottom">
              <div className="d-flex flex-column justify-content-between align-items-center px-3 py-2">
                <div className="d-flex w-100 flex-wrap justify-content-between align-items-center gap-2">
                  {/* 🎭 Rôle */}
                  <div className="col-6 col-md-3 col-lg-2">
                    <select
                      className="form-select text-dark shadow-sm"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="all">Tous les rôles</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Modérateur</option>
                      <option value="user">Utilisateur</option>
                    </select>
                  </div>

                  {/* ⚙️ Statut */}
                  <div className="col-6 col-md-3 col-lg-2">
                    <select
                      className="form-select text-dark shadow-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="active">Actif</option>
                      <option value="suspended">Suspendu</option>
                      <option value="deleted">Supprimé</option>
                    </select>
                  </div>

                  {/* 🟢 Activité */}
                  <div className="col-6 col-md-3 col-lg-2">
                    <select
                      className="form-select text-dark shadow-sm"
                      value={filterActive}
                      onChange={(e) => setFilterActive(e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="1">Actif</option>
                      <option value="0">Inactif</option>
                    </select>
                  </div>

                  {/* 📅 Date */}
                  <div className="col-6 col-md-3 col-lg-2">
                    <input
                      type="date"
                      className="form-control text-dark shadow-sm"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>

                  {/* 🎚️ Tri */}
                  <div className="col-6 col-md-3 col-lg-2">
                    <select
                      className="form-select text-dark shadow-sm"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="recent">Plus récents</option>
                      <option value="oldest">Plus anciens</option>
                      <option value="az">A → Z</option>
                      <option value="za">Z → A</option>
                    </select>
                  </div>
                </div>

                {/* 🔍 Recherche utilisateur */}
                <div className="col-12 col-md-4 col-lg-6 ">
                  <div className="input-group shadow-sm rounded-pill overflow-hidden">
                    <input
                      type="text"
                      className="w-100 border-0 text-dark rounded-pill ps-3 m-0"
                      placeholder="🔍 Rechercher (nom ou email)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        backgroundColor: '#f8f9fa',
                        fontWeight: 500,
                        height: '45px',
                      }}
                    />
                  </div>
                </div>

                {/* 🧩 Actions */}
                <div className="row mt-4">
                  <div className="col-12 d-flex flex-wrap justify-content-lg-end justify-content-center gap-2">
                    <button
                      className="btn btn-primary d-flex align-items-center gap-2"
                      onClick={() => openModal('add')}
                    >
                      <FaUserPlus />
                      <span className="d-none d-sm-inline">Ajouter</span>
                    </button>

                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      onClick={handleExport}
                    >
                      <FaUpload />
                      <span className="d-none d-sm-inline">Exporter</span>
                    </button>

                    <button
                      className="btn btn-outline-primary d-flex align-items-center gap-2"
                      onClick={handleImport}
                    >
                      <FaDownload />
                      <span className="d-none d-sm-inline">Importer</span>
                    </button>

                    <button
                      className="btn btn-outline-danger d-flex align-items-center gap-2"
                      onClick={resetFilters}
                    >
                      <FaSyncAlt />
                      <span className="d-none d-sm-inline">Réinitialiser</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={
                        displayedUsers.length > 0 &&
                        displayedUsers.every((u) => selectedUsers.includes(u.user_id || u.id))
                      }
                      onChange={handleSelectAllCurrentPage}
                    />
                  </th>
                  <th>Utilisateur</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th>Quiz complétés</th>
                  <th>Score total</th>
                  <th>Abonnement</th>
                  <th>Date d'inscription</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsers.length > 0 ? (
                  displayedUsers.map((user) => {
                    const userId = user.user_id || user.id;
                    return (
                      <tr key={userId}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedUsers.includes(userId)}
                            onChange={() => handleSelectUser(userId)}
                          />
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-primary overflow-hidden text-white d-flex align-items-center justify-content-center me-2"
                              style={{
                                width: '40px',
                                height: '40px',
                                fontSize: '16px',
                                fontWeight: '600',
                              }}
                            >
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.name || 'Avatar'}
                                  className="w-100 h-100 object-fit-cover"
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                (user.name?.charAt(0) || '?').toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="fw-semibold">{user.name || 'N/A'}</div>
                              <small className="text-muted">{user.email || 'N/A'}</small>
                            </div>
                          </div>
                        </td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.status, user.is_active)}</td>
                        <td>
                          <small className="text-muted">
                            {user.date_cx
                              ? new Date(user.date_cx).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : 'Jamais'}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-info text-dark">
                            {user.quiz_completed || user.quizCompleted || 0}
                          </span>
                        </td>
                        <td>
                          <span className="fw-semibold text-success">
                            {user.total_points || user.score || 0} pts
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${user.is_active === 1 ? 'bg-success' : user.is_active === 0 ? 'bg-danger' : 'bg-secondary'}`}
                          >
                            {user.is_active === 1
                              ? 'Valid'
                              : user.is_active === 0
                                ? 'Not valid'
                                : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : 'Jamais'}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-2 justify-content-center">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openModal('view', user)}
                              title="Voir détails"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => openModal('edit', user)}
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => openModal('delete', user)}
                              title="Supprimer"
                              disabled={!isAdmin}
                            >
                              <FaTrash />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => handleBanSingle(user)}
                              title="Bannir"
                              disabled={!isAdmin}
                            >
                              <FaBan />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav aria-label="Pagination utilisateurs" className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Précédent
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                      {String(i + 1)}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Suivant
                  </button>
                </li>
              </ul>
              <div className="text-center text-muted small">
                Affiche {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredUsers.length)} sur {filteredUsers.length}
              </div>
            </nav>
          )}
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div
          className="position-fixed bottom-0 start-50 translate-middle-x mb-4"
          style={{ zIndex: 1000 }}
        >
          <div className="card border-0 shadow-lg">
            <div className="card-body d-flex align-items-center gap-3">
              <span className="fw-semibold">
                {selectedUsers.length} utilisateur(s) sélectionné(s)
              </span>
              <div className="vr"></div>

              {/* Sélecteur de mode */}
              <select
                className="form-select form-select-sm w-auto"
                value={bulkMode}
                onChange={(e) => setBulkMode(e.target.value)}
                disabled={!isAdmin}
              >
                <option value="active">Mode: Active</option>
                <option value="not_valid">Mode: Not valid</option>
                <option value="suspended">Mode: Suspendu</option>
                <option value="deleted">Mode: Supprimé</option>
              </select>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleApplyBulkMode}
                disabled={!isAdmin}
              >
                Appliquer
              </button>

              <div className="vr"></div>
              <button
                className="btn btn-sm btn-danger"
                onClick={handleBulkDelete}
                disabled={!isAdmin}
              >
                <FaTrash className="me-2" />
                Supprimer
              </button>
              <button
                className="btn btn-sm btn-warning"
                onClick={handleBulkBan}
                disabled={!isAdmin}
              >
                <FaBan className="me-2" />
                Bannir
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedUsers([])}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark text-light border-0">
              {/* ------------------------- Header ------------------------- */}
              <div className="modal-header border-bottom border-secondary">
                <h5 className="modal-title">
                  {modalType === 'add' && 'Ajouter un utilisateur'}
                  {modalType === 'edit' && "Modifier l'utilisateur"}
                  {modalType === 'view' && "Détails de l'utilisateur"}
                  {modalType === 'delete' && 'Confirmer la suppression'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>

              {/* ------------------------- Body ------------------------- */}
              <div className="modal-body">
                {modalType === 'delete' ? (
                  <p>
                    Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                    <strong>{currentUser?.name || 'N/A'}</strong> ?
                  </p>
                ) : modalType === 'view' && currentUser ? (
                  <div>
                    <div className="text-center mb-4">
                      <div
                        className="rounded-circle bg-primary overflow-hidden text-white d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: '80px',
                          height: '80px',
                          fontSize: '32px',
                          fontWeight: '600',
                        }}
                      >
                        {currentUser.avatar_url ? (
                          <img
                            src={currentUser.avatar_url}
                            alt={currentUser.name || 'Avatar'}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          (currentUser.name?.charAt(0) || '?').toUpperCase()
                        )}
                      </div>
                      <h5 className="fw-bold">{currentUser.name || 'N/A'}</h5>
                      <p className="text-secondary">{currentUser.email || 'N/A'}</p>
                    </div>

                    <div className="row g-3">
                      <div className="col-6">
                        <small className="text-secondary">Rôle</small>
                        <div>{getRoleBadge(currentUser.role)}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-secondary">Statut</small>
                        <div>{getStatusBadge(currentUser.status)}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-secondary">Quiz complétés</small>
                        <div className="fw-semibold">
                          {currentUser.quiz_completed ?? currentUser.quizCompleted ?? 0}
                        </div>
                      </div>
                      <div className="col-6">
                        <small className="text-secondary">Score total</small>
                        <div className="fw-semibold text-success">
                          {currentUser.total_points ?? currentUser.score ?? 0} pts
                        </div>
                      </div>
                      <div className="col-12">
                        <small className="text-secondary">Date d'inscription</small>
                        <div className="fw-semibold">
                          {currentUser?.created_at
                            ? new Date(currentUser.created_at).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </div>

                      <div className="col-12">
                        <small className="text-secondary">Dernière connexion</small>
                        <div className="fw-semibold">
                          {currentUser?.date_cx
                            ? new Date(currentUser.date_cx).toLocaleString()
                            : 'Jamais'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Formulaire Add / Edit */}
                    <div className=" d-flex gap-2">
                      <div className="mb-3">
                        <label className="form-label text-light">Nom</label>
                        <input
                          type="text"
                          className="form-control bg-secondary text-light border-0"
                          value={formData?.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-light">Prénom(s)</label>
                        <input
                          type="text"
                          className="form-control bg-secondary text-light border-0"
                          value={formData?.firstName || ''}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-light">Email</label>
                      <input
                        type="email"
                        className="form-control bg-secondary text-light border-0"
                        value={formData?.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-light">Rôle</label>
                      <select
                        className="form-select bg-secondary text-light border-0"
                        value={formData?.role || 'user'}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="moderator">Modérateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-light">Statut</label>
                      <select
                        className="form-select bg-secondary text-light border-0"
                        value={formData?.status || 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="deleted">Supprimé</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------- Footer ------------------------- */}
              <div className="modal-footer border-top border-secondary">
                <button type="button" className="btn btn-outline-light" onClick={closeModal}>
                  {modalType === 'view' ? 'Fermer' : 'Annuler'}
                </button>
                {modalType !== 'view' && (
                  <button type="button" className="btn btn-primary" onClick={handleSave}>
                    {modalType === 'delete' ? 'Supprimer' : 'Enregistrer'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .user-management .table-hover tbody tr:hover {
          background-color: rgba(59, 130, 246, 0.05);
        }
        
        .user-management .form-check-input:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .modal.show {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
