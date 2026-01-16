import { DashboardSchoolSection, DashboardStudent, InternalSchool, InternalSection } from '@cometa/trpc/src/types';
import { useRef, useState } from 'react';

import EditButton from '/public/assets/icons/ic_edit_sidepanel.svg';
import Dialog from '/src/components/atoms/Dialog';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { useGetPermissions } from '/src/guards/AuthGuard';

import Button from '../Button';
import FormEditStudentDetail from '../FormEditStudentDetail';

interface IStudentDetailEditProps {
  onClose: () => void;
  student?: DashboardStudent;
  levels: InternalSchool[];
  sections: DashboardSchoolSection[];
  studentSection?: InternalSection;
  mutation: any;
}

const StudentDetailEdit = ({
  onClose,
  student,
  levels,
  sections,
  studentSection,
  mutation,
}: IStudentDetailEditProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [ableToEdit, setAbleToEdit] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const permissions = useGetPermissions();
  const formikRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <div className="relative flex flex-col flex-auto px-8 mb-9">
        {permissions?.can_edit_student && (
          <EditButton
            className="absolute cursor-pointer top-5 z-[99999] right-32"
            onClick={() => setAbleToEdit(true)}
          />
        )}
        <SidebarHeader
          title="Información del estudiante"
          onClose={() => {
            if (ableToEdit) {
              setOpenDialog(true);
            } else {
              onClose();
            }
          }}
          boxClassName="px-0"
        />
        <FormEditStudentDetail
          formikRef={formikRef}
          student={student}
          setOpenDialog={setOpenDialog}
          levels={levels}
          sections={sections}
          studentSection={studentSection}
          ableToEdit={ableToEdit}
          setOpenConfirmDialog={setOpenConfirmDialog}
          mutation={mutation}
        />
      </div>
      <Dialog.Root open={!!openDialog} position="right" classNames="right-20">
        <Dialog.Title>¿Estás seguro que deseas cancelar la edición?</Dialog.Title>
        <div className="flex justify-center gap-x-10">
          <Button id="dialog-in-drawer-cancel" variant="ghost" size="tooltip" onClick={() => setOpenDialog(false)}>
            Atrás
          </Button>
          <Button
            variant="cancel"
            size="tooltip"
            onClick={() => {
              formikRef.current && formikRef.current.resetForm();
              setAbleToEdit(false);
              setOpenDialog(false);
              setTimeout(() => {
                onClose();
              }, 200);
            }}
          >
            Si, cancelar
          </Button>
        </div>
      </Dialog.Root>
      <Dialog.Root open={!!openConfirmDialog} position="right" classNames="right-20">
        <Dialog.Title>¿Desea guardar la edición?</Dialog.Title>
        <div className="flex justify-center gap-x-10">
          <Button
            id="dialog-in-drawer-cancel"
            variant="ghost"
            size="tooltip"
            onClick={() => setOpenConfirmDialog(false)}
          >
            Atrás
          </Button>
          <Button
            size="tooltip"
            onClick={() => {
              formikRef.current && formikRef.current.handleSubmit();
              setAbleToEdit(false);
              onClose();
            }}
          >
            Si, guardar
          </Button>
        </div>
      </Dialog.Root>
    </>
  );
};

export default StudentDetailEdit;
