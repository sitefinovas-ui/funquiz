import {
  getAllFaqData,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../models/faqModel.js";

export const allFaqData = async (req, res) => {
  try {
    const data = await getAllFaqData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const faqById = async (req, res) => {
  try {
    const { faq_id } = req.params;
    const data = await getFaqById(faq_id);
    if (data.length === 0) {
      return res.status(404).json({ error: "FAQ non trouvée." });
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addFaq = async (req, res) => {
  try {
    const { question, answer, is_active } = req.body;
    if (!question || !answer) {
      return res
        .status(400)
        .json({ error: "Les champs question et answer sont requis." });
    }
    const newFaq = await createFaq({ question, answer, is_active });
    res.status(201).json(newFaq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editFaq = async (req, res) => {
  try {
    const { faq_id } = req.params;
    const { question, answer, is_active } = req.body;

    if (!question && !answer && is_active === undefined) {
      return res
        .status(400)
        .json({
          error:
            "Au moins un champ (question, answer, is_active) doit être fourni pour la mise à jour.",
        });
    }

    const updatedFaq = await updateFaq(faq_id, { question, answer, is_active });
    res.status(200).json(updatedFaq);
  } catch (error) {
    if (error.message === "FAQ non trouvée.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

export const removeFaq = async (req, res) => {
  try {
    const { faq_id } = req.params;
    await deleteFaq(faq_id);
    res.status(200).json({ message: "FAQ supprimée avec succès." });
  } catch (error) {
    if (error.message === "FAQ non trouvée.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
