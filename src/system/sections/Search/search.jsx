import React, { useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './search.css';

import thematicService from '../../configurations/Services/thematicServices.js';
import cguServices from '../../configurations/Services/cguServices.js';
import aboutServices from '../../configurations/Services/aboutServices.js';
import commentServices from '../../configurations/Services/commentServices.js';
import quizStatsServices from '../../configurations/Services/quizStatsServices.js';
import pointService from '../../configurations/Services/pointService.js';
import faqServices from '../../configurations/Services/faqService.js';

import { IoArrowRedoOutline } from 'react-icons/io5';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';

function useQueryParam() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/* Normalisation des réponses en tableau (gère plusieurs formes possibles) */
const toArray = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw?.data) {
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
  }
  if (raw?.results && Array.isArray(raw.results)) return raw.results;
  if (raw?.rows && Array.isArray(raw.rows)) return raw.rows;
  return [];
};

/* Normalisation de texte */
const normalize = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .toLowerCase()
    .trim();
};

/* Levenshtein (distance) – implémentation sans variables inutilisées */
const levenshtein = (a = '', b = '') => {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const matrix = Array(al + 1)
    .fill(null)
    .map(() => Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) matrix[i][0] = i;
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // suppression
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[al][bl];
};

/* Détermine si deux mots sont "suffisamment proches" */
const isSimilar = (keyword, token) => {
  if (!keyword || !token) return false;
  if (token.includes(keyword)) return true; // sous-chaîne
  const maxDist = Math.max(1, Math.floor(Math.min(token.length, keyword.length) * 0.34));
  return levenshtein(keyword, token) <= maxDist;
};

