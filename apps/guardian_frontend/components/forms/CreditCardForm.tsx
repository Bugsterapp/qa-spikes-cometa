import { Controller, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCardBrand } from '~/lib/getCardBrand';

import PCICompliant from '~/public/images/pci-dss-compliant-logo.svg';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';

import { z } from 'zod';
import TextField from '~/components/TexField';

import { creditCardIcon, kushkiFormIcons } from '~/utils/kushkiCreditCard';

import Lock from '~/public/icons/lock.svg';
import LoadingButton from '../molecules/LoadingButton';

const cardFormSchema = z.object({
  number: z
    .string({ required_error: 'Ingresa el numero de tarjeta' })
    .min(16, 'El número de tarjeta debe tener al menos 16 dígitos'),
  name: z
    .string({ required_error: 'Ingresa el nombre del titular de la tarjeta' })
    .min(1, 'Ingresa el nombre del titular de la tarjeta'),
  expiryDate: z.string({ required_error: 'Ingresa la fecha de expiración' }).min(5, 'Ingresa la fecha de expiración'),
  cvv: z.string({ required_error: 'Ingresa el CVV' }).min(3, 'El CVV debe tener al menos 3 dígitos'),
});

export type CardFormSchema = z.infer<typeof cardFormSchema>;

export const useCreditCardForm = () => useForm<CardFormSchema>({ resolver: zodResolver(cardFormSchema) });

interface CreditCardFormProps {
  onSubmit: (values: CardFormSchema) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const CreditCardForm = ({ onSubmit, disabled, isLoading }: CreditCardFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useFormContext<CardFormSchema>();

  const cardData = getCardBrand(watch('number') ?? '');

  const handleCardMask = (input: string) => {
    const cardBrand = getCardBrand(input);

    if (cardBrand?.card?.type === 'american-express') {
      return { mask: '____ ______ _____' };
    }

    return { mask: '____ ____ ____ ____' };
  };

  return (
    <div className="relative flex flex-col mx-5">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 mb-6 gap-x-9 gap-y-4">
        <Controller
          name="number"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              maskConfig={{ modify: handleCardMask, replacement: /\d/, mask: '____ ____ ____ ____' }}
              onChange={onChange}
              value={value}
              type="text"
              className="col-span-full"
              label="Número de la tarjeta"
              LeftIcon={kushkiFormIcons.cardIcon}
              RightIcon={creditCardIcon[cardData?.card?.type as keyof typeof creditCardIcon]}
              error={errors.number?.message}
              disabled={disabled}
            />
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              className="col-span-full"
              onChange={onChange}
              value={value}
              LeftIcon={kushkiFormIcons.people}
              label="Nombre en la tarjeta"
              error={errors.name?.message}
              disabled={disabled}
            />
          )}
        />

        <Controller
          name="expiryDate"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              maskConfig={{ mask: '__/__', replacement: /\d/ }}
              onChange={onChange}
              value={value}
              LeftIcon={kushkiFormIcons.calendar}
              label="Fecha Exp"
              error={errors.expiryDate?.message}
              disabled={disabled}
            />
          )}
        />
        <Controller
          name="cvv"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              LeftIcon={kushkiFormIcons.lock}
              label="CVV"
              onChange={onChange}
              value={value}
              type="password"
              error={errors.cvv?.message}
              disabled={disabled}
            />
          )}
        />

        <div className="flex items-center gap-3 px-5 py-6 col-span-full">
          <div className="border border-[#E0E0E0F7] rounded-[9px] p-2">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-[#57537A] text-xs">Tus datos están seguros y encriptados con certificación PCI.</span>
        </div>
        <footer className="flex flex-col items-center divide-y divide-[#E0E0E0] col-span-full">
          <PoweredByKushki className="mb-6" />
          <div className="flex items-center justify-center text-xs text-[#919EAB] gap-3 pt-6">
            <PCICompliant />
            <span className="flex-1">
              Este pago es procesado de forma segura por Kushki, un proveedor de pagos PCI de nivel 1.
            </span>
          </div>
        </footer>
        <div className="fixed bottom-0 left-0 w-full p-9 backdrop-blur-sm">
          <LoadingButton loading={isLoading} className="w-full max-w-md mx-auto" disabled={disabled}>
            Confirmar
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default CreditCardForm;
