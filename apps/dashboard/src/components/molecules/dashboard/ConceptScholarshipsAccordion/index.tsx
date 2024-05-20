import Accordion from '/src/components/atoms/Accordion';
import BoxTextColor from '/src/components/atoms/BoxTextColor';
import { formatPrice } from '/src/utils/general';

interface ConceptScholarshipsAccordionProps {
  scholarships: any[];
  price: string;
}

const ConceptScholarshipsAccordion = ({ scholarships }: ConceptScholarshipsAccordionProps) => {
  const statusPercent = ['BRILLAMONT', 'PERCENT'];

  return (
    <Accordion
      header={
        <div>
          <h1 className="font-semibold ">Becas del estudiante</h1>
          <span className="text-xs text-[#637381]">
            Revisa las becas que asignadas al estudiante que aplican sobre este concepto.
          </span>
        </div>
      }
    >
      <div>
        <div className="flex flex-col gap-y-3">
          {scholarships?.map(({ id, type, value, name }) => {
            const valueStr = statusPercent.includes(type) ? `${parseFloat(value)}%` : formatPrice(value, 'MXN');
            return (
              <div className="flex flex-row justify-between border border-[#919EAB3D] rounded-lg p-5" key={id}>
                <span className="font-medium text-sm">{name}</span>
                <BoxTextColor text={valueStr} />
              </div>
            );
          })}
        </div>
      </div>
    </Accordion>
  );
};

export default ConceptScholarshipsAccordion;
