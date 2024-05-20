import { twMerge } from 'tailwind-merge';

interface CornerTooltipProps {
  isOpen?: boolean;
  title: string;
  body: string;
  actionMethod: () => void;
  actionText: string;
  corner?: 'tl' | 'tr' | 'bl' | 'br';
  placement?: string; // 'top-20 left-28'
  modalBackground?: boolean;
}

const CornerTooltip = ({
  isOpen,
  title,
  body,
  actionMethod,
  actionText,
  corner = 'tr',
  placement,
  modalBackground,
}: CornerTooltipProps) => {
  const open = isOpen ?? false;

  const conerStyle = {
    bl: 'rounded-t-xl rounded-bl-none rounded-br-xl',
    br: 'rounded-t-xl rounded-bl-xl rounded-br-none',
    tl: 'rounded-bl-xl rounded-r-xl rounded-tl-none',
    tr: 'rounded-br-xl rounded-l-xl rounded-tr-none',
  };

  const backgroundStyles = `bg-[rgba(0,0,0,0.6)] z-10 fixed top-0 left-0 h-full w-full`;

  if (!open) return <></>;

  return (
    <>
      {modalBackground && <div className={backgroundStyles} />}
      <div
        className={twMerge(
          'flex flex-col items-center px-6 py-7 gap-4 bg-white w-[414px] h-[244px] shadow-[0_8px_16px_0_rgba(0,0,0,0.16)] z-20 absolute',
          conerStyle[corner],
          placement
        )}
      >
        <span className="font-semibold text-base text-[#212B36]">{title}</span>
        <p className="text-sm mb-2 text-[#637381] font-normal text-center min-h-[50px]">{body}</p>
        <button
          className="flex items-center justify-center w-[318px] h-[36px] py-1.5 px-4 bg-[#00AB55] shadow-[0_8px_16px_0_rgba(0,171,85,0.24)] hover:bg-[#018644] rounded-lg text-[#FFFFFF] text-sm font-bold"
          onClick={actionMethod}
        >
          {actionText}
        </button>
      </div>
    </>
  );
};

export default CornerTooltip;
