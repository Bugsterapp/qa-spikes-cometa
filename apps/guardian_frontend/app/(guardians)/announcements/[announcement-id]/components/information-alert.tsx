import React from 'react';

interface InformationAlertProps {
  deadline: string;
}

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM9.75 12.75H8.25V8.25H9.75V12.75ZM9.75 6.75H8.25V5.25H9.75V6.75Z"
      fill="#1890ff"
    />
  </svg>
);

export default function InformationAlert({ deadline }: InformationAlertProps) {
  const formattedDeadline = new Date(deadline).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="bg-[#f8f9fb] flex flex-row gap-2.5 items-center justify-start px-3 py-2 relative rounded-lg w-full">
      <div className="absolute border border-[#edf2fc] border-solid inset-0 pointer-events-none rounded-lg" />

      <div className="relative w-[18px] h-[18px] z-10">
        <InfoIcon />
      </div>

      <div className="flex flex-row gap-2.5 items-center justify-start p-0 relative z-10">
        <div className=" leading-[0] not-italic relative text-[#444c60] text-[14px] text-left whitespace-nowrap tracking-[0.1px]">
          <p className="leading-normal">
            <span>Fecha límite de respuesta </span>
            <span className="font-semibold">{formattedDeadline}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
