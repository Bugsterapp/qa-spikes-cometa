import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import { Tooltip } from '../Tooltip';

export type DropdownConceptID = {
  handleClick: () => void;
  allowAction?: boolean;
  label: string;
};

const ThreeDotsDropdown = ({ handleClick, allowAction, label }: DropdownConceptID) => (
  <div>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="mr-8 flex-col rounded-md border border-[#00AB55] px-3 py-2 flex items-center justify-center bg-white outline-none"
          aria-label={label}
          data-testid={`${label}-threeDotbutton`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9.99998" cy="10.0002" r="1.66667" fill="#00AB55" />
            <ellipse cx="9.99998" cy="4.16667" rx="1.66667" ry="1.66667" fill="#00AB55" />
            <ellipse cx="9.99998" cy="15.8332" rx="1.66667" ry="1.66667" fill="#00AB55" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-md p-[5px] fixed -right-[20px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-20"
          sideOffset={5}
        >
          <div className={`${!allowAction ? 'cursor-not-allowed' : ''}`}>
            <Tooltip
              message="Este concepto no puede ser eliminado debido a que tiene estudiantes asignados y/o pagos registrados anteriormente. Si necesitas ayuda con este concepto, escríbenos a nuestro chat."
              disableHover={allowAction}
            >
              <DropdownMenu.Item
                disabled={!allowAction}
                className="text-red-500 rounded-md flex items-center justify-center outline-none data-[disabled]:text-[#919EAB] data-[disabled]:pointer-events-none data-[highlighted]:bg-white data-[highlighted]:text-red-600"
              >
                <button
                  className="flex gap-1 py-3 px-6 w-full"
                  data-testid={`${label}-button`}
                  onClick={handleClick}
                  disabled={!allowAction}
                >
                  <IcTrash className={`${!allowAction ? 'text-[#919EAB]' : 'text-error'}`} />
                  {label}
                </button>
              </DropdownMenu.Item>
            </Tooltip>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  </div>
);

export default ThreeDotsDropdown;
