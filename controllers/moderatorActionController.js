import { getAllModeratorActions } from "../models/moderatorActionModel.js";

export const listModeratorActions = async (req, res) => {
  try {
    const actions = await getAllModeratorActions();
    res.json(actions);
  } catch (error) {
    console.error("❌ Error listModeratorActions:", error);
    res.status(500).json({ error: error.message });
  }
};
