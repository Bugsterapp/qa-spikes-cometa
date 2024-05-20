import { useEffect, useState } from 'react';
import Dialog from './atoms/Dialog';
import { ConceptStudent, StudentStatusSummary } from '@cometa/trpc/src/types';
import Button from './organisms/dashboard/Button';
import Warning from '/public/assets/icons/navigation/delinquency_warning.svg';
import CheckBox from './atoms/CheckBox';
import Info from 'public/assets/icons/ic_info.svg';
export type StudentStatus = 'no_debt' | 'due' | 'partial_paid' | 'due_and_partial';
type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpen: () => void;
  students: ConceptStudent[];
  onClose: () => void;
  onDesassign: (keepDebt: boolean) => void;
  studentStatus: StudentStatusSummary;
  isLoading?: boolean;
  isMutating?: boolean;
};

export default function DesassignModal({
  open,
  setOpen,
  onClose,
  onDesassign,
  students,
  studentStatus,
  onOpen,
  isLoading,
  isMutating,
}: Props) {
  const [keepDueOrders, setKeepDueOrders] = useState(false);
  const [keepProcessOrders, setKeepProcessOrders] = useState(false);
  useEffect(() => {
    if (open) {
      onOpen();
    }
  }, [open]);
  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            onClose();
          }
        }}
      >
        {isLoading ? (
          <div className="min-h-[180px] flex items-center justify-center">
            <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
          </div>
        ) : (
          <>
            <Dialog.Title>
              {students.length && students.length > 1 ? (
                '¿Quieres desasignar a estos estudiantes?'
              ) : (
                <div className="font-semibold text-base">
                  <span>¿Quieres desasignar a </span>
                  <span className="text-[#212B36]">
                    {students[0]?.first_name} {students[0]?.last_name}?
                  </span>
                </div>
              )}
            </Dialog.Title>
            <Dialog.Description>
              <div className="flex flex-col gap-2">
                <span>
                  Al desasignar a los estudiantes, estos ya no podrán visualizar este concepto en el portal de pagos de
                  Cometa.
                </span>
                <span>
                  La información de todos los pagos realizados permanecerá accesible para el colegio a través del
                  dashboard.
                </span>
              </div>
            </Dialog.Description>
            {studentStatus?.status === 'due' && (
              <>
                <div className="bg-[#FFF7CD] rounded-lg py-3 px-2 flex items-center justify-between gap-2">
                  <Warning className="text-[#FFC107] w-7 h-7" />
                  <p className="text-sm text-[#7A4F01] text-left py-2">
                    {students.length && students.length > 1 ? (
                      <span>
                        {studentStatus?.due} {studentStatus?.due === 1 ? 'estudiante tiene' : 'estudiantes tienen'}{' '}
                        órdenes vencidas que serán eliminadas.
                        <br />
                      </span>
                    ) : (
                      <span>
                        Este estudiante tiene órdenes vencidas que serán eliminadas.
                        <br />
                      </span>
                    )}
                  </p>
                </div>
                <label className="flex items-center gap-3 p-2 mt-3 cursor-pointer select-none">
                  <CheckBox checked={keepDueOrders} onChange={() => setKeepDueOrders(!keepDueOrders)} />
                  <span className="text-sm mt-0.5">Mantener las órdenes vencidas luego de desasignar.</span>
                </label>
              </>
            )}
            {studentStatus?.status === 'due_and_partial' && (
              <>
                <div className="bg-[#FFF7CD] rounded-lg py-3 px-4 flex items-center justify-between gap-3 mt-4">
                  <Warning className="text-[#FFC107] w-7 h-7" />

                  <span className="text-sm text-[#7A4F01] text-left flex items-center">
                    <ul className="flex justify-center flex-col">
                      <li>Se mantendrán las órdenes pagadas parcialmente o en proceso.</li>
                      <li>Se eliminarán las órdenes que no han sido pagadas.</li>
                    </ul>
                    <br />
                  </span>
                </div>
                <label className="flex items-center gap-3 p-2 mt-3 cursor-pointer select-none">
                  <CheckBox checked={keepProcessOrders} onChange={() => setKeepProcessOrders(!keepProcessOrders)} />
                  <span className="text-sm">Mantener las órdenes vencidas luego de desasignar.</span>
                </label>
              </>
            )}
            {studentStatus?.status === 'partial_paid' && (
              <div className="bg-[#D0F2FF] rounded-lg py-3 px-4 flex items-center justify-between gap-3 mt-4">
                <div>
                  <Info className="text-[#1890FF] w-7 h-7" />
                </div>
                <p className="text-sm text-[#04297A] text-left">
                  {students.length && students.length > 1 ? (
                    <span>
                      {studentStatus?.partial_paid}{' '}
                      {studentStatus?.partial_paid === 1 ? 'estudiante tiene' : 'estudiantes tienen'} órdenes pagadas
                      parcialmente o en proceso que permanecerán asignadas y pendientes de ser completadas.
                      <br />
                    </span>
                  ) : (
                    <span>
                      Este estudiante tiene órdenes pagadas parcialmente o en proceso que permanecerán asignadas y
                      pendientes de ser completadas.
                      <br />
                    </span>
                  )}
                </p>
              </div>
            )}
            <div className="flex justify-around max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-5">
              <Dialog.Close
                onClick={() => {
                  setOpen(false);
                  onClose();
                }}
              >
                <Button className="w-[156px]" variant="ghost" size="small">
                  No, volver
                </Button>
              </Dialog.Close>
              <Button
                className="w-[156px] shadow-[#FF4842] bg-[#FF4842] hover:bg-[#C73833] disabled:bg-blue-300 disabled:cursor-wait"
                size="small"
                onClick={() => {
                  onDesassign(keepDueOrders || keepProcessOrders);
                }}
                disabled={isMutating}
              >
                {isMutating ? <img src="/assets/oval.svg" alt="loading" className="mx-auto h-7" /> : 'Sí, desasignar'}
              </Button>
            </div>
          </>
        )}
      </Dialog.Root>
    </>
  );
}
