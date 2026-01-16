import { MainStudentEntity } from '@cometa/trpc/src/students/types';
import { InscriptionEntity } from '@cometa/trpc/src/students/types-mapping';
import { DocumentManager } from '~/components/document-manager';
import { useDocumentStepData } from '../hooks/useDocumentStepData';
import LoadingSpinner from '~/public/icons/loading-spinner.svg';

interface DocumentsStepProps {
  student: MainStudentEntity | undefined;
  currentInscription: InscriptionEntity | undefined;
  onNext: () => void;
}

export function DocumentsStep({ student, currentInscription, onNext }: DocumentsStepProps) {
  const { entityId, levelId, schoolStepId, isLoading, isReady } = useDocumentStepData({
    student,
    currentInscription,
    enabled: !!student,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner className="w-24 h-24 text-blue-100" />
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500">No se pudo cargar la configuración de documentos</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-gray-500">
        Sube cada archivo en el campo correspondiente y revisa que la información sea correcta.
      </p>
      <DocumentManager
        entityId={entityId as string}
        schoolStepId={schoolStepId as string}
        levelId={levelId}
        onSubmit={onNext}
        submitButtonText="Siguiente"
        showSubmitButton
        helperText="Archivos permitidos .pdf, .jpg, .jpeg, .png (Máximo 10 MB)"
      />
    </>
  );
}
