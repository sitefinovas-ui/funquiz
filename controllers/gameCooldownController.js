import { getCooldown, setCooldown } from "../models/gameCooldownModel.js";
import { getConfigByKey }           from "../models/gameConfigModel.js";

export const checkCooldown = async (req, res) => {
  try {
    const userId = req.user?.user_id ?? req.user?.id;
    if (!userId) return res.json({ blocked: false });

    const cooldownUntil = await getCooldown(userId);
    if (!cooldownUntil) return res.json({ blocked: false });

    res.json({ blocked: true, cooldown_until: cooldownUntil });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const activateCooldown = async (req, res) => {
  try {
    const userId = req.user?.user_id ?? req.user?.id;
    if (!userId) return res.status(401).json({ error: "Non authentifié" });

    const config  = await getConfigByKey("cooldown_minutes");
    const minutes = Number(config?.config_value) || 0;
    if (minutes <= 0) return res.json({ blocked: false, message: "Pas de délai configuré" });

    await setCooldown(userId, minutes);
    res.json({ blocked: true, minutes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
