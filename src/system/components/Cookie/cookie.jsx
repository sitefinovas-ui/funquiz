import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  // Fonction pour lire un cookie
  const getCookie = (name) => {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length, c.length);
      }
    }
    return "";
  };

  useEffect(() => {
    const cookie = getCookie("cookieConsent");
    if (!cookie) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      id="lawmsg"
      className="alert alert-info alert-dismissible h6 fade show fixed-bottom m-0"
      role="alert"
    >
      
      &nbsp; Nous utilisons des cookies sur ce site pour vous distinguer des autres utilisateurs.
      &nbsp; Nous utilisons ces données pour améliorer votre expérience et pour la publicité ciblée.
      &nbsp; En continuant à utiliser ce site, vous consentez à notre utilisation des cookies.
      &nbsp; Pour plus d'informations, veuillez consulter notre&nbsp;
      <a href="https://info.profilesonly.com" target="_blank" rel="noreferrer">
        Politique de Cookies
      </a>
      .
      <button
        className="btn btn-close btn-sm ms-3"
        type="button"
        onClick={handleClose}
      >
        
      </button>
    </div>
  );
}
