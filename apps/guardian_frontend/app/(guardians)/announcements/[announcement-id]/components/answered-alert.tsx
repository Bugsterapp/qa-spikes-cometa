import React from 'react';

interface AnsweredAlertProps {
  readonly guardianName: string;
  readonly answeredDate: string;
}

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="10" fill="#52C41A" />
    <path
      d="M8.5 12.5L6 10L5.293 10.707L8.5 13.914L14.707 7.707L14 7L8.5 12.5Z"
      fill="white"
      stroke="white"
      strokeWidth="0.5"
    />
  </svg>
);

export default function AnsweredAlert({ guardianName, answeredDate }: AnsweredAlertProps) {
  const date = new Date(answeredDate.endsWith('Z') ? answeredDate : `${answeredDate}Z`);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="bg-[#f8f9fb] flex flex-row gap-2.5 items-center justify-start px-3 py-2 relative rounded-lg w-full">
      <div className="absolute border border-[#edf2fc] border-solid inset-0 pointer-events-none rounded-lg" />

      <div className="relative w-[20px] h-[20px] z-10">
        <CheckIcon />
      </div>

      <div className="flex flex-row gap-2.5 items-center justify-start p-0 relative z-10">
        <div className="leading-[0] not-italic relative text-[#444c60] text-[14px] text-left tracking-[0.1px]">
          <p className="leading-normal">
            <span>Contestado por </span>
            <span className="font-semibold">{guardianName}</span>
            <span>
              {' '}
              el {formattedDate} a las {formattedTime} hs.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
