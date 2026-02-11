import { useEffect, useState } from 'react';
import { useAuth } from '../../configurations/Context/AuthProvider';
import publiciteServices from '../../configurations/Services/publiciteServices';
import adminServices from '../../configurations/Services/adminServices.js';
import { SlActionRedo } from 'react-icons/sl'; 

export default function ThemeSwitcherAdminPage() {

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // États du thème
  const [bg, setBg] = useState('#0d0d19');
  const [accent, setAccent] = useState('#9b34d3');
  const [sidebar, setSidebar] = useState('#3b0436');
  const [textPrimary, setTextPrimary] = useState('#ffffff');
  const [textMuted, setTextMuted] = useState('#a0a9c0');
  const [linkColor, setLinkColor] = useState('#4ea1ff');
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);

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

  // Chargement des publicités
  useEffect(() => {
    fetchPublicites();
  }, []);

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

  const fetchPublicites = async () => {
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
  };

  // Helpers: formatage et assainissement des dates pour les inputs et le backend
  const toYmd = (val) => {
    if (!val) return '';
    // Si déjà au format yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) {
      // Dernier recours: tronquer la chaîne
      return String(val).slice(0, 10);
    }
    // Corrige le décalage timezone pour éviter le jour-1
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  const sanitizePayload = (form) => {
    const payload = {
      titre: form.titre?.trim() || '',
      description: form.description ?? '',
      image_url: form.image_url ?? '',
      statut: form.statut || 'inactif',
      type: form.type || 'image',
      // Les inputs date doivent être yyyy-MM-dd ou null
      date_debut: form.date_debut ? toYmd(form.date_debut) : null,
      date_fin: form.date_fin ? toYmd(form.date_fin) : null,
    };
    return payload;
  };

  const submitPub = async (e) => {
    e.preventDefault();
    setPubError(null);
    try {
      // Exclure 'id' et 'clics' du payload et normaliser les dates
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
      // Normaliser pour les inputs <input type="date" />
      date_debut: toYmd(row.date_debut),
      date_fin: toYmd(row.date_fin),
      statut: row.statut || 'inactif',
      type: row.type || 'image',
      clics: Number(row.clics ?? 0),
    });
  };

  const deletePub = async (id) => {
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
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Accès réservé aux administrateurs.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-dark mb-2">Réglages de thème (Admin)</h2>
      <p className="text-muted mb-4">Personnalisez les couleurs du site public.</p>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card p-3">
            <h5 className="text-dark">Fond du site (public)</h5>
            <input
              type="color"
              className="form-control border border-dark p-2 form-control-color mt-2"
              value={bg}
              onChange={(e) => applyBg(e.target.value)}
              title="Choisir la couleur de fond"
            />
            <small className="text-muted">Appliqué à `--site-bg`.</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h5 className="text-dark">Couleur d'accent (public)</h5>
            <input
              type="color"
              className="form-control border border-dark p-2 form-control-color mt-2"
              value={accent}
              onChange={(e) => applyAccent(e.target.value)}
              title="Choisir la couleur d'accent"
            />
            <small className="text-muted">Appliqué à `--site-accent`.</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h5 className="text-dark">Couleur de la sidebar (backoffice)</h5>
            <input
              type="color"
              className="form-control border border-dark p-2 form-control-color mt-2"
              value={sidebar}
              onChange={(e) => applySidebar(e.target.value)}
              title="Choisir la couleur de la sidebar"
            />
            <small className="text-muted">Appliqué à `--bg-sidebar-dash`.</small>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-md-4">
          <div className="card p-3">
            <h5 className="text-dark">Texte principal (public)</h5>
            <input
              type="color"
              className="form-control border border-dark p-2 form-control-color mt-2"
              value={textPrimary}
              onChange={(e) => applyTextPrimary(e.target.value)}
              title="Couleur du texte principal"
            />
            <small className="text-muted">Appliqué à `--site-text`.</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h5 className="text-dark">Texte atténué (public)</h5>
            <input
              type="color"
              className="form-control border border-dark p-2 form-control-color mt-2"
              value={textMuted}
              onChange={(e) => applyTextMuted(e.target.value)}
              title="Couleur du texte atténué"
            />
            <small className="text-muted">Appliqué à `--site-text-muted`.</small>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3">
            <h5 className="text-dark">Couleur des liens (public)</h5>
            <input
              type="color"
              className="form-control form-control-color mt-2 border border-dark p-2"
              value={linkColor}
              onChange={(e) => applyLinkColor(e.target.value)}
              title="Couleur des liens"
            />
            <small className="text-muted">Appliqué à `--site-link`.</small>
          </div>
        </div>
      </div>

      <div className="mt-4 d-flex flex-wrap gap-2">
        <button className="btn btn-outline-secondary me-2" onClick={resetTheme}>
          Réinitialiser
        </button>
        <button className="btn btn-outline-light" onClick={() => applyTextPrimary('#ffffff')}>
          Texte clair
        </button>
        <button className="btn btn-outline-light" onClick={() => applyTextPrimary('#e6e6e6')}>
          Texte sombre
        </button>
        <button
          className="btn btn-outline-danger"
          onClick={async () => {
            try {
              setCacheLoading(true);
              setCacheStatus(null);
              const r = await adminServices.clearCache();
              setCacheStatus({
                type: 'success',
                message: `Cache backend vidé (${r?.cleared ?? 0}).`,
              });
            } catch (e) {
              const msg = e?.response?.data?.error || e?.message || 'Erreur';
              setCacheStatus({ type: 'error', message: msg });
            } finally {
              setCacheLoading(false);
            }
          }}
          disabled={cacheLoading}
          title="Vide le cache mémoire du serveur"
        >
          {cacheLoading ? 'Nettoyage...' : 'Vider cache backend'}
        </button>
      </div>
      {cacheStatus?.message && (
        <div
          className={`alert ${
            cacheStatus.type === 'success' ? 'alert-success' : 'alert-danger'
          } mt-3`}
          role="alert"
        >
          {cacheStatus.message}
        </div>
      )}

      <h3 className="text-dark mt-4">Publicité du moment</h3>
      <p className="text-muted">Gérez les publicités affichées au public.</p>

      <div className="card p-3 mb-3">
        <form onSubmit={submitPub} className="row g-3">
          <div className="col-md-6">
            <label className="form-label text-dark">Titre</label>
            <input
              type="text"
              name="titre"
              className="form-control-custom m-0"
              value={pubForm.titre}
              onChange={handlePubChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label text-dark">Type</label>
            <select
              name="type"
              className="form-control-custom m-0"
              value={pubForm.type}
              onChange={handlePubChange}
            >
              <option value="image">Image</option>
              <option value="popup">Popup</option>
              <option value="banniere">Bannière</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label text-dark">Description</label>
            <textarea
              name="description"
              className="form-control-custom border text-dark rounded-2 m-0"
              rows="2"
              value={pubForm.description}
              onChange={handlePubChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label text-dark">Image URL</label>
            <input
              type="text"
              name="image_url"
              className="form-control-custom m-0"
              value={pubForm.image_url}
              onChange={handlePubChange}
              placeholder="https://..."
            />
          </div>
          <div className="col-md-3">
            <label className="form-label text-dark">Date début</label>
            <input
              type="date"
              name="date_debut"
              className="form-control-custom m-0"
              value={pubForm.date_debut}
              onChange={handlePubChange}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label text-dark">Date fin</label>
            <input
              type="date"
              name="date_fin"
              className="form-control-custom m-0"
              value={pubForm.date_fin}
              onChange={handlePubChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label text-dark">Statut</label>
            <select
              name="statut"
              className="form-control-custom m-0"
              value={pubForm.statut}
              onChange={handlePubChange}
            >
              <option value="inactif">Inactif</option>
              <option value="actif">Actif</option>
              <option value="expiré">Expiré</option>
            </select>
          </div>
          
          <div className="col-md-4 d-flex align-items-end gap-2">
            <button type="submit" className="btn btn-primary m-0 ">
              {pubMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
            </button>
            {pubMode === 'edit' && (
              <button type="button" className="btn btn-secondary m-0 " onClick={resetPubForm}>
                Annuler
              </button>
            )}
          </div>
        </form>
        {pubError && <div className="alert alert-danger mt-3">{pubError}</div>}
      </div>

      <div className="card p-3">
        <h5 className="text-dark">Liste des publicités</h5>
        {pubLoading ? (
          <p className="text-muted">Chargement...</p>
        ) : publicites.length === 0 ? (
          <p className="text-muted">Aucune publicité.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Début</th>
                  <th>Fin</th>
                  {/* Colonne "Clics" supprimée */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publicites.map((row) => (
                  <tr key={row.id}>
                    <td>{row.titre}</td>
                    <td>{row.type}</td>
                    <td>{row.statut}</td>
                    <td>{formatDateFr(row.date_debut) || '-'}</td>
                    <td>{formatDateFr(row.date_fin) || '-'}</td>
                    {/* Cellule "Clics" supprimée */}
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => editPub(row)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deletePub(row.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

