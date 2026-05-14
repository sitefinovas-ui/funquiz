import { useState, useEffect, useRef } from 'react';
import useAuth from '../../configurations/Context/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';

const AFRICA_COUNTRIES = [
  {
    name: "Côte d'Ivoire", code: "CI", dial: "+225", flag: "🇨🇮",
    phone: { digits: 10, prefixes: ['01','05','07'], placeholder: "07 00 00 00 00", format: /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/ },
  },
  {
    name: "Nigeria", code: "NG", dial: "+234", flag: "🇳🇬",
    phone: { digits: 10, prefixes: ['07','08','09'], placeholder: "080 000 0000", format: /^(\d{3})(\d{3})(\d{4})$/ },
  },
  {
    name: "Ghana", code: "GH", dial: "+233", flag: "🇬🇭",
    phone: { digits: 9, prefixes: ['02','05'], placeholder: "024 000 0000", format: /^(\d{3})(\d{3})(\d{3})$/ },
  },
  {
    name: "Sénégal", code: "SN", dial: "+221", flag: "🇸🇳",
    phone: { digits: 9, prefixes: ['7'], placeholder: "77 000 00 00", format: /^(\d{2})(\d{3})(\d{2})(\d{2})$/ },
  },
  {
    name: "Cameroun", code: "CM", dial: "+237", flag: "🇨🇲",
    phone: { digits: 9, prefixes: ['6'], placeholder: "6 70 00 00 00", format: /^(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/ },
  },
  {
    name: "Mali", code: "ML", dial: "+223", flag: "🇲🇱",
    phone: { digits: 8, prefixes: ['6','7'], placeholder: "60 00 00 00", format: /^(\d{2})(\d{2})(\d{2})(\d{2})$/ },
  },
  {
    name: "Burkina Faso", code: "BF", dial: "+226", flag: "🇧🇫",
    phone: { digits: 8, prefixes: ['6','7'], placeholder: "60 00 00 00", format: /^(\d{2})(\d{2})(\d{2})(\d{2})$/ },
  },
  {
    name: "Bénin", code: "BJ", dial: "+229", flag: "🇧🇯",
    phone: { digits: 10, prefixes: ['01','05','09','51','61','91','97'], placeholder: "97 00 00 00 00", format: /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/ },
  },
  {
    name: "Togo", code: "TG", dial: "+228", flag: "🇹🇬",
    phone: { digits: 8, prefixes: ['7','9'], placeholder: "90 00 00 00", format: /^(\d{2})(\d{2})(\d{2})(\d{2})$/ },
  },
  {
    name: "RDC", code: "CD", dial: "+243", flag: "🇨🇩",
    phone: { digits: 9, prefixes: ['08','09'], placeholder: "081 000 0000", format: /^(\d{3})(\d{3})(\d{3})$/ },
  },
  {
    name: "Maroc", code: "MA", dial: "+212", flag: "🇲🇦",
    phone: { digits: 9, prefixes: ['6','7'], placeholder: "6 00 00 00 00", format: /^(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/ },
  },
  {
    name: "Algérie", code: "DZ", dial: "+213", flag: "🇩🇿",
    phone: { digits: 9, prefixes: ['5','6','7'], placeholder: "550 000 000", format: /^(\d{3})(\d{3})(\d{3})$/ },
  },
  {
    name: "Tunisie", code: "TN", dial: "+216", flag: "🇹🇳",
    phone: { digits: 8, prefixes: ['2','4','5','9'], placeholder: "20 000 000", format: /^(\d{2})(\d{3})(\d{3})$/ },
  },
  {
    name: "Afrique du Sud", code: "ZA", dial: "+27", flag: "🇿🇦",
    phone: { digits: 9, prefixes: ['6','7','8'], placeholder: "71 000 0000", format: /^(\d{2})(\d{3})(\d{4})$/ },
  },
];

function formatPhone(raw, country) {
  const { format } = country.phone;
  if (!format) return raw;
  const m = raw.match(format);
  if (!m) return raw;
  return m.slice(1).join(' ');
}

function validatePhone(raw, country) {
  if (!raw) return null;
  const { digits, prefixes } = country.phone;
  if (raw.length !== digits) return `Numéro invalide — ${digits} chiffres attendus pour ${country.name}.`;
  if (prefixes.length > 0 && !prefixes.some(p => raw.startsWith(p)))
    return `Préfixe invalide pour ${country.name} (attendu : ${prefixes.join(', ')}).`;
  return null;
}

function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const strengthMeta = [
  { label: '',         color: 'bg-gray-200' },
  { label: 'Faible',   color: 'bg-red-400'  },
  { label: 'Moyen',    color: 'bg-amber-400' },
  { label: 'Bon',      color: 'bg-lime-400'  },
  { label: 'Fort',     color: 'bg-emerald-500' },
];

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-white/40">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold tracking-wider uppercase text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 ' +
  'text-gray-900 placeholder:text-gray-400 outline-none ' +
  'transition-all duration-150 ' +
  'focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5';

const VIDEO_POOL = [
  "https://videos.pexels.com/video-files/3129977/3129977-uhd_2560_1440_30fps.mp4",
  "/signup/1.mp4",
];

const GRID_COLS = 6;
const GRID_ROWS = 5;
const TILE_COUNT = GRID_COLS * GRID_ROWS;

const TILE_PALETTES = [
  ['#0f2027','#203a43','#2c5364'],
  ['#1a1a2e','#16213e','#0f3460'],
  ['#0d1b2a','#1b263b','#415a77'],
  ['#10002b','#240046','#3c096c'],
  ['#03071e','#370617','#6a040f'],
  ['#1b4332','#081c15','#40916c'],
  ['#212529','#343a40','#495057'],
  ['#14213d','#1d3557','#457b9d'],
];

function AnimatedTile({ index }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 120; const H = 90;
    canvas.width = W; canvas.height = H;
    const palette = TILE_PALETTES[index % TILE_PALETTES.length];
    const phase = index * 0.41;
    let t = phase;
    const hex2rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const rgbs = palette.map(hex2rgb);
    const draw = () => {
      t += 0.008;
      const gx = W * 0.5 + Math.sin(t) * W * 0.45;
      const gy = H * 0.5 + Math.cos(t * 0.7) * H * 0.45;
      const grd = ctx.createLinearGradient(gx, 0, W - gx, H);
      grd.addColorStop(0, `rgb(${rgbs[0].join(',')})`);
      grd.addColorStop(0.5, `rgb(${rgbs[1].join(',')})`);
      grd.addColorStop(1, `rgb(${rgbs[2].join(',')})`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      const lx = W * 0.5 + Math.sin(t * 1.2 + phase) * W * 0.38;
      const ly = H * 0.5 + Math.cos(t * 0.8 + phase) * H * 0.38;
      const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, W * 0.6);
      glow.addColorStop(0, 'rgba(255,255,255,0.06)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [index]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

function VideoTile({ src, offset, index }) {
  const [useFallback, setUseFallback] = useState(!src);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    const el = videoRef.current;
    if (!el) return;
    const start = async () => {
      try {
        if (el.duration && !isNaN(el.duration)) el.currentTime = offset % el.duration;
        await el.play();
      } catch { setUseFallback(true); }
    };
    el.addEventListener('loadedmetadata', start);
    return () => el.removeEventListener('loadedmetadata', start);
  }, [src, offset]);

  if (useFallback) return <AnimatedTile index={index} />;

  return (
    <video ref={videoRef} src={src} muted autoPlay loop playsInline preload="metadata"
      onError={() => setUseFallback(true)}
      className="w-full h-full object-cover scale-105"
      style={{ filter: 'contrast(1.1) saturate(1.2)' }}
    />
  );
}

function VideoGridBackground() {
  const tiles = Array.from({ length: TILE_COUNT }, (_, i) => ({
    src: VIDEO_POOL.length ? VIDEO_POOL[i % VIDEO_POOL.length] : null,
    offset: i * 4.3,
    index: i,
  }));

  return (
    <div className="fixed inset-0 w-screen h-screen" style={{ zIndex: 0, display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`, gap: '2px' }}>
      {tiles.map((tile) => (
        <div key={tile.index} className="relative overflow-hidden bg-black">
          <VideoTile src={tile.src} offset={tile.offset} index={tile.index} />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.75) 100%)' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const SignUp = () => {
  useEffect(() => { document.title = 'FUNQUIZ | Inscription'; }, []);

  const [email,           setEmail]           = useState('');
  const [firstName,       setFirstName]       = useState('');
  const [lastName,        setLastName]        = useState('');
  const [number,          setNumber]          = useState('');
  const [country,         setCountry]         = useState(AFRICA_COUNTRIES[0]);
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [error,           setError]           = useState('');
  const [phoneError,      setPhoneError]      = useState('');
  const [loading,         setLoading]         = useState(false);
  const [agreed,          setAgreed]          = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleCountryChange = (code) => {
    setCountry(AFRICA_COUNTRIES.find(x => x.code === code));
    setNumber('');
    setPhoneError('');
  };

  const handlePhoneBlur = () => setPhoneError(validatePhone(number, country) || '');

  const strength = getStrength(password);
  const meta = strengthMeta[strength];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!agreed)                        { setError("Vous devez accepter les conditions d'utilisation."); return; }
    if (password !== confirmPassword)   { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 8)            { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    const phoneErr = validatePhone(number, country);
    if (phoneErr)                       { setError(phoneErr); return; }
    setLoading(true);
    try {
      await register({
        name: lastName, first_name: firstName, email,
        number: number ? `${country.dial}${formatPhone(number, country).replace(/\s/g, '')}` : null,
        date_of_birth: '--/--/----', password,
      });
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (res) => {
    try { await loginWithGoogle(res.credential); navigate('/login'); }
    catch { setError("Erreur d'authentification Google."); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-black overflow-hidden">

      <VideoGridBackground />

      {/* ── Card : full-width sur mobile, max-w-4xl sur desktop ── */}
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/60 flex flex-col lg:flex-row relative z-10">

        {/* ── LEFT : formulaire ── */}
        <div className="flex-1 bg-white px-5 py-6 sm:px-8 sm:py-8 flex flex-col">

          {/* Brand */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src="/Log.png" alt="logo funquiz" />
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">FunQuiz</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Créer un compte</h1>
          <p className="text-sm text-gray-400 mt-1 mb-5">Rejoignez la communauté FunQuiz en Afrique</p>

          {/* Google */}
          <div className="w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Erreur Google.")}
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <hr className="flex-1 border-gray-100" />
            <span className="text-xs text-gray-400">ou par email</span>
            <hr className="flex-1 border-gray-100" />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 mb-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-xs text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-3">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nom">
                <input className={inputCls} placeholder="Konan"
                  value={lastName} onChange={e => setLastName(e.target.value)} required />
              </Field>
              <Field label="Prénom">
                <input className={inputCls} placeholder="Aya"
                  value={firstName} onChange={e => setFirstName(e.target.value)} />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email">
              <input className={inputCls} type="email" placeholder="aya@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </Field>

            {/* Country + Phone — empilés sur mobile, côte à côte sur sm+ */}
            <div className="flex flex-col sm:grid sm:grid-cols-5 gap-2">
              <div className="sm:col-span-2">
                <Field label="Pays">
                  <select
                    className={inputCls + ' cursor-pointer'}
                    value={country.code}
                    onChange={e => handleCountryChange(e.target.value)}
                  >
                    {AFRICA_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field label="Téléphone">
                  <div className="flex gap-2 items-center">
                    <span className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">
                      {country.dial}
                    </span>
                    <input
                      className={`${inputCls} ${phoneError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                      placeholder={country.phone.placeholder}
                      value={number}
                      maxLength={country.phone.digits}
                      onChange={e => { const raw = e.target.value.replace(/\D/g, ''); setNumber(raw); if (phoneError) setPhoneError(''); }}
                      onBlur={handlePhoneBlur}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {phoneError ? (
                      <span className="text-[11px] text-red-500">{phoneError}</span>
                    ) : (
                      <span className="text-[11px] text-gray-400">
                        {number.length > 0 ? `${number.length} / ${country.phone.digits} chiffres` : `${country.phone.digits} chiffres requis`}
                      </span>
                    )}
                    {number.length === country.phone.digits && !phoneError && (
                      <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Valide
                      </span>
                    )}
                  </div>
                </Field>
              </div>
            </div>

            {/* Password */}
            <Field label="Mot de passe">
              <div className="relative">
                <input className={inputCls + ' pr-10'} type={showPass ? 'text' : 'password'}
                  placeholder="8+ caractères" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPass ? 'Masquer' : 'Afficher'}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? meta.color : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  {meta.label && <span className="text-[11px] text-gray-400">{meta.label}</span>}
                </div>
              )}
            </Field>

            {/* Confirm password */}
            <Field label="Confirmer">
              <div className="relative">
                <input
                  className={`${inputCls} pr-10 ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  type={showConfirm ? 'text' : 'password'} placeholder="Répéter le mot de passe"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? 'Masquer' : 'Afficher'}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </Field>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-gray-900 rounded cursor-pointer" />
              <span className="text-xs text-gray-500 leading-relaxed">
                J'accepte les{' '}
                <Link to="/terms" className="text-gray-900 underline underline-offset-2 hover:text-gray-600">conditions d'utilisation</Link>
                {' '}et la{' '}
                <Link to="/privacy" className="text-gray-900 underline underline-offset-2 hover:text-gray-600">politique de confidentialité</Link>
              </span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="mt-1 w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold tracking-wide transition-all duration-150 hover:bg-gray-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                  </svg>
                  Création en cours…
                </>
              ) : "S'inscrire"}
            </button>

            <p className="text-center text-xs text-gray-400 pb-1">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-600">Se connecter</Link>
            </p>

          </form>
        </div>

        {/* ── RIGHT : info panel — masqué sur mobile, visible sur lg ── */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-6 w-[340px] relative overflow-hidden bg-black/30 backdrop-blur-sm border-l border-white/10">
          <div className="relative z-10 text-center px-6">
            <h2 className="text-xl font-semibold text-white tracking-tight leading-snug drop-shadow-md">
              Testez vos<br />connaissances
            </h2>
            <p className="text-sm text-white/50 mt-2 leading-relaxed max-w-[200px] mx-auto">
              Des milliers de quiz sur la culture africaine, l'histoire et bien plus.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-2.5 w-full px-6">
            <StatCard
              icon={<svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
              label="Quiz disponibles" value="12 400+" accent="bg-emerald-500/10"
            />
            <StatCard
              icon={<svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              label="Joueurs actifs" value="87 000+" accent="bg-violet-500/10"
            />
            <StatCard
              icon={<svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>}
              label="Classements" value="En temps réel" accent="bg-amber-500/10"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUp;