import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-BVLJ3MHEX3';
const CONSENT_DURATION_DAYS = 10;

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  // =========================
  // Helpers
  // =========================

  const getCookie = (name) => {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }

      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }

    return null;
  };

  const setCookie = (name, value, days = 365) => {
    const expires = new Date(
      Date.now() + days * 864e5
    ).toUTCString();

    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  // =========================
  // Consent Logic
  // =========================

  const isConsentExpired = () => {
    const dateStr = getCookie('cookieConsentDate');

    if (!dateStr) return true;

    const diffInDays =
      (new Date() - new Date(dateStr)) /
      (1000 * 60 * 60 * 24);

    return diffInDays >= CONSENT_DURATION_DAYS;
  };

  const shouldBlockAnalytics = () => {
    if (import.meta.env.PROD) return false;

    if (typeof window === 'undefined') return true;

    const host = window.location.hostname || '';

    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    );
  };

  const loadGoogleAnalytics = () => {
    if (shouldBlockAnalytics() || window.gtag) return;

    const script = document.createElement('script');

    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;

    document.head.appendChild(script);

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];

      function gtag() {
        window.dataLayer.push(arguments);
      }

      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
    };
  };

  // =========================
  // Initial Check
  // =========================

  useEffect(() => {
    const consent = getCookie('cookieConsent');

    if (consent === 'true' && !isConsentExpired()) {
      loadGoogleAnalytics();
    } else if (
      consent === 'false' &&
      !isConsentExpired()
    ) {
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  // =========================
  // Actions
  // =========================

  const handleAccept = () => {
    const now = new Date().toISOString();

    setCookie(
      'cookieConsent',
      'true',
      CONSENT_DURATION_DAYS
    );

    setCookie(
      'cookieConsentDate',
      now,
      CONSENT_DURATION_DAYS
    );

    setShowBanner(false);

    loadGoogleAnalytics();
  };

  const handleDecline = () => {
    const now = new Date().toISOString();

    setCookie(
      'cookieConsent',
      'false',
      CONSENT_DURATION_DAYS
    );

    setCookie(
      'cookieConsentDate',
      now,
      CONSENT_DURATION_DAYS
    );

    setShowBanner(false);
  };

  // =========================
  // Hide
  // =========================

  if (!showBanner || isDashboard) return null;

  // =========================
  // UI
  // =========================

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        className="
          relative w-full max-w-[820px]
          overflow-hidden rounded-[34px]
          border border-white/20
          bg-white/80
          shadow-[0_30px_80px_rgba(0,0,0,0.12)]
          backdrop-blur-[40px]
        "
      >
        {/* Reflets style Apple */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.35),transparent_30%)]
            pointer-events-none
          "
        />

        {/* contour lumineux */}
        <div
          className="
            absolute inset-0 rounded-[34px]
            ring-1 ring-inset ring-white/40
            pointer-events-none
          "
        />

        <div className="relative flex flex-col gap-6 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
          {/* LEFT */}
          <div className="flex items-start gap-4">
            {/* icône */}
            <div
              className="
                flex h-12 w-12 shrink-0 items-center justify-center
                rounded-2xl
                bg-white/70
                shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                backdrop-blur-xl
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-neutral-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4 9 5.567 9 7.5 10.343 11 12 11Zm0 0v2m-6 2a6 6 0 1112 0v1H6v-1Z"
                />
              </svg>
            </div>

            {/* texte */}
            <div>
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900">
                Respect de votre confidentialité
              </h3>

              <p className="mt-1 text-[14px] leading-relaxed text-neutral-600">
                Nous utilisons des cookies pour améliorer votre
                expérience, analyser le trafic et optimiser les
                performances du site.
              </p>

              <a
                href="/terms#privacy"
                target="_blank"
                rel="noreferrer"
                className="
                  mt-3 inline-flex items-center
                  text-[13px] font-medium
                  text-blue-600
                  transition-all duration-200
                  hover:text-blue-700
                "
              >
                En savoir plus
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 pl-16 sm:pl-0">
            <button
              onClick={handleDecline}
              className="
                rounded-full
                border border-black/5
                bg-white/60
                px-5 py-2.5
                text-[14px] font-medium
                text-neutral-700
                shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                backdrop-blur-xl
                transition-all duration-200
                hover:bg-white
                active:scale-[0.98]
              "
            >
              Refuser
            </button>

            <button
              onClick={handleAccept}
              className="
                rounded-full
                bg-[#0071E3]
                px-5 py-2.5
                text-[14px] font-medium
                text-white
                shadow-[0_10px_25px_rgba(0,113,227,0.28)]
                transition-all duration-200
                hover:brightness-110
                active:scale-[0.98]
              "
            >
              Autoriser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}