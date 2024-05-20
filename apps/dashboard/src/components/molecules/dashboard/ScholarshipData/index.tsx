import { Alert } from '@mui/material';
import ScholarshipDataTable from '/src/components/atoms/ScholarshipDataTable';
import { formatPrice } from '/src/utils/general';
import { AvailableScholarshipDetail } from '@cometa/trpc/src/types';

interface ScholarshipDataProps {
  disabled?: boolean;
  isAssign?: boolean;
  scholarshipDetail?: AvailableScholarshipDetail;
  isLoading?: boolean;
}

const ScholarshipData = ({
  scholarshipDetail,
  disabled = false,
  isAssign = false,
  isLoading,
}: ScholarshipDataProps) => {
  const statusPercent = ['BRILLAMONT', 'PERCENT'];

  const isPercent = scholarshipDetail && statusPercent.includes(scholarshipDetail?.type);

  return (
    <div className="flex flex-col w-full py-6 gap-6">
      <div
        className={`${
          disabled ? 'text-gray-600 bg-gray-500/8' : 'text-green-800 bg-green/8'
        } flex flex-row items-center justify-between px-6 py-4 rounded-lg`}
      >
        {isLoading && !scholarshipDetail ? (
          <div className="h-5 rounded-full bg-green/8 dark:bg-green-800 w-full animate-pulse" />
        ) : (
          <>
            <span className="text-sm font-semibold">Descuento aplicado:</span>
            <div className="font-bold text-lg">
              {scholarshipDetail?.value && scholarshipDetail?.type ? (
                isPercent ? (
                  <span className="text-2xl">{scholarshipDetail.value}%</span>
                ) : (
                  <>
                    $ <span className="text-2xl">{formatPrice(scholarshipDetail.value, 'MXN').replace('$', '')}</span>{' '}
                    MXN
                  </>
                )
              ) : (
                <span className="text-2xl">-</span>
              )}
            </div>
          </>
        )}
      </div>
      {scholarshipDetail ? (
        <div className="mt-4">
          <p className="text-sm mb-4">
            {disabled
              ? 'Conceptos a los que aplicó esta beca:'
              : 'La beca aplicaría a los siguientes conceptos asignados al estudiante:'}
          </p>
          <div>
            <ScholarshipDataTable
              concepts={scholarshipDetail.affected_concepts}
              disabled={disabled}
              isAssign={isAssign}
            />
          </div>
        </div>
      ) : (
        <Alert severity="info" align-items="center">
          Este estudiante aún no tiene conceptos que se vean afectados por esta beca
        </Alert>
      )}
    </div>
  );
};

export default ScholarshipData;
