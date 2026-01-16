import type { DocumentTemplateEntity } from '@cometa/trpc/src/students/types';
import { api } from '/src/utils/api';
import { useTemplatePDF } from '/src/components/signatures/hooks/useTemplatePDF';
import { PDFPreview } from '/src/components/signatures/components/pdf-preview';
import { useSelectedSchool } from '/src/guards/AuthGuard';

interface TemplateInfoTabProps {
  template: DocumentTemplateEntity;
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear().toString().slice(-2);

  return `${day}/${month}/${year}`;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-3 px-4 border-b border-[#E5E7EB] last:border-b-0">
      <span className="text-sm text-[#637381]">{label}</span>
      <span className="text-sm text-[#212B36] font-medium">{value}</span>
    </div>
  );
}

export function TemplateInfoTab({ template }: TemplateInfoTabProps) {
  const selectedSchool = useSelectedSchool();

  const { data: creator } = api.schools.getUser.useQuery(
    {
      school_id: selectedSchool?.id as string,
      user_id: template.created_by,
    },
    { enabled: !!template.created_by && !!selectedSchool?.id }
  );

  const { data: fields, isLoading: loadingFields } = api.students.getTemplateFields.useQuery(
    { template_id: template.id },
    {
      enabled: !!template.id,
    }
  );

  const { pdfBlobUrl, isLoading: loadingPdf } = useTemplatePDF({
    templateId: template.id,
    enabled: !!template.id,
  });

  const creatorName = creator ? `${creator.first_name} ${creator.last_name}`.trim() || creator.email : '-';

  if (loadingFields || loadingPdf) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <img src="/assets/loading.svg" alt="loading" className="w-12 h-12" />
      </div>
    );
  }

  if (!fields || !pdfBlobUrl) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-[#919EAB] text-sm">No se pudo cargar el preview del documento</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 max-w-7xl mx-auto">
        <div className="bg-white border border-[#E5E7EB] rounded-lg h-fit overflow-hidden">
          <div className="text-sm font-semibold text-[#22283A] px-4 py-3 bg-[#F8F9FB] border-b border-[#E5E7EB]">
            Información general
          </div>

          <div className="space-y-0">
            <InfoRow label="Creado por" value={creatorName} />
            <InfoRow label="Fecha de creación" value={formatDate(template.created_at)} />
            <InfoRow label="Última modificación" value={formatDate(template.modified_at)} />
          </div>
        </div>

        <div>
          <PDFPreview pdfUrl={pdfBlobUrl} fields={fields} />
        </div>
      </div>
    </div>
  );
}
