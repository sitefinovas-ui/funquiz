import './Contact.css';
import { useEffect, useState } from 'react';
import messageServices from '../../configurations/Services/messageServices.js';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    firstname: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState({ success: null, message: '' });
  const maxWords = 50;

  useEffect(() => {
    document.title = 'FUNQUIZ | Contacts';
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'message') {
      const words = value.trim().split(/\s+/);
      if (words[0] === '') {
        setFormData((prev) => ({ ...prev, message: '' }));
        return;
      }
      if (words.length <= maxWords) {
        setFormData((prev) => ({ ...prev, message: value }));
      } else {
        setFormData((prev) => ({ ...prev, message: words.slice(0, maxWords).join(' ') }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, message: '' });

    // Validation simple
    if (
      !formData.name ||
      !formData.firstname ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setStatus({ success: false, message: 'Tous les champs sont requis.' });
      return;
    }

    try {
      await messageServices.createMessage({
        name: `${formData.firstname} ${formData.name}`,
        email: formData.email,
        subject: formData.subject,
        content: formData.message,
        priority: 'normal',
        status: 'unread',
      });

      setStatus({ success: true, message: 'Message envoyé avec succès ! 🚀' });

      // Reset formulaire
      setFormData({
        name: '',
        firstname: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setStatus({ success: false, message: "Erreur lors de l'envoi du message." });
      console.error(error);
    }
  };

  const wordCount =
    formData.message.trim() === '' ? 0 : formData.message.trim().split(/\s+/).length;
  const wordsLeft = maxWords - wordCount;

  return (
    <div className="contact-custom text-light vw-100 gap-3 d-flex flex-column">
      {/* === HEADER CONTACT === */}
      <div className="header-contact-cus d-flex flex-column justify-content-center align-items-center text-center">
        <h1 className="fs-custom-contact">Contact</h1>
        <p className="subtitle-contact">
          Un souci, une idée ou juste envie de papoter ? On est là !
        </p>
      </div>

      {/* === FORMULAIRE === */}
      <div className="container d-flex flex-lg-row flex-column justify-content-center align-items-center w-100">
        <form
          className="contact-form overflow-hidden w-100 p-5 rounded-5 shadow-lg d-flex flex-column gap-4"
          onSubmit={handleSubmit}
        >
          {/* Header du formulaire */}
          <div className="text-start d-none d-lg-block mb-3">
            <span className="text-primary fw-bold">FunQuiz</span>
            <h3 className="fs-2 fw-bolder text-light">Contactez-nous</h3>
            <p className="text-muted-custom">
              Des questions ou suggestions sur le quiz ? Écris-nous !
            </p>
          </div>

          {/* Nom et prénom */}
          <div className="d-flex gap-4 flex-column flex-md-row">
            <div className="flex-fill">
              <label htmlFor="name" className="form-label fw-semibold">
                Nom
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control border-primary rounded-4"
                placeholder="Ex: Dupont"
                required
              />
            </div>
            <div className="flex-fill">
              <label htmlFor="firstname" className="form-label fw-semibold">
                Prénom(s)
              </label>
              <input
                type="text"
                id="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="form-control border-primary rounded-4"
                placeholder="Ex: Julien"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label fw-semibold">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control border-primary rounded-4"
              placeholder="exemple@mail.com"
              required
            />
          </div>

          {/* Objet */}
          <div>
            <label htmlFor="subject" className="form-label fw-semibold">
              Objet
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="form-control border-primary rounded-4"
              placeholder="Sujet du message"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="form-label fw-semibold">
              Message
            </label>
            <div>
              <textarea
                id="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="form-control border-primary rounded-4"
                placeholder="Écris ton message ici..."
                required
              ></textarea>
              <small className={`d-block mt-1 ${wordsLeft === 0 ? 'text-danger' : 'text-muted'}`}>
                {wordsLeft} mot{wordsLeft !== 1 ? 's' : ''} restant{wordsLeft !== 1 ? 's' : ''}
              </small>
            </div>
          </div>

          {/* Message statut */}
          {status.message && (
            <p className={`fw-semibold ${status.success ? 'text-success' : 'text-danger'}`}>
              {status.message}
            </p>
          )}

          {/* Bouton */}
          <button type="submit" className="btn-contact rounded-pill fw-bold px-5 py-2">
            🚀 Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
