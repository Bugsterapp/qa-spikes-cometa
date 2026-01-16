import React, { useState, useEffect, useRef } from 'react';

import IcEdit from 'public/assets/icons/ic_edit.svg';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import SchoolCycleAndDurationDetail from '../../SchoolCycleAndDurationDetail';
import { api } from '/src/utils/api';
import { ScholarshipResumeDetail } from '/src/components/molecules/dashboard/ScholarshipResumeDetail';
import SidebarActions from '/src/components/atoms/SidebarActions';
import StudentScholarshipEdit, { ScholarshipCycleDelete } from '/src/components/students/StudentScholarshipEdit';
import Dialog from '/src/components/atoms/Dialog';
import Button from '../../Button';
import CAlert from '/src/components/atoms/CAlert';
import { StudentScholarshipRetrieve } from '@cometa/trpc/src/types';

interface ScholarshipAssignmentDetailProps {
  onClose: () => void;
  studentId: string;
  scholarshipId: string;
  isOld?: boolean;
}

const ScholarshipAssignmentDetailV2 = ({
  onClose,
  studentId,
  scholarshipId,
  isOld = false,
}: ScholarshipAssignmentDetailProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [onEdit, setOnEdit] = useState(false);
  const [showConceptAffected, setShowConceptAffected] = useState<string | undefined>();
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openDialogDesasign, setOpenDialogDesasign] = useState(false);
  const [scholarshipCycle, setScholarshipCycle] = useState<ScholarshipCycleDelete | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [copyStudentScholarshipDetail, setStudentScholarshipDetail] = useState<
    StudentScholarshipRetrieve[] | undefined
  >([]);

  const { data: studentScholarshipDetail, isPending: isLoading } = api.students.studentScholarships.useQuery(
    { scholarshipId, studentId },
    {
      enabled: !!scholarshipId,
      meta: { logErrorToSentry: true },
    }
  );

  useEffect(() => {
    if ((!studentScholarshipDetail || studentScholarshipDetail.length === 0) && !isLoading) {
      onClose();
    }
  }, [studentScholarshipDetail, isLoading]);

  const scholarshipDetail = studentScholarshipDetail && studentScholarshipDetail[0]?.scholarship;
  const student = studentScholarshipDetail && studentScholarshipDetail[0]?.student;

  const deleteScholarship = async (scholarship: ScholarshipCycleDelete) => {
    setScholarshipCycle(scholarship);
    if (scholarship.isDeletable === true) {
      setOpenDialogDelete(true);
    } else {
      setOpenDialogDesasign(true);
    }
  };

  const activateScholarship = async (scholarship: ScholarshipCycleDelete) => {
    setScholarshipCycle(scholarship);
    changeScholarshipStatus(true, scholarship);
  };

  const onClickDelete = async () => {
    if (scholarshipCycle) {
      setStudentScholarshipDetail((prevDetails) =>
        prevDetails?.filter((scholarship) => scholarship.id !== scholarshipCycle?.id)
      );
    }
    setOpenDialogDelete(false);
  };

  const onClickEdit = async () => {
    setStudentScholarshipDetail(studentScholarshipDetail);
    setShowSuccess(false);
    setOnEdit(true);
  };

  const changeScholarshipStatus = async (is_active: boolean, scholarship?: ScholarshipCycleDelete) => {
    const scholarshipData = scholarship || scholarshipCycle;
    setStudentScholarshipDetail((prevDetails) =>
      prevDetails?.map((scholarship) =>
        scholarship.id === scholarshipData?.id ? { ...scholarship, is_active } : scholarship
      )
    );
    setOpenDialogDesasign(false);
  };

  const discardChanges = () => {
    setOnEdit(false);
  };

  const submitFormExternally = () => {
    setShowSuccess(false);
    setIsSubmitting(true);
    formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  };

  return (
    <>
      <div className="flex flex-col flex-auto px-8 mb-9 font-lota">
        {showSuccess && (
          <CAlert className="my-4 absolute z-[999] w-[90%]" type="success" message="¡Cambios guardados exitosamente!" />
        )}
        <SidebarHeader
          title={isOld ? 'Detalle de beca pasada' : 'Detalle de beca o descuento asignado'}
          onClose={onClose}
          boxClassName="pt-4 pb-3"
        />
        <div className="pt-6">
          {/* @ts-ignore */}
          <ScholarshipResumeDetail scholarship={scholarshipDetail} scholarshipDetail student={student} />
        </div>
        {onEdit && (
          <StudentScholarshipEdit
            ref={formRef}
            studentScholarships={copyStudentScholarshipDetail}
            deleteScholarship={deleteScholarship}
            activateScholarship={activateScholarship}
            setIsSubmitting={setIsSubmitting}
            setIsFormValid={setIsFormValid}
            closeEdit={() => setOnEdit(false)}
          />
        )}{' '}
        {!onEdit && (
          <>
            <div className="pt-[24px] flex flex-row">
              <div className="text-[#454D64] flex flex-col gap-1 max-w-[407px]">
                <span className="font-semibold">Ciclo escolar y duración</span>
                <span className="text-sm">
                  Esta beca únicamente afectará a conceptos de los ciclos escolares seleccionados.
                </span>
              </div>
              <div className="flex items-center cursor-pointer">
                <button className="flex flex-row items-center text-center bg-transparent" onClick={onClickEdit}>
                  <div className="m-2">
                    <IcEdit fill="#00AB55" />
                  </div>
                  <span className="text-sm font-bold text-[#00AB55]">Editar</span>
                </button>
              </div>
            </div>
            <SchoolCycleAndDurationDetail
              groupedAffectedConcepts={studentScholarshipDetail}
              showConceptAffected={showConceptAffected}
              setShowConceptAffected={setShowConceptAffected}
            />
          </>
        )}
      </div>
      {onEdit && (
        <SidebarActions>
          <button
            className="bg-[#FAFBFF] px-20 py-3 text-green-400 hover:text-green-500 text-base font-bold disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] rounded-lg"
            onClick={discardChanges}
          >
            Descartar
          </button>
          <button
            disabled={isSubmitting || !isFormValid}
            className="text-white text-base font-bold px-20 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap"
            onClick={submitFormExternally}
          >
            Guardar
          </button>
        </SidebarActions>
      )}
      <Dialog.Root open={!!openDialogDelete} position="right" classNames="right-16">
        <Dialog.Title>Eliminar beneficio del ciclo escolar</Dialog.Title>
        <Dialog.Description>
          Al eliminar la beca o descuento del ciclo escolar seleccionado, el estudiante dejará de recibir el beneficio
          en todos los conceptos afectados.
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Button
            id="dialog-in-drawer-cancel"
            variant="ghost"
            size="tooltip"
            onClick={() => setOpenDialogDelete(false)}
          >
            Cancelar
          </Button>
          <Button variant="cancel" size="tooltip" onClick={onClickDelete}>
            Eliminar
          </Button>
        </div>
      </Dialog.Root>
      <Dialog.Root open={!!openDialogDesasign} position="right" classNames="right-16">
        <Dialog.Title>Desactivar ciclo escolar</Dialog.Title>
        <Dialog.Description>
          No se puede eliminar el ciclo escolar porque el estudiante ya tiene pagos realizados para este beneficio.
        </Dialog.Description>
        <div className="mb-8 text-base font-semibold text-[#637381]">
          ¿Quieres Desactivar la beca para el resto de pagos del {scholarshipCycle?.schoolCycle?.name} ?
        </div>
        <div className="flex justify-center gap-x-10">
          <Button
            id="dialog-in-drawer-cancel"
            variant="ghost"
            size="tooltip"
            onClick={() => setOpenDialogDesasign(false)}
          >
            Cancelar
          </Button>
          <Button variant="cancel" size="tooltip" onClick={() => changeScholarshipStatus(false)}>
            Desactivar
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
};
export default ScholarshipAssignmentDetailV2;
