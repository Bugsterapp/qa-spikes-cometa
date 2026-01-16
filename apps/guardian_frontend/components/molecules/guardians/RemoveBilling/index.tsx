import { Button } from '@cometa/recreo/v2';

type RemoveBillingProps = {
  onClick: () => void;
};

export default function RemoveBilling({ onClick }: RemoveBillingProps) {
  return (
    <Button onClick={onClick} className="text-[#E65959] bg-transparent  hover:bg-red-50 transition-colors">
      Eliminar mis datos de facturación
    </Button>
  );
}
