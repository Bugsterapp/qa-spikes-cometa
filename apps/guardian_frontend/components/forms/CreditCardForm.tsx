import { Controller, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCardBrand } from '~/lib/getCardBrand';

import PCICompliant from '~/public/images/pci-dss-compliant-logo.svg';
import PoweredByKushki from '~/components/atoms/guardians/PoweredByKushki';
import { Checkbox } from '~/components/Checkbox';
import { UTMLink as Link } from '~/components/UtmNavigation';

import { z } from 'zod';
import TextField from '~/components/TexField';

import { creditCardIcon, kushkiFormIcons } from '~/utils/kushkiCreditCard';

import Lock from '~/public/icons/lock.svg';
import LoadingButton from '../ui/LoadingButton';
import SubtotalCard from '../organisms/guardians/SubtotalCard';
import type { CardTypeEnum } from '@cometa/trpc';
import type { CardNumberVerification } from 'card-validator/dist/card-number';
import { cn } from '@cometa/utils';
import { validationRules } from '~/constants/kushki/credit-card/DrawerOptions';

type TCardCommission = {
  type: 'percentage';
  value: number;
  subtotal: number;
  commission: number;
  total: number;
};

export type TCommissionValues = {
  DEBIT: TCardCommission;
  CREDIT: TCardCommission;
  AMEX: TCardCommission;
};

export const cardFormSchema = z
  .object({
    number: z.string().optional(),
    name: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
  })
  .superRefine((allValues, ctx) => {
    const { number, name, expiryDate, cvv } = allValues;

    if (!number || number.length < 16) {
      ctx.addIssue({
        path: ['number'],
        message: 'El número de tarjeta debe tener al menos 16 dígitos',
        code: z.ZodIssueCode.custom,
      });
    }

    if (!name || !name.trim()) {
      ctx.addIssue({
        path: ['name'],
        message: 'Ingresa el nombre del titular de la tarjeta',
        code: z.ZodIssueCode.custom,
      });
    }

    if (!expiryDate || expiryDate.trim().length < 5) {
      ctx.addIssue({
        path: ['expiryDate'],
        message: 'Ingresa la fecha de expiración',
        code: z.ZodIssueCode.custom,
      });
    } else {
      const rule = validationRules.expiryDate.rule(expiryDate);
      if (!rule.isValid) {
        ctx.addIssue({
          path: ['expiryDate'],
          message: validationRules.expiryDate.message,
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // 5) Check 'cvv' basics
    if (!cvv || cvv.trim().length < 3) {
      ctx.addIssue({
        path: ['cvv'],
        message: 'El CVV debe tener al menos 3 dígitos',
        code: z.ZodIssueCode.custom,
      });
    } else {
      const cardBrand = getCardBrand(number ?? '');
      const isAmex = cardBrand?.card?.type === 'american-express';
      const rule = validationRules.cvv.rule(cvv, isAmex ? 4 : 3);

      if (!rule.isValid) {
        ctx.addIssue({
          path: ['cvv'],
          message: validationRules.cvv.message,
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

export type CardFormSchema = z.infer<typeof cardFormSchema>;

export const useCreditCardForm = () => useForm<CardFormSchema>({ resolver: zodResolver(cardFormSchema), mode: 'all' });

interface CreditCardFormProps {
  onSubmit: (values: CardFormSchema) => void;
  isLoading?: boolean;
  isLoadingSubtotal?: boolean;
  disabled?: boolean;
  commissionValues?: TCommissionValues;
  cardBrandCode: CardTypeEnum;
  cardData: CardNumberVerification;
  handleChangeCheckbox?: (checked: boolean) => void;
  show3DS?: boolean;
  checkedTerms?: boolean;
}

const CreditCardForm = ({
  onSubmit,
  disabled,
  isLoading,
  isLoadingSubtotal,
  commissionValues,
  cardBrandCode,
  cardData,
  handleChangeCheckbox,
  show3DS,
  checkedTerms,
}: CreditCardFormProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useFormContext<CardFormSchema>();

  const hasCommissions =
    commissionValues &&
    !!Object.keys(commissionValues).find((key) => commissionValues[key as keyof typeof commissionValues].commission);

  const handleCardMask = (input: string) => {
    const cardBrand = getCardBrand(input);

    if (cardBrand?.card?.type === 'american-express') {
      return { mask: '____ ______ _____' };
    }

    return { mask: '____ ____ ____ ____' };
  };

  return (
    <div className="relative flex flex-col mx-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn('grid grid-cols-2 mb-6 gap-x-9 gap-y-4', {
          'mb-32': hasCommissions,
        })}
      >
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

        {hasCommissions && (
          <SubtotalCard
            className="col-span-full"
            subtotalValue={commissionValues[cardBrandCode].subtotal}
            commissionValue={isLoadingSubtotal ? 0 : commissionValues[cardBrandCode].commission}
            totalValue={commissionValues[cardBrandCode].total}
            isLoading={isLoadingSubtotal}
          />
        )}

        <div className="flex items-center gap-3 px-5 py-6 col-span-full mx-auto">
          <div className="border border-[#E0E0E0F7] rounded-[9px] p-2">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-[#57537A] text-xs">Tus datos están seguros y encriptados con certificación PCI.</span>
        </div>
        {show3DS ? (
          <div className="flex items-center justify-center mb-5 col-span-full gap-x-2" id="terms-acceptance-3ds">
            <Checkbox id="terms-and-conditions-3ds" checked={checkedTerms} onCheckedChange={handleChangeCheckbox} />
            <label htmlFor="terms-and-conditions-3ds">
              <span className="text-gray-300 select-none">
                Acepto los{' '}
                <Link href="/terms" className="text-[#2850FF] underline">
                  Términos & Condiciones
                </Link>
              </span>
            </label>
          </div>
        ) : null}
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
          <LoadingButton
            loading={isLoading}
            className="w-full max-w-md mx-auto"
            disabled={isLoading || disabled || (show3DS && !checkedTerms)}
          >
            Confirmar
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default CreditCardForm;
