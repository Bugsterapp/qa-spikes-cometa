import React, { useState, useEffect } from 'react';
import { RATED_CSAT_PAYMENT } from '~/utils/storesKeys';
import ToggleFeature from '~/components/molecules/common/ToggleFeature';
import { FEATURE_RATING_CSAT_PAYMENT } from '~/utils/featuresKeys';
import { useAlert } from '~/hooks';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';

interface DialogRatingProps {
  open: boolean;
  onClose: () => void;
  text: string;
  segmentName: string;
  statusPayment?: string;
}
/**
 * Comment rating dialog
 */

const DialogRating: React.FC<DialogRatingProps> = ({ open, onClose, text, segmentName, statusPayment }) => {
  const _router = useRouter();
  const { type = null, method = null } = _router.query;
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const sendTrackEvent = useSendTrackEvent();
  const { setAlert } = useAlert();

  const handleClose = (skip = true) => {
    onClose();
    sendTrackEvent(`portal: ${segmentName}`, {
      score: skip ? null : rating,
      comment,
      status: statusPayment,
      type,
      method,
    });
    localStorage.setItem(RATED_CSAT_PAYMENT, skip ? '' : '1');
    if (!skip) setAlert('¡Gracias por calificar!', 'success');
  };

  // Handle body scroll lock when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleClose]);

  // Helper function to determine if a star should be highlighted
  const isStarHighlighted = (star: number): boolean => {
    const activeRating = hoveredStar || rating;
    if (!activeRating) return false;

    // For the 5th star, only highlight it if it's the exact one being hovered/selected
    if (star === 5) {
      return activeRating === 5;
    }

    // For stars 1-4, highlight if the star is less than or equal to the active rating
    return star <= activeRating;
  };

  return (
    <ToggleFeature
      allowComponent={
        <>
          {open && (
            <>
              {/* Backdrop - slightly darkened background */}
              <div
                className="fixed inset-0 bg-black/40 z-[1300] transition-opacity"
                onClick={() => handleClose()}
                aria-hidden="true"
              />

              {/* Dialog - centered modal */}
              <div
                className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
                role="dialog"
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                {/* Modal container with soft shadow and 24px padding */}
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                  {/* Title - bold and centered */}
                  <h2 id="alert-dialog-title" className="text-gray-800 font-bold text-center text-lg mb-6">
                    {text}
                  </h2>

                  {/* Star Rating Section */}
                  <div className="flex flex-col items-center">
                    <div className="flex gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          className="focus:outline-none transition-transform hover:scale-110 bg-transparent"
                        >
                          <svg
                            className={`w-10 h-10 transition-colors ${
                              isStarHighlighted(star) ? 'text-[#FFA500]' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>
                      ))}
                    </div>

                    {/* Textarea - appears only after star selection */}
                    {!!rating && (
                      <div className="w-full mb-6">
                        <textarea
                          value={comment}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const newComent = e.target.value;
                            setComment(newComent);
                          }}
                          placeholder={rating ? `¿Cuéntanos por qué marcaste ${rating}? (opcional)` : ''}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent resize-none text-sm placeholder-gray-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col items-center gap-3">
                    {!!rating && (
                      <button
                        type="button"
                        onClick={() => {
                          handleClose(false);
                        }}
                        disabled={!rating}
                        className="w-full py-3 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2a4ae6] transition-colors shadow-md text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Enviar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleClose()}
                      className="py-2 text-gray-500 hover:text-gray-700 transition-colors text-base bg-transparent"
                    >
                      Omitir
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      }
      featureName={FEATURE_RATING_CSAT_PAYMENT}
    />
  );
};

export default DialogRating;
