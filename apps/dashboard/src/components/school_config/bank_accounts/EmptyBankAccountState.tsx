import { Button } from '@cometa/recreo/v2';
import Image from 'next/image';
import IcPlus from 'public/assets/icons/levels_grades_groups/ic_plus.svg';

export enum BankAccountStateVariant {
  NoAccounts = 'no-accounts',
  NoDeactivated = 'no-deactivated',
}

type EmptyBankAccountStateProps = {
  variant: BankAccountStateVariant;
  onAddNew?: () => void;
};

export function EmptyBankAccountState({ variant, onAddNew }: Readonly<EmptyBankAccountStateProps>) {
  const isNoAccounts = variant === BankAccountStateVariant.NoAccounts;

  return (
    <div className="bg-[#f8f9fb] rounded-[16px] p-[24px] flex flex-col items-center justify-center gap-6 h-[368px] w-full">
      <div className="flex flex-col items-center justify-start gap-4 w-full">
        <div className="w-20 h-20 bg-center bg-cover bg-no-repeat shrink-0">
          <Image
            src="/assets/images/bank_accounts.png"
            alt="Bank building"
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center justify-start gap-2 text-center w-full max-w-[466px]">
          <h3 className="text-[#22283a] text-base font-semibold font-lota leading-6">
            {isNoAccounts ? 'Registra tus cuentas bancarias' : 'No tienes cuentas desactivadas'}
          </h3>
          <p className="text-[#444c60] text-sm font-normal font-lota leading-5 max-w-[428px]">
            {isNoAccounts
              ? 'Al crear tus conceptos de cobro podrás asignarlas a ingresos específicos y definir una cuenta predeterminada.'
              : 'Las cuentas bancarias desactivadas aparecerán aquí.'}
          </p>
        </div>
      </div>
      {isNoAccounts && onAddNew && (
        <Button variant="light" size="sm" className="gap-1" onClick={onAddNew}>
          <IcPlus className="w-4 h-4" />
          Agregar cuenta
        </Button>
      )}
    </div>
  );
}
