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
import './user.css';

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
              const totalPoints = Number(pointsData?.total_points) || 0;
              const totalGamesPlayed = Number(pointsData?.total_games_played) || 0;
              return { ...user, total_points: totalPoints, quiz_completed: totalGamesPlayed };
            } catch (error) {
              console.error(`❌ Erreur récupération points pour user_id=${user.user_id}:`, error);
              return {
                ...user,
                total_points: 0,
                quiz_completed: Number(user?.quiz_completed) || 0,
              }; // sécurité en cas d'erreur
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
    setSortConfig({ key: 'created_at', direction: 'desc' });
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
    const normalizeStr = (s) => String(s || '').toLowerCase().trim();
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
      const matchesActive = filterActive === 'all' || String(user.is_active ?? '').trim() === filterActive;

      const uDateRaw = getUserDate(user);
      const uDateDay = uDateRaw ? toDayStr(uDateRaw) : null;
      const matchesDate = !requestedDayStr || uDateDay === requestedDayStr;

      return matchesSearch && matchesRole && matchesStatus && matchesActive && matchesDate;
    });

    const sorted = [...base];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Helper pour récupérer des valeurs nested ou calculées
        if (sortConfig.key === 'user') {
          aVal = normalizeStr(a.name || a.first_name || a.email);
          bVal = normalizeStr(b.name || b.first_name || b.email);
        } else if (['created_at', 'date_cx', 'last_login'].includes(sortConfig.key)) {
          // Utilisation de getUserDate pour fallback correct
          aVal = new Date((sortConfig.key === 'created_at' ? a.created_at : getUserDate(a)) || 0).getTime();
          bVal = new Date((sortConfig.key === 'created_at' ? b.created_at : getUserDate(b)) || 0).getTime();
        } else if (sortConfig.key === 'score') {
          aVal = Number(a.total_points || a.score || 0);
          bVal = Number(b.total_points || b.score || 0);
        } else if (sortConfig.key === 'quiz') {
          aVal = Number(a.quiz_completed || a.quizCompleted || 0);
          bVal = Number(b.quiz_completed || b.quizCompleted || 0);
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [safeUsers, searchTerm, filterRole, filterStatus, filterActive, filterDate, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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
    const confirmed = window.confirm(`Supprimer (Soft) ${selectedUsers.length} utilisateur(s) ?`);
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

  const handleBulkHardDelete = async () => {
    if (!isAdmin) {
      alert('Action réservée aux administrateurs.');
      return;
    }
    if (!selectedUsers.length) return;
    const confirmed = window.confirm(
      `ATTENTION : Suppression DÉFINITIVE de ${selectedUsers.length} utilisateur(s) ?\nCette action est irréversible.`
    );
    if (!confirmed) return;

    try {
      await Promise.all(selectedUsers.map((id) => authService.hardDeleteUser(id)));
      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.user_id || u.id)));
      setSelectedUsers([]);
      alert('Utilisateurs supprimés définitivement.');
    } catch (err) {
      console.error('Erreur suppression définitive en masse:', err);
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
    <div className="user-management overflow-scroll vh-100 mt-5">
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
          <div className="card border-0 shadow-sm bg-white text-dark">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total</p>
                  <h3 className="fw-bold mb-0 text-dark">{stats.total}</h3>
                </div>
                <div className="rounded-3 p-2 bg-primary bg-opacity-10">
                  <FaUserShield size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm bg-white text-dark">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Actifs</p>
                  <h3 className="fw-bold mb-0 text-dark">{stats.active}</h3>
                </div>
                <div className="rounded-3 p-2 bg-success bg-opacity-10">
                  <FaCheckCircle size={20} className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm bg-white text-dark">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Admins</p>
                  <h3 className="fw-bold mb-0 text-dark">{stats.admins}</h3>
                </div>
                <div className="rounded-3 p-2 bg-danger bg-opacity-10">
                  <FaUserShield size={20} className="text-danger" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm bg-white text-dark">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Modérateurs</p>
                  <h3 className="fw-bold mb-0 text-dark">{stats.moderators}</h3>
                </div>
                <div className="rounded-3 p-2 bg-warning bg-opacity-10">
                  <FaUserCog size={20} className="text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-sm-6 col-lg-2">
          <div className="card border-0 shadow-sm bg-white text-dark">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Bannis</p>
                  <h3 className="fw-bold mb-0 text-dark">{stats.banned}</h3>
                </div>
                <div className="rounded-3 p-2 bg-secondary bg-opacity-10">
                  <FaBan size={20} className="text-secondary" />
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
        className="card border-0 shadow-sm mb-4 sticky-top"
        style={{ top: 0, zIndex: 1000 }}
      >
        <div className="card-body bg-white p-4">
          <div className="d-flex flex-column gap-3">
            {/* Top Row: Search & Main Actions */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div
                className="input-group shadow-sm rounded-pill overflow-hidden bg-light"
                style={{ maxWidth: '400px' }}
              >
                <span className="input-group-text border-0 bg-light ps-3 text-muted">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light shadow-none"
                  placeholder="Rechercher (nom, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontWeight: 500 }}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 fw-semibold shadow-sm"
                  onClick={() => openModal('add')}
                >
                  <FaUserPlus /> <span>Nouveau</span>
                </button>
                <button
                  className="btn btn-light rounded-circle shadow-sm p-2 text-secondary"
                  onClick={resetFilters}
                  title="Réinitialiser les filtres"
                >
                  <FaSyncAlt />
                </button>
              </div>
            </div>

            {/* Bottom Row: Filters & Secondary Actions */}
            <div className="d-flex flex-wrap gap-2 align-items-center pt-2 border-top">
              <div className="d-flex align-items-center gap-2 me-2">
                <FaFilter className="text-primary opacity-50" />
                <span className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.75rem' }}>
                  Filtres
                </span>
              </div>

              <select
                className="form-select form-select-sm border-0 bg-light rounded-pill shadow-none w-auto fw-medium text-secondary"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">Rôles : Tous</option>
                <option value="admin">Admin</option>
                <option value="moderator">Modérateur</option>
                <option value="user">Utilisateur</option>
              </select>

              <select
                className="form-select form-select-sm border-0 bg-light rounded-pill shadow-none w-auto fw-medium text-secondary"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Statut : Tous</option>
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="deleted">Supprimé</option>
              </select>

              <select
                className="form-select form-select-sm border-0 bg-light rounded-pill shadow-none w-auto fw-medium text-secondary"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="all">Compte : Tous</option>
                <option value="1">Validé</option>
                <option value="0">Non validé</option>
              </select>

              <input
                type="date"
                className="form-control form-control-sm border-0 bg-light rounded-pill shadow-none w-auto text-secondary fw-medium"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />

              <div className="ms-auto d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1 border-0 bg-light"
                  onClick={handleExport}
                >
                  <FaUpload size={12} /> <span className="d-none d-sm-inline">Export</span>
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-1 border-0 bg-light"
                  onClick={handleImport}
                >
                  <FaDownload size={12} /> <span className="d-none d-sm-inline">Import</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
              <thead className="table-light sticky-top" style={{ top: '0', zIndex: 10 }}>
                <tr>
                  <th style={{ width: '50px' }} className="border-bottom-0">
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
                  
                  <th onClick={() => requestSort('user')} className="cursor-pointer border-bottom-0 text-secondary text-uppercase small fw-bold" style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center gap-1">
                      Utilisateur
                      {sortConfig.key === 'user' && (
                        sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                      {sortConfig.key !== 'user' && <FaSort className="text-muted opacity-25" />}
                    </div>
                  </th>

                  <th className="border-bottom-0 text-secondary text-uppercase small fw-bold">Rôle & Statut</th>

                  <th onClick={() => requestSort('last_login')} className="cursor-pointer border-bottom-0 text-secondary text-uppercase small fw-bold" style={{ cursor: 'pointer' }}>
                     <div className="d-flex align-items-center gap-1">
                      Dernière Connexion
                      {sortConfig.key === 'last_login' && (
                        sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                      )}
                    </div>
                  </th>

                  <th onClick={() => requestSort('quiz')} className="cursor-pointer border-bottom-0 text-secondary text-uppercase small fw-bold text-center" style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center justify-content-center gap-1">
                        Quiz
                        {sortConfig.key === 'quiz' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>

                  <th onClick={() => requestSort('score')} className="cursor-pointer border-bottom-0 text-secondary text-uppercase small fw-bold text-center" style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center justify-content-center gap-1">
                        Score
                        {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>

                  <th onClick={() => requestSort('created_at')} className="cursor-pointer border-bottom-0 text-secondary text-uppercase small fw-bold" style={{ cursor: 'pointer' }}>
                    <div className="d-flex align-items-center gap-1">
                        Inscription
                        {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                    </div>
                  </th>

                  <th className="text-center border-bottom-0 text-secondary text-uppercase small fw-bold">Actions</th>
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
                              className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3 shadow-sm"
                              style={{
                                width: '45px',
                                height: '45px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                              }}
                            >
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.name || 'Avatar'}
                                  className="w-100 h-100 rounded-circle object-fit-cover"
                                />
                              ) : (
                                (user.name?.charAt(0) || user.first_name?.charAt(0) || user.email?.charAt(0) || '?').toUpperCase()
                              )}
                            </div>
                            <div className="d-flex flex-column">
                              <span className="fw-bold text-dark">{user.name || 'Inconnu'} {user.first_name}</span>
                              <small className="text-muted" style={{ fontSize: '0.85em' }}>{user.email || 'N/A'}</small>
                            </div>
                          </div>
                        </td>
                        
                        <td>
                            <div className="d-flex flex-column gap-1 align-items-start">
                                {getRoleBadge(user.role)}
                                {getStatusBadge(user.status, user.is_active)}
                            </div>
                        </td>

                        <td>
                            <div className="text-muted small fw-medium">
                                {user.date_cx
                              ? new Date(user.date_cx).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Jamais'}
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.75em' }}>
                                {user.date_cx ? new Date(user.date_cx).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) : ''}
                            </small>
                        </td>

                        <td className="text-center">
                           <span className="badge bg-light text-dark border fw-normal px-3 py-2 rounded-pill">
                                {user.quiz_completed || user.quizCompleted || 0}
                           </span>
                        </td>

                        <td className="text-center">
                            <span className="fw-bold text-primary">
                                {user.total_points || user.score || 0}
                            </span>
                        </td>

                        <td>
                            <div className="text-muted small">
                                {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                            </div>
                        </td>

                        <td>
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              className="btn btn-sm btn-light text-secondary border-0 rounded-circle"
                              onClick={() => openModal('view', user)}
                              title="Voir détails"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-sm btn-light text-primary border-0 rounded-circle"
                              onClick={() => openModal('edit', user)}
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            
                             {isAdmin && (
                              <>
                                <button
                                  className={`btn btn-sm btn-light border-0 rounded-circle ${
                                    user.is_active ? 'text-warning' : 'text-success'
                                  }`}
                                  onClick={() => handleToggleActive(user)}
                                  title={user.is_active ? 'Bannir' : 'Activer'}
                                >
                                  {user.is_active ? <FaBan className="text-dark" /> : <FaCheckCircle />}
                                </button>
                                <button
                                        className="btn btn-sm btn-danger text-white border-0 shadow-sm rounded-circle"
                                        style={{ marginLeft: '4px' }}
                                        onClick={async () => {
                                          if (
                                            window.confirm(
                                              `ATTENTION : Suppression DÉFINITIVE de ${user.name} ?\nCette action est irréversible.`
                                            )
                                          ) {
                                            try {
                                              await authService.hardDeleteUser(user.user_id || user.id);
                                              setUsers((prev) =>
                                                prev.filter(
                                                  (u) => (u.user_id || u.id) !== (user.user_id || user.id)
                                                )
                                              );
                                              alert('Utilisateur supprimé définitivement.');
                                            } catch (err) {
                                              console.error(err);
                                              alert(err.message || 'Erreur lors de la suppression');
                                            }
                                          }
                                        }}
                                        title="Suppression DÉFINITIVE"
                                      >
                                        <FaSkull />
                                      </button>
                                </>
                             )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted d-flex flex-column align-items-center">
                        <FaSearch size={32} className="mb-3 opacity-50" />
                        <p className="mb-0">Aucun utilisateur trouvé.</p>
                        <small>Essayez de modifier vos filtres.</small>
                      </div>
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
            <div className="card-body d-flex align-items-center gap-3 p-2 ps-3">
              <span className="fw-bold text-primary">
                {selectedUsers.length} <span className="fw-normal text-muted">sélectionné(s)</span>
              </span>
              
              <div className="vr mx-1"></div>

              {/* Statuts */}
              <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select form-select-sm border-0 bg-light rounded-pill fw-medium"
                    value={bulkMode}
                    onChange={(e) => setBulkMode(e.target.value)}
                    disabled={!isAdmin}
                    style={{ minWidth: '130px' }}
                  >
                    <option value="active">Activer</option>
                    <option value="not_valid">Invalider</option>
                    <option value="suspended">Suspendre</option>
                    <option value="deleted">Corbeille</option>
                  </select>
                  <button
                    className="btn btn-sm btn-dark rounded-pill px-3"
                    onClick={handleApplyBulkMode}
                    disabled={!isAdmin}
                    title="Appliquer le statut"
                  >
                    OK
                  </button>
              </div>

              <div className="vr mx-1"></div>

              {/* Actions destructives */}
              <div className="d-flex gap-2">
                 <button
                    className="btn btn-sm btn-danger text-white shadow-sm d-flex align-items-center gap-2 rounded-pill px-3"
                    onClick={handleBulkHardDelete}
                    disabled={!isAdmin}
                    title="Suppression DÉFINITIVE"
                  >
                    <FaSkull /> <span className="d-none d-sm-inline">Définitif</span>
                  </button>
              </div>
              
              <div className="vr mx-1"></div>

              <button
                className="btn btn-sm btn-light text-secondary rounded-circle"
                onClick={() => setSelectedUsers([])}
                title="Annuler"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="modal position-fixed bottom-0 d-flex align-items-center justify-content-center show d-block"
          style={{ backgroundColor: 'rgba(176, 17, 17, 0.7)', zIndex: 1100 }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark text-light border-0" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
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
                          (currentUser.name?.charAt(0) || currentUser.first_name?.charAt(0) || currentUser.email?.charAt(0) || '?').toUpperCase()
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
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-light">Nom</label>
                          <input
                            type="text"
                            className="form-control bg-secondary text-light border-0"
                            placeholder="Nom de famille"
                            value={formData?.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label text-light">Prénom(s)</label>
                          <input
                            type="text"
                            className="form-control bg-secondary text-light border-0"
                            placeholder="Prénom(s)"
                            value={formData?.firstName || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-light">Email</label>
                      <input
                        type="email"
                        className="form-control bg-secondary text-light border-0"
                        placeholder="exemple@email.com"
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
                <button type="button" className="btn btn-secondary text-white" onClick={closeModal}>
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

    </div>
  );
};

export default UserManagement;
