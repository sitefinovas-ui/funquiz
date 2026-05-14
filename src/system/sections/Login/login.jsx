import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../configurations/Context/useAuth';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, loginWithGoogle, loading } = useAuth();

  useEffect(() => {
    document.title = 'FUNQUIZ | Se connecter';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Erreur lors de la connexion'
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const googleToken = credentialResponse.credential;
      if (!googleToken) throw new Error('Token Google manquant');
      await loginWithGoogle(googleToken);
      navigate('/');
    } catch (err) {
      setError('Erreur Google : ' + err.message);
    }
  };

  const handleGoogleError = () => {
    setError('Erreur de connexion Google');
  };

  return (
    <div className="min-h-screen relative flex bg-[#f5f5f7]">

      {/* ── Form panel — identique desktop, centré mobile ── */}
      <div className="
        flex flex-1
        absolute z-10
        top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        items-center justify-center
        px-6
        w-full lg:w-auto
      ">
        <div className="w-full max-w-md">

          <h1 className="text-3xl text-center animate-[fadeInUp_0.5s_ease-in-out] font-semibold text-white">
            Bon retour
          </h1>

          <p className="mt-2 text-sm text-center text-white/50">
            Connectez-vous à votre compte FunQuiz
          </p>

          <div className="flex mt-8 justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="pill"
              width="320"
            />
          </div>

          <div className="my-4 text-center text-xs text-gray-400">
            ou
          </div>

          <button
            type="button"
            onClick={() => setShowManual(!showManual)}
            className="
              w-full py-3 rounded-xl
              bg-black text-white
              hover:bg-gray-800
              transition
              relative z-10
            "
            style={{ display: showManual ? 'none' : 'block' }}
          >
            Continuer manuellement
          </button>

          <div
            className="rounded-2xl shadow-sm"
            style={{ display: showManual ? 'block' : 'none' }}
          >
            {error && (
              <div className="mt-3 text-sm text-red-500">{error}</div>
            )}

            <div
              className="overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out"
              style={{
                maxHeight: showManual ? '420px' : '0px',
                opacity: showManual ? 1 : 0,
              }}
            >
              <div className="pt-4 space-y-3">

                <input
                  type="email"
                  placeholder="Adresse email"
                  className="
                    w-full px-4 py-3
                    text-sm text-black
                    rounded-xl
                    border border-gray-200
                    focus:outline-none focus:ring-2 focus:ring-gray-300
                  "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    className="
                      w-full px-4 py-3
                      rounded-xl
                      border border-gray-200
                      focus:outline-none focus:ring-2 focus:ring-gray-300
                      text-sm text-black
                    "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <button
                  type="submit"
                  onClick={handleLogin}
                  disabled={loading}
                  className="
                    w-full py-3
                    rounded-xl
                    bg-black text-white
                    hover:bg-gray-800
                    transition
                  "
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>

              </div>
            </div>
          </div>

          <div
            className="flex justify-between mt-10 text-sm text-gray-500"
            style={{ display: showManual ? 'flex' : 'none' }}
          >
            <Link to="/reset" className="hover:text-black text-white">
              Mot de passe oublié
            </Link>
            <Link to="/sign-up" className="hover:text-black text-white">
              Créer un compte
            </Link>
          </div>

          <div
            className="mt-8"
            style={{ display: showManual ? 'none' : 'block' }}
          >
            <button
              onClick={() => navigate(-1)}
              className="w-full gap-2 flex items-center justify-center py-3 rounded-xl text-[12px] text-white hover:animate-pulse transition"
            >
              <FaArrowLeft /> Retour
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile background — uniquement sous lg ── */}
      <div className="absolute inset-0 lg:hidden">
        <img
          src="/play.webp"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[6px]" />
      </div>

      {/* ── RIGHT desktop — identique, inchangé ── */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative w-screen h-screen bg-[#fafafa] overflow-hidden">
        <img
          src="/play.webp"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[08px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      </div>

    </div>
  );
};

export default Login;