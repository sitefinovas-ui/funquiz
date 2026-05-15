import db from "../config/db.js";

/* ── Valeurs par défaut de chaque rôle ─────────────────────────────────────
   La migration (IIFE ci-dessous) ajoute les clés manquantes aux enregistrements
   existants sans écraser les valeurs déjà définies manuellement.
   ─────────────────────────────────────────────────────────────────────────── */
const DEFAULT_PERMISSIONS = {
  admin: {
    // Utilisateurs
    users_view: true, users_edit: true, users_delete: true,
    // Commentaires
    comments_view: true, comments_approve: true, comments_delete: true,
    // Quiz
    quiz_view: true, quiz_edit: true, quiz_delete: true,
    // Paramètres du jeu
    game_config_view: true, game_config_edit: true,
    // Offres spéciales
    publicites_view: true, publicites_edit: true, publicites_delete: true,
    // Pays
    countries_view: true, countries_edit: true,
    // Pages de contenu
    about_edit: true, legal_edit: true,
    // Messages & Newsletter
    messages_view: true, newsletter_view: true, newsletter_send: true,
    // Système
    settings_view: true, settings_edit: true,
    global_settings_view: true, global_settings_edit: true,
    // Modération
    logs_view: true,
  },
  moderator: {
    users_view: true,  users_edit: false, users_delete: false,
    comments_view: true, comments_approve: true, comments_delete: true,
    quiz_view: true, quiz_edit: false, quiz_delete: false,
    game_config_view: false, game_config_edit: false,
    publicites_view: true,  publicites_edit: false, publicites_delete: false,
    countries_view: true,   countries_edit: false,
    about_edit: false, legal_edit: false,
    messages_view: true, newsletter_view: false, newsletter_send: false,
    settings_view: false, settings_edit: false,
    global_settings_view: false, global_settings_edit: false,
    logs_view: true,
  },
  user: {
    users_view: false, users_edit: false, users_delete: false,
    comments_view: true, comments_approve: false, comments_delete: false,
    quiz_view: true, quiz_edit: false, quiz_delete: false,
    game_config_view: false, game_config_edit: false,
    publicites_view: true,  publicites_edit: false, publicites_delete: false,
    countries_view: true,   countries_edit: false,
    about_edit: false, legal_edit: false,
    messages_view: false, newsletter_view: false, newsletter_send: false,
    settings_view: false, settings_edit: false,
    global_settings_view: false, global_settings_edit: false,
    logs_view: false,
  },
};

/* ── Migration : ajoute les clés manquantes sans écraser les valeurs existantes ── */
(async () => {
  try {
    for (const [role, defaults] of Object.entries(DEFAULT_PERMISSIONS)) {
      const [rows] = await db.query(
        "SELECT permissions FROM funquiz_role_permissions WHERE role = ?", [role]
      );
      if (!rows.length) {
        await db.query(
          "INSERT IGNORE INTO funquiz_role_permissions (role, permissions) VALUES (?, ?)",
          [role, JSON.stringify(defaults)]
        );
      } else {
        const current = typeof rows[0].permissions === 'string'
          ? JSON.parse(rows[0].permissions)
          : rows[0].permissions || {};
        // defaults en base, current par-dessus → les valeurs manuelles sont préservées
        // les nouvelles clés de defaults qui n'existent pas dans current sont ajoutées
        const merged = { ...defaults, ...current };
        await db.query(
          "UPDATE funquiz_role_permissions SET permissions = ? WHERE role = ?",
          [JSON.stringify(merged), role]
        );
      }
    }
  } catch (e) {
    console.error("❌ permissions migration:", e.message);
  }
})();

export const getPermissionsByRole = async (role) => {
  const [rows] = await db.query(
    "SELECT permissions FROM funquiz_role_permissions WHERE role = ?", [role]
  );
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
