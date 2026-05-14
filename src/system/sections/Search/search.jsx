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

const normalize = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .toLowerCase()
    .trim();
};

const levenshtein = (a = '', b = '') => {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const matrix = Array(al + 1).fill(null).map(() => Array(bl + 1).fill(0));
  for (let i = 0; i <= al; i++) matrix[i][0] = i;
  for (let j = 0; j <= bl; j++) matrix[0][j] = j;
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i-1][j]+1, matrix[i][j-1]+1, matrix[i-1][j-1]+cost);
    }
  }
  return matrix[al][bl];
};

const isSimilar = (keyword, token) => {
  if (!keyword || !token) return false;
  if (token.includes(keyword)) return true;
  const maxDist = Math.max(1, Math.floor(Math.min(token.length, keyword.length) * 0.34));
  return levenshtein(keyword, token) <= maxDist;
};

const frenchToEnglish = {
  'accueil': ['home','homepage','welcome','main page'],
  'menu': ['menu','navigation','navbar'],
  'thematique': ['theme','thematic','topic','subject','category'],
  'categorie': ['category','group','section'],
  'sous-categorie': ['subcategory','subsection','division'],
  'titre': ['title','name','heading','label'],
  'description': ['description','details','summary','overview','content'],
  'contenu': ['content','text','article','post'],
  'mot-clé': ['keyword','tag','label'],
  'mot cle': ['keyword','tag','label'],
  'recherche': ['search','find','lookup','query'],
  'filtrer': ['filter','sort','refine','narrow'],
  'resultat': ['result','outcome','match','response'],
  'utilisateur': ['user','member','account','profile','participant'],
  'profil': ['profile','account','user info','personal page'],
  'inscription': ['signup','register','registration','create account'],
  'connexion': ['login','sign in','authenticate','access'],
  'deconnexion': ['logout','sign out','disconnect','exit'],
  'identifiant': ['username','user id','login','identifier'],
  'mot de passe': ['password','passcode','security key'],
  'email': ['email','mail','contact'],
  'role': ['role','permission','access level','authorization'],
  'administrateur': ['admin','administrator','moderator'],
  'moderateur': ['moderator','admin assistant','controller'],
  'client': ['customer','client','buyer','consumer','user'],
  'visiteur': ['visitor','guest','anonymous user'],
  'compte': ['account','profile','user account'],
  'commentaire': ['comment','feedback','review','opinion','response'],
  'avis': ['review','rating','feedback','opinion'],
  'note': ['rating','score','mark','grade'],
  'evaluation': ['evaluation','assessment','review'],
  'mention': ['mention','reference','tag'],
  'reponse': ['answer','response','reply'],
  'classement': ['ranking','leaderboard','scoreboard','position'],
  'score': ['score','points','mark','ranking'],
  'statistique': ['statistics','data','metrics','analytics'],
  'performance': ['performance','efficiency','result'],
  'à propos': ['about','info','platform','presentation','who we are'],
  'apropos': ['about','info','platform','presentation','who we are'],
  'conditions': ['terms','conditions','rules','agreement','policy'],
  'conditions generales': ['terms and conditions','general conditions'],
  'politique': ['policy','rules','privacy','regulation'],
  'politique de confidentialité': ['privacy policy','data protection policy'],
  'confidentialité': ['privacy','confidentiality','data protection'],
  'protection des données': ['data protection','gdpr','privacy policy'],
  'cookies': ['cookies','cookie policy','tracking'],
  'mentions légales': ['legal notice','legal information','imprint'],
  'cgu': ['terms','tos','terms of service','policy'],
  'faq': ['faq','questions','help','support'],
  'aide': ['help','support','assistance','guide'],
  'support': ['support','assistance','helpdesk'],
  'mission': ['mission','goal','purpose','objective'],
  'vision': ['vision','future','objective','strategy'],
  'valeurs': ['values','principles','ethics'],
  'objectif': ['goal','objective','target','aim'],
  'histoire': ['history','background','story','journey'],
  'partenaire': ['partner','collaborator','affiliate'],
  'equipe': ['team','staff','crew','group'],
  'contact': ['contact','get in touch','reach out'],
  'tableau de bord': ['dashboard','control panel','admin board'],
  'parametre': ['settings','preferences','configuration','options'],
  'configuration': ['configuration','setup','settings','system'],
  'notification': ['notification','alert','message','update'],
  'message': ['message','chat','communication'],
  'formulaire': ['form','input form','survey'],
  'bouton': ['button','click','action'],
  'lien': ['link','url','hyperlink'],
  'page': ['page','view','screen'],
  'section': ['section','area','part'],
  'quiz': ['quiz','game','test','challenge'],
  'question': ['question','faq','ask','query'],
  'jeu': ['game','play','entertainment','challenge'],
  'niveau': ['level','stage','difficulty'],
  'thematique populaire': ['popular theme','trending topic'],
  'serveur': ['server','backend','host'],
  'base de données': ['database','db','data storage'],
  'api': ['api','interface','endpoint'],
  'route': ['route','path','endpoint'],
  'service': ['service','functionality','feature'],
  'composant': ['component','element','module'],
  'frontend': ['frontend','client side','interface'],
  'backend': ['backend','server side','system'],
  'stockage': ['storage','saving','database','backup'],
  'mise à jour': ['update','refresh','upgrade'],
  'actif': ['active','enabled','available'],
  'inactif': ['inactive','disabled','unavailable'],
  'bloqué': ['blocked','banned','restricted'],
  'valide': ['valid','approved','confirmed'],
  'erreur': ['error','mistake','issue','bug'],
  'succès': ['success','done','completed','approved'],
  'chargement': ['loading','fetching','processing'],
  'date': ['date','time','timestamp'],
  'heure': ['hour','time'],
  'jour': ['day','date'],
  'mois': ['month','period'],
  'année': ['year'],
  'image': ['image','photo','picture','media'],
  'video': ['video','clip','media','film'],
  'son': ['sound','audio','music'],
  'fichier': ['file','document','upload'],
  'document': ['document','file','record'],
  'exemple': ['example','sample','demo'],
  'test': ['test','try','experiment','check'],
  'produit': ['product','item','good'],
  'prix': ['price','cost','rate','tariff'],
  'commande': ['order','purchase','request'],
  'panier': ['cart','basket','shopping cart'],
  'paiement': ['payment','transaction','checkout'],
  'livraison': ['delivery','shipping','dispatch'],
  'facture': ['invoice','bill','receipt'],
  'vendeur': ['seller','vendor','merchant'],
  'acheteur': ['buyer','purchaser','client'],
  'abonnement': ['subscription','membership','plan'],
  'suivre': ['follow','subscribe','track'],
  'partager': ['share','spread','post','publish'],
  'publication': ['post','publication','entry','article'],
  'actualité': ['news','update','event','feed'],
  'discussion': ['discussion','chat','forum','thread'],
  'forum': ['forum','community','board'],
  'groupe': ['group','community','team'],
  'invitation': ['invite','invitation','request'],
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
  const [results, setResults] = useState({ thematics: [], cgu: [], about: [], comments: [], rankings: [], faqs: [] });

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
        const [thematicsRaw, cguRaw, aboutRaw, commentsRaw, faqsRaw, rankingsRaw] = await Promise.all([
          thematicService.getAllThematics().catch(() => []),
          cguServices.getAll().catch(() => []),
          aboutServices.getAll().catch(() => []),
          commentServices.getAllComments().catch(() => []),
          faqServices.getAllFaq().catch(() => []),
          quizStatsServices.getRankings(50).catch(async () => {
            try { return await pointService.getAllUsersPoints(); } catch { return []; }
          }),
        ]);

        let keywords = q.split(/\s+/).filter(Boolean);
        keywords = keywords.flatMap((word) => {
          const lower = word.toLowerCase();
          const translations = frenchToEnglish[lower] || [];
          return [word, ...translations];
        });

        const fieldMatches = (fieldValue) => {
          const norm = normalize(fieldValue);
          if (!norm) return false;
          const tokens = norm.split(/\s+/).filter(Boolean);
          for (const kw of keywords) if (norm.includes(kw)) return true;
          for (const kw of keywords) for (const token of tokens) if (isSimilar(kw, token)) return true;
          return false;
        };

        const filterItem = (item, stringFields = [], numberFields = []) => {
          if (!item) return false;
          for (const nf of numberFields) {
            const v = item?.[nf];
            if (v !== undefined && v !== null && String(v).includes(qraw)) return true;
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
          } catch {}
          return false;
        };

        const thematics = toArray(thematicsRaw).filter((t) =>
          filterItem(t, ['thematic_title','title','thematic_description','description','color_code','subtitle']));
        const cgu = toArray(cguRaw).filter((c) => filterItem(c, ['title','content']));
        const about = toArray(aboutRaw).filter((a) =>
          filterItem(a, ['title','subtitle','description','mission','vision','contact_email']));
        const comments = toArray(commentsRaw).filter((c) =>
          filterItem(c, ['content','text','title','username','user'], ['likes','dislikes']));
        const faqs = toArray(faqsRaw)
          .filter((f) => Number(f.is_active) === 1 || f.is_active === true || f.is_active === '1')
          .filter((f) => filterItem(f, ['question','answer']));
        const rankings = toArray(rankingsRaw).filter((r) =>
          filterItem(r, ['username','name','pseudo','full_name'], ['points','score','total_points']));

        if (!cancelled) setResults({ thematics, cgu, about, comments, faqs, rankings });
      } catch (err) {
        if (!cancelled) setErrors((prev) => [...prev, 'Erreur lors du chargement.', err]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [q, hasQuery]);

  const totalResults = Object.values(results).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);

  /* ── section renderer ── */
  const Section = ({ title, items, delay = 0, renderItem }) => {
    if (!items.length) return null;
    return (
      <div className="sc-section" style={{ animationDelay: `${delay}s` }}>
        <div className="sc-section-head">
          <span className="sc-section-title">{title}</span>
          <span className="sc-section-badge">{items.length}</span>
        </div>
        {items.map((item, idx) => renderItem(item, idx))}
      </div>
    );
  };

  return (
    <div className="sc-page">
      <div className="sc-wrap">

        {/* ── Header ── */}
        {hasQuery && !loading && (
          <div className="sc-header">
            {totalResults > 0 ? (
              <>
                <span className="sc-count-badge">🔍 {totalResults} résultat{totalResults > 1 ? 's' : ''}</span>
                <span className="sc-query-label">pour <em>"{qraw}"</em></span>
              </>
            ) : null}
          </div>
        )}

        {/* ── Errors ── */}
        {errors.length > 0 && hasQuery && (
          <div className="sc-error">{errors[0]}</div>
        )}

        {/* ── Loading ── */}
        {loading && hasQuery && (
          <div className="sc-state">
            <div className="sc-dots">
              <div className="sc-dot" /><div className="sc-dot" /><div className="sc-dot" />
            </div>
            <div className="sc-state-title">Recherche en cours…</div>
          </div>
        )}

        {/* ── Empty / no query ── */}
        {!loading && !hasQuery && (
          <div className="sc-state">
            <div className="sc-state-icon">🔎</div>
            <div className="sc-state-title">Lancez une recherche</div>
            <div className="sc-state-sub">Utilisez la barre de recherche pour trouver des thématiques, FAQ, classements et plus encore.</div>
          </div>
        )}

        {!loading && hasQuery && totalResults === 0 && (
          <div className="sc-state">
            <div className="sc-state-icon">😶</div>
            <div className="sc-state-title">Aucun résultat</div>
            <div className="sc-state-sub">Aucun contenu ne correspond à <em>"{qraw}"</em>. Essayez un autre terme.</div>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && hasQuery && totalResults > 0 && (
          <div className="sc-results">

            <Section title="Thématiques" items={results.thematics} delay={0} renderItem={(item, idx) => (
              <div key={idx} className="sc-item">
                {item.icon_url && <img src={item.icon_url} className="sc-item-thumb" alt="" />}
                <div className="sc-item-body">
                  <div className="sc-item-title">{item.thematic_title || item.title || 'Sans titre'}</div>
                  {(item.thematic_description || item.description) && (
                    <p className="sc-item-desc">{item.thematic_description || item.description}</p>
                  )}
                  {Array.isArray(item.sub_thematics) && item.sub_thematics.length > 0 && (
                    <div className="sc-item-meta">
                      <span className="sc-item-pill">{item.sub_thematics.length} sous-thématique{item.sub_thematics.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                <button className="sc-item-action" onClick={() => {
                  const id = item?.thematic_id ?? item?.thematicId ?? item?.id;
                  id ? openPopup('thematic', { highlightThematicId: id }) : openPopup('thematic');
                }}>
                  <IoArrowRedoOutline />
                </button>
              </div>
            )} />

            <Section title="CGU" items={results.cgu} delay={0.04} renderItem={(item, idx) => (
              <div key={idx} className="sc-item">
                <div className="sc-item-body">
                  <div className="sc-item-title">{item.title || 'Sans titre'}</div>
                  {item.content && <p className="sc-item-desc">{String(item.content).slice(0, 200)}</p>}
                </div>
                <button className="sc-item-action" onClick={() => navigate(item?.id ? `/terms#cgu-${item.id}` : '/terms')}>
                  <IoArrowRedoOutline />
                </button>
              </div>
            )} />

            <Section title="À propos" items={results.about} delay={0.08} renderItem={(item, idx) => (
              <div key={idx} className="sc-item">
                <div className="sc-item-body">
                  <div className="sc-item-title">{item.title || 'Sans titre'}</div>
                  {item.description && <p className="sc-item-desc">{item.description}</p>}
                </div>
                <button className="sc-item-action" onClick={() => navigate('/about')}>
                  <IoArrowRedoOutline />
                </button>
              </div>
            )} />

            <Section title="FAQ" items={results.faqs} delay={0.12} renderItem={(item, idx) => (
              <div key={idx} className="sc-item">
                <div className="sc-item-body">
                  <div className="sc-item-title">{item.question || 'Sans question'}</div>
                  {item.answer && <p className="sc-item-desc">{String(item.answer).slice(0, 200)}</p>}
                </div>
                <button className="sc-item-action" onClick={() => {
                  const faqId = item?.faq_id ?? item?.id;
                  navigate(faqId ? `/terms#faq-${faqId}` : '/terms');
                }}>
                  <IoArrowRedoOutline />
                </button>
              </div>
            )} />

            <Section title="Classements" items={results.rankings} delay={0.16} renderItem={(item, idx) => (
              <div key={idx} className="sc-item">
                <div className="sc-item-body">
                  <div className="sc-item-title">{item.username || item.name || item.pseudo || item.full_name || 'Utilisateur'}</div>
                  {(item.points || item.score || item.total_points) && (
                    <div className="sc-item-meta">
                      <span className="sc-item-pill score">🪙 {item.points || item.score || item.total_points} pts</span>
                    </div>
                  )}
                </div>
                <button className="sc-item-action" onClick={() => navigate('/raking')}>
                  <IoArrowRedoOutline />
                </button>
              </div>
            )} />

          </div>
        )}

      </div>
    </div>
  );
};

export default Search;
