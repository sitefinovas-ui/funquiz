import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import countryServices from '../../configurations/Services/countryServices.js';

const STORAGE_KEY = 'fq.welcome.v1';
const COUNTRY_KEY = 'fq.selected.country';

export default function WelcomePopup({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    countryServices.getAll()
      .then(data => {
        const active = (data || []).filter(c => c.is_active);
        setCountries(active);
        const saved = localStorage.getItem(COUNTRY_KEY);
        const def = active.find(c => c.code === saved) || active[0];
        if (def) setSelected(def.code);
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'done');
      onClose?.();
    }, 280);
  };

  const handleCountryNext = () => {
    if (selected) {
      localStorage.setItem(COUNTRY_KEY, selected);
      setStep(2);
    }
  };

  const handleRegister = () => {
    localStorage.setItem(STORAGE_KEY, 'done');
    navigate('/sign-up', { state: { country_code: selected } });
    onClose?.();
  };

  const handleSkip = () => dismiss();

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-280 ${closing ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className={`relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transition-transform duration-280 ${closing ? 'scale-95' : 'scale-100'}`}
      >
        {/* Barre de progression */}
        <div className="flex gap-1.5 p-5 pb-0">
          {[1, 2].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>

        {/* Bouton fermer */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-lg"
        >
          ✕
        </button>

        {/* ─── ÉTAPE 1 : Sélection du pays ─── */}
        {step === 1 && (
          <div className="p-6 pt-4">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🌍</div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Bienvenue sur FunQuiz !</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Tu es de quel pays ?</p>
            </div>

            {countries.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1 mb-5">
                {countries.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setSelected(c.code)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                      selected === c.code
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    {c.flag_url ? (
                      <img src={c.flag_url} alt={c.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <span
                        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: c.color || '#6366f1' }}
                      >
                        {c.code}
                      </span>
                    )}
                    <span className={`text-sm font-semibold truncate ${selected === c.code ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleCountryNext}
              disabled={!selected}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ─── ÉTAPE 2 : CTA Inscription ─── */}
        {step === 2 && (
          <div className="p-6 pt-4">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Rejoins la compétition !</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Des milliers de joueurs t'attendent</p>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                { icon: '🎮', title: 'Quiz illimités', desc: 'Accède à tous les thèmes et sous-thèmes' },
                { icon: '⭐', title: 'Gagne des points', desc: 'Monte dans le classement général' },
                { icon: '🎖️', title: 'Débloque des succès', desc: "Récompenses exclusives pour les meilleurs" },
              ].map(({ icon, title, desc }) => (
                <li key={title} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white text-sm">{title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={handleRegister}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none mb-3"
            >
              S'inscrire gratuitement
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Continuer sans compte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export { STORAGE_KEY, COUNTRY_KEY };
