import countryModel from '../models/countryModel.js';

export const getAllCountries = async (req, res) => {
  try {
    const countries = await countryModel.getAll();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCountryById = async (req, res) => {
  try {
    const country = await countryModel.getById(req.params.id);
    if (!country) return res.status(404).json({ message: 'Pays non trouvé' });
    res.json(country);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCountry = async (req, res) => {
  try {
    const { code, name, flag_url, color } = req.body;
    const insertId = await countryModel.create({ code, name, flag_url, color });
    res.status(201).json({ id: insertId, message: 'Pays créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCountry = async (req, res) => {
  try {
    const { code, name, flag_url, color, is_active } = req.body;
    await countryModel.update(req.params.id, { code, name, flag_url, color, is_active });
    res.json({ message: 'Pays mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCountry = async (req, res) => {
  try {
    await countryModel.delete(req.params.id);
    res.json({ message: 'Pays supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
