import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaGlobeAfrica, FaCheck, FaTimes, FaSpinner, FaSearch } from 'react-icons/fa';
import countryServices from '../../../../../configurations/Services/countryServices.js';

const CountryManagement = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    flag_url: '',
    color: '#3b82f6',
    is_active: 1
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const data = await countryServices.getAll();
      setCountries(data);
    } catch (error) {
      console.error('Erreur lors du chargement des pays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (country = null) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        code: country.code,
        name: country.name,
        flag_url: country.flag_url,
        color: country.color,
        is_active: country.is_active
      });
    } else {
      setEditingCountry(null);
      setFormData({
        code: '',
        name: '',
        flag_url: '',
        color: '#3b82f6',
        is_active: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCountry(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCountry) {
        await countryServices.update(editingCountry.id, formData);
      } else {
        await countryServices.create(formData);
      }
      fetchCountries();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pays ?')) {
      try {
        await countryServices.delete(id);
        fetchCountries();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Gestion des Pays</h2>
          <p className="text-slate-500 font-medium">Gérez les pays disponibles pour les thématiques.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <FaPlus /> <span>Ajouter un pays</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un pays..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Drapeau</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Couleur</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FaSpinner className="animate-spin text-blue-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : filteredCountries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                    Aucun pays trouvé.
                  </td>
                </tr>
              ) : (
                filteredCountries.map((country) => (
                  <tr key={country.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100">
                        <img src={country.flag_url} alt={country.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{country.code}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{country.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: country.color }} />
                        <span className="text-xs font-mono text-slate-500">{country.color}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        country.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {country.is_active ? <FaCheck /> : <FaTimes />}
                        {country.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(country)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(country.id)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">
                {editingCountry ? 'Modifier le pays' : 'Ajouter un pays'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Code (ex: CI)</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Nom du pays</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">URL du Drapeau (Image)</label>
                <input
                  required
                  type="url"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
                  value={formData.flag_url}
                  onChange={(e) => setFormData({ ...formData, flag_url: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Couleur (Hex)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-12 h-11 p-1 bg-slate-50 border-none rounded-2xl cursor-pointer"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Statut</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: Number(e.target.value) })}
                  >
                    <option value={1}>Actif</option>
                    <option value={0}>Inactif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryManagement;
