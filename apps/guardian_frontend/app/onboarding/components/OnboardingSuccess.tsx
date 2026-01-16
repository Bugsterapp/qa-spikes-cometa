import React from 'react';
import GreenCheck from '../assets/green-check.svg';
import Card from '~/components/ui/Card';
import CardIcon from '../assets/cards-icon.svg';
import InvoiceIcon from '../assets/invoice-icon.svg';
import LockIcon from '../assets/lock-icon.svg';
import Image from 'next/image';
import { Button } from '~/components/ui/Button';

export default function OnboardingSuccess({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="flex flex-col h-full px-4 pt-24">
      <div className="flex flex-col items-start pr-20 space-y-5">
        <GreenCheck className="w-16" />
        <h4 className="text-3xl text-[#1C1C1C]">
          ¡Ya estas listo para realizar <strong>tu primer pago!</strong>
        </h4>
        <span className="text-[#57537A]">Tus datos se guardaron correctamente.</span>
      </div>
      <ul className="mt-12 space-y-4">
        <Card as="li" className="flex items-center text-lg text-[#1C1C1D] gap-2.5">
          <CardIcon className="w-7" />
          <span>
            Paga con <strong>cualquier método</strong>
          </span>
        </Card>
        <Card as="li" className="flex items-center text-lg text-[#1C1C1D] gap-2.5">
          <LockIcon className="w-7" />
          <span>Datos protegidos</span>
          <Image src="/images/pci-dss-compliant-logo.svg" alt="pci-dss-compliant-logo" height={25} width={65} />
        </Card>
        <Card as="li" className="flex items-center text-lg text-[#1C1C1D] gap-2.5">
          <InvoiceIcon className="w-7" />
          <span>
            Ten control de <strong>tus facturas</strong>
          </span>
        </Card>
      </ul>

      <Button theme="recreo" onClick={onSubmit} className="w-full mt-auto">
        Empezar
      </Button>
    </div>
  );
}
