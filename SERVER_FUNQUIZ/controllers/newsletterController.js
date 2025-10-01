import { getAllNewsletter, getNewsletterById, createNewsletter, deleteNewsletter } from "../models/newsletterModel.js";
import { mailNewsletterSubscription, mailNewsletterUnsubscription } from "../utils/mail.js";

// Récupérer toutes les newsletters
export const allNewsletters = async (req, res) => {
  try {
    const newsletters = await getAllNewsletter();
    res.status(200).json(newsletters);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des newsletters." });
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
    res.status(500).json({ message: "Erreur serveur lors de la récupération de la newsletter." });
  }
};

// Créer un nouvel abonnement
export const addNewsletter = async (req, res) => {
  const { email, user_id } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Le champ email est requis." });
  }
  try {
    const newNewsletter = await createNewsletter({ email, user_id });
    await mailNewsletterSubscription(email);
    res.status(201).json(newNewsletter);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la création de l'abonnement." });
  }
};

// Supprimer un abonnement
export const removeNewsletter = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await deleteNewsletter(id);
    if (!success) {
      return res.status(404).json({ message: "Newsletter non trouvée." });
    }
    await mailNewsletterUnsubscription(id);
    res.status(200).json({ message: "Abonnement supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'abonnement." });
  }
};