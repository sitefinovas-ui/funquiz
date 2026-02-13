import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-BVLJ3MHEX3';

const CONSENT_DURATION_DAYS = 10;

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Lire un cookie
  const getCookie = (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  };

  // Écrire un cookie
  const setCookie = (name, value, days = 365) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  };

  // Calculer si le consentement a expiré
  const isConsentExpired = () => {
    const dateStr = getCookie('cookieConsentDate');
    if (!dateStr) return true;

    const consentDate = new Date(dateStr);
    const now = new Date();
    const diffInDays = (now - consentDate) / (1000 * 60 * 60 * 24);
    return diffInDays >= CONSENT_DURATION_DAYS;
  };

  // Charger GA dynamiquement après consentement
  const shouldBlockAnalytics = () => {
    if (import.meta.env.PROD) return false;
    if (typeof window === 'undefined') return true;
    const host = window.location.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
    if (host.startsWith('192.168.') || host.startsWith('10.')) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
    return false;
  };

  const loadGoogleAnalytics = () => {
    if (shouldBlockAnalytics()) return;
    if (window.gtag) return;

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

  // Vérifier consentement + expiration
  useEffect(() => {
    const consent = getCookie('cookieConsent');

    if (consent === 'true' && !isConsentExpired()) {
      loadGoogleAnalytics();
    } else if (consent === 'false' && !isConsentExpired()) {
      setShowBanner(false); // Refus encore valable
    } else {
      setShowBanner(true); // Pas de consentement OU expiré
    }
  }, []);

  // L'utilisateur accepte
  const handleAccept = () => {
    const now = new Date().toISOString();
    setCookie('cookieConsent', 'true', CONSENT_DURATION_DAYS);
    setCookie('cookieConsentDate', now, CONSENT_DURATION_DAYS);
    setShowBanner(false);
    loadGoogleAnalytics();
  };

  // L'utilisateur refuse
  const handleDecline = () => {
    const now = new Date().toISOString();
    setCookie('cookieConsent', 'false', CONSENT_DURATION_DAYS);
    setCookie('cookieConsentDate', now, CONSENT_DURATION_DAYS);
    setShowBanner(false);
  };

  // Ne rien afficher si la bannière ne doit pas être visible
  if (!showBanner || isDashboard) return null;

  return (
    <div
      className="alert alert-info alert-dismissible h6 fade show fixed-bottom m-0 text-center"
      role="alert"
      style={{ zIndex: 9999 }}
    >
      Ce site utilise des cookies pour améliorer votre expérience. Les cookies analytiques sont
      utilisés uniquement avec votre consentement.{' '}
      <a href="/politique-de-cookies" target="_blank" rel="noreferrer">
        En savoir plus
      </a>
      <div className="mt-2">
        <button className="btn btn-primary btn-sm me-2" onClick={handleAccept}>
          Accepter
        </button>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleDecline}>
          Refuser
        </button>
      </div>
    </div>
  );
}
