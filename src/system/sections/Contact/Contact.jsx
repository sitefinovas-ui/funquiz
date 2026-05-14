import './Contact.css';
import { useEffect, useState } from 'react';
import messageServices from '../../configurations/Services/messageServices.js';

const INFO_ITEMS = [
  { label: 'Canal principal',   value: 'support@funquiz.fr' },
  { label: 'Délai de réponse', value: 'Sous 24h en moyenne' },
  { label: 'Disponibilité',    value: 'Lun – Ven · 9h à 18h' },
  { label: 'Confidentialité',  value: 'Données chiffrées bout en bout' },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', firstname: '', email: '', subject: '', message: '' });
  const [status,   setStatus]   = useState({ success: null, message: '' });
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const maxWords = 50;

  useEffect(() => { document.title = 'FUNQUIZ | Contact'; }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'message') {
      const words = value.trim().split(/\s+/);
      if (words[0] === '') { setFormData(p => ({ ...p, message: '' })); return; }
      setFormData(p => ({ ...p, message: words.length <= maxWords ? value : words.slice(0, maxWords).join(' ') }));
    } else {
      setFormData(p => ({ ...p, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setStatus({ success: null, message: '' });
    if (!formData.name || !formData.firstname || !formData.email || !formData.subject || !formData.message) {
      setStatus({ success: false, message: 'Tous les champs sont requis.' });
      return;
    }
    setSending(true);
    try {
      await messageServices.createMessage({
        name: `${formData.firstname} ${formData.name}`,
        email: formData.email, subject: formData.subject,
        content: formData.message, priority: 'normal', status: 'unread',
      });
      setSent(true);
      setStatus({ success: true, message: 'Message envoyé. Nous vous répondons sous 24h.' });
      setFormData({ name: '', firstname: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    } catch {
      setStatus({ success: false, message: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setSending(false);
    }
  };

  const wordCount = formData.message.trim() === '' ? 0 : formData.message.trim().split(/\s+/).length;
  const wordsLeft = maxWords - wordCount;

  return (
    <div className="ct-page">

      {/* ── HERO ── */}
      <div className="ct-hero">
        <video
          className="ct-hero-video"
          src="/contact-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="ct-hero-overlay" />
        <div className="ct-hero-content">
          <p className="ct-hero-eyebrow">Support</p>
          <h1 className="ct-hero-title">Comment pouvons-nous vous aider ?</h1>
          <p className="ct-hero-sub">
            Notre équipe lit chaque message et vous répond en moins de 24h,
            du lundi au vendredi.
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ct-body">

        {/* Left — info */}
        <div className="ct-info-list">
          {INFO_ITEMS.map((item, i) => (
            <div key={item.label} className="ct-info-item" style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="ct-info-label">{item.label}</span>
              <span className="ct-info-value">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Right — form */}
        <div className="ct-form-card">
          <h2 className="ct-form-card-title">Envoyer un message</h2>
          <p className="ct-form-card-sub">Remplissez tous les champs pour nous contacter.</p>

          <form className="ct-form" onSubmit={handleSubmit}>
            <div className="ct-row">
              <div className="ct-field">
                <label htmlFor="name" className="ct-label">Nom</label>
                <input type="text" id="name" className="ct-input"
                  value={formData.name} onChange={handleChange} placeholder="Dupont" required />
              </div>
              <div className="ct-field">
                <label htmlFor="firstname" className="ct-label">Prénom</label>
                <input type="text" id="firstname" className="ct-input"
                  value={formData.firstname} onChange={handleChange} placeholder="Julien" required />
              </div>
            </div>

            <div className="ct-field">
              <label htmlFor="email" className="ct-label">Adresse email</label>
              <input type="email" id="email" className="ct-input"
                value={formData.email} onChange={handleChange} placeholder="exemple@mail.com" required />
            </div>

            <div className="ct-field">
              <label htmlFor="subject" className="ct-label">Sujet</label>
              <input type="text" id="subject" className="ct-input"
                value={formData.subject} onChange={handleChange} placeholder="Objet de votre message" required />
            </div>

            <div className="ct-field">
              <label htmlFor="message" className="ct-label">Message</label>
              <textarea id="message" rows={5} className="ct-textarea"
                value={formData.message} onChange={handleChange}
                placeholder="Décrivez votre demande…" required />
              <small className={`ct-word-count ${wordsLeft === 0 ? 'limit' : ''}`}>
                {wordCount} / {maxWords} mots
              </small>
            </div>

            {status.message && (
              <p className={`ct-status-msg ${status.success ? 'success' : 'error'}`}>
                {status.message}
              </p>
            )}

            <button
              type="submit"
              className={`ct-submit${sent ? ' sent' : ''}`}
              disabled={sending}
            >
              {sent ? 'Envoyé' : sending ? 'Envoi en cours…' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
