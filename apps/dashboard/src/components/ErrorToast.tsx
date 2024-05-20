import { Transition } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import ExclamationSolid from '/public/assets/icons/ic_exclamation_solid.svg';
import Close from '/public/assets/icons/studentDetail/plus.svg';

type Props = {
  message: string;
  show: boolean;
  onClose?: () => void;
};

export default function ErrorToast({ message, show, onClose }: Props) {
  const [open, setOpen] = useState(show);

  return (
    <Transition
      enter="duration-200 delay-75"
      enterFrom="-translate-y-5 opacity-0"
      enterTo="translate-y-0 opacity-100"
      leaveFrom="translate-y-0 opacity-100"
      leaveTo="-translate-y-6 opacity-0"
      leave="duration-300"
      show={open}
      as={Fragment}
    >
      <div className="bg-[#FFE7D9] flex flex-nowrap py-5 px-4 gap-4 w-full rounded-lg items-center absolute inset-x-0 top-2 m-auto max-w-lg translate-y-6 z-[9999]">
        <ExclamationSolid className="text-[#FF4842] w-5 h-5" />
        <span className="text-[#7A0C2E]">{message}</span>
        <button
          className="appearance-none"
          onClick={() => {
            setOpen(false);
            if (onClose) {
              onClose();
            }
          }}
        >
          <Close className="rotate-45 translate-y-0 text-[#7A0C2E] w-3 h-3" />
        </button>
      </div>
    </Transition>
  );
}
