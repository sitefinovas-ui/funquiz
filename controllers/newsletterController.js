import {
  getAllNewsletter,
  getNewsletterById,
  createNewsletter,
  deleteNewsletter,
  findNewsletterByEmail,
  updateNewsletterStatus,
  searchNewsletters,
} from "../models/newsletterModel.js";
import {
  mailNewsletterSubscription,
  mailNewsletterUnsubscription,
  mailMessageReply,
} from "../utils/mail.js";
import { createMessage } from "../models/messageModel.js";

// Récupérer toutes les newsletters
export const allNewsletters = async (req, res) => {
  try {
    const newsletters = await getAllNewsletter();
    console.log('Newsletters récupérées:', newsletters);
    res.status(200).json(newsletters);
  } catch (error) {
    console.error('Erreur dans allNewsletters:', error);
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la récupération des newsletters.",
        error: error.message
      });
  }
};

// Rechercher des newsletters avec filtres
export const searchNewsletterWithFilters = async (req, res) => {
  console.log('\n🔍 [Controller] Début de searchNewsletterWithFilters');
  console.log('📥 [Controller] Query params reçus:', req.query);

  try {
    // 🧩 Extraction et normalisation des filtres
    const { search, confirmed, startDate, endDate } = req.query;

    const filters = {
      search: search || '',
      confirmed: confirmed !== undefined && confirmed !== '' ? Number(confirmed) : null,
      startDate: startDate || null,
      endDate: endDate || null
    };

    console.log('🔄 [Controller] Filtres traités:', filters);
    console.log('⏳ [Controller] Appel du modèle searchNewsletters...');

    // 🔍 Appel au modèle
    const results = await searchNewsletters(filters);

    console.log('✅ [Controller] Résultats obtenus:', {
      count: results?.length || results?.results?.length || 0,
      sample: (results?.results || results)?.slice(0, 2)
    });

    // ✅ Réponse finale
    return res.status(200).json({
      success: true,
      count: results?.length || results?.results?.length || 0,
      results: results?.results || results
    });

  } catch (error) {
    console.error('❌ [Controller] Erreur:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });

    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la recherche des newsletters.",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// Récupérer une newsletter par ID
export const newsletterById = async (req, res) => {
  const { id } = req.params;
  try {
    const newsletter = await getNewsletterById(id);
    if (newsletter.length === 0) {
      return res.status(404).json({ message: "Newsletter non trouvée." });
    }
    res.status(200).json(newsletter);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la récupération de la newsletter.",
      });
  }
};

// Créer un nouvel abonnement
export const addNewsletter = async (req, res) => {
  const { email, user_id } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Le champ email est requis." });
  }
  try {
    const existing = await findNewsletterByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Cet email est déjà abonné." });
    }

    const newNewsletter = await createNewsletter({ email, user_id });

    try {
      await mailNewsletterSubscription(email);
    } catch (mailErr) {
      console.error("mailNewsletterSubscription failed:", mailErr);
    }

    return res.status(201).json(newNewsletter);
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY" || /duplicate entry/i.test(error?.message || "")) {
      return res.status(409).json({ message: "Cet email est déjà abonné." });
    }
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de l'abonnement." });
  }
};

// Supprimer une newsletter
export const removeNewsletter = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!id || isNaN(id)) {
    console.error("❌ [Controller] ID invalide:", req.params.id);
    return res.status(400).json({ 
      error: "ID de newsletter invalide",
      details: "L'ID doit être un nombre entier valide"
    });
  }

  try {
    console.log('🗑️ [Controller] Tentative de suppression newsletter:', id);
    const deleted = await deleteNewsletter(id);
    
    if (deleted) {
      console.log('✅ [Controller] Newsletter supprimée:', id);
      res.status(200).json({ 
        success: true,
        message: "Newsletter supprimée avec succès" 
      });
    } else {
      console.log('⚠️ [Controller] Newsletter non trouvée:', id);
      res.status(404).json({ 
        success: false,
        error: "Newsletter non trouvée" 
      });
    }
  } catch (error) {
    console.error("❌ [Controller] Erreur suppression newsletter:", id, error);
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de la suppression de la newsletter",
      details: error.message
    });
  }
};


// Envoyer une newsletter à tous les abonnés et stocker en base
// Mise à jour du statut confirmed
export const updateConfirmedStatus = async (req, res) => {
  const { id } = req.params;
  const { confirmed } = req.body;
  
  if (confirmed === undefined || ![0, 1].includes(confirmed)) {
    return res.status(400).json({ message: "Le statut confirmed doit être 0 ou 1" });
  }

  try {
    const success = await updateNewsletterStatus(id, confirmed);
    if (!success) {
      return res.status(404).json({ message: "Newsletter non trouvée." });
    }
    res.status(200).json({ message: "Statut mis à jour avec succès." });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut.",
      error: error.message
    });
  }
};

export const sendNewsletterBulk = async (req, res) => {
  try {
    const { subject, content, template, onlyConfirmed = true } = req.body;
    if (!subject || !content) {
      return res
        .status(400)
        .json({ message: "Les champs subject et content sont requis." });
    }

    const adminId = req.user?.user_id || null;
    const list = await getAllNewsletter();
    const recipients = Array.isArray(list)
      ? list.filter((n) => (!onlyConfirmed ? true : n.confirmed === 1))
      : [];

    if (recipients.length === 0) {
      return res.status(400).json({ message: "Aucun abonné newsletter trouvé." });
    }

    const results = { sent: 0, stored: 0, errors: [] };

    // Envoi séquentiel: évite d'ouvrir trop de connexions SMTP en parallèle
    for (const n of recipients) {
      const email = n?.email;
      const user_id = n?.user_id || null;

      // 1) Envoi email
      try {
        const r = await mailMessageReply(email, "Abonné", content, subject);
        if (!r?.success) {
          results.errors.push({
            email,
            stage: "send",
            error: r?.message || "Email non envoyé",
          });
        } else {
          results.sent++;
        }
      } catch (e) {
        results.errors.push({
          email,
          stage: "send",
          error: String(e?.message || e),
        });
      }

      // 2) Stockage côté messages (bulle admin)
      try {
        await createMessage({
          user_id,
          admin_id: adminId,
          name: "Newsletter",
          email,
          subject,
          content,
          content_admin: content,
          priority: "normal",
          status: "read",
          assigned_to: adminId,
        });
        results.stored++;
      } catch (e) {
        results.errors.push({
          email,
          stage: "store",
          error: String(e?.message || e),
        });
      }
    }

    return res
      .status(200)
      .json({ message: "Newsletter envoyée", ...results, count: recipients.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
