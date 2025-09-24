import { useState, useEffect } from "react";

const Terms = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("intro");

  // ✅ Tableau d'objets à la place d'un objet
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

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));

      // Détecter la section active
      const sections = document.querySelectorAll("section[id]");
      let current = "intro";
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
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
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const styles = {
    app: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      lineHeight: "1.6",
      color: "#1f2937",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e8eaf6 100%)",
      minHeight: "100vh",
    },
    progressBar: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "4px",
      background: "rgba(229, 231, 235, 0.8)",
      zIndex: 1000,
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
      transition: "width 0.3s ease",
      borderRadius: "0 2px 2px 0",
    },
    nav: {
      position: "fixed",
      right: "2rem",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 100,
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      borderRadius: "12px",
      padding: "1rem 0.5rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(229, 231, 235, 0.5)",
    },
    navItem: {
      display: "block",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      margin: "8px 0",
      background: "rgba(156, 163, 175, 0.5)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      border: "none",
    },
    navItemActive: {
      background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
      transform: "scale(1.5)",
      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
    },
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem 1rem",
      position: "relative",
    },
    header: {
      textAlign: "center",
      marginBottom: "4rem",
      padding: "3rem 0",
    },
    mainTitle: {
      fontSize: "3.5rem",
      fontWeight: "700",
      background: "linear-gradient(135deg, #1f2937 0%, #3b82f6 50%, #8b5cf6 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "1rem",
      lineHeight: "1.1",
    },
    subtitle: {
      fontSize: "1.25rem",
      color: "#6b7280",
      maxWidth: "600px",
      margin: "0 auto",
    },
    section: {
      marginBottom: "4rem",
      scrollMarginTop: "2rem",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "2rem",
      gap: "1rem",
    },
    sectionIcon: {
      fontSize: "2.5rem",
      padding: "1rem",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      background: "white",
      border: "1px solid rgba(229, 231, 235, 0.5)",
    },
    sectionTitle: {
      fontSize: "2rem",
      fontWeight: "600",
      color: "#1f2937",
      margin: 0,
    },
    sectionContent: {
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
      padding: "2.5rem",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(229, 231, 235, 0.5)",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    },
    paragraph: {
      fontSize: "1.1rem",
      lineHeight: "1.8",
      marginBottom: "1.5rem",
      color: "#374151",
      textAlign: "justify",
    },
    footer: {
      textAlign: "center",
      padding: "3rem 0",
      marginTop: "4rem",
      borderTop: "1px solid rgba(229, 231, 235, 0.5)",
      background: "rgba(255, 255, 255, 0.5)",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
    },
    footerText: {
      color: "#6b7280",
      fontSize: "1rem",
      marginBottom: "1rem",
    },
    contactButton: {
      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
      color: "white",
      border: "none",
      padding: "12px 32px",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
    },
  };

  return (
    <div style={styles.app}>
      {/* Progress bar */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${scrollProgress}%` }}></div>
      </div>

      {/* Navigation fixe */}
      <nav style={styles.nav}>
        {contentData.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            style={{
              ...styles.navItem,
              ...(activeSection === section.id ? styles.navItemActive : {}),
            }}
            title={section.title}
          />
        ))}
      </nav>

      <main style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.mainTitle}>Conditions d'Utilisation</h1>
          <p style={styles.subtitle}>
            Découvrez nos engagements et vos droits en toute transparence
          </p>
        </header>

        {/* ✅ Mapping direct sur un tableau */}
        {contentData.map((section) => {
          const { id, icon, title, content, color } = section;
          return (
            <section key={id} id={id} style={styles.section}>
              <div style={styles.sectionHeader}>
                <span 
                  style={{
                    ...styles.sectionIcon,
                    background: `linear-gradient(135deg, ${color}, ${color}88)`,
                  }}
                >
                  {icon}
                </span>
                <h2 style={styles.sectionTitle}>{title}</h2>
              </div>
              <div 
                style={styles.sectionContent}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 30px 60px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* Décoration de couleur */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "4px",
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                  }}
                />
                
                {content.map((paragraph, index) => (
                  <p key={`${id}-paragraph-${index}`} style={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          );
        })}

        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <button 
            style={styles.contactButton}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px) scale(1.05)";
              e.target.style.boxShadow = "0 15px 35px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 10px 25px rgba(59, 130, 246, 0.3)";
            }}
          >
            Nous contacter
          </button>
        </footer>
      </main>
    </div>
  );
};

export default Terms;