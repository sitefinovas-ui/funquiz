import './home.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';

import google from '../../../assets/icons/google.png';
import { MdNavigateNext } from 'react-icons/md';

import thematicService   from '../../configurations/Services/thematicServices';
import pointService      from '../../configurations/Services/pointService';
import faqService        from '../../configurations/Services/faqService.js';
import commentService    from '../../configurations/Services/commentServices.js';
import newsletterService from '../../configurations/Services/newsletterServices.js';
import pubService        from '../../configurations/Services/publiciteServices.js';

const Home = () => {
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const user_id_token = payload?.user_id;

  const navigate = useNavigate();
  const { openPopup, setActivePopup } = usePopup();

  const [activeIndex,   setActiveIndex]   = useState(null);
  const [activeRankTab, setActiveRankTab] = useState(0);
  const [message,       setMessage]       = useState('');
  const [loading,       setLoading]       = useState(false);
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  const [thematics, setThematics] = useState([]);
  const [points,    setPoints]    = useState([]);
  const [faqs,      setFaqs]      = useState([]);
  const [comments,  setComments]  = useState([]);
  const [email,     setEmail]     = useState('');
  const [pub,       setPub]       = useState([]);

  const toggleFAQ = (i) => setActiveIndex(activeIndex === i ? null : i);

  /* ── Data fetching ── */
  useEffect(() => {
    let mounted = true;
    thematicService.getAllThematics()
      .then(data => { if (mounted) setThematics(Array.isArray(data) ? data : []); })
      .catch(() => { if (mounted) setThematics([]); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    pointService.getAllUsersPoints().then(response => {
      setPoints(
        Array.isArray(response?.data?.data) ? response.data.data :
        Array.isArray(response?.data)       ? response.data : []
      );
    }).catch(() => {});
  }, []);

  useEffect(() => {
    faqService.getAllFaq().then(data => {
      setFaqs(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    commentService.getCommentsWithUserAndQuiz().then(setComments).catch(() => {});
  }, []);

  useEffect(() => {
    pubService.list().then(data => {
      setPub(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true); setLoading(true); setMessage('');
    try {
      await newsletterService.addNewsletter({ email, user_id: user_id_token || null });
      setMessage('Merci pour votre inscription !');
      setEmail('');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(
        error?.status === 409 || /déjà abonné/i.test(error?.message || '')
          ? 'Vous êtes déjà inscrit à la newsletter.'
          : 'Une erreur est survenue. Veuillez réessayer.'
      );
      setTimeout(() => setMessage(''), 5000);
    } finally { setLoading(false); setIsSubmitting(false); }
  };

  const approvedComments = Array.isArray(comments)
    ? comments.filter(c =>
        Number(c.is_approved) === 1 &&
        (c.is_visible !== undefined ? Number(c.is_visible) : Number(c.is_approved)) === 1
      )
    : [];

  /* ── Ranking tab data ── */
  const RANK_TABS = ['Top quiz', 'Populaires', 'Joueurs'];

  const thematicItems = [...thematics]
    .sort((a, b) => (b.sub_thematics?.length || 0) - (a.sub_thematics?.length || 0))
    .slice(0, 9)
    .map(t => ({
      id:       t.thematic_id,
      icon:     t.icon_url,
      name:     t.thematic_title,
      tag:      `Quiz · ${t.sub_thematics?.length || 0} sous-thèmes`,
      rating:   '4.8',
      isPlayer: false,
      onClick:  () => openPopup('thematic', { highlightThematicId: t.thematic_id }),
    }));

  const popularItems = [...thematics]
    .slice(0, 9)
    .map(t => ({
      id:       t.thematic_id,
      icon:     t.icon_url,
      name:     t.thematic_title,
      tag:      t.thematic_description?.slice(0, 40) || 'Quiz interactif · FunQuiz',
      rating:   '4.9',
      isPlayer: false,
      onClick:  () => openPopup('thematic', { highlightThematicId: t.thematic_id }),
    }));

  const playerItems = points.slice(0, 9).map(p => ({
    id:       p.user_id,
    icon:     p.avatar_url || '/favicon_log_fun_quiz.png',
    name:     `${p.first_name || ''} ${p.name || ''}`.trim() || 'Joueur',
    tag:      `${(p.total_points || 0).toLocaleString('fr-FR')} pts · ${p.games_played || 0} parties`,
    rating:   `★ Champion`,
    isPlayer: true,
    onClick:  null,
  }));

  const rankingItems = activeRankTab === 2 ? playerItems : activeRankTab === 1 ? popularItems : thematicItems;

  return (
    <div className="bg-white min-h-screen pb-24 lg:px-[200px] lg:pb-0">

      {/* ══ FEATURED CAROUSEL ══ */}
      <section className='ps-8'>
        <div className="flex gap-3 px-4 md:px-6 pt-5 pb-4 overflow-x-auto scroll-hide snap-x snap-mandatory">
          {thematics.map((thematic, i) => (
            <div key={thematic.thematic_id} className="fc-entrance" style={{ animationDelay: `${i * 0.07}s` }}>
              <FeaturedCard
                thematic={thematic}
                onClick={() => openPopup('thematic', { highlightThematicId: thematic.thematic_id })}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ══ MEILLEURS CLASSEMENTS ══ */}
      <section className="px-4 md:px-6 py-4 border-t border-gray-100">

        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900">Meilleurs classements</h2>
          <button
            onClick={() => navigate('/raking')}
            className="flex items-center gap-0.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
          >
            Voir tout <MdNavigateNext size={16} />
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto scroll-hide pb-1">
          {RANK_TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveRankTab(i)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeRankTab === i
                  ? 'bg-violet-50 text-violet-700 border-violet-300'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 3-column ranking grid */}
        {rankingItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-gray-100">
            {rankingItems.map((item, i) => (
              <div
                key={item.id || i}
                onClick={item.onClick || undefined}
                className={`rank-item flex items-center gap-3 py-3 px-2 border-b border-gray-100 last:border-b-0 rounded-lg ${
                  item.onClick ? 'cursor-pointer' : ''
                }`}
                style={{ animationDelay: `${i * 0.055}s` }}
              >
                <span className="rank-num w-5 shrink-0 text-center text-sm font-medium text-gray-400">{i + 1}</span>
                <div className={`rank-icon w-12 h-12 shrink-0 overflow-hidden bg-violet-50 border border-gray-100 flex items-center justify-center ${item.isPlayer ? 'rounded-full' : 'rounded-xl'}`}>
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={item.isPlayer ? 'w-full h-full object-cover' : 'w-10 h-10 object-contain'}
                    onError={e => { e.target.onerror = null; e.target.src = '/favicon_log_fun_quiz.png'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{item.tag}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-xs text-gray-400">{item.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-6 text-center">Aucune donnée disponible.</p>
        )}
      </section>

      {/* ══ AVIS DES JOUEURS ══ */}
      {approvedComments.length > 0 && (
        <section className="py-4 border-t border-gray-100">
          <div className="flex items-center justify-between px-4 md:px-6 mb-3">
            <div className="flex items-center gap-2.5">
              <img src={google} width={22} height={22} alt="Google" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-none">Avis des joueurs</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-amber-400 text-xs">★★★★★</span>
                  <span className="text-xs text-gray-400">5.0 · {approvedComments.length} avis</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActivePopup('opinion')}
              className="flex items-center gap-0.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
            >
              Voir tout <MdNavigateNext size={16} />
            </button>
          </div>

          <div className="flex gap-3 px-4 md:px-6 overflow-x-auto scroll-hide pb-2 snap-x snap-mandatory">
            {approvedComments.slice(0, 8).map((comment, i) => (
              <div
                key={comment.comment_id ?? i}
                className="review-card snap-start shrink-0 w-64 md:w-72 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={comment.avatar_url || '/favicon_log_fun_quiz.png'}
                    alt={comment.first_name || 'Joueur'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0"
                    onError={e => { e.target.onerror = null; e.target.src = '/favicon_log_fun_quiz.png'; }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate leading-none">
                      {comment.first_name} {comment.name}
                    </p>
                    <span className="text-amber-400 text-xs">★★★★★</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">{comment.content}</p>
                <p className="text-xs text-gray-400">
                  {comment.created_at
                    ? new Date(comment.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ OFFRES SPÉCIALES ══ */}
      {Array.isArray(pub) && pub.filter(i => i.statut === 'actif').length > 0 && (
        <section className="px-4 md:px-6 py-4 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Offres spéciales</h2>
          {pub.filter(i => i.statut === 'actif').map((item, index) => (
            <PubCard key={index} item={item} index={index} />
          ))}
        </section>
      )}

      {/* ══ FAQ ══ */}
      {Array.isArray(faqs) && faqs.length > 0 && (
        <section className="px-4 md:px-6 py-4 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Questions fréquentes</h2>
            <button
              onClick={() => navigate('/terms')}
              className="flex items-center gap-0.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
            >
              Voir plus <MdNavigateNext size={16} />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-2 max-w-4xl">
            {faqs.slice(0, 6).map((faq, index) => (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden transition-all ${
                  activeIndex === index
                    ? 'border-violet-200 bg-violet-50/60'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className={`text-sm font-medium leading-snug ${activeIndex === index ? 'text-violet-700' : 'text-gray-800'}`}>
                    {faq.question}
                  </span>
                  <span className={`text-lg shrink-0 ${activeIndex === index ? 'text-violet-500' : 'text-gray-400'}`}>
                    {activeIndex === index ? '−' : '+'}
                  </span>
                </button>
                {activeIndex === index && (
                  <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-violet-100">
                    <p className="pt-3 m-0">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ NEWSLETTER ══ */}
      <section className="px-4 md:px-6 lg:py-[100px] border-t border-gray-100">
        <div className="max-w-md mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200 mb-3">
            📬 Newsletter
          </span>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Restez informé des nouveautés
          </h2>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Recevez les nouveaux quiz et actualités directement dans votre boîte mail.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 focus-within:border-violet-300 rounded-full px-4 py-2 transition-colors"
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 min-w-0"
              required
            />
            <button
              className="shrink-0 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '...' : "S'inscrire"}
            </button>
          </form>
          {message && (
            <p className="mt-3 text-sm text-violet-600">{message}</p>
          )}
        </div>
      </section>

    </div>
  );
};

/* ══ FEATURED CARD ══ */
const FeaturedCard = ({ thematic, onClick }) => {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = -((y - rect.height / 2) / rect.height) * 14;
    const ry =  ((x - rect.width  / 2) / rect.width)  * 14;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;
    const shimmer = card.querySelector('.fc-shimmer');
    if (shimmer) {
      shimmer.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,.22) 0%, transparent 60%)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    const shimmer = card.querySelector('.fc-shimmer');
    if (shimmer) shimmer.style.background = 'transparent';
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fc-card snap-start shrink-0 relative w-[280px] md:w-[360px] h-[180px] md:h-[220px] rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        background: `linear-gradient(160deg, ${thematic.color_code || '#7c3aed'}ee 0%, ${thematic.color_code || '#7c3aed'}77 100%)`,
        transition: 'transform 0.18s cubic-bezier(.23,1,.32,1), box-shadow 0.18s ease',
        willChange: 'transform',
      }}
    >
      {/* Mouse-follow shimmer */}
      <div className="fc-shimmer absolute inset-0 z-10 pointer-events-none rounded-2xl" style={{ transition: 'background 0.1s' }} />

      {/* Big faded bg icon — spins subtly on hover */}
      <img
        src={thematic.icon_url}
        alt=""
        aria-hidden="true"
        className="fc-bg-icon absolute right-2 bottom-2 w-28 h-28 md:w-36 md:h-36 object-contain"
      />

      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* Sweep shine on hover */}
      <div className="fc-sweep absolute inset-0 pointer-events-none" />

      {/* Badge top-left */}
      <div className="absolute top-3 left-3 z-20">
        <span className="fc-badge inline-flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block fc-dot" />
          Disponible
        </span>
      </div>

      {/* Sub-theme count badge top-right */}
      {(thematic.sub_thematics?.length || 0) > 0 && (
        <div className="absolute top-3 right-3 z-20">
          <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
            {thematic.sub_thematics.length} quiz
          </span>
        </div>
      )}

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
        <h3 className="text-white font-bold text-base leading-tight mb-2.5 line-clamp-1 drop-shadow">
          {thematic.thematic_title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 shrink-0 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center">
              <img src={thematic.icon_url} alt="" className="w-6 h-6 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold leading-none truncate">{thematic.thematic_title}</p>
              <p className="text-white/60 text-[11px] mt-0.5">
                {thematic.sub_thematics?.length || 0} quiz · FunQuiz
              </p>
            </div>
          </div>
          <button className="fc-play-btn shrink-0 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
            Jouer
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══ PUB CARD ══ */
function getTimeLeft(dateFin) {
  if (!dateFin) return null;
  const diff = new Date(dateFin) - new Date();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  };
}

function getProgress(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return 30;
  const total = new Date(dateFin) - new Date(dateDebut);
  if (total <= 0) return 100;
  const elapsed = new Date() - new Date(dateDebut);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function formatDateFr(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(local);
}

const PubCard = ({ item, index }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(item.date_fin));
  const [progress, setProgress] = useState(() => getProgress(item.date_debut, item.date_fin));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(item.date_fin));
      setProgress(getProgress(item.date_debut, item.date_fin));
    }, 1000);
    return () => clearInterval(id);
  }, [item.date_fin, item.date_debut]);

  return (
    <div className={`pub-cinema-card ${index % 2 === 1 ? 'reverse' : ''}`}>
      <div className="pub-cinema-bg">
        <img src={item.image_url} alt={item.titre ?? ''} className="pub-cinema-img" />
        <div className="pub-cinema-overlay" />
        <div className="pub-cinema-shimmer" />
      </div>
      <div className="pub-particles" aria-hidden="true">
        {[1,2,3,4,5,6].map(n => <div key={n} className={`pub-particle pub-p${n}`} />)}
      </div>
      <div className="pub-glass-panel">
        <div className="pub-glass-top">
          <span className="pub-flash-badge">⚡ Offre spéciale</span>
          {timeLeft && (
            <div className="pub-countdown">
              {timeLeft.days > 0 && <span className="pub-cd-unit"><b>{timeLeft.days}</b>j</span>}
              <span className="pub-cd-unit"><b>{String(timeLeft.hours).padStart(2,'0')}</b>h</span>
              <span className="pub-cd-unit"><b>{String(timeLeft.minutes).padStart(2,'0')}</b>m</span>
              <span className="pub-cd-unit"><b>{String(timeLeft.seconds).padStart(2,'0')}</b>s</span>
            </div>
          )}
        </div>
        <h2 className="pub-glass-title">{item?.titre ?? 'Titre indisponible'}</h2>
        <p className="pub-glass-desc">{item.description}</p>
        <div className="pub-progress-wrap">
          <div className="pub-progress-labels">
            <span>Du {formatDateFr(item.date_debut)}</span>
            <span>au {formatDateFr(item.date_fin)}</span>
          </div>
          <div className="pub-progress-track">
            <div className="pub-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button className="pub-cinema-cta">
          Découvrir maintenant <span className="pub-cta-icon">↗</span>
        </button>
      </div>
    </div>
  );
};

export default Home;
