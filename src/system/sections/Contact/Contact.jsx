import './contact.css';
import { useEffect } from 'react';

export default function Contact() {
  useEffect(() => {
    document.title = "FUNQUIZ | Contacts";
  }, []);
  return (
    <div className="contact-custom text-light vw-100 gap-3 d-flex flex-column">
      
      {/* === HEADER CONTACT === */}
      <div className="header-contact-cus d-flex flex-column justify-content-center align-items-center text-center">
        <h1 className="fs-custom-contact">Contact</h1>
        <p className="subtitle-contact">Un souci, une idée ou juste envie de papoter ? On est là !</p>
      </div>

      {/* === FORMULAIRE === */}
      <div className="container d-flex flex-lg-row flex-column justify-content-center align-items-center w-100">
        <form className="contact-form overflow-hidden w-100  p-5 rounded-5 shadow-lg d-flex flex-column gap-4">
          
          {/* Header du formulaire */}
          <div className="text-start d-none d-lg-block mb-3">
            <span className="text-primary fw-bold">Contact Quiz</span>
            <h3 className="fs-2 fw-bolder text-light">Get in touch</h3>
            <p className="text-muted-custom">
              Des questions ou suggestions sur le quiz ? Écris-nous !
            </p>
          </div>

          {/* Nom et prénom */}
          <div className="d-flex gap-4 flex-column flex-md-row">
            <div className="flex-fill">
              <label htmlFor="name" className="form-label fw-semibold">Nom</label>
              <input
                type="text"
                id="name"
                className="form-control border-primary rounded-4"
                placeholder="Ex: Dupont"
              />
            </div>
            <div className="flex-fill">
              <label htmlFor="firstname" className="form-label fw-semibold">Prénom(s)</label>
              <input
                type="text"
                id="firstname"
                className="form-control border-primary rounded-4"
                placeholder="Ex: Julien"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label fw-semibold">Email</label>
            <input
              type="email"
              id="email"
              className="form-control border-primary rounded-4"
              placeholder="exemple@mail.com"
            />
          </div>

          {/* Objet */}
          <div>
            <label htmlFor="subject" className="form-label fw-semibold">Objet</label>
            <input
              type="text"
              id="subject"
              className="form-control border-primary rounded-4"
              placeholder="Sujet du message"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="form-label fw-semibold">Message</label>
            <textarea
              id="message"
              rows="4"
              className="form-control border-primary rounded-4"
              placeholder="Écris ton message ici..."
            ></textarea>
          </div>

          {/* Bouton */}
          <button type="submit" className="btn-contact rounded-pill fw-bold px-5 py-2">
            🚀 Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
