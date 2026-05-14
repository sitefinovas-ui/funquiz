import db from "../config/db.js";

export const getPermissionsByRole = async (role) => {
  const [rows] = await db.query("SELECT permissions FROM funquiz_role_permissions WHERE role = ?", [role]);
  return rows[0]?.permissions || null;
};

export const getAllRolePermissions = async () => {
  const [rows] = await db.query("SELECT * FROM funquiz_role_permissions");
  return rows;
};

export const updateRolePermissions = async (role, permissions) => {
  const [res] = await db.query(
    "UPDATE funquiz_role_permissions SET permissions = ? WHERE role = ?",
    [JSON.stringify(permissions), role]
  );
  return res.affectedRows > 0;
};
