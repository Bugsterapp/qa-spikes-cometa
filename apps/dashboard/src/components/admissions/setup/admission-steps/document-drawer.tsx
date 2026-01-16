import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckboxCard } from '@cometa/recreo/v2';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import { SchoolStepDocsEntity } from '@cometa/trpc/src/admissions/types';
import { ConfigurationDrawer } from '/src/components/admissions/setup/shared';

const documentSchema = z.object({
  selectedType: z.string().min(1, 'El tipo de documento es requerido'),
  selectedLevels: z.array(z.string()).min(1, 'Debe seleccionar al menos un nivel'),
});

type DocumentFormData = z.infer<typeof documentSchema>;

type DocumentUploadDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolStepId: string;
  document?: SchoolStepDocsEntity | null;
};

export function DocumentUploadDrawer({
  isOpen,
  onClose,
  onSuccess,
  schoolStepId,
  document,
}: DocumentUploadDrawerProps) {
  const selectedSchool = useSelectedSchool();

  const { data: docTags = [] } = api.admissions.getSchoolStepDocsTags.useQuery();
  const { data: schoolLevels = [] } = api.levels.getLevels.useQuery(
    { schoolId: selectedSchool?.id as string },
    { enabled: !!selectedSchool?.id }
  );

  const upsertDocumentsMutation = api.admissions.upsertSchoolStepDocs.useMutation();

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      selectedType: '',
      selectedLevels: [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  const selectedLevels = watch('selectedLevels');

  useEffect(() => {
    if (document) {
      reset({
        selectedType: document.tag || '',
        selectedLevels: document.level_ids ? document.level_ids.split(',') : [],
      });
    } else {
      reset({
        selectedType: '',
        selectedLevels: schoolLevels.map((level) => level.id),
      });
    }
  }, [document, reset, schoolLevels]);

  const handleSave = async (data: DocumentFormData) => {
    if (!schoolStepId) return;

    const name =
      SCHOOL_STEP_DOC_TAG_NAMES[data.selectedType as keyof typeof SCHOOL_STEP_DOC_TAG_NAMES] || data.selectedType;

    await upsertDocumentsMutation.mutateAsync(
      [
        {
          id: document?.id || undefined,
          name,
          description: '',
          tag: data.selectedType,
          active: true,
          order: document?.order || 1,
          school_step_id: schoolStepId,
          level_ids: data.selectedLevels.join(','),
        },
      ],
      {
        onSuccess: () => {
          reset({
            selectedType: '',
            selectedLevels: schoolLevels.map((level) => level.id),
          });
          onSuccess();
        },
      }
    );
  };

  const handleDiscard = () => {
    reset();
    onClose();
  };

  const handleLevelChange = (levelId: string, checked: boolean) => {
    const currentLevels = selectedLevels;
    if (checked) {
      setValue('selectedLevels', [...currentLevels, levelId], { shouldValidate: true });
    } else {
      setValue(
        'selectedLevels',
        currentLevels.filter((id) => id !== levelId),
        { shouldValidate: true }
      );
    }
  };

  return (
    <ConfigurationDrawer
      isOpen={isOpen}
      onClose={handleDiscard}
      onSave={handleSubmit(handleSave)}
      title="Configurar documento"
      isLoading={upsertDocumentsMutation.isPending}
    >
      <form onSubmit={handleSubmit(handleSave)} className="space-y-5">
        <div className="space-y-1">
          <label className="block text-sm text-gray-600">Tipo de documento</label>
          <div className="relative">
            <select
              {...register('selectedType')}
              className="w-full px-4 py-3 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona el tipo de documento</option>
              {docTags.map((tag) => (
                <option key={tag} value={tag}>
                  {SCHOOL_STEP_DOC_TAG_NAMES[tag as keyof typeof SCHOOL_STEP_DOC_TAG_NAMES] || tag}
                </option>
              ))}
            </select>
          </div>
          {errors.selectedType ? (
            <span className="text-xs text-red-500 mt-1">{errors.selectedType.message}</span>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-gray-600">¿A qué niveles se solicita?</label>
          <div className="space-y-2 overflow-y-auto">
            {schoolLevels.length > 0 ? (
              schoolLevels.map((level) => (
                <CheckboxCard
                  key={level.id}
                  id={`level-${level.id}`}
                  title={level.name}
                  checked={selectedLevels.includes(level.id)}
                  onCheckedChange={(checked: boolean) => handleLevelChange(level.id, checked)}
                />
              ))
            ) : (
              <span className="text-sm text-gray-400">No hay niveles disponibles</span>
            )}
          </div>
          {errors.selectedLevels ? (
            <span className="text-xs text-red-500 mt-1">{errors.selectedLevels.message}</span>
          ) : null}
          {selectedLevels.length > 0 ? (
            <div className="text-xs text-gray-500">
              {selectedLevels.length} nivel{selectedLevels.length > 1 ? 'es' : ''} seleccionado
              {selectedLevels.length > 1 ? 's' : ''}
            </div>
          ) : null}
        </div>
      </form>
    </ConfigurationDrawer>
  );
}

export const SCHOOL_STEP_DOC_TAG_NAMES = {
  birth_certificate: 'Acta de nacimiento',
  curp: 'CURP',
  student_id_number: 'NIA',
  father_id_card: 'INE padre',
  mother_id_card: 'INE madre',
  proof_of_residence: 'Comprobante de domicilio',
  student_transfer_certificate: 'Cédula de movimiento del estudiante',
  good_conduct_letter: 'Carta de buena conducta',
  no_debt_letter: 'Carta de no adeudo',
  student_access_contract: 'Contrato de acceso a estudiantes',
  preschool_report_cards: 'Boletas de preescolar',
  elementary_report_cards: 'Boletas de primaria',
  middle_school_report_cards: 'Boletas de secundaria',
  preschool_certificate: 'Certificado de preescolar',
  elementary_certificate: 'Certificado de primaria',
  middle_school_certificate: 'Certificado de secundaria',
};
