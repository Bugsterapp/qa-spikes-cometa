import IcCloseXStroke from '/public/assets/icons/ic_close_x_stroke.svg';

type OnboardingConfirmationDialogProps = {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  studentsCount: number;
  conceptsCount: number;
  scholarshipsCount: number;
};

export function OnboardingConfirmationDialog({
  isVisible,
  onConfirm,
  onCancel,
  onClose,
  studentsCount,
  conceptsCount,
  scholarshipsCount,
}: OnboardingConfirmationDialogProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(34,40,58,0.8)] z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-[0px_10px_15px_-3px_rgba(34,40,58,0.1),0px_4px_6px_-4px_rgba(34,40,58,0.1)] border border-[#d0d8e9] w-[425px] max-w-[425px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
        >
          <IcCloseXStroke className="w-full h-full" />
        </button>

        <div className="flex flex-col gap-1.5 items-start justify-start text-center w-full mb-4">
          <h2 className="font-semibold text-[18px] leading-[28px] text-[#22283a] w-full">
            Confirmar envío de información
          </h2>
          <p className="font-normal text-[14px] leading-[20px] text-[#697086] w-full">
            La información será validada y te notificaremos cuando tu institución este lista para operar.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-4">
          <div className="bg-[#f8f9fb] h-[60px] rounded-[12px] border border-[#d0d8e9] flex items-center justify-center p-4">
            <div className="font-semibold text-[16px] leading-[24px] text-[#22283a] tracking-[-0.4px]">
              {studentsCount} estudiantes
            </div>
          </div>

          <div className="bg-[#f8f9fb] h-[60px] rounded-[12px] border border-[#d0d8e9] flex items-center justify-center p-4">
            <div className="font-semibold text-[16px] leading-[24px] text-[#22283a] tracking-[-0.4px]">
              {conceptsCount} conceptos
            </div>
          </div>

          <div className="bg-[#f8f9fb] h-[60px] rounded-[12px] border border-[#d0d8e9] flex items-center justify-center p-4">
            <div className="font-semibold text-[16px] leading-[24px] text-[#22283a] tracking-[-0.4px]">
              {scholarshipsCount} becas
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onConfirm}
            className="bg-[#873aff] text-white font-semibold text-[14px] leading-[20px] px-4 py-2 rounded-full h-9 w-full shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)] hover:bg-[#7c35e6] transition-colors"
          >
            Confirmar información
          </button>
          <button
            onClick={onCancel}
            className="bg-white text-[#697086] font-semibold text-[14px] leading-[20px] px-4 py-2 rounded-full h-9 w-full border border-[#d0d8e9] shadow-[0px_1px_2px_0px_rgba(34,40,58,0.05)] hover:bg-[#f8f9fb] transition-colors"
          >
            Atrás
          </button>
        </div>
      </div>
    </div>
  );
}