// Traduction FR → EN complète et sans doublons (utile pour la recherche et le filtrage)
const frenchToEnglish = {
  // --- Général / Structure du site ---
  'accueil': ['home', 'homepage', 'welcome', 'main page'],
  'menu': ['menu', 'navigation', 'navbar'],
  'thematique': ['theme', 'thematic', 'topic', 'subject', 'category'],
  'categorie': ['category', 'group', 'section'],
  'sous-categorie': ['subcategory', 'subsection', 'division'],
  'titre': ['title', 'name', 'heading', 'label'],
  'description': ['description', 'details', 'summary', 'overview', 'content'],
  'contenu': ['content', 'text', 'article', 'post'],
  'mot-clé': ['keyword', 'tag', 'label'],
  'mot cle': ['keyword', 'tag', 'label'],
  'recherche': ['search', 'find', 'lookup', 'query'],
  'filtrer': ['filter', 'sort', 'refine', 'narrow'],
  'resultat': ['result', 'outcome', 'match', 'response'],

  // --- Utilisateurs / Comptes ---
  'utilisateur': ['user', 'member', 'account', 'profile', 'participant'],
  'profil': ['profile', 'account', 'user info', 'personal page'],
  'inscription': ['signup', 'register', 'registration', 'create account'],
  'connexion': ['login', 'sign in', 'authenticate', 'access'],
  'deconnexion': ['logout', 'sign out', 'disconnect', 'exit'],
  'identifiant': ['username', 'user id', 'login', 'identifier'],
  'mot de passe': ['password', 'passcode', 'security key'],
  'email': ['email', 'mail', 'contact'],
  'role': ['role', 'permission', 'access level', 'authorization'],
  'administrateur': ['admin', 'administrator', 'moderator'],
  'moderateur': ['moderator', 'admin assistant', 'controller'],
  'client': ['customer', 'client', 'buyer', 'consumer', 'user'],
  'visiteur': ['visitor', 'guest', 'anonymous user'],
  'compte': ['account', 'profile', 'user account'],

  // --- Commentaires / Feedback ---
  'commentaire': ['comment', 'feedback', 'review', 'opinion', 'response'],
  'avis': ['review', 'rating', 'feedback', 'opinion'],
  'note': ['rating', 'score', 'mark', 'grade'],
  'evaluation': ['evaluation', 'assessment', 'review'],
  'mention': ['mention', 'reference', 'tag'],
  'reponse': ['answer', 'response', 'reply'],

  // --- Classement / Statistiques ---
  'classement': ['ranking', 'leaderboard', 'scoreboard', 'position'],
  'score': ['score', 'points', 'mark', 'ranking'],
  'statistique': ['statistics', 'data', 'metrics', 'analytics'],
  'performance': ['performance', 'efficiency', 'result'],

  // --- Légal / Conditions / Politique ---
  'à propos': ['about', 'info', 'platform', 'presentation', 'who we are'],
  'apropos': ['about', 'info', 'platform', 'presentation', 'who we are'],
  'conditions': ['terms', 'conditions', 'rules', 'agreement', 'policy'],
  'conditions generales': ['terms and conditions', 'general conditions'],
  'politique': ['policy', 'rules', 'privacy', 'regulation'],
  'politique de confidentialité': ['privacy policy', 'data protection policy'],
  'confidentialité': ['privacy', 'confidentiality', 'data protection'],
  'protection des données': ['data protection', 'gdpr', 'privacy policy'],
  'cookies': ['cookies', 'cookie policy', 'tracking'],
  'mentions légales': ['legal notice', 'legal information', 'imprint'],
  'cgu': ['terms', 'tos', 'terms of service', 'policy'],
  'faq': ['faq', 'questions', 'help', 'support'],
  'aide': ['help', 'support', 'assistance', 'guide'],
  'support': ['support', 'assistance', 'helpdesk'],

  // --- Informations institutionnelles ---
  'mission': ['mission', 'goal', 'purpose', 'objective'],
  'vision': ['vision', 'future', 'objective', 'strategy'],
  'valeurs': ['values', 'principles', 'ethics'],
  'objectif': ['goal', 'objective', 'target', 'aim'],
  'histoire': ['history', 'background', 'story', 'journey'],
  'partenaire': ['partner', 'collaborator', 'affiliate'],
  'equipe': ['team', 'staff', 'crew', 'group'],
  'contact': ['contact', 'get in touch', 'reach out'],

  // --- Interface / Navigation ---
  'tableau de bord': ['dashboard', 'control panel', 'admin board'],
  'parametre': ['settings', 'preferences', 'configuration', 'options'],
  'configuration': ['configuration', 'setup', 'settings', 'system'],
  'notification': ['notification', 'alert', 'message', 'update'],
  'message': ['message', 'chat', 'communication'],
  'formulaire': ['form', 'input form', 'survey'],
  'bouton': ['button', 'click', 'action'],
  'lien': ['link', 'url', 'hyperlink'],
  'page': ['page', 'view', 'screen'],
  'section': ['section', 'area', 'part'],

  // --- Contenu dynamique / Quiz / Thèmes ---
  'quiz': ['quiz', 'game', 'test', 'challenge'],
  'question': ['question', 'faq', 'ask', 'query'],
  'reponse': ['answer', 'response', 'solution'],
  'jeu': ['game', 'play', 'entertainment', 'challenge'],
  'niveau': ['level', 'stage', 'difficulty'],
  'thematique populaire': ['popular theme', 'trending topic'],

  // --- Éléments techniques ---
  'serveur': ['server', 'backend', 'host'],
  'base de données': ['database', 'db', 'data storage'],
  'api': ['api', 'interface', 'endpoint'],
  'route': ['route', 'path', 'endpoint'],
  'service': ['service', 'functionality', 'feature'],
  'composant': ['component', 'element', 'module'],
  'frontend': ['frontend', 'client side', 'interface'],
  'backend': ['backend', 'server side', 'system'],
  'stockage': ['storage', 'saving', 'database', 'backup'],
  'mise à jour': ['update', 'refresh', 'upgrade'],

  // --- Accessibilité / États ---
  'actif': ['active', 'enabled', 'available'],
  'inactif': ['inactive', 'disabled', 'unavailable'],
  'bloqué': ['blocked', 'banned', 'restricted'],
  'valide': ['valid', 'approved', 'confirmed'],
  'erreur': ['error', 'mistake', 'issue', 'bug'],
  'succès': ['success', 'done', 'completed', 'approved'],
  'chargement': ['loading', 'fetching', 'processing'],

  // --- Autres utiles ---
  'date': ['date', 'time', 'timestamp'],
  'heure': ['hour', 'time'],
  'jour': ['day', 'date'],
  'mois': ['month', 'period'],
  'année': ['year'],
  'image': ['image', 'photo', 'picture', 'media'],
  'video': ['video', 'clip', 'media', 'film'],
  'son': ['sound', 'audio', 'music'],
  'fichier': ['file', 'document', 'upload'],
  'document': ['document', 'file', 'record'],
  'exemple': ['example', 'sample', 'demo'],
  'test': ['test', 'try', 'experiment', 'check'],

  // --- Marché / Plateforme commerciale (si e-commerce inclus) ---
  'produit': ['product', 'item', 'good'],
  'prix': ['price', 'cost', 'rate', 'tariff'],
  'commande': ['order', 'purchase', 'request'],
  'panier': ['cart', 'basket', 'shopping cart'],
  'paiement': ['payment', 'transaction', 'checkout'],
  'livraison': ['delivery', 'shipping', 'dispatch'],
  'facture': ['invoice', 'bill', 'receipt'],
  'vendeur': ['seller', 'vendor', 'merchant'],
  'acheteur': ['buyer', 'purchaser', 'client'],

  // --- Communauté / Réseau ---
  'abonnement': ['subscription', 'membership', 'plan'],
  'suivre': ['follow', 'subscribe', 'track'],
  'partager': ['share', 'spread', 'post', 'publish'],
  'publication': ['post', 'publication', 'entry', 'article'],
  'actualité': ['news', 'update', 'event', 'feed'],
  'discussion': ['discussion', 'chat', 'forum', 'thread'],
  'forum': ['forum', 'community', 'board'],
  'groupe': ['group', 'community', 'team'],
  'invitation': ['invite', 'invitation', 'request'],
};


