import db from '../config/db.js';

const countryModel = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM countries ORDER BY name ASC');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM countries WHERE id = ?', [id]);
    return rows[0];
  },

  getByCode: async (code) => {
    const [rows] = await db.query('SELECT * FROM countries WHERE code = ?', [code]);
    return rows[0];
  },

  create: async ({ code, name, flag_url, color }) => {
    const [result] = await db.query(
      'INSERT INTO countries (code, name, flag_url, color) VALUES (?, ?, ?, ?)',
      [code, name, flag_url, color]
    );
    return result.insertId;
  },

  update: async (id, { code, name, flag_url, color, is_active }) => {
    const [result] = await db.query(
      'UPDATE countries SET code = ?, name = ?, flag_url = ?, color = ?, is_active = ? WHERE id = ?',
      [code, name, flag_url, color, is_active, id]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM countries WHERE id = ?', [id]);
    return result;
  }
};

export default countryModel;
