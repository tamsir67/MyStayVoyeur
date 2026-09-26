import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  X, Lock, Mail, User as UserIcon, Phone, CheckCircle2, 
  AlertCircle, ArrowRight, Shield, Sparkles, KeyRound, 
  Compass, Home, Check, Eye, EyeOff, Camera, Upload, Trash2, Image as ImageIcon, Sparkle
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    closeAuthModal, 
    openAuthModal, 
    login, 
    signup, 
    requestPasswordReset, 
    resetPasswordWithCode,
    users
  } = useApp();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupRole, setSignupRole] = useState<UserRole>('voyageur');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupAvatar, setSignupAvatar] = useState<string>('');
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [signupBio, setSignupBio] = useState('');
  const [acceptCharter, setAcceptCharter] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Avatar presets for easy selection
  const avatarPresets = [
    { label: 'Ba Tamsir', url: '/ba_tamsir_avatar.jpg' },
    { label: 'Voyageur Nature', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
    { label: 'Hôte Cévenol', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
    { label: 'Guide Randonnée', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' }
  ];

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSignupError('Le fichier sélectionné doit être une image (JPG, PNG ou WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSignupError('La taille de l\'image ne doit pas dépasser 5 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setSignupAvatar(event.target.result);
        setSignupError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    const res = login(loginIdentifier, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      setLoginIdentifier('');
      setLoginPassword('');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!signupLastName.trim() || !signupFirstName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupError('Veuillez remplir tous les champs obligatoires (nom, prénom, email, mot de passe).');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (!acceptCharter) {
      setSignupError('Veuillez accepter la charte d\'éco-tourisme rural MyStay.');
      return;
    }

    const fullName = `${signupFirstName.trim()} ${signupLastName.trim()}`;

    const res = signup({
      name: fullName,
      email: signupEmail,
      password: signupPassword,
      role: signupRole,
      phone: signupPhone,
      bio: signupBio,
      avatar: signupAvatar.trim() || undefined
    });

    if (!res.success) {
      setSignupError(res.message);
    } else {
      setSignupLastName('');
      setSignupFirstName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupPhone('');
      setSignupBio('');
      setSignupAvatar('');
      setAvatarInputUrl('');
      setAcceptCharter(false);
    }
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);

    if (!resetEmail.trim()) {
      setResetError('Veuillez saisir votre adresse email.');
      return;
    }

    const res = requestPasswordReset(resetEmail);
    if (!res.success) {
      setResetError(res.message);
    } else {
      setResetStep('verify');
      setResetMessage(res.message);
      if (res.generatedCode) {
        setGeneratedCodeHint(res.generatedCode);
        setResetCode(res.generatedCode); // auto-fill for testing convenience
      }
    }
  };

  const handleResetVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!resetCode.trim() || !newPassword.trim()) {
      setResetError('Veuillez saisir le code de sécurité et votre nouveau mot de passe.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    const res = resetPasswordWithCode(resetEmail, resetCode, newPassword);
    if (!res.success) {
      setResetError(res.message);
    } else {
      // Switch back to login
      setLoginIdentifier(resetEmail);
      setLoginPassword(newPassword);
      setResetStep('request');
      setGeneratedCodeHint(null);
      openAuthModal('login');
    }
  };

  const fillDemoUser = (userRole: 'voyageur' | 'hote' | 'admin') => {
    const target = users.find(u => u.role === userRole);
    if (target) {
      setLoginIdentifier(target.email);
      setLoginPassword(target.password || (userRole === 'voyageur' ? 'voyageur123' : userRole === 'hote' ? 'hote123' : 'admin123'));
      setLoginError(null);
    }
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div 
        id="auth-modal-content"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-emerald-900/10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            id="auth-close-btn"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium tracking-wide uppercase text-emerald-200">
                Espace Sécurisé MyStay
              </div>
              <h2 className="text-xl font-bold text-white">
                {authModalMode === 'login' && 'Connexion à votre compte'}
                {authModalMode === 'signup' && 'Rejoindre la communauté MyStay'}
                {authModalMode === 'forgot' && 'Réinitialiser votre mot de passe'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            {authModalMode === 'login' && 'Accédez à vos séjours réservés, vos hébergements ruraux ou à la console d\'administration.'}
            {authModalMode === 'signup' && 'Créez votre profil en quelques clics pour voyager ou accueillir dans le respect des terroirs.'}
            {authModalMode === 'forgot' && 'Recevez un code de validation sécurisé pour restaurer l\'accès à votre compte.'}
          </p>
        </div>

        {/* Tab Switcher (Connexion vs Inscription) */}
        {authModalMode !== 'forgot' && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium">
            <button
              id="tab-login"
              type="button"
              onClick={() => {
                setLoginError(null);
                openAuthModal('login');
              }}
              className={`flex-1 py-3 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                authModalMode === 'login'
                  ? 'border-emerald-700 text-emerald-900 font-bold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Connexion</span>
            </button>
            <button
              id="tab-signup"
              type="button"
              onClick={() => {
                setSignupError(null);
                openAuthModal('signup');
              }}
              className={`flex-1 py-3 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                authModalMode === 'signup'
                  ? 'border-emerald-700 text-emerald-900 font-bold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Inscription</span>
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-5">
          {/* ======================= MODE 1: LOGIN ======================= */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>{loginError}</div>
                </div>
              )}

              {/* Demo Accounts Quick-Fill Pills */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Comptes démo pré-configurés
                  </span>
                  <span className="text-[11px] text-emerald-700">1 clic pour remplir</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => fillDemoUser('voyageur')}
                    className="px-2 py-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
                  >
                    <div className="font-medium text-emerald-950 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-emerald-700" />
                      Voyageur
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-emerald-800 truncate">Ba Tamsir</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoUser('hote')}
                    className="px-2 py-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
                  >
                    <div className="font-medium text-emerald-950 flex items-center gap-1">
                      <Home className="w-3 h-3 text-emerald-700" />
                      Hôte Rural
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-emerald-800 truncate">Antoine V.</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoUser('admin')}
                    className="px-2 py-1.5 bg-white border border-emerald-200 rounded-lg text-left hover:border-emerald-600 hover:bg-emerald-50 transition-all group"
                  >
                    <div className="font-medium text-emerald-950 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-700" />
                      Admin CMS
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-emerald-800 truncate">Laurent M.</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                  Identifiant ou Adresse email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="login-input-identifier"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="ex: claire.bernard@example.fr ou Claire Bernard"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    Mot de passe
                  </label>
                  <button
                    id="btn-forgot-password"
                    type="button"
                    onClick={() => {
                      setResetEmail(loginIdentifier);
                      openAuthModal('forgot');
                    }}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-900 underline transition-colors cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    id="login-input-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-sans"
                  />
                  <button
                    id="btn-toggle-login-password"
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={showLoginPassword ? "Masquer le mot de passe" : "Visualiser le mot de passe"}
                    aria-label={showLoginPassword ? "Masquer le mot de passe" : "Visualiser le mot de passe"}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Cliquez sur l'œil pour afficher ou masquer</span>
                  {showLoginPassword && (
                    <span className="text-emerald-700 font-medium text-[11px]">Mot de passe visible</span>
                  )}
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Accéder à mon espace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <div>
                  <span className="text-xs text-slate-500">Pas encore de compte ? </span>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup')}
                    className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Créer un compte en 1 minute
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================= MODE 2: SIGNUP ======================= */}
          {authModalMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {signupError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>{signupError}</div>
                </div>
              )}

              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                  Type de profil souhaité
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSignupRole('voyageur')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      signupRole === 'voyageur'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${signupRole === 'voyageur' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Voyageur</div>
                      <div className="text-[11px] text-slate-500 leading-tight">Découvrir et réserver des gîtes ruraux</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupRole('hote')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                      signupRole === 'hote'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${signupRole === 'hote' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Hôte rural</div>
                      <div className="text-[11px] text-slate-500 leading-tight">Proposer et gérer un hébergement engagé</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Nom & Prénom séparés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                    Nom *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="signup-input-lastname"
                      type="text"
                      required
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}
                      placeholder="ex: Delacroix"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                    Prénom *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="signup-input-firstname"
                      type="text"
                      required
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}
                      placeholder="ex: Julien"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="signup-input-email"
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="julien@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="signup-input-phone"
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                  Mot de passe * (min. 6 caractères)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    id="signup-input-password"
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-sans"
                  />
                  <button
                    id="btn-toggle-signup-password"
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={showSignupPassword ? "Masquer le mot de passe" : "Visualiser le mot de passe"}
                    aria-label={showSignupPassword ? "Masquer le mot de passe" : "Visualiser le mot de passe"}
                  >
                    {showSignupPassword ? (
                      <EyeOff className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Cliquez sur l'œil pour afficher ou masquer</span>
                  {showSignupPassword && (
                    <span className="text-emerald-700 font-medium text-[11px]">Mot de passe visible</span>
                  )}
                </div>
              </div>

              {/* Profile Photo Upload Section (Optionnel & Conforme RGPD) */}
              <div className="p-3.5 bg-stone-50/90 border border-stone-200/90 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Photo de profil (facultatif)</span>
                  </label>
                  <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    {signupAvatar ? 'Photo sélectionnée' : 'Optionnel'}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  {/* Avatar Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-600 bg-white shadow-xs flex items-center justify-center">
                      {signupAvatar ? (
                        <img 
                          src={signupAvatar} 
                          alt="Aperçu photo de profil" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    {signupAvatar && (
                      <button
                        type="button"
                        onClick={() => setSignupAvatar('')}
                        className="absolute -top-1 -right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-xs cursor-pointer"
                        title="Supprimer la photo"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  {/* Actions to pick avatar */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-emerald-600 text-stone-800 text-xs font-semibold hover:bg-emerald-50/50 transition cursor-pointer shadow-2xs">
                        <Upload className="w-3 h-3 text-emerald-700" />
                        <span>Parcourir...</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/jpg"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <ImageIcon className="w-3 h-3 text-stone-500" />
                        <span>{showUrlInput ? 'Masquer URL' : 'Lien Web'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 leading-tight">
                      Glissez ou choisissez un fichier JPG, PNG ou WebP (max 5 Mo).
                    </p>
                  </div>
                </div>

                {/* Optional URL input */}
                {showUrlInput && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-200">
                    <input
                      type="url"
                      value={avatarInputUrl}
                      onChange={(e) => {
                        setAvatarInputUrl(e.target.value);
                        if (e.target.value.trim().startsWith('http')) {
                          setSignupAvatar(e.target.value.trim());
                        }
                      }}
                      placeholder="Collez l'URL de votre photo (https://...)"
                      className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (avatarInputUrl.trim()) {
                          setSignupAvatar(avatarInputUrl.trim());
                          setShowUrlInput(false);
                        }
                      }}
                      className="px-3 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-emerald-800"
                    >
                      Valider
                    </button>
                  </div>
                )}

                {/* Avatar presets suggestions */}
                <div className="pt-2 border-t border-stone-200/70">
                  <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
                    Ou choisir un avatar de la communauté :
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSignupAvatar(preset.url);
                          setAvatarInputUrl('');
                        }}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] transition border cursor-pointer ${
                          signupAvatar === preset.url
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-4 h-4 rounded-full object-cover shrink-0" 
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                  Présentation / Motivation éco-responsable (facultatif)
                </label>
                <textarea
                  id="signup-input-bio"
                  rows={2}
                  value={signupBio}
                  onChange={(e) => setSignupBio(e.target.value)}
                  placeholder={signupRole === 'hote' ? "Expliquez brièvement votre hébergement et vos pratiques écologiques..." : "Ce qui vous attire dans le tourisme rural..."}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                />
              </div>

              {/* Charter Acceptance (décochée par défaut) */}
              <div className="flex items-start gap-2.5 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <input
                  id="signup-accept-charter"
                  type="checkbox"
                  checked={acceptCharter}
                  onChange={(e) => setAcceptCharter(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="signup-accept-charter" className="text-xs text-slate-600 leading-snug cursor-pointer select-none">
                  J'adhère à la <strong className="text-emerald-800">Charte Éthique MyStay</strong> pour un tourisme rural à faible impact carbone, respectueux de la biodiversité et des communautés villageoises.
                </label>
              </div>

              <button
                id="btn-submit-signup"
                type="submit"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all"
              >
                <span>Finaliser mon inscription</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Déjà inscrit ? </span>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Se connecter
                </button>
              </div>
            </form>
          )}

          {/* ======================= MODE 3: FORGOT PASSWORD ======================= */}
          {authModalMode === 'forgot' && (
            <div className="space-y-4">
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>{resetError}</div>
                </div>
              )}

              {resetMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                  <div>{resetMessage}</div>
                </div>
              )}

              {generatedCodeHint && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">Code simulé reçu : </span>
                    <span className="font-mono text-sm tracking-widest font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {generatedCodeHint}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium">(Prêt à être validé)</span>
                </div>
              )}

              {resetStep === 'request' ? (
                <form onSubmit={handleResetRequest} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Saisissez l'adresse email associée à votre compte MyStay. Un code de sécurité temporaire vous sera immédiatement délivré.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        id="reset-input-email"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="ex: claire.bernard@example.fr"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-request-reset-code"
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Recevoir mon code de réinitialisation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                      Code de sécurité (6 chiffres)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        id="reset-input-code"
                        type="text"
                        required
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-4 py-2.5 font-mono tracking-widest text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                      Nouveau mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                      <input
                        id="reset-input-newpassword"
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all font-sans"
                      />
                      <button
                        id="btn-toggle-reset-password"
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-emerald-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title={showResetPassword ? "Masquer le mot de passe" : "Visualiser le mot de passe"}
                        aria-label={showResetPassword ? "Masquer le mot de passe" : "Visualiser le mot de passe"}
                      >
                        {showResetPassword ? (
                          <EyeOff className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Cliquez sur l'œil pour afficher ou masquer</span>
                      {showResetPassword && (
                        <span className="text-emerald-700 font-medium text-[11px]">Mot de passe visible</span>
                      )}
                    </div>
                  </div>

                  <button
                    id="btn-confirm-new-password"
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Valider mon nouveau mot de passe</span>
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs font-medium text-slate-600 hover:text-emerald-800 underline transition-colors"
                >
                  Retour à l'écran de connexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
