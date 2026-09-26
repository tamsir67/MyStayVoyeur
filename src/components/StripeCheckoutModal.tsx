import React, { useState } from 'react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, ShieldCheck, Lock, CreditCard, CheckCircle2, 
  Sparkles, ArrowRight, AlertCircle, Info, RefreshCw,
  Leaf, Key, MapPin
} from 'lucide-react';

interface StripeCheckoutModalProps {
  listing: Listing;
  params: {
    startDate: string;
    endDate: string;
    guestsCount: number;
  };
  onClose: () => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({ listing, params, onClose }) => {
  const { createBooking, currentUser, setActiveView, setSelectedListing } = useApp();

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [cardHolder, setCardHolder] = useState(currentUser.name);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  // Compute pricing
  const start = new Date(params.startDate);
  const end = new Date(params.endDate);
  const nightsCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  const nightlyTotal = listing.pricePerNight * nightsCount;
  const cleaningFee = listing.cleaningFee;
  const serviceFee = Number((nightlyTotal * 0.12).toFixed(2));
  const touristTax = Number((nightsCount * params.guestsCount * 1.5).toFixed(2));
  const grandTotal = Number((nightlyTotal + cleaningFee + serviceFee + touristTax).toFixed(2));

  const handlePay = () => {
    setIsProcessing(true);

    // Simulate realistic Stripe API delay
    setTimeout(() => {
      const booking = createBooking({
        listing,
        startDate: params.startDate,
        endDate: params.endDate,
        guestsCount: params.guestsCount,
        paymentMethod: 'carte_bancaire_stripe'
      });

      setIsProcessing(false);
      setIsSuccess(true);
      setCreatedBookingId(booking.id);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="stripe-checkout-modal-container"
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto"
      >
        
        {/* Stripe Header Brand */}
        <div className="bg-[#1A1F2C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-wider text-white">stripe</span>
            <span className="text-xs text-stone-400 border-l border-stone-600 pl-2">
              Paiement Sécurisé MyStay
            </span>
          </div>
          <button 
            id="close-stripe-checkout-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#8C5E45] uppercase tracking-wider bg-[#F7EBE4] px-2.5 py-1 rounded-full border border-[#E9D5C9]">
                Paiement Sécurisé Validé • Stripe DSP2
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-900 pt-1">
                Paiement Stripe confirmé avec succès !
              </h2>
              <p className="text-xs text-stone-500">
                Transaction ID : <code>pi_3Pq9_{createdBookingId}</code> • Réf : {createdBookingId}
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E6E4DD] max-w-md mx-auto text-left text-xs space-y-2.5 shadow-inner">
              <div className="font-bold text-stone-800 text-sm border-b border-stone-200 pb-2 flex items-center justify-between">
                <span>Détails de votre réservation :</span>
                <span className="text-[11px] text-emerald-700 font-normal bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Confirmée</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Hébergement :</span>
                <span className="font-semibold text-stone-900 text-right">{listing.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Dates :</span>
                <span className="font-semibold text-stone-900">
                  {new Date(params.startDate).toLocaleDateString('fr-FR')} au {new Date(params.endDate).toLocaleDateString('fr-FR')} ({nightsCount} nuits)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Montant débité (TTC) :</span>
                <span className="font-bold text-[#243E36] text-sm">{grandTotal.toFixed(2)} €</span>
              </div>
              
              {/* Access code & exact address unlocked */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Key className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Code d'accès boîte à clés :</span>
                  <span className="bg-white px-2 py-0.5 rounded font-mono font-bold text-[#243E36] border border-emerald-300">
                    MYSTAY-{createdBookingId ? createdBookingId.slice(-4).toUpperCase() : '8420'}
                  </span>
                </div>
                <div className="flex items-start gap-1 text-[11px] text-emerald-800">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span><strong>Adresse exacte débloquée :</strong> {listing.exactAddress || listing.approxLocation}</span>
                </div>
              </div>

              {/* CO2 impact notice */}
              <div className="flex items-center gap-2 text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Impact environnemental positif : <strong>{(listing.impactScoreKgCo2SavedPerNight * nightsCount).toFixed(1)} kg CO₂</strong> évités.</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="view-my-trips-after-payment-btn"
                onClick={() => {
                  onClose();
                  setSelectedListing(null);
                  setActiveView('my_trips');
                }}
                className="px-6 py-3 bg-[#243E36] hover:bg-[#1B2F29] text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md"
              >
                <span>Accéder à « Mes Voyages » (Gérer ma réservation & messagerie)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-stone-200">
            
            {/* Left Column: Order Summary & Exact Breakdown */}
            <div className="md:col-span-5 p-6 bg-[#FAF9F5] space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#8C5E45] uppercase tracking-wider bg-[#F7EBE4] px-2 py-0.5 rounded-full border border-[#E9D5C9]">
                  Étape 3 • Récapitulatif complet
                </span>
                <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                  {listing.title}
                </h3>
                <p className="text-xs text-stone-500">
                  {listing.commune} ({listing.department})
                </p>
              </div>

              <div className="aspect-16/9 rounded-xl overflow-hidden bg-stone-200 border border-stone-200">
                <img src={(listing.images && listing.images[0]) || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'} alt={listing.title} className="w-full h-full object-cover" />
              </div>

              {/* Breakdown matching README section 4 */}
              <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-200">
                <div className="flex justify-between">
                  <span>Prix des nuitées ({listing.pricePerNight} € x {nightsCount} nuits)</span>
                  <span className="font-semibold text-stone-900">{nightlyTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Forfait ménage écologique</span>
                  <span className="font-semibold text-stone-900">{cleaningFee.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission solidaire MyStay (12%)</span>
                  <span className="font-semibold text-stone-900">{serviceFee.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxe de séjour reversée à la commune</span>
                  <span className="font-semibold text-stone-900">{touristTax.toFixed(2)} €</span>
                </div>

                {/* Calcul de votre impact environnemental positif (README) */}
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Impact environnemental positif : </span>
                    <span>~{(listing.impactScoreKgCo2SavedPerNight * nightsCount).toFixed(1)} kg CO₂ économisés</span>
                  </div>
                </div>

                <div className="border-t border-stone-300 pt-3 flex justify-between items-baseline font-bold text-stone-900">
                  <span className="text-sm">Total à payer TTC</span>
                  <span className="text-2xl text-[#243E36]">{grandTotal.toFixed(2)} €</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Réglementation DSP2 & Garantie Anti-Fraude Stripe</span>
              </div>
            </div>

            {/* Right Column: Stripe Payment Form */}
            <div className="md:col-span-7 p-6 space-y-5">
              
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Moyen de paiement sécurisé
                </h4>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">CB</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">VISA</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono">MC</span>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                    Titulaire de la carte
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-stone-300 outline-none focus:border-[#243E36] focus:ring-1 focus:ring-[#243E36]"
                    placeholder="Nom Prénom"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                    Numéro de carte
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full text-xs font-mono font-medium p-2.5 pl-9 rounded-xl border border-stone-300 outline-none focus:border-[#243E36] focus:ring-1 focus:ring-[#243E36]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                      Expiration
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      className="w-full text-xs font-mono font-medium p-2.5 rounded-xl border border-stone-300 outline-none focus:border-[#243E36]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 uppercase mb-1">
                      CVC / Cryptogramme
                    </label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={e => setCvc(e.target.value)}
                      className="w-full text-xs font-mono font-medium p-2.5 rounded-xl border border-stone-300 outline-none focus:border-[#243E36]"
                    />
                  </div>
                </div>
              </div>

              {/* Split info for transparency */}
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <div className="font-bold text-stone-700">Ventilation Stripe Connect (Split Payment) :</div>
                <div>• Hôte ({listing.hostName}) : <strong>{(nightlyTotal + cleaningFee - (nightlyTotal * 0.03)).toFixed(2)} €</strong> net estimé</div>
                <div>• Commission plateforme MyStay : <strong>{serviceFee.toFixed(2)} €</strong></div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-stripe-payment-btn"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-[#635BFF] hover:bg-[#5349DF] text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:opacity-75"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Communication avec Stripe API...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Payer {grandTotal.toFixed(2)} € avec Stripe</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-stone-400">
                Paiement chiffré TLS 1.3 • 100 % sécurisé
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
