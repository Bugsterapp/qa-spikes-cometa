import { ReactNode } from 'react';
import { formatPrice } from '/src/utils/general';
import { AffectedConcept } from '@cometa/trpc/src/types';

interface ScholarshipDataTableProps {
  concepts: AffectedConcept[];
  disabled?: boolean;
  isAssign?: boolean;
}

interface Props {
  children?: ReactNode;
  disabled?: boolean;
}

const ConceptName = ({ children }: Props) => <span className="text-sm font-medium">{children}</span>;
const PrevPrice = ({ children }: Props) => <span className="text-xs line-through text-gray-600">{children}</span>;
const NewPrice = ({ children, disabled }: Props) => (
  <span className={`text-sm font-semibold ${disabled ? 'text-gray-600' : 'text-green'}`}>{children}</span>
);

const ScholarshipDataTable = ({ concepts, disabled, isAssign = false }: ScholarshipDataTableProps) => {
  const columns = ['Nombre', isAssign ? 'Monto previo' : 'Monto original', 'Después de beca'];

  const styleFirstCol = ' text-left rounded-tl-lg';
  const styleLastCol = ' text-left rounded-tr-lg';
  return (
    <table className="table-fixed w-full">
      <thead>
        <tr className="text-gray-600 font-medium text-sm border-solid bg-gray-200 border-b border-gray-600">
          {columns.map((column, index) => {
            let classNameStr = 'py-[9px] px-3';

            if (!index) classNameStr = classNameStr + styleFirstCol;
            else if (index == columns.length - 1) classNameStr = classNameStr + styleLastCol;

            return (
              <th key={index} className={classNameStr}>
                <span>{column}</span>
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-400">
        {concepts.length === 0 ? (
          <tr className="py-5 flex items-center justify-center w-full px-3">
            <td colSpan={0}>Sin resultados</td>
          </tr>
        ) : null}
        {concepts.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            <td className="text-left px-3 py-5">
              <ConceptName>{row.name}</ConceptName>
            </td>
            <td className="text-right px-3 py-5">
              <PrevPrice>{`${formatPrice(row.prev_price, 'MXN')} MXN`}</PrevPrice>
            </td>
            <td className="text-right px-3 py-5">
              <NewPrice disabled={disabled}>{`${formatPrice(row.new_price, 'MXN')} MXN`}</NewPrice>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ScholarshipDataTable;
