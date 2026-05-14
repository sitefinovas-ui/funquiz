import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Wall from '../../../assets/10740576.jpg';
import Logo from '../../../assets/Log.png';

const COUNTRIES = [
  {
    name: "Côte d'Ivoire",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/960px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png",
  },
  {
    name: "Gabon",
    flag: "https://upload.wikimedia.org/wikipedia/commons/0/04/Flag_of_Gabon.svg",
  },
  {
    name: "Ghana",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/1280px-Flag_of_Ghana.svg.png",
  },
  {
    name: "Benin",
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Benin.svg/1280px-Flag_of_Benin.svg.png",
  },
];

const FEATURES = [
  'Quiz adaptés automatiquement à votre pays',
  'Classements et défis locaux',
  'Questions culturelles par région',
  'Progression synchronisée partout en Afrique',
];

const Info = () => {
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const isDash = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const seen = sessionStorage.getItem('seenWelcomePopup');
    if (!isDash && !seen) {
      setShowPopup(true);
      setTimeout(() => setAnimateIn(true), 80);
      sessionStorage.setItem('seenWelcomePopup', 'true');
    }
  }, [isDash]);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 px-0 sm:px-4 sm:py-6">

      {/* Modal */}
      <div
        className={`
          relative w-full sm:max-w-[900px]
          bg-[#11131A]
          rounded-t-[28px] sm:rounded-[28px]
          border-t border-white/[0.08] sm:border border-white/[0.08]
          overflow-hidden
          grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr]
          transition-all duration-500
          ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `}
      >

        {/* ── LEFT — image panel ── */}
        <div className="relative overflow-hidden min-h-[200px] sm:min-h-0">
          {/* Drag pill — mobile only */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-white/20 sm:hidden z-20" />

          <img
            src={Wall}
            alt="Paysage africain"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Scrim — bottom on mobile, right on desktop */}
          <div className="
            absolute inset-0
            bg-gradient-to-b from-black/5 via-black/50 to-[#11131A]
            sm:bg-gradient-to-r sm:from-black/5 sm:via-black/40 sm:to-[#11131A]
          " />

          {/* Left content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-8 gap-3 sm:gap-0">

            {/* Logo pill */}
            <div className="flex items-center gap-3 bg-white/[0.07] border border-white/[0.12] rounded-2xl px-3 py-2 w-fit">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <img src={Logo} alt="FunQuiz" className="w-5 h-5 object-contain" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-white leading-none">FunQuiz</p>
                <p className="text-[11px] text-white/50 mt-0.5">Afrique • Quiz • Culture</p>
              </div>
            </div>

            {/* Hero copy */}
            <div>
              {/* Flags */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {COUNTRIES.map((c, i) => (
                    <img
                      key={i}
                      src={c.flag}
                      alt={c.name}
                      className="w-[22px] h-[22px] rounded-full border-[1.5px] border-[#11131A] object-cover -ml-1.5 first:ml-0"
                    />
                  ))}
                </div>
                <span className="text-[11px] text-white/55">Plus de 54 pays</span>
              </div>

              <h1 className="text-[clamp(20px,4.5vw,34px)] font-semibold text-white leading-[1.12] tracking-[-0.035em]">
                Jouez avec votre culture.<br />
                Défiez tout un continent.
              </h1>

              <p className="hidden sm:block mt-3 text-[13px] leading-relaxed text-white/55 max-w-xs">
                Une plateforme de quiz moderne pensée pour les joueurs africains,
                avec des contenus adaptés automatiquement selon votre pays.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT — content panel ── */}
        <div className="bg-[#13151E] px-5 py-6 sm:px-8 sm:py-9 flex flex-col justify-between gap-5">

          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/25 rounded-full px-3 py-1 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Expérience intelligente & localisée
            </div>

            <h2 className="mt-3 text-[clamp(18px,3vw,26px)] font-semibold text-white leading-[1.2] tracking-[-0.03em]">
              Une expérience pensée<br />
              pour chaque pays africain.
            </h2>

            <p className="mt-3 text-[13px] leading-relaxed text-white/55">
              FunQuiz est accessible dans tous les pays d'Afrique. Les quiz, thèmes
              et défis sont automatiquement adaptés selon votre pays.
            </p>

            {/* Features */}
            <div className="mt-5 flex flex-col gap-2">
              {FEATURES.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5"
                >
                  <span className="w-[7px] h-[7px] flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="text-[12.5px] text-white/75">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowPopup(false)}
              className="
                mt-6 w-full
                bg-white text-black
                rounded-[13px] px-5 py-3.5
                text-[14px] font-semibold
                transition-opacity duration-150
                active:opacity-80
              "
            >
              Commencer l'aventure
            </button>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Confidentialité', to: '/terms' },
              { label: 'CGU', to: '/terms' },
              { label: 'Mentions légales', to: '/legal' },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="text-[11.5px] text-white/30 hover:text-white/60 transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Info;