import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaGlobe,
  FaDatabase,
} from 'react-icons/fa';
import thematicService from '../../../../../configurations/Services/thematicServices.js';
import countryServices from '../../../../../configurations/Services/countryServices.js';
import { StoragePicker } from '../Storage/StorageManagement.jsx';

const ThematicManagement = () => {
  const [thematics, setThematics] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingThematic, setEditingThematic] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color_code: '#6366f1',
    country_codes: ['CI'],
    display_order: 0,
    is_active: 1
  });
  const [selectedFile,        setSelectedFile]        = useState(null);
  const [selectedStoragePath, setSelectedStoragePath] = useState(null);
  const [previewUrl,          setPreviewUrl]          = useState(null);
  const [showStoragePicker,   setShowStoragePicker]   = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tData, cData] = await Promise.all([
        thematicService.getAllParamThematics(),
        countryServices.getAll()
      ]);
      setThematics(tData || []);
      setCountries(cData || []);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      setStatus({ type: 'error', message: "Impossible de charger les données." });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingThematic(null);
    setFormData({
      title: '',
      description: '',
      color_code: '#6366f1',
      country_codes: ['CI'],
      display_order: 0,
      is_active: 1
    });
    setSelectedFile(null);
    setSelectedStoragePath(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleOpenEdit = (thematic) => {
    setEditingThematic(thematic);
    const codes = Array.isArray(thematic.country_codes) && thematic.country_codes.length
      ? thematic.country_codes
      : (thematic.country_code ? [thematic.country_code] : ['CI']);
    setFormData({
      title: thematic.title || '',
      description: thematic.description || '',
      color_code: thematic.color_code || '#6366f1',
      country_codes: codes,
      display_order: thematic.display_order || 0,
      is_active: thematic.is_active ?? 1
    });
    setSelectedFile(null);
    setSelectedStoragePath(null);
    setPreviewUrl(thematic.icon_url || null);
    setShowModal(true);
  };

  const toggleCountry = (code) => {
    setFormData(prev => {
      const current = prev.country_codes || [];
      return {
        ...prev,
        country_codes: current.includes(code)
          ? current.filter(c => c !== code)
          : [...current, code]
      };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedStoragePath(null);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStoragePick = (img) => {
    setSelectedStoragePath(img.path);
    setSelectedFile(null);
    setPreviewUrl(img.icon_url);
    setShowStoragePicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'country_codes') {
        data.append('country_codes', JSON.stringify(formData.country_codes));
      } else {
        data.append(key, formData[key]);
      }
    });
    if (selectedFile) {
      data.append('icon', selectedFile);
    } else if (selectedStoragePath) {
      data.append('icon_url', selectedStoragePath);
    }

    try {
      if (editingThematic) {
        await thematicService.updateThematic(editingThematic.thematic_id, data);
        setStatus({ type: 'success', message: "Thématique mise à jour avec succès." });
      } else {
        await thematicService.createThematic(data);
        setStatus({ type: 'success', message: "Thématique créée avec succès." });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setStatus({ type: 'error', message: "Erreur lors de la sauvegarde." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette thématique ?")) return;
    
    try {
      await thematicService.deleteThematic(id);
      setStatus({ type: 'success', message: "Thématique supprimée." });
      fetchData();
    } catch (error) {
      console.error("Erreur suppression:", error);
      setStatus({ type: 'error', message: "Erreur lors de la suppression." });
    }
  };

  const filteredThematics = thematics.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une thématique..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <FaPlus />
          Ajouter une Thématique
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {status.message}
          <button onClick={() => setStatus(null)} className="ml-auto opacity-50 hover:opacity-100">
            <FaTimes />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-indigo-500 text-4xl mb-4" />
          <p className="text-gray-500">Chargement des thématiques...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThematics.map((thematic) => (
            <div key={thematic.thematic_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-32 relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: `${thematic.color_code}22` }}>
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: thematic.color_code }}></div>
                {thematic.icon_url ? (
                  <img src={thematic.icon_url} alt={thematic.title} className="w-16 h-16 object-contain" />
                ) : (
                  <FaImage className="text-gray-300 text-4xl" />
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenEdit(thematic)}
                    className="p-2 bg-white/90 hover:bg-white text-indigo-600 rounded-full shadow-sm"
                    title="Modifier"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(thematic.thematic_id)}
                    className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-sm"
                    title="Supprimer"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">{thematic.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    thematic.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {thematic.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                  {thematic.description || "Aucune description."}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 dark:border-gray-700 pt-3">
                  <div className="flex items-center gap-1 flex-wrap">
                    <FaGlobe className="text-indigo-400" />
                    {(thematic.country_codes?.length ? thematic.country_codes : [thematic.country_code || 'CI']).map(code => (
                      <span key={code} className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded text-[10px] font-bold">{code}</span>
                    ))}
                  </div>
                  <div>Ordre: {thematic.display_order}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showStoragePicker && (
        <StoragePicker
          onSelect={handleStoragePick}
          onClose={() => setShowStoragePicker(false)}
        />
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingThematic ? 'Modifier la Thématique' : 'Ajouter une Thématique'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Titre *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pays (plusieurs possibles) *</label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 max-h-40 overflow-y-auto">
                    {countries.map(c => {
                      const selected = (formData.country_codes || []).includes(c.code);
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => toggleCountry(c.code)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            selected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-400'
                          }`}
                        >
                          {c.name} <span className="opacity-70">({c.code})</span>
                        </button>
                      );
                    })}
                  </div>
                  {(formData.country_codes || []).length === 0 && (
                    <p className="text-xs text-red-500">Sélectionnez au moins un pays.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Couleur (Hex)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={formData.color_code}
                      onChange={(e) => setFormData({...formData, color_code: e.target.value})}
                      className="h-10 w-20 p-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={formData.color_code}
                      onChange={(e) => setFormData({...formData, color_code: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ordre d'affichage</label>
                  <input 
                    type="number" 
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="space-y-4 p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Icône / Image</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center relative overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <FaImage className="text-gray-300 text-3xl" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      id="icon-upload"
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <label
                        htmlFor="icon-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium text-sm"
                      >
                        <FaImage />
                        Importer
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowStoragePicker(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors font-medium text-sm"
                      >
                        <FaDatabase />
                        Médiathèque
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">SVG, PNG ou WEBP recommandés. Taille max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_active"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Thématique active (visible par les utilisateurs)
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {editingThematic ? 'Mettre à jour' : 'Créer la thématique'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThematicManagement;
