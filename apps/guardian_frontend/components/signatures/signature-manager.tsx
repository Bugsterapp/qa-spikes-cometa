import { useMemo, useCallback, useState } from 'react';
import { Dialog } from '@cometa/recreo';
import { Button } from '@cometa/recreo/v2';
import { api } from '~/utils/api';
import { DocumentSignerCard } from './document-signer-card';
import { DocumentInstanceEntity, DocumentInstanceStatus } from '@cometa/trpc/src/students/types';
import { EmbedSignDocument } from '@documenso/embed-react';
import { XIcon } from 'lucide-react';
import { useToast } from '../Toast/useToast';

export type SignatureManagerProps = {
  templateIds: string[];
  signer: {
    id: string;
    email: string;
    name: string;
  };
  schoolId: string;
  externalId: string;
  module?: 'admissions';
  onCompleted?: () => void;
  title?: string;
  description?: string;
};

export function SignatureManager({
  templateIds,
  signer,
  schoolId,
  externalId,
  module,
  onCompleted,
  title,
  description,
}: SignatureManagerProps) {
  const { toast } = useToast();
  const [signingTemplateId, setSigningTemplateId] = useState<string | null>(null);
  const [documentInstance, setDocumentInstance] = useState<DocumentInstanceEntity | null>(null);
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = api.students.listDocumentTemplates.useQuery({ id: templateIds }, { enabled: templateIds.length > 0 });
  const {
    data: instances,
    isLoading: isLoadingInstances,
    refetch: refetchInstances,
  } = api.students.listDocumentInstances.useQuery(
    {
      school_id: schoolId,
      signer_id: signer.id,
      external_id: externalId,
    },
    {
      enabled: !!schoolId && !!signer.id && !!externalId,
    }
  );
  const createInstance = api.students.createDocumentInstance.useMutation({
    onSuccess: (instance) => {
      refetchInstances();
      setSigningTemplateId(null);
      setDocumentInstance(instance);
    },
    onError: () => {
      setSigningTemplateId(null);
    },
  });

  const updateDocumentStatus = api.students.updateDocumentStatus.useMutation({
    onSuccess: () => {
      refetchInstances();
      setDocumentInstance(null);
      toast({
        title: 'Contrato firmado',
        variant: 'success',
      });
    },
  });

  const documentsWithState = useMemo(() => {
    if (!templates) return [];

    return templates.map((template) => {
      const instance = instances?.find((i) => i.template_id === template.id);
      return {
        template,
        instance,
        status: instance?.status || ('not_started' as const),
        isSigned: instance?.is_signed || false,
        isExpired: instance?.is_expired || false,
      };
    });
  }, [templates, instances]);

  const allSigned = useMemo(() => {
    if (documentsWithState.length === 0) return false;
    return documentsWithState.every((doc) => doc.status === DocumentInstanceStatus.Signed);
  }, [documentsWithState]);

  const handleSign = useCallback(
    async (templateId: string) => {
      setSigningTemplateId(templateId);

      try {
        const existingInstance = instances?.find((i) => i.template_id === templateId);

        if (existingInstance) {
          setSigningTemplateId(null);
          setDocumentInstance(existingInstance);
        } else {
          await createInstance.mutateAsync({
            template_id: templateId,
            school_id: schoolId,
            signer_id: signer.id,
            signer_email: signer.email,
            signer_name: signer.name,
            external_id: externalId,
            module: module,
          });
        }
      } catch (error) {
        setSigningTemplateId(null);
      }
    },
    [instances, createInstance, schoolId, signer, externalId, module]
  );

  const isLoading = isLoadingTemplates || isLoadingInstances;
  const canComplete = allSigned && !isLoading;

  if (templatesError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar contratos</h2>
          <p className="text-gray-600">No se pudieron cargar los contratos para firmar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {(title || description) && (
        <header className="p-6 pb-2">
          {title && <h2 className="text-2xl font-bold text-[#1c1c1d] mb-2">{title}</h2>}
          {description && <p className="text-base text-[#3E4559]">{description}</p>}
        </header>
      )}

      <div className="flex-1 overflow-y-auto p-6 pb-3">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-50 h-20 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : documentsWithState.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay contratos para firmar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documentsWithState.map(({ template, instance }) => (
              <DocumentSignerCard
                key={template.id}
                template={template}
                instance={instance}
                onSign={handleSign}
                isLoading={signingTemplateId === template.id}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-6 pt-3">
        <Button disabled={!canComplete} variant="neutral" size="lg" className="w-full" onClick={onCompleted}>
          {isLoading ? 'Cargando...' : 'Listo'}
        </Button>
      </div>

      <Dialog.Root
        open={!!documentInstance}
        onOpenChange={(open) => {
          if (!open) {
            setDocumentInstance(null);
            refetchInstances();
          }
        }}
        className="p-0"
      >
        {documentInstance?.signing_token && (
          <div className="h-[100dvh] overflow-hidden flex flex-col">
            <Dialog.Title className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 mb-0">
              <h1 className="text-lg font-bold">Firma de contrato</h1>
              <XIcon size={24} className="cursor-pointer" onClick={() => setDocumentInstance(null)} />
            </Dialog.Title>
            <EmbedSignDocument
              darkModeDisabled
              token={documentInstance.signing_token}
              host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST}
              className="w-full flex-1"
              cssVars={{
                primary: '#873AFF',
                primaryForeground: '#FFFFFF',
                background: '#FFFFFF',
              }}
              onDocumentCompleted={() => {
                updateDocumentStatus.mutate({
                  documentId: documentInstance.id,
                  status: DocumentInstanceStatus.Signed,
                });
              }}
            />
          </div>
        )}
      </Dialog.Root>
    </div>
  );
}
