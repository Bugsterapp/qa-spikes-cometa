import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

// events
import useSendTrackEvent from '~/hooks/useSendEvent';
import { EMAIL_LOGIN } from '~/utils/linksEmail';

const DialogButtonsContactUs = ({ sendEmail, open, onClose, ...otherProps }) => {
  const sendTrackEvent = useSendTrackEvent();
  const notifyContactUs = () => {
    sendTrackEvent('portal: Login Contact Help', {});
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
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" {...otherProps}>
        <div className="bg-transparent shadow-none flex flex-col">
          <button
            type="button"
            onClick={sendEmail}
            className="mb-2.5 px-6 py-3 bg-white text-gray-900 rounded shadow-none hover:bg-gray-50 transition-colors text-sm"
          >
            Enviar otro correo
          </button>
          <a
            href={EMAIL_LOGIN}
            target="_blank"
            rel="noopener noreferrer"
            onClick={notifyContactUs}
            className="no-underline mt-2.5"
          >
            <button
              type="button"
              className="w-full px-6 py-3 bg-white text-gray-900 rounded shadow-none hover:bg-gray-50 transition-colors text-sm"
            >
              Contáctate con nosotros
            </button>
          </a>
        </div>
      </div>
    </>
  );
};

DialogButtonsContactUs.propTypes = {
  sendEmail: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default DialogButtonsContactUs;
