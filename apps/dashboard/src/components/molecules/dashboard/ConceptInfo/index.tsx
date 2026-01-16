import { ReactNode } from 'react';
import BoxTextColor from '/src/components/atoms/BoxTextColor';
import { StudentConceptDetailSerializerV2 } from '@cometa/trpc/src/types';

interface ConceptInfoProps {
  conceptData: StudentConceptDetailSerializerV2;
  isOptional?: boolean;
}
interface Props {
  children?: ReactNode;
}

type CompoundingsNoSingle = {
  [key: string]: string;
};

const Label = (props: Props) => <span className="text-sm text-[#637381] font-bold pt-1">{props.children}</span>;
const Value = (props: Props) => <span className="text-sm font-medium ">{props.children}</span>;
const CompoundinText = (props: Props) => <span className="text-sm font-medium">{props.children}</span>;

const ConceptInfo = ({ conceptData }: ConceptInfoProps) => {
  const statusPercent = ['BRILLAMONT', 'PERCENT'];
  const { interests, early_bird_discounts } = conceptData;

  const interestsFormated = interests.map(({ type, value, payday, compounding }, index) => {
    const compoundingsNoSingle: CompoundingsNoSingle = {
      DAILY: 'Diariamente',
      WEEKLY: 'Semanalmente',
      MONTHLY: 'Cada mes',
      FORTNIGHTLY: 'Cada 15 días',
    };
    const daysOffSet = () => {
      const lastPositionsDay = ['ultimo', 'penultimo', 'antepenultimo'];
      if (!payday?.day) return;
      const { day } = payday;
      return day < 0 ? `${lastPositionsDay[day * -1 - 1]} días` : `${day} días`;
    };
    const frequency = compounding === 'SINGLE' ? 'Una única vez' : compoundingsNoSingle[compounding];
    const days = daysOffSet();
    const compoundinText = `${frequency}, ${days} después de la fecha de vencimiento`;
    const valueStr = statusPercent.includes(type) ? `${value}%` : `${value} MXN`;
    return (
      <div key={index} className="flex flex-col items-start">
        <div key={index} className="flex flex-row items-center justify-end gap-x-2">
          <BoxTextColor text={valueStr} status="error" />
          <CompoundinText>{compoundinText}</CompoundinText>
        </div>
      </div>
    );
  });

  const earlyBirdsList = (early_bird_discounts as Record<string, unknown>[]).map(
    ({ discount_type, discount_value, up_to_days }, index) => {
      const text = statusPercent.includes(discount_type as string) ? `${discount_value}%` : `${discount_value} MXN`;
      const successDay =
        up_to_days === 0
          ? 'Antes de la fecha de vencimiento'
          : `Hasta ${up_to_days} día${(up_to_days as number) > 1 ? 's' : ''} de la fecha de vencimiento`;
      return (
        <div key={index} className="flex flex-row items-center justify-start gap-x-2 font-medium">
          <BoxTextColor text={text} />
          <Value>{successDay}</Value>
        </div>
      );
    }
  );

  return (
    <div className="bg-[#919EAB14] rounded-lg px-6 py-5 flex flex-col gap-y-3">
      <>
        <div className="flex flex-col gap-4">
          <Label>Recargos por morosidad:</Label>
          <hr className="border-t border-gray-300" />
          <div className="flex flex-col gap-4 pl-1 ">
            {interestsFormated.length === 0 ? (
              <span className="text-[#919EAB] italic text-sm">
                Al crear este concepto, no se le agregaron recargos por morosidad.
              </span>
            ) : (
              interestsFormated
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Label>Dscto. pronto pago:</Label>
          <hr className="border-t border-gray-300" />
          <div className="flex flex-col gap-4 pl-1 ">
            {earlyBirdsList.length === 0 ? (
              <span className="text-[#919EAB] italic text-sm">
                Al crear este concepto, no se le agregaron descuentos pronto pago.
              </span>
            ) : (
              earlyBirdsList
            )}
          </div>
        </div>
      </>
    </div>
  );
};

export default ConceptInfo;
