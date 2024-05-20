import type { ReactNode } from 'react';
import { Button } from '~/components/atoms/Button';
import { Drawer, type DrawerProps } from '~/components/Drawer';
import CreditCard from '~/public/icons/credit-card.svg';
import SuccessCheck from '~/public/icons/success-check.svg';
import InformationWhite from '~/public/icons/information-white.svg';
import Warning from '~/public/icons/warning.svg';
import LoadingButton from './molecules/LoadingButton';

type Intent = 'success' | 'error' | 'card' | 'warning';

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
      <Button size="small" className="mt-auto" onClick={onClick}>
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
  ...props
}: DrawerProps & {
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onClick: () => void;
  onCancel: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <Drawer className="md:min-h-[30%]" {...props} dismissible={!disabled}>
    <InformationWhite className="mx-auto text-[#FF4842] w-12 h-12" />
    <Drawer.Title className="mt-4 max-w-[290px] mx-auto">{title}</Drawer.Title>
    <Drawer.Description className="my-5">{description}</Drawer.Description>
    <LoadingButton
      size="small"
      className="w-full bg-[#FFE3E3] text-[#FF4842] hover:text-white hover:bg-[#FF4842] shadow-[6px_6px_20px_#96101014]"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
    >
      {confirmLabel}
    </LoadingButton>
    <Button className="w-full mt-6 text-sm" variant="transparent" onClick={onCancel} disabled={disabled}>
      {cancelLabel}
    </Button>
  </Drawer>
);
