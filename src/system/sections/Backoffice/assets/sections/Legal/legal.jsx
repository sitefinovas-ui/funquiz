import React, { useEffect, useState } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaFileContract,
  FaUserShield,
  FaCookieBite,
  FaInfoCircle,
  FaHeadset,
  FaQuestionCircle,
  FaSpinner,
  FaSave,
} from 'react-icons/fa';
import cguServices from '../../../../../configurations/Services/cguServices.js';
import privacyPolicyServices from '../../../../../configurations/Services/privacyPolicyServices.js';
import cookiesPolicyServices from '../../../../../configurations/Services/cookiesPolicyServices.js';
import aboutServices from '../../../../../configurations/Services/aboutServices.js';
import contactServices from '../../../../../configurations/Services/contactServices.js';
import faqServices from '../../../../../configurations/Services/faqService.js';

const Legal = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cgu');
  const [data, setData] = useState({
    cgu: [], privacy: [], cookies: [], about: [], contacts: [], faq: []
  });

  const [modal, setModal] = useState({ show: false, type: null, item: null });
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'cgu', label: 'CGU', icon: FaFileContract },
    { id: 'privacy', label: 'Confidentialité', icon: FaUserShield },
    { id: 'cookies', label: 'Cookies', icon: FaCookieBite },
    { id: 'about', label: 'À propos', icon: FaInfoCircle },
    { id: 'contacts', label: 'Contacts', icon: FaHeadset },
    { id: 'faq', label: 'FAQ', icon: FaQuestionCircle },
  ];

  const loadAll = async () => {
    setLoading(true);
    try {
      const [c, p, k, a, ct, f] = await Promise.all([
        cguServices.getAll(),
        privacyPolicyServices.getAll(),
        cookiesPolicyServices.getAll(),
        aboutServices.getAll(),
        contactServices.getAll().catch(() => []),
        faqServices.getAllFaq().catch(() => []),
      ]);
      setData({ cgu: c, privacy: p, cookies: k, about: a, contacts: ct, faq: f });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openModal = (type, item = null) => {
    setModal({ show: true, type, item });
    if (item) {
      setFormData(item);
    } else {
      setFormData(type === 'faq' ? { is_active: 1 } : type === 'contacts' ? { status: 'operationnel' } : { status: 'draft' });
    }
  };

  const closeModal = () => { setModal({ show: false, type: null, item: null }); setFormData({}); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const type = modal.type;
      const id = modal.item?.id || modal.item?.faq_id;
      const isEdit = !!modal.item;

      if (type === 'cgu') await (isEdit ? cguServices.update(id, formData) : cguServices.create(formData));
      if (type === 'privacy') await (isEdit ? privacyPolicyServices.update(id, formData) : privacyPolicyServices.create(formData));
      if (type === 'cookies') await (isEdit ? cookiesPolicyServices.update(id, formData) : cookiesPolicyServices.create(formData));
      if (type === 'about') await (isEdit ? aboutServices.update(id, formData) : aboutServices.create(formData));
      if (type === 'contacts') await (isEdit ? contactServices.update(id, formData) : contactServices.create(formData));
      if (type === 'faq') await (isEdit ? faqServices.updateFaq(id, { question: formData.question, answer: formData.answer, is_active: Number(formData.is_active) }) : faqServices.createFaq({ question: formData.question, answer: formData.answer, is_active: Number(formData.is_active) }));

      closeModal();
      await loadAll();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Supprimer cet élément ?')) return;
    try {
      if (type === 'cgu') await cguServices.delete(id);
      if (type === 'privacy') await privacyPolicyServices.delete(id);
      if (type === 'cookies') await cookiesPolicyServices.delete(id);
      if (type === 'about') await aboutServices.delete(id);
      if (type === 'contacts') await contactServices.delete(id);
      if (type === 'faq') await faqServices.deleteFaq(id);
      await loadAll();
    } catch (e) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <FaSpinner className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 font-medium">Chargement des documents légaux...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Espace Légal</h1>
          <p className="text-slate-500 font-medium">Gérez les documents contractuels et les informations d'aide</p>
        </div>
        <button
          onClick={() => openModal(activeTab)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <FaPlus /> <span>Ajouter</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap p-1.5 bg-slate-100 rounded-[28px] w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-[22px] text-sm font-bold transition-all duration-300 ${
                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              <Icon className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informations</th>
                <th className="p-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Détails</th>
                <th className="p-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="p-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data[activeTab].map((item) => {
                const id = item.id || item.faq_id;
                return (
                  <tr key={id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="p-8">
                      <p className="font-bold text-slate-900 leading-tight">
                        {item.title || item.question || item.service || 'Sans titre'}
                      </p>
                      {item.subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{item.subtitle}</p>}
                    </td>
                    <td className="p-8 max-w-md">
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed italic">
                        {item.content || item.answer || item.description || item.mission || '—'}
                      </p>
                    </td>
                    <td className="p-8">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        (item.status === 'published' || item.status === 'operationnel' || item.is_active === 1) ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                      }`}>
                        {(item.status === 'published' || item.status === 'operationnel' || item.is_active === 1) ? <FaCheckCircle size={8} /> : <FaTimes size={8} />}
                        {item.status === 'published' ? 'Publié' : item.status === 'draft' ? 'Brouillon' : item.status === 'operationnel' ? 'Opérationnel' : item.status === 'cacher' ? 'Caché' : item.is_active === 1 ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(activeTab, item)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Modifier"><FaEdit size={16} /></button>
                        <button onClick={() => handleDelete(activeTab, id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Supprimer"><FaTrash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data[activeTab].length === 0 && (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun contenu disponible</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-10 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-900">
                {modal.item ? 'Éditer' : 'Créer'} {tabs.find(t => t.id === modal.type)?.label}
              </h3>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"><FaTimes /></button>
            </div>

            <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Common Fields */}
              {(modal.type === 'cgu' || modal.type === 'privacy' || modal.type === 'cookies') && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Titre</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Contenu</label>
                    <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium min-h-[200px] resize-none" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Statut</label>
                    <div className="flex gap-2">
                      {['draft', 'published'].map(s => (
                        <button key={s} onClick={() => setFormData({...formData, status: s})} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${formData.status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {s === 'draft' ? 'Brouillon' : 'Publié'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* FAQ Fields */}
              {modal.type === 'faq' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Question</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" value={formData.question || ''} onChange={e => setFormData({...formData, question: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Réponse</label>
                    <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium min-h-[160px] resize-none" value={formData.answer || ''} onChange={e => setFormData({...formData, answer: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Statut</label>
                    <div className="flex gap-2">
                      {[1, 0].map(s => (
                        <button key={s} onClick={() => setFormData({...formData, is_active: s})} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${Number(formData.is_active) === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {s === 1 ? 'Actif' : 'Inactif'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Contact Fields */}
              {modal.type === 'contacts' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Service</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" value={formData.service || ''} onChange={e => setFormData({...formData, service: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Email</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Description</label>
                    <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium min-h-[120px] resize-none" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Statut</label>
                    <div className="flex gap-2">
                      {['operationnel', 'cacher'].map(s => (
                        <button key={s} onClick={() => setFormData({...formData, status: s})} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${formData.status === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {s === 'operationnel' ? 'Opérationnel' : 'Caché'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* About Fields */}
              {modal.type === 'about' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Titre</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Description</label>
                    <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium min-h-[120px] resize-none" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Mission</label>
                    <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium min-h-[100px] resize-none" value={formData.mission || ''} onChange={e => setFormData({...formData, mission: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Vision</label>
                    <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium min-h-[100px] resize-none" value={formData.vision || ''} onChange={e => setFormData({...formData, vision: e.target.value})} />
                  </div>
                </>
              )}
            </div>

            <div className="p-10 bg-slate-50 flex gap-4">
              <button onClick={closeModal} className="flex-1 px-8 py-4 bg-white text-slate-600 rounded-3xl font-bold hover:bg-slate-100 transition-all">Annuler</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] px-8 py-4 bg-blue-600 text-white rounded-3xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {saving ? <FaSpinner className="animate-spin mx-auto" /> : <div className="flex items-center justify-center gap-2"><FaSave /> <span>Enregistrer les modifications</span></div>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Legal;

