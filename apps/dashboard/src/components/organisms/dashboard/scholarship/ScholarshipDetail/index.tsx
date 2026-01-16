import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { createColumnHelper } from '@tanstack/react-table';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { formatPrice } from '/src/utils/general';
import React from 'react';
import { formatPercentage } from '/src/utils/number-utils';

export type Concept = {
  id: string;
  name: string;
  type: string;
  school_cycle_name: string;
};

const ScholarshipDetail: React.FC<{ scholarshipId: string }> = ({ scholarshipId }) => {
  const selectedSchool = useSelectedSchool();

  const { data: scholarship, isPending: isLoading } = api.scholarships.getScholarshipById.useQuery({
    scholarshipId,
  });

  const columnHelper = createColumnHelper<Concept>();
  const { data: conceptTypes } = api.charge.conceptTypesList.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: Boolean(selectedSchool),
    }
  );

  const columns = [
    columnHelper.accessor('name', {
      cell: (row) => (
        <div>
          <span className="text-sm text-[#212B36] truncate max-w-[450px]">{row.getValue()}</span>
        </div>
      ),
      header: () => <span className="font-semibold text-sm w-[480px]">Nombre</span>,
      size: 450,
      minSize: 450,
    }),
    columnHelper.accessor('type', {
      cell: (row) => (
        <div>
          <span className="text-sm text-[#212B36]">
            {conceptTypes?.find((concept) => concept.id.toString() === row.getValue())?.name || row.getValue()}
          </span>
        </div>
      ),
      header: () => <span className="font-semibold text-sm">Tipo de concepto</span>,
      minSize: 220,
      maxSize: 520,
    }),
    columnHelper.accessor('school_cycle_name', {
      cell: (row) => (
        <div>
          <span className="text-sm text-[#212B36]">{row.getValue()}</span>
        </div>
      ),
      header: () => <span className="font-semibold text-sm">Ciclo escolar</span>,
    }),
  ];
  if (isLoading)
    return (
      <div className="py-8 px-10 flex flex-col gap-6 bg-[#FAFBFB] min-h-[calc(100vh-155px)]">
        <div className="min-h-[180px] flex items-center justify-center">
          <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
        </div>
      </div>
    );

  const calculationType = scholarship?.calculation?.type;
  const calculationValue = scholarship?.calculation?.value;

  const specificConcepts = (scholarship?.applicability?.specificConcepts as Concept[]) || [];
  const excludedConcepts = (scholarship?.applicability?.excludedConcepts as Concept[]) || [];
  const categories = scholarship?.applicability?.categories || [];

  return (
    <div className="py-8 px-10 flex flex-col gap-6 bg-[#FAFBFB] min-h-[calc(100vh-155px)]">
      <InformationBox title="Datos generales">
        <div className="flex flex-row w-full h-9 items-center">
          <span className="w-[120px] text-xs text-[#637381] font-normal mr-4">Nombre:</span>
          <span className="font-semibold text-sm text-[#212B36]">{scholarship?.name}</span>
        </div>
        <div className="flex flex-row w-full h-9 items-center">
          <span className="w-[120px] text-xs text-[#637381] font-normal mr-4">Tipo de descuento: </span>
          <span className="font-semibold text-sm text-[#212B36]">
            {calculationType === 'PERCENTAGE' ? 'Porcentaje' : 'Monto fijo'}
          </span>
        </div>
        <div className="flex flex-row w-full h-9 items-center">
          <span className="w-[120px] text-xs text-[#637381] font-normal mr-4">Valor: </span>
          <span className="font-semibold text-sm text-[#212B36]">
            {calculationType === 'PERCENTAGE'
              ? formatPercentage(calculationValue as string)
              : calculationValue
              ? formatPrice(Number(calculationValue), 'MXN')
              : '-'}
          </span>
        </div>
      </InformationBox>
      {categories.length > 0 && (
        <InformationBox
          title="Tipos de conceptos afectados"
          subtitle="La beca afectará a todos los conceptos que pertenezcan a los tipos seleccionados."
        >
          <div className="mt-4">
            <div className="flex flex-row gap-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center gap-2 px-3 py-1 text-sm transition-colors duration-300 bg-white border rounded-full text-blue-secondary-300 border-blue-secondary-300 hover:text-white hover:bg-blue-secondary-300"
                >
                  {conceptTypes?.find((type) => type.id.toString() === category)?.name || ''}
                </div>
              ))}
            </div>
          </div>
        </InformationBox>
      )}

      {specificConcepts.length > 0 && (
        <InformationBox
          title="Conceptos afectados"
          subtitle="Estos son los conceptos seleccionados a los que aplicará la beca en caso sea asignada"
        >
          <div className="mb-4 mt-4">
            <TableVirtualized
              columns={columns}
              data={specificConcepts}
              isLoading={isLoading}
              totalCount={specificConcepts.length}
              totalFetched={specificConcepts.length}
              hasNextPage={false}
              isFetchingNextPage={false}
              fetchNextPage={() => void 0}
              maxHeight={Math.min(300, Math.max(104, (specificConcepts.length + 1) * 53.5))}
              hideFooter
              rounded
            />
          </div>
        </InformationBox>
      )}

      {excludedConcepts.length > 0 && (
        <InformationBox
          title="Conceptos excluidos"
          subtitle="La beca NO afectará a estos conceptos a pesar de pertenecer a los tipos de conceptos afectados."
        >
          <div className="mb-4 mt-4">
            <TableVirtualized
              columns={columns}
              data={excludedConcepts}
              isLoading={isLoading}
              totalCount={excludedConcepts.length}
              totalFetched={excludedConcepts.length}
              hasNextPage={false}
              isFetchingNextPage={false}
              fetchNextPage={() => void 0}
              maxHeight={Math.min(300, Math.max(104, (excludedConcepts.length + 1) * 53.5))}
              rounded
            />
          </div>
        </InformationBox>
      )}
    </div>
  );
};

type InformationBoxProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const InformationBox = ({ title, subtitle, children }: InformationBoxProps) => (
  <div className="bg-white py-6 px-8 rounded-xl border border-[#E4EBF6]">
    <div className="flex flex-col">
      <span className="font-bold text-lg text-[#212B36]">{title}</span>
      {subtitle && <span className="text-sm text-[#717993] pb-2">{subtitle}</span>}
    </div>
    <div className="border-t my-2 border-[#919EAB3D]" />
    {children}
  </div>
);

export default ScholarshipDetail;
