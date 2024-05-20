import { commerces } from '~/utils/whereToPay';
import Accordion from '~/components/atoms/guardians/Accordion';
import { formatPrice } from '~/utils/orders';
import Image from 'next/image';
import { cn } from '~/lib/cn';

interface AccordionKushkiWhereToPayProps {
  priceTotal: number;
  currency: string;
  showAgreements?: boolean;
}

export const AccordionKushkiWhereToPay = ({
  priceTotal,
  currency,
  showAgreements = false,
}: AccordionKushkiWhereToPayProps) => {
  const validCommerces = commerces.filter((element) => element.maxAmountAllowed >= priceTotal);
  const invalidCommerces = commerces.filter((element) => element.maxAmountAllowed < priceTotal);
  const commercesSorted = [...validCommerces, ...invalidCommerces];
  return (
    <Accordion tittle={<span className="text-[#091A7A] text-lg">¿Dónde pagar?</span>}>
      <>
        <div className="flex flex-col mt-1 text-xs font-medium text-gray-600 gap-y-4">
          <span>Podrás pagar en cualquiera de estas sucursales una vez generado tu PIN de pago.</span>
          <div className="border-b border-[#D0D0D0] h-px w-full" />
          <span>
            Ten en cuenta que cada sucursal tiene un monto diferente de comisión. Por favor recuerda preguntar en tu
            sucursal antes de pagar.
          </span>
        </div>
        <div className="flex flex-col [&>div]:pt-4 divide-y-[1px] divide-[#D0D0D0] gap-y-4">
          {commercesSorted?.map((element) => (
            <div
              className={cn(
                'flex flex-row items-center',
                element.maxAmountAllowed < priceTotal ? 'opacity-40' : 'opacity-100'
              )}
              key={`${element.name}`}
            >
              <div className="mt-2">
                <Image src={element.logo} alt={element.name} height={48} width={48} />
              </div>
              <div className="ml-4">
                <p className="text-sm">{element.name}</p>
                <p className="text-[10px] text-[#808080]">
                  Monto máximo permitido: {formatPrice(element.maxAmountAllowed, currency)} {currency}
                </p>
                {showAgreements ? <p className="text-[10px]">Convenio: {element.agreement}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </>
    </Accordion>
  );
};

export default AccordionKushkiWhereToPay;
