import { Button } from '@cometa/recreo/v2';
import {
  DocumentTemplateEntity,
  DocumentInstanceEntity,
  DocumentInstanceStatus,
} from '@cometa/trpc/src/students/types';

type DocumentSignerCardProps = {
  template: DocumentTemplateEntity;
  instance?: DocumentInstanceEntity;
  onSign: (templateId: string) => Promise<void>;
  isLoading?: boolean;
};

const STATUS_LABELS: Record<DocumentInstanceStatus, string> = {
  pending: 'Pendiente',
  signed: 'Firmado',
};

const STATUS_COLORS: Record<DocumentInstanceStatus, string> = {
  pending: 'text-yellow-600',
  signed: 'text-green-600',
};

export function DocumentSignerCard({ template, instance, onSign, isLoading }: DocumentSignerCardProps) {
  const status = instance?.status;
  const isSigned = status === DocumentInstanceStatus.Signed;

  const getButtonText = () => {
    if (isSigned) return 'Ver';
    if (instance) return 'Continuar firma';
    return 'Firmar';
  };

  const handleClick = async () => {
    if (isLoading) return;
    await onSign(template.id);
  };

  return (
    <div className="bg-neutral-50 border border-[#E4EBF6] rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex flex-col items-start">
          <h3 className="font-semibold text-[#1c1c1d]">{template.name}</h3>
          {status && <span className={`text-xs ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</span>}
        </div>
        {/*{template.description && <p className="text-sm text-[#686f87] mt-1">{template.description}</p>}
        {instance?.is_expired && <p className="text-sm text-red-600 mt-1">Este documento ha expirado</p>}*/}
      </div>
      <Button onClick={handleClick} disabled={isLoading || instance?.is_expired} variant="outline">
        {isLoading ? 'Cargando...' : getButtonText()}
      </Button>
    </div>
  );
}
