import { AvailableScholarshipDetail, DashboardStudent, ConceptTypesEnum } from '@cometa/trpc/src/types';
import { useEffect, useState } from 'react';
import { api } from '/src/utils/api';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';

import IcClose from '/public/assets/icons/ic_close.svg';
import Exclamation from '/public/assets/icons/ic_exclamation.svg';
import Chip from '/src/components/atoms/Chip';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { formatPercentage, formatPrice } from '/src/utils/general';

interface ScholarshipResumeDetailProps {
  onClose?: () => void;
  scholarship?: AvailableScholarshipDetail;
  student?: DashboardStudent;
  scholarshipDetail?: boolean;
}

export function ScholarshipResumeDetail({
  onClose,
  scholarship,
  student,
  scholarshipDetail,
}: ScholarshipResumeDetailProps) {
  const selectedSchoolId = useSelectedSchoolId();
  const { data: conceptTypes } = api.charge.conceptTypesList.useQuery(
    { schoolId: selectedSchoolId as string },
    { enabled: !!selectedSchoolId }
  );

  const conceptTypesForShowing = [
    ConceptTypesEnum.BOOKS_AND_MATERIALS,
    ConceptTypesEnum.EXAMS_AND_CERTIFICATES,
    ConceptTypesEnum.UNIFORMS_AND_MERCH,
  ];
  const statusPercent = ['BRILLAMONT', 'PERCENT'];
  const isPercent = scholarship && statusPercent.includes(scholarship?.type);
  const [visibleChips, setVisibleChips] = useState<ConceptTypesEnum[] | undefined>([]);
  const [hiddenChips, setHiddenChips] = useState<string[]>([]);
  const maxWidth = 300;
  const estimatedChipWidth = 120;
  const showConceptTypes = scholarship?.affected_concept_types && scholarship?.affected_concept_types?.length > 0;
  const hasConcepts = scholarship && scholarship?.affected_concepts?.length > 0;

  useEffect(() => {
    if (scholarship?.affected_concept_types) {
      const maxChips = Math.floor(maxWidth / estimatedChipWidth);
      setVisibleChips(scholarship?.affected_concept_types.slice(0, maxChips));
      setHiddenChips(scholarship?.affected_concept_types.slice(maxChips));
    }
  }, [scholarship, maxWidth, estimatedChipWidth]);

  return (
    <div className="flex rounded-lg border border-[#DFE3E8] p-4 bg-[#F9FAFB] font-lota">
      <section className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex items-start flex-col h-[42px]">
            <span className="text-xs text-[#637381] leading-4">Beca</span>
            <span className="font-semibold text-base text-[#212B36]">{scholarship?.name}</span>
          </div>
          {onClose && (
            <button onClick={onClose}>
              <IcClose fill="#98A2B3" />
            </button>
          )}
        </div>
        <div className="border-t my-4 border-[#919EAB3D]" />
        <div className="flex flex-col items-start self-stretch gap-3">
          <div className="flex gap-2">
            <span className="flex-none w-[158px] text-xs leading-[18px] text-[#637381]">
              {scholarshipDetail ? 'Estudiante asignado:' : 'Estudiante a asignar:'}
            </span>
            <span className="flex-1 font-medium text-sm text-[#212B36] leading-[22px]">
              {student?.first_name} {student?.last_name}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="flex-none w-[158px] text-xs leading-[18px] text-[#637381]">Descuento aplicado:</span>
            <span className="flex-1 font-medium text-sm text-[#212B36] leading-[22px]">
              {scholarship?.value && scholarship?.type
                ? isPercent
                  ? formatPercentage(scholarship.value)
                  : '$ ' + formatPrice(scholarship.value, 'MXN').replace('$', '') + ' MXN'
                : '-'}
            </span>
          </div>
          {showConceptTypes ? (
            <div className="flex gap-2">
              <span className="flex-none w-[158px] text-xs leading-[18px] text-[#637381]">Conceptos a afectar:</span>
              <div className="flex content-start gap-2">
                {visibleChips?.map((concept, index) => (
                  <>
                    {conceptTypesForShowing.includes(concept) ? (
                      <Tooltip message={conceptTypes?.find((c) => c.id === concept)?.name} side="top">
                        <Chip key={index} intent="infoFixed" clamp="line">
                          {conceptTypes?.find((c) => c.id === concept)?.name}
                        </Chip>
                      </Tooltip>
                    ) : (
                      <Chip key={index} intent="infoFixed">
                        {conceptTypes?.find((c) => c.id === concept)?.name}
                      </Chip>
                    )}
                  </>
                ))}
                {hiddenChips.length > 0 && (
                  <Tooltip
                    message={hiddenChips
                      .map((concept) => conceptTypes?.find((c) => c.id === concept)?.name)
                      .filter(Boolean)
                      .join(', ')}
                  >
                    <Chip intent="infoFixed" className="pb-2">{`+${hiddenChips.length}`}</Chip>
                  </Tooltip>
                )}
                {scholarship?.excluded_concepts && scholarship.excluded_concepts.length > 0 && (
                  <Tooltip
                    message={
                      'Esta beca tiene' +
                      (scholarship.excluded_concepts.length == 1 ? ` concepto excluido` : ' conceptos excluidos')
                    }
                  >
                    <Exclamation className="text-[#FD6262] w-5 h-5" />
                  </Tooltip>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <span className="flex-none w-[158px] text-xs leading-[18px] text-[#637381]">Conceptos a afectar:</span>
              <span className="flex-1 font-medium text-sm text-[#212B36]">
                {hasConcepts
                  ? `${scholarship.affected_concepts.length} ` +
                    (scholarship.affected_concepts.length == 1 ? 'concepto afectado' : 'conceptos afectados')
                  : 'Ningún concepto'}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
