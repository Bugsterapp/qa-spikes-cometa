'use client';
import type { ReactNode } from 'react';
import { Button } from '~/components/ui/Button';
import { Drawer, type DrawerProps } from '~/components/Drawer';
import CreditCard from '~/public/icons/credit-card.svg';
import SuccessCheck from '~/public/icons/success-check.svg';
import InformationWhite from '~/public/icons/information-white.svg';
import Warning from '~/public/icons/warning.svg';
import ConfirmationDrawerIcon from '~/assets/ConfirmationDrawer.svg';
import LoadingButton from './ui/LoadingButton';

export type Intent = 'success' | 'error' | 'card' | 'warning';

export const InformationDrawer = ({
  title,
  description,
  onClick,
  intent,
  ...props
}: DrawerProps & { title: ReactNode; description: ReactNode; onClick: () => void; intent: Intent }) => {
  const icons: Record<Intent, ReactNode> = {
    success: <SuccessCheck className="mx-auto" />,
    error: <InformationWhite className="mx-auto text-[#FF4842] w-12 h-12" />,
    warning: <Warning className="mx-auto text-[#F1BD35] w-12 h-12" />,
    card: (
      <span className="w-12 h-12 rounded-full bg-[#F0EFFD] flex items-center justify-center mx-auto">
        <CreditCard className="mx-auto" />
      </span>
    ),
  };

  return (
    <Drawer className="md:min-h-[30%]" {...props}>
      {icons[intent]}
      <Drawer.Title className="mt-4 max-w-[290px] mx-auto">{title}</Drawer.Title>
      <Drawer.Description className="my-5">{description}</Drawer.Description>
      <Button size="small" theme="recreo" className="mt-auto" onClick={onClick}>
        Entendido
      </Button>
    </Drawer>
  );
};

export const ConfirmationDrawer = ({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onClick,
  onCancel,
  disabled,
  loading,
  intent = 'danger',
  ...props
}: DrawerProps & {
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onClick: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  loading?: boolean;
  intent?: 'danger' | 'info';
}) => {
  const iconConfig = {
    danger: {
      icon: <InformationWhite className="mx-auto text-[#FF4842] w-12 h-12" />,
      titleClass: 'mt-4 max-w-[290px] mx-auto text-neutral-700',
      descriptionClass: 'my-5 text-neutral-700',
      buttonClass:
        'w-full bg-[#FFE3E3] text-[#FF4842] hover:text-white hover:bg-[#FF4842] shadow-[6px_6px_20px_#96101014]',
      secondaryButtonClass: 'w-full mt-6 text-sm text-neutral-900 font-semibold',
    },
    info: {
      icon: (
        <div className="relative shrink-0 size-[68px] flex items-center justify-center mx-auto">
          <ConfirmationDrawerIcon className="w-full h-full" />
        </div>
      ),
      titleClass: 'font-semibold text-[20px] leading-normal text-[#1c1c1d] text-center w-full',
      descriptionClass: 'font-normal text-[14px] leading-[20px] text-[#535765] text-center mt-3',
      buttonClass:
        'w-full bg-[#1c1c1d] text-white font-semibold text-[14px] leading-[20px] rounded-[100px] px-[20px] py-[10px] hover:bg-[#1c1c1d] active:bg-[#1c1c1d] shadow-none',
      secondaryButtonClass:
        'w-full bg-[#f3f6fb] text-[#1c1c1d] font-semibold text-[14px] leading-[20px] rounded-[100px] px-[20px] py-[10px] mt-[10px] hover:bg-[#f3f6fb] active:bg-[#f3f6fb]',
    },
  };

  const config = iconConfig[intent];

  return (
    <Drawer className="md:min-h-[30%] pb-[28px] pt-[24px]" {...props} dismissible={!disabled}>
      <div className="flex flex-col gap-[12px] items-center mb-4">
        {config.icon}
        <Drawer.Title className={config.titleClass}>{title}</Drawer.Title>
      </div>
      <Drawer.Description className={config.descriptionClass}>{description}</Drawer.Description>
      <div className="flex flex-col items-center w-full mt-6">
        <LoadingButton
          size="small"
          className={config.buttonClass}
          onClick={onClick}
          disabled={disabled}
          loading={loading}
        >
          {confirmLabel}
        </LoadingButton>
        <Button className={config.secondaryButtonClass} variant="transparent" onClick={onCancel} disabled={disabled}>
          {cancelLabel}
        </Button>
      </div>
    </Drawer>
  );
};