const Search = () => {
  const { openPopup } = usePopup();
  const params = useQueryParam();
  const navigate = useNavigate();
  const qraw = params.get('query') || '';
  const q = normalize(qraw);
  const hasQuery = q.length > 0;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [results, setResults] = useState({
    thematics: [],
    cgu: [],
    about: [],
    comments: [],
    rankings: [],
    faqs: [],
  });

  useEffect(() => {
    let cancelled = false;
    if (!hasQuery) {
      setResults({ thematics: [], cgu: [], about: [], comments: [], rankings: [], faqs: [] });
      setErrors([]);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      setErrors([]);

      try {
        const [
          thematicsRaw,
          cguRaw,
          aboutRaw,
          commentsRaw,
          faqsRaw,
          rankingsRaw,
        ] = await Promise.all([
          thematicService.getAllThematics().catch(() => []),
          cguServices.getAll().catch(() => []),
          aboutServices.getAll().catch(() => []),
          commentServices.getAllComments().catch(() => []),
          faqServices.getAllFaq().catch(() => []),
          quizStatsServices.getRankings(50).catch(async () => {
            try {
              return await pointService.getAllUsersPoints();
            } catch {
              return [];
            }
          }),
        ]);

        // Étape 1 : découpe des mots-clés
        let keywords = q.split(/\s+/).filter(Boolean);

        // Étape 2 : enrichissement avec les traductions anglaises
        keywords = keywords.flatMap((word) => {
          const lower = word.toLowerCase();
          const translations = frenchToEnglish[lower] || [];
          return [word, ...translations];
        });

        // Test de correspondance d'un champ string
        const fieldMatches = (fieldValue) => {
          const norm = normalize(fieldValue);
          if (!norm) return false;
          const tokens = norm.split(/\s+/).filter(Boolean);
          for (const kw of keywords) if (norm.includes(kw)) return true;
          for (const kw of keywords) for (const token of tokens) if (isSimilar(kw, token)) return true;
          return false;
        };

        // Filtre générique (string + number + fallback JSON)
        const filterItem = (item, stringFields = [], numberFields = []) => {
          if (!item) return false;
          for (const nf of numberFields) {
            const v = item?.[nf];
            if (v !== undefined && v !== null) {
              if (String(v).includes(qraw)) return true;
            }
          }
          for (const f of stringFields) {
            const v = item?.[f];
            if (typeof v === 'string' && fieldMatches(v)) return true;
            if (v && typeof v === 'object') {
              for (const subKey of Object.keys(v)) {
                if (typeof v[subKey] === 'string' && fieldMatches(v[subKey])) return true;
              }
            }
          }
          try {
            const json = normalize(JSON.stringify(item));
            for (const kw of keywords) if (json.includes(kw)) return true;
            const jsonTokens = json.split(/\s+/).filter(Boolean).slice(0, 500);
            for (const kw of keywords) for (const t of jsonTokens) if (isSimilar(kw, t)) return true;
          } catch {
            // ignore
          }
          return false;
        };

        const thematics = toArray(thematicsRaw).filter((t) =>
          filterItem(t, ['thematic_title', 'title', 'thematic_description', 'description', 'color_code', 'subtitle'])
        );

        const cgu = toArray(cguRaw).filter((c) => filterItem(c, ['title', 'content']));

        const about = toArray(aboutRaw).filter((a) =>
          filterItem(a, ['title', 'subtitle', 'description', 'mission', 'vision', 'contact_email'])
        );

        const comments = toArray(commentsRaw).filter((c) =>
          filterItem(c, ['content', 'text', 'title', 'username', 'user'], ['likes', 'dislikes'])
        );

        const faqs = toArray(faqsRaw)
          .filter((f) => Number(f.is_active) === 1 || f.is_active === true || f.is_active === '1')
          .filter((f) => filterItem(f, ['question', 'answer']));

        const rankings = toArray(rankingsRaw).filter((r) =>
          filterItem(r, ['username', 'name', 'pseudo', 'full_name'], ['points', 'score', 'total_points'])
        );

        if (!cancelled) {
          setResults({ thematics, cgu, about, comments, faqs, rankings });
        }
      } catch (err) {
        if (!cancelled) setErrors((prev) => [...prev, 'Erreur lors du chargement.', err]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [q, hasQuery]);

  const totalResults = Object.values(results).reduce(
    (s, arr) => s + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  return (
    <div className="container py-4 text-light">
      <div style={{ padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
        <div>
          {hasQuery ? (
            <div className="d-flex gap-2 mb-3 align-items-start justify-content-start">
              <p className="m-0 p-0" style={{ color: '#666' }}>
                Résultats pour : "{qraw}"
              </p>

              {!loading && totalResults > 0 && (
                <div className="d-flex align-items-center justify-content-center">
                  <p className="m-0 p-0" style={{ color: 'white' }}>
                    {totalResults} résultats trouvés
                  </p>
                </div>
              )}

              {!loading && totalResults === 0 && (
                <p className="m-0 p-0" style={{ color: '#999' }}>
                  Aucun résultat trouvé pour "{qraw}".
                </p>
              )}
            </div>
          ) : (
            <h3 className='text-center p-5 m-5' style={{ color: '#666' }}>Entrez un terme de recherche</h3>
          )}
        </div>

        {loading && hasQuery && (
          <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Chargement en cours...</p>
          </div>
        )}

        {!loading && errors.length > 0 && hasQuery && (
          <div style={{ background: '#fee', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            {errors.map((e, i) => (
              <p key={i} style={{ color: '#c00' }}>
                {e}
              </p>
            ))}
          </div>
        )}

        {!loading && hasQuery && totalResults === 0 && (
          <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Aucun résultat trouvé pour "{qraw}".</p>
          </div>
        )}

        {hasQuery && (
          <div>
            {!loading && results.thematics.length > 0 && (
              <div style={{ padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                <h3
                  style={{
                    color: 'white',
                    borderBottom: '2px solid rgb(209, 16, 183)',
                    paddingBottom: '10px',
                  }}
                >
                  Thématiques ({results.thematics.length})
                </h3>
                {results.thematics.map((item, idx) => (
                  <div
                    key={idx}
                    className="d-flex gap-2 align-items-center justify-content-between"
                    style={{
                      background: '#f9f9f9',
                      border: '1px solid #ddd',
                      padding: '15px',
                      marginTop: '15px',
                      borderRadius: '4px',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>
                        {item.thematic_title || item.title || 'Sans titre'}
                      </h4>
                      <div className="d-flex gap-2 align-items-start">
                        <div style={{ width: '100px', height: '100px' }}>
                          {item.icon_url ? (
                            <img
                              src={item.icon_url}
                              className="w-100 h-100 object-fit-cover"
                              alt={item.thematic_title || item.title || 'Sans titre'}
                            />
                          ) : null}
                        </div>
                        <div>
                          {(item.thematic_description || item.description) && (
                            <p className="m-0 p-0 d-flex flex-wrap w-75" style={{ color: '#666' }}>
                              {item.thematic_description || item.description}
                            </p>
                          )}
                          <p className="m-0 p-0 text-black">
                            {(Array.isArray(item.sub_thematics) && item.sub_thematics.length) ||
                              'Sans sous thématique'}{' '}
                            Sous-thématiques.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const targetId = item?.thematic_id ?? item?.thematicId ?? item?.id;
                        if (targetId) openPopup('thematic', { highlightThematicId: targetId });
                        else openPopup('thematic');
                      }}
                      className="d-flex align-items-center btn rounded-circle p-2 justify-content-center"
                    >
                      <IoArrowRedoOutline style={{ color: 'black', fontSize: '24px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && results.cgu.length > 0 && (
              <div style={{ padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                <h3
                  style={{
                    color: 'white',
                    borderBottom: '2px solid rgb(209, 16, 183)',
                    paddingBottom: '10px',
                  }}
                >
                  CGU ({results.cgu.length})
                </h3>
                {results.cgu.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9f9f9',
                      border: '1px solid #ddd',
                      padding: '15px',
                      marginTop: '15px',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>
                        {item.title || 'Sans titre'}
                      </h4>
                      <button
                        onClick={() => navigate(item?.id ? `/terms#cgu-${item.id}` : '/terms')}
                        className="d-flex align-items-center btn rounded-circle p-2 justify-content-center"
                      >
                        <IoArrowRedoOutline style={{ color: 'black', fontSize: '24px' }} />
                      </button>
                    </div>
                    {item.content && (
                      <p style={{ color: '#666' }}>{String(item.content).slice(0, 200)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && results.about.length > 0 && (
              <div style={{ padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                <h3
                  style={{
                    color: 'white',
                    borderBottom: '2px solid rgb(209, 16, 183)',
                    paddingBottom: '10px',
                  }}
                >
                  À propos ({results.about.length})
                </h3>
                {results.about.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9f9f9',
                      border: '1px solid #ddd',
                      padding: '15px',
                      marginTop: '15px',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>
                        {item.title || 'Sans titre'}
                      </h4>
                      <button
                        onClick={() => navigate('/about')}
                        className="d-flex align-items-center btn rounded-circle p-2 justify-content-center"
                      >
                        <IoArrowRedoOutline style={{ color: 'black', fontSize: '24px' }} />
                      </button>
                    </div>
                    {item.description && <p style={{ color: '#666' }}>{item.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {!loading && results.faqs.length > 0 && (
              <div style={{ padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                <h3
                  style={{
                    color: 'white',
                    borderBottom: '2px solid rgb(209, 16, 183)',
                    paddingBottom: '10px',
                  }}
                >
                  FAQ ({results.faqs.length})
                </h3>
                {results.faqs.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9f9f9',
                      border: '1px solid #ddd',
                      padding: '15px',
                      marginTop: '15px',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>
                        {item.question || 'Sans question'}
                      </h4>
                      <button
                        onClick={() => {
                          const faqId = item?.faq_id ?? item?.id;
                          navigate(faqId ? `/terms#faq-${faqId}` : '/terms');
                        }}
                        className="d-flex align-items-center btn rounded-circle p-2 justify-content-center"
                      >
                        <IoArrowRedoOutline style={{ color: 'black', fontSize: '24px' }} />
                      </button>
                    </div>
                    {item.answer && (
                      <p style={{ color: '#666', margin: '10px 0 0 0' }}>
                        {String(item.answer).slice(0, 200)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && results.rankings.length > 0 && (
              <div style={{ padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
                <h3
                  style={{
                    color: 'white',
                    borderBottom: '2px solid rgb(209, 16, 183)',
                    paddingBottom: '10px',
                  }}
                >
                  Classements ({results.rankings.length})
                </h3>
                {results.rankings.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9f9f9',
                      border: "1px solid '#ddd'",
                      padding: '15px',
                      marginTop: '15px',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>
                        {item.username || item.name || item.pseudo || item.full_name || 'Utilisateur'}
                      </h4>
                      <button
                        onClick={() => navigate('/raking')}
                        className="d-flex align-items-center btn rounded-circle p-2 justify-content-center"
                      >
                        <IoArrowRedoOutline style={{ color: 'black', fontSize: '24px' }} />
                      </button>
                    </div>
                    {(item.points || item.score || item.total_points) && (
                      <span
                        style={{
                          background: '#0066cc',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '14px',
                        }}
                      >
                        Score : {item.points || item.score || item.total_points}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;