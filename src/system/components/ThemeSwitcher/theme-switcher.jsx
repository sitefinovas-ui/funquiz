import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../configurations/Context/AuthProvider';
import publiciteServices from '../../configurations/Services/offresServices';
import adminServices from '../../configurations/Services/adminServices.js';
import { 
  FaPalette, 
  FaAd, 
  FaWhatsapp, 
  FaServer, 
  FaSync, 
  FaTrash, 
  FaEdit, 
  FaPlus, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaRedoAlt,
  FaCalendarAlt,
  FaLink,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaSpinner
} from 'react-icons/fa'; 

export default function ThemeSwitcherAdminPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Navigation par onglets
  const [activeTab, setActiveTab] = useState('theme'); // 'theme', 'ads', 'system'

  // États du thème
  const [bg, setBg] = useState('#0d0d19');
  const [accent, setAccent] = useState('#9b34d3');
  const [sidebar, setSidebar] = useState('#3b0436');
  const [textPrimary, setTextPrimary] = useState('#ffffff');
  const [textMuted, setTextMuted] = useState('#a0a9c0');
  const [linkColor, setLinkColor] = useState('#4ea1ff');
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);

  const [waLoading, setWaLoading] = useState(false);
  const [waError, setWaError] = useState(null);
  const [waStatus, setWaStatus] = useState(null);
  const [waQrDataUrl, setWaQrDataUrl] = useState(null);

  // États CRUD Publicité
  const [publicites, setPublicites] = useState([]);
  const [pubLoading, setPubLoading] = useState(true);
  const [pubError, setPubError] = useState(null);
  const [pubMode, setPubMode] = useState('add');
  const [pubForm, setPubForm] = useState({
    id: null,
    titre: '',
    description: '',
    image_url: '',
    date_debut: '',
    date_fin: '',
    statut: 'inactif',
    type: 'image',
    clics: 0,
  });

  // Chargement initial du thème
  useEffect(() => {
    const savedBg = localStorage.getItem('public.site.bg');
    const savedAccent = localStorage.getItem('public.site.accent');
    const savedSidebar = localStorage.getItem('theme.sidebar');
    const savedText = localStorage.getItem('public.site.text');
    const savedTextMuted = localStorage.getItem('public.site.textMuted');
    const savedLink = localStorage.getItem('public.site.link');
    
    const finalBg = savedBg || bg;
    const finalAccent = savedAccent || accent;
    const finalSidebar = savedSidebar || sidebar;
    const finalText = savedText || textPrimary;
    const finalTextMuted = savedTextMuted || textMuted;
    const finalLink = savedLink || linkColor;

    setBg(finalBg);
    setAccent(finalAccent);
    setSidebar(finalSidebar);
    setTextPrimary(finalText);
    setTextMuted(finalTextMuted);
    setLinkColor(finalLink);

    document.documentElement.style.setProperty('--site-bg', finalBg);
    document.documentElement.style.setProperty('--site-accent', finalAccent);
    document.documentElement.style.setProperty('--brand-accent', finalAccent);
    document.documentElement.style.setProperty('--brand-accent-strong', finalAccent);
    document.documentElement.style.setProperty('--bg-sidebar-dash', finalSidebar);
    document.documentElement.style.setProperty('--site-text', finalText);
    document.documentElement.style.setProperty('--site-text-muted', finalTextMuted);
    document.documentElement.style.setProperty('--site-link', finalLink);

    // Mapping Bootstrap pour appliquer partout
    document.documentElement.style.setProperty('--bs-body-color', finalText);
    document.documentElement.style.setProperty('--bs-secondary-color', finalTextMuted);
    document.documentElement.style.setProperty('--bs-link-color', finalLink);
    document.documentElement.style.setProperty('--bs-link-hover-color', finalAccent);
  }, []);

  const fetchPublicites = useCallback(async () => {
    setPubLoading(true);
    setPubError(null);
    try {
      const data = await publiciteServices.list();
      const rows = Array.isArray(data) ? data : data?.rows ?? [];
      setPublicites(rows);
    } catch (err) {
      setPubError(err.message || 'Erreur lors du chargement des publicités');
    } finally {
      setPubLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'ads') fetchPublicites();
  }, [activeTab, fetchPublicites]);

  useEffect(() => {
    if (activeTab !== 'system') return;
    
    let cancelled = false;
    let timer;

    const fetchQr = async () => {
      if (cancelled) return;
      setWaLoading(true);
      setWaError(null);
      try {
        const data = await adminServices.getWhatsAppQr();
        if (cancelled) return;
        setWaStatus(data?.status ?? null);
        setWaQrDataUrl(data?.qrDataUrl ?? null);
      } catch (e) {
        if (cancelled) return;
        const msg = e?.response?.data?.error || e?.message || 'Erreur';
        setWaError(msg);
        setWaStatus(null);
        setWaQrDataUrl(null);
      } finally {
        if (!cancelled) setWaLoading(false);
      }
    };

    const loop = async () => {
      await fetchQr();
      timer = window.setInterval(fetchQr, 10000); // Augmenté à 10s pour moins de bruit
    };

    loop();
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [activeTab]);

  const applyBg = (value) => {
    setBg(value);
    document.documentElement.style.setProperty('--site-bg', value);
    localStorage.setItem('public.site.bg', value);
  };

  const applyAccent = (value) => {
    setAccent(value);
    document.documentElement.style.setProperty('--site-accent', value);
    document.documentElement.style.setProperty('--brand-accent', value);
    document.documentElement.style.setProperty('--brand-accent-strong', value);
    document.documentElement.style.setProperty('--bs-link-hover-color', value);
    localStorage.setItem('public.site.accent', value);
  };

  const formatDateFr = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(local);
  };

  const applySidebar = (value) => {
    setSidebar(value);
    document.documentElement.style.setProperty('--bg-sidebar-dash', value);
    localStorage.setItem('theme.sidebar', value);
  };

  const applyTextPrimary = (value) => {
    setTextPrimary(value);
    document.documentElement.style.setProperty('--site-text', value);
    document.documentElement.style.setProperty('--bs-body-color', value);
    localStorage.setItem('public.site.text', value);
  };

  const applyTextMuted = (value) => {
    setTextMuted(value);
    document.documentElement.style.setProperty('--site-text-muted', value);
    document.documentElement.style.setProperty('--bs-secondary-color', value);
    localStorage.setItem('public.site.textMuted', value);
  };

  const applyLinkColor = (value) => {
    setLinkColor(value);
    document.documentElement.style.setProperty('--site-link', value);
    document.documentElement.style.setProperty('--bs-link-color', value);
    const currentAccent = getComputedStyle(document.documentElement)
      .getPropertyValue('--site-accent')
      .trim();
    document.documentElement.style.setProperty('--bs-link-hover-color', currentAccent || value);
    localStorage.setItem('public.site.link', value);
  };

  const resetTheme = () => {
    const defaultBg = '#0d0d19';
    const defaultAccent = '#9b34d3';
    const defaultSidebar = '#3b0436';
    const defaultText = '#ffffff';
    const defaultTextMuted = '#a0a9c0';
    const defaultLink = '#4ea1ff';

    document.documentElement.style.setProperty('--site-bg', defaultBg);
    document.documentElement.style.setProperty('--site-accent', defaultAccent);
    document.documentElement.style.setProperty('--brand-accent', defaultAccent);
    document.documentElement.style.setProperty('--brand-accent-strong', defaultAccent);
    document.documentElement.style.setProperty('--bg-sidebar-dash', defaultSidebar);
    document.documentElement.style.setProperty('--site-text', defaultText);
    document.documentElement.style.setProperty('--site-text-muted', defaultTextMuted);
    document.documentElement.style.setProperty('--site-link', defaultLink);

    // Mapping Bootstrap
    document.documentElement.style.setProperty('--bs-body-color', defaultText);
    document.documentElement.style.setProperty('--bs-secondary-color', defaultTextMuted);
    document.documentElement.style.setProperty('--bs-link-color', defaultLink);
    document.documentElement.style.setProperty('--bs-link-hover-color', defaultAccent);

    // Nettoyage localStorage
    localStorage.removeItem('public.site.bg');
    localStorage.removeItem('public.site.accent');
    localStorage.removeItem('theme.sidebar');
    localStorage.removeItem('public.site.text');
    localStorage.removeItem('public.site.textMuted');
    localStorage.removeItem('public.site.link');

    // État React
    setBg(defaultBg);
    setAccent(defaultAccent);
    setSidebar(defaultSidebar);
    setTextPrimary(defaultText);
    setTextMuted(defaultTextMuted);
    setLinkColor(defaultLink);
  };

  // Gestion des publicités
  const handlePubChange = (e) => {
    const { name, value } = e.target;
    setPubForm((prev) => ({
      ...prev,
      [name]: name === 'clics' ? Number(value) : value,
    }));
  };

  const resetPubForm = () => {
    setPubForm({
      id: null,
      titre: '',
      description: '',
      image_url: '',
      date_debut: '',
      date_fin: '',
      statut: 'inactif',
      type: 'image',
      clics: 0,
    });
    setPubMode('add');
    setPubError(null);
  };

  const toYmd = (val) => {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val).slice(0, 10);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const sanitizePayload = (form) => ({
    titre: form.titre?.trim() || '',
    description: form.description ?? '',
    image_url: form.image_url ?? '',
    statut: form.statut || 'inactif',
    type: form.type || 'image',
    date_debut: form.date_debut ? toYmd(form.date_debut) : null,
    date_fin: form.date_fin ? toYmd(form.date_fin) : null,
  });

  const submitPub = async (e) => {
    e.preventDefault();
    setPubError(null);
    try {
      const payload = sanitizePayload(pubForm);
      if (pubMode === 'add') {
        await publiciteServices.create(payload);
      } else {
        await publiciteServices.update(pubForm.id, payload);
      }
      resetPubForm();
      fetchPublicites();
    } catch (err) {
      setPubError(err.message || 'Échec de la soumission de la publicité');
    }
  };

  const editPub = (row) => {
    setPubMode('edit');
    setPubForm({
      id: row.id,
      titre: row.titre || '',
      description: row.description || '',
      image_url: row.image_url || '',
      date_debut: toYmd(row.date_debut),
      date_fin: toYmd(row.date_fin),
      statut: row.statut || 'inactif',
      type: row.type || 'image',
      clics: Number(row.clics ?? 0),
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePub = async (id) => {
    if (!window.confirm('Supprimer cette publicité ?')) return;
    setPubError(null);
    try {
      await publiciteServices.delete(id);
      fetchPublicites();
    } catch (err) {
      setPubError(err.message || 'Échec de la suppression de la publicité');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <FaExclamationTriangle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès restreint</h2>
        <p className="text-slate-500 max-w-md">Cette section est réservée aux administrateurs du système.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'theme', icon: <FaPalette />, label: 'Thème & Design' },
    { id: 'ads', icon: <FaAd />, label: 'Publicités' },
    { id: 'system', icon: <FaServer />, label: 'Système & WhatsApp' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Réglages du Système</h2>
          <p className="text-slate-500 font-medium">Configurez l'apparence et les services de FunQuiz.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[24px] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-[20px] text-sm font-bold transition-all
              ${activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* ══ THEME TAB ══ */}
        {activeTab === 'theme' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Fond du site (Public)', value: bg, setter: applyBg, desc: '--site-bg' },
                { label: "Couleur d'accent", value: accent, setter: applyAccent, desc: '--site-accent' },
                { label: 'Sidebar (Backoffice)', value: sidebar, setter: applySidebar, desc: '--bg-sidebar-dash' },
                { label: 'Texte principal', value: textPrimary, setter: applyTextPrimary, desc: '--site-text' },
                { label: 'Texte atténué', value: textMuted, setter: applyTextMuted, desc: '--site-text-muted' },
                { label: 'Couleur des liens', value: linkColor, setter: applyLinkColor, desc: '--site-link' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 group">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</h4>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-inner border border-slate-100 shrink-0">
                      <input
                        type="color"
                        className="absolute inset-[-10px] w-[150%] h-[150%] cursor-pointer"
                        value={item.value}
                        onChange={(e) => item.setter(e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-mono font-bold text-slate-700">{item.value.toUpperCase()}</p>
                      <p className="text-[10px] font-medium text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-black">Actions rapides sur le thème</h3>
                <p className="text-slate-400 font-medium max-w-md">Réinitialisez les réglages par défaut ou changez rapidement le mode de texte.</p>
              </div>
              <div className="relative z-10 flex flex-wrap justify-center gap-3">
                <button 
                  onClick={resetTheme}
                  className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold transition-all"
                >
                  <FaSync /> Réinitialiser tout
                </button>
                <button 
                  onClick={() => applyTextPrimary('#ffffff')}
                  className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:shadow-xl transition-all"
                >
                  Mode Clair
                </button>
                <button 
                  onClick={() => applyTextPrimary('#e6e6e6')}
                  className="flex items-center gap-2 px-6 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Mode Sombre
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ ADS TAB ══ */}
        {activeTab === 'ads' && (
          <div className="space-y-8">
            {/* Form Section */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900">
                      {pubMode === 'add' ? 'Créer une publicité' : 'Modifier la publicité'}
                    </h3>
                    <p className="text-slate-500 font-medium">Gérez le contenu promotionnel affiché sur FunQuiz.</p>
                  </div>
                  {pubMode === 'edit' && (
                    <button onClick={resetPubForm} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                      <FaTimes size={20} />
                    </button>
                  )}
                </div>

                <form onSubmit={submitPub} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Titre</label>
                      <input
                        required
                        type="text"
                        name="titre"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
                        value={pubForm.titre}
                        onChange={handlePubChange}
                        placeholder="Ex: Super Quiz de Noël"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Type d'affichage</label>
                      <select
                        name="type"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                        value={pubForm.type}
                        onChange={handlePubChange}
                      >
                        <option value="image">Simple Image</option>
                        <option value="popup">Fenêtre Surgissante (Popup)</option>
                        <option value="banniere">Bannière (Haut de page)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Description / Message</label>
                    <textarea
                      name="description"
                      rows="3"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 resize-none"
                      value={pubForm.description}
                      onChange={handlePubChange}
                      placeholder="Décrivez l'offre ou l'événement..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">URL de l'image</label>
                      <div className="relative">
                        <FaLink className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="url"
                          name="image_url"
                          className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
                          value={pubForm.image_url}
                          onChange={handlePubChange}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Date début</label>
                        <input
                          type="date"
                          name="date_debut"
                          className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                          value={pubForm.date_debut}
                          onChange={handlePubChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Date fin</label>
                        <input
                          type="date"
                          name="date_fin"
                          className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                          value={pubForm.date_fin}
                          onChange={handlePubChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Statut</label>
                        <div className="flex gap-2">
                          {['actif', 'inactif', 'expiré'].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setPubForm({...pubForm, statut: s})}
                              className={`
                                px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                                ${pubForm.statut === s 
                                  ? (s === 'actif' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : s === 'expiré' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white') 
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                              `}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                      {pubMode === 'add' ? <FaPlus /> : <FaSync />}
                      <span>{pubMode === 'add' ? 'Ajouter la publicité' : 'Mettre à jour'}</span>
                    </button>
                  </div>
                </form>
                {pubError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 animate-shake">
                    <FaExclamationTriangle /> {pubError}
                  </div>
                )}
              </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Publicités enregistrées</h3>
                <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {publicites.length} Total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aperçu</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenu</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validité</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pubLoading ? (
                      <tr><td colSpan="5" className="px-10 py-20 text-center"><FaSpinner className="animate-spin text-blue-600 mx-auto" size={32} /></td></tr>
                    ) : publicites.length === 0 ? (
                      <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400 font-medium italic">Aucune publicité configurée.</td></tr>
                    ) : (
                      publicites.map((pub) => (
                        <tr key={pub.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <div className="w-20 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                              {pub.image_url ? (
                                <img src={pub.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><FaAd size={20} /></div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="min-w-[200px]">
                              <p className="text-sm font-black text-slate-900 mb-1">{pub.titre}</p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{pub.type}</p>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <FaCalendarAlt size={10} className="text-slate-400" />
                                {formatDateFr(pub.date_debut)}
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <span className="w-2 h-0.5 bg-slate-200" />
                                {formatDateFr(pub.date_fin)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`
                              inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                              ${pub.statut === 'actif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                            `}>
                              {pub.statut === 'actif' ? <FaCheckCircle size={10} /> : <FaTimes size={10} />}
                              {pub.statut}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => editPub(pub)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                <FaEdit size={14} />
                              </button>
                              <button onClick={() => deletePub(pub.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ SYSTEM TAB ══ */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cache Control */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[22px] flex items-center justify-center">
                  <FaServer size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Cache Backend</h3>
                  <p className="text-slate-500 text-sm font-medium">Libérez la mémoire du serveur.</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Cette action vide toutes les données temporaires stockées par le serveur API (sessions, stats précalculées, etc.). Utile en cas de comportement anormal des données.
                </p>
                <button
                  onClick={async () => {
                    try {
                      setCacheLoading(true);
                      setCacheStatus(null);
                      const r = await adminServices.clearCache();
                      setCacheStatus({ type: 'success', message: `Nettoyage réussi (${r?.cleared ?? 0} entrées).` });
                    } catch (e) {
                      setCacheStatus({ type: 'error', message: e.message });
                    } finally {
                      setCacheLoading(false);
                    }
                  }}
                  disabled={cacheLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
                >
                  {cacheLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                  <span>Vider le cache système</span>
                </button>
              </div>

              {cacheStatus && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300 ${
                  cacheStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {cacheStatus.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  {cacheStatus.message}
                </div>
              )}
            </div>

            {/* WhatsApp Control */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-[22px] flex items-center justify-center">
                  <FaWhatsapp size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Bot WhatsApp</h3>
                  <p className="text-slate-500 text-sm font-medium">Connectez le service de notification.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${waStatus?.ready ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-red-400'}`} />
                    <span className="text-sm font-black text-slate-700 uppercase tracking-wider">
                      {waStatus?.ready ? 'Opérationnel' : waStatus?.initializing ? 'Initialisation...' : 'Déconnecté'}
                    </span>
                  </div>
                  <button 
                    onClick={async () => {
                      setWaLoading(true);
                      const data = await adminServices.getWhatsAppQr();
                      setWaStatus(data?.status);
                      setWaQrDataUrl(data?.qrDataUrl);
                      setWaLoading(false);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    disabled={waLoading}
                  >
                    <FaRedoAlt className={waLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                {waQrDataUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center justify-center overflow-hidden">
                      <img src={waQrDataUrl} alt="QR Code" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scannez avec votre téléphone</p>
                  </div>
                ) : (
                  <div className="aspect-square bg-slate-50 rounded-3xl p-10 border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
                    {waStatus?.ready ? (
                      <>
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                          <FaCheckCircle size={40} />
                        </div>
                        <p className="text-slate-600 font-bold text-sm">Le bot est déjà lié et prêt à envoyer des messages.</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Génération du code QR...</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

