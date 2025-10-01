import { useState, useEffect } from "react";
import "./terms.css";

const contentData = [
  {
    id: "intro",
    title: "Introduction",
    icon: "📋",
    color: "#3b82f6",
    content: [
      "Bienvenue sur notre plateforme. Ces conditions d'utilisation régissent votre accès et votre utilisation de nos services. En acceptant ces termes, vous vous engagez à respecter toutes les dispositions énoncées ci-dessous.",
      "Notre mission est de fournir un service de qualité tout en respectant vos droits et votre vie privée. Ces conditions ont été conçues pour être transparentes et équitables pour tous nos utilisateurs.",
      "Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet immédiatement après leur publication sur cette page. Il est de votre responsabilité de consulter régulièrement ces conditions.",
    ],
  },
  {
    id: "responsabilites",
    title: "Responsabilités",
    icon: "⚖️",
    color: "#10b981",
    content: [
      "En tant qu'utilisateur, vous devez utiliser notre service de manière responsable et légale. Cela inclut le respect des droits d'autrui et l'utilisation appropriée des fonctionnalités proposées.",
      "Nous nous engageons à maintenir la qualité et la disponibilité du service dans la mesure du possible. Cependant, nous ne pouvons garantir un fonctionnement ininterrompu et nous réservons le droit d'effectuer des maintenances programmées.",
      "Vous êtes entièrement responsable de la sécurité de votre compte et de vos informations d'accès. Nous vous recommandons fortement d'utiliser des mots de passe sécurisés et de ne jamais partager vos identifiants.",
    ],
  },
  {
    id: "limitations",
    title: "Limitations",
    icon: "⚠️",
    color: "#f59e0b",
    content: [
      "Notre service est fourni 'en l'état' sans aucune garantie expresse ou implicite. Nous déclinons toute responsabilité pour les dommages directs ou indirects résultant de l'utilisation de notre plateforme.",
      "L'utilisation du service est strictement limitée à des fins légales et éthiques. Toute utilisation abusive, frauduleuse ou contraire à nos conditions peut entraîner la suspension immédiate ou la résiliation de votre compte.",
      "Nous nous réservons le droit de limiter, suspendre ou résilier l'accès à notre service à notre seule discrétion, notamment en cas de violation de ces conditions d'utilisation.",
    ],
  },
  {
    id: "donnees",
    title: "Protection des données",
    icon: "🔒",
    color: "#8b5cf6",
    content: [
      "Nous collectons et traitons vos données personnelles conformément à notre politique de confidentialité et aux réglementations en vigueur, notamment le RGPD.",
      "Vos données ne seront jamais vendues à des tiers. Elles sont uniquement utilisées pour améliorer votre expérience utilisateur et assurer le bon fonctionnement de nos services.",
      "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez notre équipe support.",
    ],
  },
  {
    id: "cookies",
    title: "Politique des cookies",
    icon: "🍪",
    color: "#ec4899",
    content: [
      "Notre site utilise des cookies pour améliorer votre expérience de navigation. Ces petits fichiers nous permettent de mémoriser vos préférences et d'analyser l'utilisation de notre site.",
      "Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur. Cependant, la désactivation de certains cookies peut affecter le bon fonctionnement du site.",
      "Nous utilisons également des cookies analytiques pour comprendre comment nos utilisateurs interagissent avec notre plateforme et améliorer nos services en conséquence.",
    ],
  },
  {
    id: "contact",
    title: "Contact et support",
    icon: "📞",
    color: "#06b6d4",
    content: [
      "Pour toute question concernant ces conditions d'utilisation, n'hésitez pas à contacter notre équipe support qui se fera un plaisir de vous aider.",
      "Nous nous engageons à répondre à toutes vos demandes dans les plus brefs délais et à vous fournir l'assistance nécessaire pour une utilisation optimale de nos services.",
      "En cas de litige, nous privilégions toujours la résolution amiable. Un processus de médiation est disponible avant tout recours juridique.",
    ],
  },
];

const Terms = () => {
  // Navigation sticky : active section
  const [activeSection, setActiveSection] = useState("intro");
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      let current = "intro";
      const offset = window.innerWidth < 900 ? 80 : 120;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom >= offset) {
          current = section.id;
        }
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - (window.innerWidth < 900 ? 60 : 100);
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="terms-app">
      {/* HERO HEADER */}
      <div className="terms-hero bg-danger">
        <div className="w-100 h-100 params">
           <h1>Conditions d&apos;Utilisation</h1>
           <p>Découvrez nos engagements et vos droits en toute transparence</p>
        </div>
      </div>
      <div className="terms-layout">
        {/* NAVIGATION STICKY */}
        <nav className="terms-nav" aria-label="Navigation sections">
          {contentData.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={
                "terms-nav-item" + (activeSection === section.id ? " active" : "")
              }
              title={section.title}
              aria-label={section.title}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') scrollToSection(section.id); }}
            >
              <span aria-hidden="true">{section.icon}</span> <span style={{marginLeft:8}}>{section.title}</span>
            </button>
          ))}
        </nav>
        {/* CONTENT */}
        <div className="terms-content">
          {contentData.map((section) => {
            const { id, icon, title, content } = section;
            return (
              <section key={id} id={id} className="terms-section">
                <div className="terms-section-header">
                  <span className="terms-section-icon" aria-hidden="true">{icon}</span>
                  <h2 className="terms-section-title">{title}</h2>
                </div>
                <div className="terms-section-content">
                  {content.map((paragraph, index) => (
                    <p key={`${id}-paragraph-${index}`} className="terms-paragraph">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
          <footer className="terms-footer">
            <div>
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <a
              href="mailto:support@funquiz.ci"
              className="terms-contact-button"
              aria-label="Contacter le support FunQuiz"
            >
              Nous contacter
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Terms;