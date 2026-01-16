import Layout from '/src/components/layouts';
import { GetServerSideProps } from 'next';
import { useState, useCallback } from 'react';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { CredentialDesigner } from '../../components/credentials/credential-designer';
import { CredentialDrawer } from '../../components/credentials/credential-drawer';
import { EmptyState, EmptyCredentialIcon } from '../../components/credentials/shared/empty-state';
import { TemplateList } from '../../components/credentials/template-list';
import { LoadingScreen } from '../../components/credentials/loading-screen';
import type { CredentialConfig } from '../../components/credentials/types';

CredentialsPage.auth = true;

export default function CredentialsPage() {
  return <Credentials />;
}

CredentialsPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Credenciales" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

export function Credentials() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [duplicateFromTemplateId, setDuplicateFromTemplateId] = useState<string | undefined>(undefined);
  const selectedSchool = useSelectedSchool();

  const { data, isLoading } = api.credentials.listTemplates.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      page: 1,
      limit: 100,
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  const templates = data?.results || [];
  const hasTemplates = templates.length > 0;
  const isEditing = editingTemplateId !== null;

  function handleSave(_config: CredentialConfig) {
    setHasUnsavedChanges(false);
    setEditingTemplateId(null);
    setDuplicateFromTemplateId(undefined);
    setIsDrawerOpen(false);
  }

  function handleClose() {
    setHasUnsavedChanges(false);
    setEditingTemplateId(null);
    setDuplicateFromTemplateId(undefined);
    setIsDrawerOpen(false);
  }

  function handleCreateTemplate() {
    setEditingTemplateId(null);
    setDuplicateFromTemplateId(undefined);
    setIsDrawerOpen(true);
  }

  function handleEditTemplate(templateId: string) {
    setEditingTemplateId(templateId);
    setDuplicateFromTemplateId(undefined);
    setIsDrawerOpen(true);
  }

  function handleDuplicateTemplate(templateId: string) {
    setEditingTemplateId(null); // null = modo creación
    setDuplicateFromTemplateId(templateId);
    setIsDrawerOpen(true);
  }

  const handleConfigChange = useCallback((isDirty: boolean) => {
    setHasUnsavedChanges(isDirty);
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen
        title="Cargando plantillas..."
        description="Estamos cargando las plantillas de credenciales de tu colegio. En unos segundos estarán listas."
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] overflow-hidden font-['Lota_Grotesque']">
      <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center bg-[#fbfcfd]">
        {!hasTemplates ? (
          <EmptyState
            icon={<EmptyCredentialIcon />}
            title="Crea una nueva plantilla"
            description="Para poder generar credenciales debes tener creado previamente el diseño de la plantilla de la credencial de tu colegio"
            buttonText="Crear nueva plantilla"
            onButtonClick={handleCreateTemplate}
          />
        ) : (
          <TemplateList
            templates={templates}
            onCreateNew={handleCreateTemplate}
            onEdit={handleEditTemplate}
            onDuplicate={handleDuplicateTemplate}
          />
        )}
      </div>

      <CredentialDrawer
        isOpen={isDrawerOpen}
        onClose={handleClose}
        title="Nueva credencial"
        hasUnsavedChanges={hasUnsavedChanges}
        isEditing={isEditing}
      >
        <CredentialDesigner
          onSave={handleSave}
          onCancel={handleClose}
          onConfigChange={handleConfigChange}
          templateId={editingTemplateId ?? undefined}
          duplicateFromTemplateId={duplicateFromTemplateId}
          isEditing={isEditing}
        />
      </CredentialDrawer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent'];
  const isMobile = Boolean(UA?.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
  if (!isMobile) {
    return { props: {} };
  }

  return {
    redirect: {
      permanent: false,
      destination: '/only-desktop',
    },
  };
};
