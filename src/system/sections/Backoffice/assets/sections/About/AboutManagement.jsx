import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaInfoCircle, FaCheck, FaTimes, FaSpinner, FaSearch, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import aboutServices from '../../../../../configurations/Services/aboutServices.js';

const AboutManagement = () => {
  const [aboutList, setAboutList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbout, setEditingAbout] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    mission: '',
    vision: '',
    contact_email: '',
    status: 'published'
  });

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const data = await aboutServices.getAll();
      setAboutList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des données About:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (about = null) => {
    if (about) {
      setEditingAbout(about);
      setFormData({
        title: about.title || '',
        subtitle: about.subtitle || '',
        description: about.description || '',
        mission: about.mission || '',
        vision: about.vision || '',
        contact_email: about.contact_email || '',
        status: about.status || 'published'
      });
    } else {
      setEditingAbout(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        mission: '',
        vision: '',
        contact_email: '',
        status: 'published'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAbout(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAbout) {
        await aboutServices.update(editingAbout.id, formData);
      } else {
        await aboutServices.create(formData);
      }
      fetchAbout();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await aboutServices.delete(id);
        fetchAbout();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredAbout = aboutList.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Gestion de la page À propos</h2>
          <p className="text-slate-500 font-medium">Gérez le contenu informatif de FunQuiz.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <FaPlus /> <span>Ajouter du contenu</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, email..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Titre</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sous-titre</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <FaSpinner className="animate-spin text-blue-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : filteredAbout.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                    Aucun contenu trouvé.
                  </td>
                </tr>
              ) : (
                filteredAbout.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{item.title}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{item.subtitle}</td>
                    <td className="px-6 py-4 text-slate-600">{item.contact_email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                      }`}>
                        {item.status === 'published' ? <FaCheckCircle size={8} /> : <FaTimes size={8} />}
                        {item.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900">
                {editingAbout ? 'Modifier le contenu' : 'Ajouter du contenu'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Titre principal</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Sous-titre</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Description / Histoire</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Notre Mission</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 resize-none"
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Notre Vision</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20 resize-none"
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Email de contact</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Statut</label>
                  <div className="flex gap-2">
                    {['draft', 'published'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s })}
                        className={`flex-1 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                          formData.status === s 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {s === 'draft' ? 'Brouillon' : 'Publié'}
                      </button>
                    ))}
                  </div>
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

export default AboutManagement;
