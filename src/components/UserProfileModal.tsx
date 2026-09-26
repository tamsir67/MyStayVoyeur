import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { baTamsirAvatar } from '../mockData';
import { 
  X, Camera, RotateCcw, Check, Sparkles, ShieldCheck, 
  Mail, Phone, User as UserIcon, FileText, Compass,
  Leaf, Award, Upload
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { 
    currentUser, 
    bookings,
    setActiveView,
    isProfileModalOpen, 
    closeProfileModal, 
    updateUserProfile, 
    resetBaTamsirAvatar,
    showNotification 
  } = useApp();

  const userBookings = bookings.filter(b => b.travelerId === currentUser.id && b.status !== 'annulee' && b.status !== 'refusee');
  const userCo2Saved = userBookings.reduce((sum, b) => sum + (b.co2SavedKg || ((b.nightsCount || 1) * 12.5)), 0);
  const totalNights = userBookings.reduce((sum, b) => sum + (b.nightsCount || 1), 0);

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || baTamsirAvatar);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isProfileModalOpen && currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
      setAvatarPreview(currentUser.avatar || baTamsirAvatar);
    }
  }, [isProfileModalOpen, currentUser]);

  if (!isProfileModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('Format non valide', 'Veuillez sélectionner un fichier image (JPG, PNG, WebP).', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      updateUserProfile({ avatar: result });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleResetToOfficialAvatar = () => {
    if (currentUser.id === 'usr_voyageur_1' || currentUser.name?.includes('Tamsir')) {
      setAvatarPreview(baTamsirAvatar);
      resetBaTamsirAvatar();
    } else {
      const defaultImg = currentUser.role === 'hote'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';
      setAvatarPreview(defaultImg);
      updateUserProfile({ avatar: defaultImg });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        email,
        phone,
        bio,
        avatar: avatarPreview
      });
      closeProfileModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-[#FAF9F5] rounded-t-3xl">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#243E36] text-[#A3E5C8] rounded-xl">
              <UserIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Profil Utilisateur • {currentUser.name}
              </h2>
              <p className="text-xs text-stone-500">
                Gérez votre identité, votre avatar et vos engagements éco-tourisme
              </p>
            </div>
          </div>
          <button 
            id="close-profile-modal-btn"
            onClick={closeProfileModal}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="relative group shrink-0">
              <img
                src={avatarPreview}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#243E36] shadow-md transition-all group-hover:brightness-95"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white rounded-full opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer text-xs font-medium"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span>Modifier</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-bold text-lg text-stone-900">{name}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentUser.role === 'admin' ? 'Administrateur' : currentUser.role === 'hote' ? 'Hôte rural' : 'Voyageur éco-curieux'}
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Glissez-déposez une photo ici ou cliquez sur les boutons ci-dessous pour changer d'avatar.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  id="btn-upload-avatar"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#243E36] hover:bg-[#1B2F29] text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#A3E5C8]" />
                  <span>Uploader une photo</span>
                </button>

                <button
                  type="button"
                  id="btn-reset-official-avatar"
                  onClick={handleResetToOfficialAvatar}
                  className="px-3 py-1.5 bg-white border border-stone-300 hover:border-[#243E36] text-stone-700 hover:text-[#243E36] text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>{currentUser.id === 'usr_voyageur_1' || currentUser.name?.includes('Tamsir') ? 'Photo officielle Ba Tamsir' : 'Photo par défaut'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Eco-Stats Pills */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div 
              onClick={() => {
                closeProfileModal();
                setActiveView('my_trips');
              }}
              className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl cursor-pointer hover:bg-emerald-100/70 transition"
              title="Cliquer pour voir le graphique comparatif"
            >
              <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center justify-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Score Carbone
              </div>
              <div className="text-base font-bold text-emerald-950 mt-0.5">-{userCo2Saved.toFixed(1)} kg</div>
              <div className="text-[10px] text-emerald-700">CO₂ économisé ↗</div>
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
              <div className="text-[11px] font-semibold text-amber-800 uppercase flex items-center justify-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                Séjours
              </div>
              <div className="text-base font-bold text-amber-950 mt-0.5">{userBookings.length} réservé{userBookings.length > 1 ? 's' : ''}</div>
              <div className="text-[10px] text-amber-700">{totalNights} nuitées écologiques</div>
            </div>
            <div className="p-3 bg-stone-100 border border-stone-200 rounded-2xl">
              <div className="text-[11px] font-semibold text-stone-700 uppercase flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-stone-600" />
                Engagement
              </div>
              <div className="text-base font-bold text-stone-900 mt-0.5">
                {userBookings.length >= 3 ? 'Niveau 3' : userBookings.length >= 1 ? 'Niveau 2' : 'Niveau 1'}
              </div>
              <div className="text-[10px] text-stone-600">Voyageur Responsable</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-stone-600 mb-1.5">
                Nom complet
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#243E36] focus:bg-white transition"
                  placeholder="Ex: Ba Tamsir"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1.5">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#243E36] focus:bg-white transition"
                    placeholder="ba.tamsir@example.fr"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-600 mb-1.5">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#243E36] focus:bg-white transition"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-600 mb-1.5">
                Biographie / Présentation
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#243E36] focus:bg-white transition resize-none"
                  placeholder="Partagez vos passions pour la nature et les séjours ruraux..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={closeProfileModal}
              className="px-4 py-2.5 border border-stone-300 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-50 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              id="btn-save-user-profile"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#243E36] hover:bg-[#1B2F29] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4 text-[#A3E5C8]" />
              <span>{isSaving ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
