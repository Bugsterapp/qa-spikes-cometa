import { useState } from 'react';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import Sheet from '/src/components/atoms/Sheet';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import Button from '/src/components/organisms/dashboard/Button';
import useAlert from '/src/hooks/useAlert';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { CredentialMockup } from '/src/components/credentials/shared/credential-mockup';
import { CredentialCard } from '/src/components/credentials/shared/credential-card';
import { CredentialProvider } from '/src/components/credentials/credential-provider';
import type { CredentialTemplateEntity } from '@cometa/trpc/src/students/types';
import type { DashboardStudentDetail, InscriptionSection } from '@cometa/trpc';
import { CredentialTemplateType } from '@cometa/trpc/src/students/types';
import type { StudentData, SchoolData, CredentialConfig } from '/src/components/credentials/types';

interface CredentialTemplateSidePanelProps {
  open: boolean;
  onClose: () => void;
  student?: DashboardStudentDetail;
}

export default function CredentialTemplateSidePanel({ open, onClose, student }: CredentialTemplateSidePanelProps) {
  const studentId = student?.id || '';
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();
  const trackEvent = useSendTrackEventWithUserName();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: templatesData, isLoading } = api.credentials.listTemplates.useQuery(
    {
      schoolId: selectedSchool?.id ?? '',
      page: 1,
      limit: 100,
      type: CredentialTemplateType.Student,
    },
    {
      enabled: open && !!selectedSchool?.id,
    }
  );

  const templates = templatesData?.results ?? [];

  function createStudentDataFromStudent(studentData: DashboardStudentDetail, expiresAt?: string): StudentData {
    const activeInscription = studentData.inscription_section?.find(
      (ins: InscriptionSection) => ins.school_cycle?.is_active
    );

    return {
      name: studentData.first_name,
      lastName: studentData.last_name || '--',
      photo: studentData.photo || '/assets/default-avatar.jpg',
      level: studentData.section?.level_name || activeInscription?.section?.level_name || '--',
      cct: '--',
      grade: studentData.section?.grade || activeInscription?.section?.grade || '--',
      enrollment: studentData.enrollment_code || '--',
      curp: studentData.identifier || '--',
      cycle: activeInscription?.school_cycle?.name || new Date().getFullYear().toString(),
      expires_at: expiresAt,
    };
  }

  function createSchoolData(school: ReturnType<typeof useSelectedSchool>): SchoolData {
    return {
      name: school?.name || '',
      logo: school?.logo || '/assets/cometa-logo.svg',
    };
  }

  const selectedTemplateEntity = templates.find((t) => t.id === selectedTemplate);
  const config = selectedTemplateEntity?.config;

  const studentData =
    student && config
      ? createStudentDataFromStudent(student, (config as unknown as CredentialConfig)?.front_fields?.expires_at?.value)
      : null;

  const schoolData = createSchoolData(selectedSchool);

  function handleSelectTemplate(templateId: string) {
    setSelectedTemplate(templateId);
  }

  const generateCredentialsMutation = api.credentials.generateFilteredCredentials.useMutation({
    onSuccess: (response) => {
      const uint8Array = new Uint8Array(response.data);
      const blob = new Blob([uint8Array], { type: 'application/zip' });
      const filename = `credencial_${student?.first_name}_${student?.last_name}.zip`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setAlertState({
        severity: 'success',
        message: 'Credencial generada exitosamente',
        open: true,
      });

      trackEvent('dashboard: credential generated successfully', {
        school_id: selectedSchool?.id,
        student_id: studentId,
        template_id: selectedTemplate,
      });

      onClose();
      setSelectedTemplate(null);
      setIsGenerating(false);
    },
    onError: (error) => {
      setAlertState({
        severity: 'error',
        message:
          'Ha ocurrido un error al generar la credencial. Intenta nuevamente o contacta a nuestro equipo de soporte.',
        open: true,
      });

      trackEvent('dashboard: credential generation failed', {
        school_id: selectedSchool?.id,
        student_id: studentId,
        template_id: selectedTemplate,
        error: error.message,
      });
      setIsGenerating(false);
    },
  });

  function handleGenerate() {
    if (!selectedTemplate || !selectedSchool?.id || !studentId) return;

    trackEvent('dashboard: generate credential clicked', {
      school_id: selectedSchool?.id,
      student_id: studentId,
      template_id: selectedTemplate,
    });

    setIsGenerating(true);

    generateCredentialsMutation.mutate({
      templateId: selectedTemplate,
      schoolId: selectedSchool.id,
      studentIds: [studentId],
    });
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Sheet.Content large>
        <div className="flex flex-col h-full">
          <div className="sticky top-0 z-10 w-full bg-white border-b border-[#E9EEF7]">
            <SidebarHeader title="Selecciona la plantilla a utilizar" onClose={onClose} boxClassName="px-8 py-5" />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex gap-8 p-8 h-full">
              <div className="flex-shrink-0 flex items-center justify-center">
                {selectedTemplate && config && studentData ? (
                  <CredentialProvider initialStudentData={studentData}>
                    <CredentialMockup orientation={(config as unknown as CredentialConfig).orientation}>
                      <CredentialCard
                        config={config as unknown as CredentialConfig}
                        studentData={studentData}
                        schoolData={schoolData}
                      />
                    </CredentialMockup>
                  </CredentialProvider>
                ) : (
                  <div className="flex items-center justify-center w-[356px] h-[512px] border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-400 text-sm">Selecciona una plantilla para ver el preview</p>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <img src="/assets/oval.svg" alt="loading" className="h-8" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-base text-gray-600 mb-2">No hay plantillas disponibles</p>
                    <p className="text-sm text-gray-500">
                      Crea una plantilla de credencial para poder generar credenciales.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[#454D64] mb-4">Nombre</p>
                    {templates.map((template) => (
                      <TemplateItem
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplate === template.id}
                        onSelect={handleSelectTemplate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 w-full bg-white border-t border-[#E9EEF7] px-8 py-4 shadow-[0px_-4px_16px_rgba(0,_0,_0,_0.08)]">
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isGenerating} className="px-6 py-3">
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={!selectedTemplate || isGenerating}
                className="px-6 py-3"
              >
                {isGenerating ? <img src="/assets/oval.svg" alt="loading" className="h-5" /> : 'Generar credencial'}
              </Button>
            </div>
          </div>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}

interface TemplateItemProps {
  template: CredentialTemplateEntity;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function TemplateItem({ template, isSelected, onSelect }: TemplateItemProps) {
  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`
        w-full px-5 py-4 rounded-2xl border-2 text-left transition-all
        flex items-center justify-between
        ${
          isSelected
            ? 'border-[#00AB55] bg-[#00AB5508]'
            : 'border-[#E9EEF7] bg-white hover:border-[#00AB5544] hover:bg-[#00AB5504]'
        }
      `}
    >
      <span className={`text-sm font-medium ${isSelected ? 'text-[#00AB55]' : 'text-[#1C1C1D]'}`}>{template.name}</span>

      <div
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${isSelected ? 'border-[#00AB55]' : 'border-[#C4CDD5]'}
        `}
      >
        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#00AB55]" />}
      </div>
    </button>
  );
}
