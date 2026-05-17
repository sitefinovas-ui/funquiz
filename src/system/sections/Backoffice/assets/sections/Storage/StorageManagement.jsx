import React, { useState, useEffect, useRef } from 'react';
import {
  FaUpload, FaTrash, FaCopy, FaSearch, FaImage,
  FaSpinner, FaCheck, FaTimes, FaDatabase,
} from 'react-icons/fa';
import storageService from '../../../../../configurations/Services/storageService.js';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

/* ── Picker réutilisable (importé depuis ThematicManagement) ── */
export const StoragePicker = ({ onSelect, onClose }) => {
  const [images,  setImages]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    storageService.listImages()
      .then(setImages)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = images.filter(img =>
    img.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">

        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
            <FaDatabase className="text-indigo-500" /> Médiathèque
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une image..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-indigo-500 text-3xl" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaImage className="text-4xl mx-auto mb-3 opacity-30" />
              <p>{search ? 'Aucune image ne correspond à votre recherche.' : 'La médiathèque est vide.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map(img => (
                <button
                  key={img.filename}
                  type="button"
                  onClick={() => setSelected(img)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selected?.filename === img.filename
                      ? 'border-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-indigo-900'
                      : 'border-transparent hover:border-indigo-300'
                  }`}
                >
                  <img
                    src={img.icon_url}
                    alt={img.filename}
                    className="w-full h-full object-cover bg-gray-100 dark:bg-gray-700"
                  />
                  {selected?.filename === img.filename && (
                    <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                      <span className="bg-indigo-600 text-white rounded-full p-1.5">
                        <FaCheck size={10} />
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1 py-0.5">
                    <p className="text-[9px] text-white truncate">{img.filename}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {selected ? `✓ ${selected.filename}` : 'Cliquez sur une image pour la sélectionner'}
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={() => selected && onSelect(selected)}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Utiliser cette image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Page Médiathèque ── */
const StorageManagement = () => {
  const [images,     setImages]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [uploading,  setUploading]  = useState(false);
  const [copiedFile, setCopiedFile] = useState(null);
  const [status,     setStatus]     = useState(null);
  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await storageService.listImages();
      setImages(data);
    } catch {
      setStatus({ type: 'error', message: 'Impossible de charger les images.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      await storageService.uploadImage(fd);
      setStatus({ type: 'success', message: 'Image uploadée avec succès.' });
      fetchImages();
    } catch {
      setStatus({ type: 'error', message: "Erreur lors de l'upload." });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (img) => {
    if (!window.confirm(`Supprimer "${img.filename}" ?`)) return;
    try {
      await storageService.deleteImage(img.filename);
      setImages(prev => prev.filter(i => i.filename !== img.filename));
      setStatus({ type: 'success', message: 'Image supprimée.' });
    } catch {
      setStatus({ type: 'error', message: 'Erreur lors de la suppression.' });
    }
  };

  const handleCopy = (img) => {
    navigator.clipboard.writeText(img.icon_url).then(() => {
      setCopiedFile(img.filename);
      setTimeout(() => setCopiedFile(null), 2000);
    });
  };

  const filtered = images.filter(img =>
    img.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaDatabase className="text-indigo-500" /> Médiathèque
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {images.length} image{images.length !== 1 ? 's' : ''} stockée{images.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-60"
          >
            {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
            Importer
          </button>
        </div>
      </div>

      {/* ── Status ── */}
      {status && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          status.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' ? <FaCheck /> : <FaTimes />}
          {status.message}
          <button onClick={() => setStatus(null)} className="ml-auto opacity-50 hover:opacity-100">
            <FaTimes />
          </button>
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-indigo-500 text-4xl mb-4" />
          <p className="text-gray-500">Chargement des images...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FaDatabase className="text-5xl mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-400 text-lg">
            {search
              ? 'Aucune image ne correspond à votre recherche.'
              : 'La médiathèque est vide. Importez votre première image !'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(img => (
            <div
              key={img.filename}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
                <img
                  src={img.icon_url}
                  alt={img.filename}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center">
                  <FaImage className="text-gray-300 text-3xl" />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopy(img)}
                    title="Copier l'URL"
                    className="p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white transition"
                  >
                    {copiedFile === img.filename
                      ? <FaCheck className="text-green-600" size={13} />
                      : <FaCopy size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(img)}
                    title="Supprimer"
                    className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white transition"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate" title={img.filename}>
                  {img.filename}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  {formatSize(img.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StorageManagement;
