import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ReviewModal: React.FC = () => {
  const { 
    activeReviewBooking, setActiveReviewBooking, addReview 
  } = useApp();

  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [authenticity, setAuthenticity] = useState(5);
  const [ecoResponsibility, setEcoResponsibility] = useState(5);
  const [hostWelcome, setHostWelcome] = useState(5);
  const [comment, setComment] = useState('');

  if (!activeReviewBooking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      bookingId: activeReviewBooking.id,
      listingId: activeReviewBooking.listingId,
      rating,
      subRatings: {
        cleanliness,
        authenticity,
        ecoResponsibility,
        hostWelcome
      },
      comment
    });

    setActiveReviewBooking(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="review-modal-container"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-[#FAF9F5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#8C5E45] uppercase tracking-wider bg-[#F7EBE4] px-2 py-0.5 rounded-full border border-[#E9D5C9]">
                Section 5 • Avis éco-tourisme
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Séjour vérifié
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Laisser un avis éco-tourisme
            </h3>
            <p className="text-[11px] text-stone-500">
              {activeReviewBooking.listingTitle} ({activeReviewBooking.listingCommune})
            </p>
          </div>
          <button
            onClick={() => setActiveReviewBooking(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          <div className="text-[11px] text-stone-600 bg-[#FAF9F5] p-3 rounded-xl border border-stone-200 leading-relaxed">
            🌿 <strong>Charte MyStay :</strong> Évaluez la <em>propreté</em>, l'<em>authenticité</em>, l'<em>engagement écologique</em> et la <em>chaleur de l'accueil</em> de votre hôte.
          </div>
          
          {/* Overall Rating */}
          <div className="text-center space-y-2 bg-[#FAF9F5] p-4 rounded-2xl border border-stone-200">
            <span className="font-bold text-stone-700 uppercase tracking-wider text-[11px]">
              Note globale du séjour
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition transform hover:scale-110"
                >
                  <Star className={`w-7 h-7 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                </button>
              ))}
            </div>
            <div className="text-sm font-bold text-stone-900">{rating} / 5 étoiles</div>
          </div>

          {/* 4 Sub-criteria from specifications */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="font-bold text-stone-700 text-[11px] uppercase tracking-wider">
              Sous-critères qualité MyStay (1 à 5) :
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Propreté du lieu :</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setCleanliness(n)}
                      className={`w-6 h-6 rounded text-[11px] font-bold ${cleanliness >= n ? 'bg-[#243E36] text-white' : 'bg-white border text-stone-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Authenticité & patrimoine :</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setAuthenticity(n)}
                      className={`w-6 h-6 rounded text-[11px] font-bold ${authenticity >= n ? 'bg-[#243E36] text-white' : 'bg-white border text-stone-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Éco-responsabilité constatée :</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setEcoResponsibility(n)}
                      className={`w-6 h-6 rounded text-[11px] font-bold ${ecoResponsibility >= n ? 'bg-[#243E36] text-white' : 'bg-white border text-stone-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Accueil humain & conseils de l'hôte :</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setHostWelcome(n)}
                      className={`w-6 h-6 rounded text-[11px] font-bold ${hostWelcome >= n ? 'bg-[#243E36] text-white' : 'bg-white border text-stone-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Free Comment */}
          <div>
            <label className="block font-bold text-stone-700 uppercase tracking-wider text-[11px] mb-1">
              Votre retour d'expérience sincère *
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Partagez ce qui vous a marqué : l'accueil, les produits locaux, le calme de la nature, la démarche écologique..."
              className="w-full p-3 rounded-xl border border-stone-300 outline-none focus:border-[#243E36]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveReviewBooking(null)}
              className="px-4 py-2 text-stone-500 hover:text-stone-800 cursor-pointer font-medium"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#243E36] hover:bg-[#1B2F29] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publier l'avis vérifié</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
