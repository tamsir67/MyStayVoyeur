import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Compass, Calendar, Home, ShieldCheck, 
  Heart, Check, LogIn, LogOut, UserPlus, 
  ChevronDown, User as UserIcon, Camera, MessageSquare,
  Database, RefreshCw
} from 'lucide-react';
import { UserRole } from '../types';
import { LogoMyStayVoyager } from './LogoMyStayVoyager';

export const Navbar: React.FC = () => {
  const { 
    currentUser, switchRole, activeView, setActiveView, 
    favorites, bookings, isAuthenticated, logout, openAuthModal, 
    requireAuth, openProfileModal, setActiveChatBookingId, showNotification, 
    unreadMessagesCount, openAirtableModal, isAdmin, isAdminSession
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const travelerActiveBookings = bookings.filter(
    b => b.travelerId === currentUser.id && (b.status === 'confirmee' || b.status === 'en_attente_hote')
  );

  const roles: { id: UserRole; label: string; badge: string; desc: string }[] = [
    { id: 'voyageur', label: 'Voyageur', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Recherche, réservation & avis' },
    { id: 'hote', label: 'Hôte rural', badge: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'Gestion d’annonces, calendrier & revenus' },
    { id: 'admin', label: 'Admin CMS', badge: 'bg-stone-800 text-stone-100 border-stone-700', desc: 'CMS, modération, labels & CRUD' }
  ];

  const handleNavClick = (view: 'my_trips' | 'host_space' | 'admin_space', targetRole?: UserRole) => {
    if (!isAuthenticated) {
      openAuthModal('login', view);
      return;
    }
    // Le changement automatique de profil n'est permis qu'à un administrateur
    if (isAdminSession && targetRole && currentUser.role !== targetRole && currentUser.role !== 'admin') {
      switchRole(targetRole);
    }
    setActiveView(view);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5] border-b border-[#E6E4DD] backdrop-blur-md bg-opacity-95 shadow-xs">
      {/* Top Accent Band */}
      <div className="w-full h-2 bg-[#243E36] border-b border-[#1A2E28]" />

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand My Stay Voyager */}
          <div 
            id="brand-logo-btn"
            onClick={() => setActiveView('explore')}
            className="flex items-center cursor-pointer group"
          >
            <LogoMyStayVoyager variant="horizontal" size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-explore-btn"
              onClick={() => setActiveView('explore')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'explore'
                  ? 'text-[#243E36] bg-[#EAE8DF]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#F3F1E9]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explorer</span>
            </button>

            <button
              id="nav-trips-btn"
              onClick={() => handleNavClick('my_trips')}
              title="Gérer ses réservations & Déposer un avis"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'my_trips'
                  ? 'text-[#243E36] bg-[#EAE8DF]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#F3F1E9]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Mes Voyages</span>
              {isAuthenticated && travelerActiveBookings.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-[#8C5E45] text-white text-xs flex items-center justify-center font-bold">
                  {travelerActiveBookings.length}
                </span>
              )}
            </button>

            <button
              id="nav-host-btn"
              onClick={() => handleNavClick('host_space', 'hote')}
              title="Déposer une annonce & Gérer son gîte"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeView === 'host_space'
                  ? 'text-[#243E36] bg-[#EAE8DF]'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#F3F1E9]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Espace Hôte</span>
            </button>
          </nav>

          {/* Right Controls: Favorites, Quick Role Switcher, Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Airtable Sync Button — réservé à l'administrateur */}
            {isAdmin && (
            <button
              id="nav-airtable-sync-btn"
              onClick={openAirtableModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#18392b] bg-[#e6ede9] hover:bg-[#d8e4dd] border border-[#a8ccbc] transition cursor-pointer shadow-xs group"
              title="Synchronisation Base de Données Airtable (appIt4PVIpjgrmhri)"
            >
              <Database className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-mono text-xs hidden sm:inline">Airtable</span>
              <span className="text-[10px] bg-[#243E36] text-[#A3E5C8] px-1.5 py-0.5 rounded-md font-sans font-semibold">Sync</span>
            </button>
            )}

            {/* Messages Icon */}
            <button
              id="nav-messages-btn"
              onClick={() => {
                const myConvs = bookings.filter(b => b.travelerId === currentUser.id || b.hostId === currentUser.id);
                if (myConvs.length > 0) {
                  setActiveChatBookingId(myConvs[0].id);
                } else if (bookings.length > 0) {
                  setActiveChatBookingId(bookings[0].id);
                } else {
                  showNotification('Messagerie Instantanée', 'Sélectionnez un hébergement ou une réservation pour discuter en direct.', 'info');
                }
              }}
              className="relative p-2 text-stone-600 hover:text-[#243E36] hover:bg-[#F3F1E9] rounded-lg transition cursor-pointer"
              title="Messagerie instantanée MyStay"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            {/* Favorites Icon */}
            <button
              id="nav-favorites-btn"
              onClick={() => handleNavClick('my_trips')}
              className="relative p-2 text-stone-600 hover:text-rose-600 hover:bg-[#F3F1E9] rounded-lg transition cursor-pointer"
              title="Mes hébergements favoris"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-rose-600 fill-rose-600' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Persona / Demo Role Switcher — visible uniquement pour une session administrateur */}
            {isAdminSession && (
            <div className="hidden md:flex items-center bg-[#EDECE6] p-1 rounded-xl border border-[#DFDDD4]">
              <span className="text-[10px] font-bold text-stone-500 uppercase px-2 tracking-wide">
                DÉMO :
              </span>
              <div className="flex items-center gap-1">
                {roles.map(r => (
                  <button
                    key={r.id}
                    id={`role-switch-${r.id}`}
                    onClick={() => switchRole(r.id)}
                    className={`px-2 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                      isAuthenticated && currentUser.role === r.id
                        ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                    }`}
                    title={r.desc}
                  >
                    {isAuthenticated && currentUser.role === r.id && <Check className="w-3 h-3 text-emerald-600" />}
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Authentication Buttons OR User Profile */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-300">
                <button
                  id="nav-login-btn"
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-[#243E36] hover:bg-[#EAE8DF] rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-[#243E36]/30"
                  title="Se connecter à votre compte"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Connexion</span>
                </button>
                <button
                  id="nav-signup-btn"
                  onClick={() => openAuthModal('signup')}
                  className="hidden sm:flex px-3.5 py-1.5 text-xs sm:text-sm font-semibold bg-[#243E36] hover:bg-[#1A2E28] text-white rounded-xl shadow-xs transition items-center gap-1.5 cursor-pointer"
                  title="Créer un compte MyStay"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Inscription</span>
                </button>
              </div>
            ) : (
              <div className="relative pl-2 border-l border-stone-300">
                <button
                  id="nav-user-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#EAE8DF] transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#243E36]"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-stone-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-stone-500 capitalize">
                      {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'hote' ? 'Hôte rural' : 'Voyageur'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-1 z-50 text-sm">
                      <div 
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          openProfileModal();
                        }}
                        className="px-4 py-3 border-b border-stone-100 flex items-center gap-3 cursor-pointer hover:bg-stone-50 transition group"
                        title="Cliquer pour voir et modifier mon profil"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-full object-cover border border-[#243E36] shadow-sm group-hover:brightness-95 transition"
                          />
                          <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#243E36] text-[#A3E5C8] rounded-full shadow-xs">
                            <Camera className="w-2.5 h-2.5" />
                          </span>
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="font-semibold text-stone-900 truncate group-hover:text-[#243E36] flex items-center justify-between">
                            <span>{currentUser.name}</span>
                            <span className="text-[10px] text-stone-400 group-hover:text-emerald-700 font-normal">Modifier</span>
                          </div>
                          <div className="text-xs text-stone-500 truncate">{currentUser.email || 'Mode Démo'}</div>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {currentUser.role === 'admin' ? 'Administrateur' : currentUser.role === 'hote' ? 'Hôte rural' : 'Voyageur'}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          id="nav-user-profile-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            openProfileModal();
                          }}
                          className="w-full text-left px-4 py-2 text-[#243E36] bg-emerald-50/50 hover:bg-emerald-100/60 font-medium flex items-center gap-2 cursor-pointer transition"
                        >
                          <Camera className="w-4 h-4 text-emerald-700" />
                          <span>Mon Profil & Changer ma photo</span>
                        </button>

                        <button
                          id="nav-user-menu-space-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setActiveView(currentUser.role === 'admin' ? 'admin_space' : currentUser.role === 'hote' ? 'host_space' : 'my_trips');
                          }}
                          className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-stone-500" />
                          <span>{currentUser.role === 'admin' ? 'Console Administration (CMS)' : 'Mon Espace personnel'}</span>
                        </button>
                        {isAdmin && (
                        <button
                          id="nav-user-menu-airtable-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            openAirtableModal();
                          }}
                          className="w-full text-left px-4 py-2 text-[#18392b] bg-emerald-50/70 hover:bg-emerald-100/70 flex items-center gap-2 cursor-pointer font-medium transition"
                        >
                          <Database className="w-4 h-4 text-emerald-700" />
                          <span>Base Airtable</span>
                        </button>
                        )}
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            openAuthModal('forgot');
                          }}
                          className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-stone-500" />
                          <span>Changer de mot de passe</span>
                        </button>
                      </div>

                      <div className="border-t border-stone-100 pt-1">
                        <button
                          id="nav-logout-btn"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

