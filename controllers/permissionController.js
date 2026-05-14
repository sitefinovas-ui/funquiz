import { getAllRolePermissions, updateRolePermissions } from "../models/permissionModel.js";

export const listRolePermissions = async (req, res) => {
  try {
    const roles = await getAllRolePermissions();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const saveRolePermissions = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    if (!role || !permissions) return res.status(400).json({ error: "Rôle et permissions requis" });
    
    await updateRolePermissions(role, permissions);
    res.json({ message: "Permissions mises à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
