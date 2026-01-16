import React from 'react';
import { cn } from '~/lib/cn';

export type DrawerCode = 'success' | 'error' | 'warning';

type Props = {
  title: string;
  code: DrawerCode;
  optionMessage: string;
  children: React.ReactNode;
  information: string;
  icon: React.ReactNode;
};

const colorMap: Record<DrawerCode, string> = {
  success: 'bg-green-700',
  error: 'bg-red-700',
  warning: 'bg-yellow-700',
};

const Drawer = ({ title, code, optionMessage, children, information, icon }: Props) => (
  <>
    {/* Backdrop */}
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 z-[9999]" />

    {/* Drawer */}
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 w-full max-w-sm mx-auto pt-3 z-[100000] rounded-t-3xl',
        colorMap[code]
      )}
      data-test-id="footer-payment-result"
    >
      <div className="flex flex-col gap-2 items-center justify-around">
        {/* Icon */}
        <div className="w-full flex justify-center">{icon}</div>

        {/* Title */}
        <div className="w-7/12 flex justify-center">
          <h2 className="text-white font-semibold text-lg text-center">{title}</h2>
        </div>

        {/* White content box */}
        <div className="w-full flex justify-center">
          <div className="bg-white w-full p-3 rounded-t-[3rem]">
            <div className="flex flex-col gap-2 items-center justify-around max-w-[277px] mx-auto">
              {/* Information */}
              <div className="w-full flex justify-center">
                <p className="text-gray-900 font-medium text-sm text-center">{information}</p>
              </div>

              {/* Option message */}
              <div className="w-10/12 flex justify-center mb-5">
                <p className="text-[#637381] font-medium text-xs text-center">{optionMessage}</p>
              </div>

              {/* Children (buttons, etc.) */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Drawer;
