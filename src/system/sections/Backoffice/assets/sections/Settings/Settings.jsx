import React, { useState, useEffect } from 'react';
import { FaSave, FaEnvelope, FaServer, FaKey, FaUser, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import api from '../../../../../configurations/Api/api_axios.js';

const Settings = () => {
  const [settings, setSettings] = useState({
    MAIL_PROVIDER: 'smtp',
    RESEND_API_KEY: '',
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_SECURE: 'false',
    MAIL_FROM: 'FunQuiz <no-reply@funquiz.com>'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      setSettings(prev => ({ ...prev, ...res.data }));
    } catch (error) {
      console.error("Erreur fetch settings:", error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await api.post('/settings', settings);
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès !' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("Erreur save settings:", error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Paramètres Généraux</h2>
        <p className="text-slate-500 font-medium">Configurez les services globaux de la plateforme.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email Provider */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-lg font-black text-slate-900 border-b border-slate-50 pb-4">
            <FaEnvelope className="text-blue-600" />
            <h3>Configuration Email</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Fournisseur d'email</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                value={settings.MAIL_PROVIDER}
                onChange={(e) => setSettings({ ...settings, MAIL_PROVIDER: e.target.value })}
              >
                <option value="smtp">SMTP (Standard)</option>
                <option value="resend">Resend (API)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Expéditeur (From)</label>
              <input
                type="text"
                placeholder='FunQuiz <no-reply@funquiz.com>'
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                value={settings.MAIL_FROM}
                onChange={(e) => setSettings({ ...settings, MAIL_FROM: e.target.value })}
              />
            </div>
          </div>

          {settings.MAIL_PROVIDER === 'resend' ? (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Clé API Resend</label>
              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="re_..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                  value={settings.RESEND_API_KEY}
                  onChange={(e) => setSettings({ ...settings, RESEND_API_KEY: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Hôte SMTP</label>
                  <div className="relative">
                    <FaServer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="smtp.example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                      value={settings.SMTP_HOST}
                      onChange={(e) => setSettings({ ...settings, SMTP_HOST: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Port</label>
                  <input
                    type="text"
                    placeholder="587"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                    value={settings.SMTP_PORT}
                    onChange={(e) => setSettings({ ...settings, SMTP_PORT: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Utilisateur SMTP</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                      value={settings.SMTP_USER}
                      onChange={(e) => setSettings({ ...settings, SMTP_USER: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Mot de passe SMTP</label>
                  <div className="relative">
                    <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20"
                      value={settings.SMTP_PASS}
                      onChange={(e) => setSettings({ ...settings, SMTP_PASS: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, SMTP_SECURE: settings.SMTP_SECURE === 'true' ? 'false' : 'true' })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings.SMTP_SECURE === 'true' ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.SMTP_SECURE === 'true' ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-bold text-slate-700">Utiliser SSL/TLS (Port 465)</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            <span>Sauvegarder les paramètres</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
