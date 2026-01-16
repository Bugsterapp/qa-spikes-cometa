import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';
import {
  SchoolStepTags,
  SchoolStepResourceEntity,
  SchoolStepResourceType,
  UrlFileEntity,
  SchoolStepStatusEnum,
  SchoolStepTypeEnum,
  SchoolStepEntity,
} from '@cometa/trpc/src/admissions/types';
import { DocumentConfigurationDrawer } from '/src/components/admissions/setup/admission-steps/resource-drawer';
import {
  ConfigurationLayout,
  ConfigurationHeader,
  SectionHeader,
  ListItem,
  AddButton,
  SortableListItem,
  PhoneHeader,
  PhoneBody,
  PhoneContainer,
  ConfigurationContent,
  FileCard,
  VideoCard,
} from '/src/components/admissions/setup/shared';
import { PhoneEmptyState } from '/src/components/admissions/setup/shared/phone';
import { useUpdateStepStatus } from '/src/components/admissions/setup/hooks/useUpdateStepStatus';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScholarInfoConfigurationPage() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const [isDocumentDrawerOpen, setIsDocumentDrawerOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<SchoolStepResourceEntity | null>(null);
  const [localResources, setLocalResources] = useState<SchoolStepResourceEntity[]>([]);

  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });

  const scholarInfoStep = schoolSteps.find((step: SchoolStepEntity) => step.tag === SchoolStepTags.ScholarInfo);
  const schoolStepId = scholarInfoStep?.id as string;

  const { data: fetchedResources = [], refetch: refetchResources } = api.admissions.getSchoolStepResources.useQuery(
    { school_step_id: schoolStepId },
    { enabled: !!schoolStepId }
  );

  const utils = api.useUtils();
  const upsertSchoolSteps = api.admissions.upsertSchoolSteps.useMutation();

  useEffect(() => {
    const sortedResources = [...(fetchedResources as SchoolStepResourceEntity[])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    setLocalResources(sortedResources);
  }, [fetchedResources]);

  const resources = localResources;

  const updateResourceOrder = api.admissions.updateSchoolStepResource.useMutation();

  const stepNumber = scholarInfoStep?.order || 1;

  function handleBack() {
    router.push('/admissions/setup?config=true');
  }

  function handleClose() {
    router.push('/admissions/setup?config=true');
  }

  function handleConfigureDocument() {
    setEditingDocument(null);
    setIsDocumentDrawerOpen(true);
  }

  function handleEditDocument(document: SchoolStepResourceEntity) {
    setEditingDocument(document);
    setIsDocumentDrawerOpen(true);
  }

  async function handleDocumentSuccess() {
    const { data: updatedResources } = await refetchResources();

    if (updatedResources && updatedResources.length === 0 && scholarInfoStep?.status === SchoolStepStatusEnum.Draft) {
      upsertSchoolSteps.mutate(
        [
          {
            id: scholarInfoStep.id as string,
            name: scholarInfoStep.name as string,
            description: scholarInfoStep.description as string,
            school_id: scholarInfoStep.school_id as string,
            order: scholarInfoStep.order as number,
            tag: scholarInfoStep.tag as SchoolStepTags,
            type: scholarInfoStep.type as SchoolStepTypeEnum,
            actions: {
              to_do: {
                label: scholarInfoStep.actions?.to_do?.label || 'Completar',
                redirect_url: scholarInfoStep.actions?.to_do?.redirect_url || '',
              },
              in_progress: {
                label: scholarInfoStep.actions?.in_progress?.label || 'Continuar',
                redirect_url: scholarInfoStep.actions?.in_progress?.redirect_url || '',
              },
              completed: {
                label: scholarInfoStep.actions?.completed?.label || 'Revisar',
                redirect_url: scholarInfoStep.actions?.completed?.redirect_url || '',
              },
            },
            status: SchoolStepStatusEnum.Inactive,
            rules: scholarInfoStep.rules,
            deleted_at: scholarInfoStep.deleted_at,
          },
        ],
        {
          onSuccess: () => {
            utils.admissions.getSchoolSteps.invalidate({ schoolId });
          },
        }
      );
    }

    setIsDocumentDrawerOpen(false);
    setEditingDocument(null);
  }

  function handleCloseDrawer() {
    setIsDocumentDrawerOpen(false);
    setEditingDocument(null);
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        let updatedResources: SchoolStepResourceEntity[] = [];

        setLocalResources((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          const newItems = arrayMove(items, oldIndex, newIndex);

          updatedResources = newItems.map((resource, index) => ({
            ...resource,
            order: index + 1,
          }));

          return updatedResources;
        });

        const updatePromises = updatedResources.map((resource) => {
          if (resource.id) {
            return updateResourceOrder.mutateAsync({
              school_step_id: schoolStepId,
              resource_id: resource.id,
              source: resource.source,
              name: resource.name || undefined,
              description: resource.description || undefined,
              type: resource.type as SchoolStepResourceType,
              order: resource.order || undefined,
            });
          }
          return Promise.resolve();
        });

        await Promise.all(updatePromises);
        refetchResources();
      }
    },
    [schoolStepId, updateResourceOrder, refetchResources]
  );

  return (
    <div className="font-lota antialiased">
      <ConfigurationHeader title="Información escolar" onBack={handleBack} onClose={handleClose} />

      <ConfigurationLayout
        leftContent={
          <ScholarInfoContent
            stepNumber={stepNumber}
            resources={resources}
            onConfigureDocument={handleConfigureDocument}
            onEditDocument={handleEditDocument}
            onDragEnd={handleDragEnd}
            totalSteps={schoolSteps.length}
          />
        }
        rightContent={<PhoneContent schoolId={schoolId} resources={resources} />}
      />

      <DocumentConfigurationDrawer
        isOpen={isDocumentDrawerOpen}
        onClose={handleCloseDrawer}
        onSuccess={handleDocumentSuccess}
        schoolStepId={schoolStepId}
        document={editingDocument}
      />
    </div>
  );
}

type ScholarInfoContentProps = {
  stepNumber: number;
  resources: SchoolStepResourceEntity[];
  onConfigureDocument: () => void;
  onEditDocument: (document: SchoolStepResourceEntity) => void;
  onDragEnd: (event: DragEndEvent) => void;
  totalSteps: number;
};

function ScholarInfoContent({
  stepNumber,
  resources,
  onConfigureDocument,
  onEditDocument,
  onDragEnd,
  totalSteps,
}: ScholarInfoContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { handleSaveAndUpdateStatus } = useUpdateStepStatus(SchoolStepTags.ScholarInfo);

  return (
    <ConfigurationContent
      title="Información escolar"
      stepNumber={stepNumber}
      description="Comparte con las familias documentos clave como el modelo educativo, reglamentos o materiales escolares. Ellos deberán revisarlos antes de avanzar en el proceso."
      onSave={() => handleSaveAndUpdateStatus()}
      isDisabled={resources.length === 0}
      totalSteps={totalSteps}
    >
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Documentos a mostrar"
          tooltip="Estos son los documentos que las familias podrán revisar desde su app."
        />

        <div className="space-y-2">
          {resources.length === 0 ? (
            <div className="relative">
              <ListItem
                title={
                  <div className="flex items-center gap-1 font-normal">
                    Configurar documento
                    <ChevronRight className="w-4 h-4" />
                  </div>
                }
                onClick={onConfigureDocument}
                className="cursor-pointer"
                showDragHandle
              />
            </div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext
                  items={resources.map((resource) => resource.id as string)}
                  strategy={verticalListSortingStrategy}
                >
                  {resources.map((document) => (
                    <SortableListItem
                      key={document.id}
                      item={document}
                      onClick={onEditDocument}
                      getTitle={(doc) => doc.name as string}
                      getId={(doc) => doc.id as string}
                      isCompleted
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <AddButton onClick={onConfigureDocument} label="Agregar nuevo documento" />
            </>
          )}
        </div>
      </div>
    </ConfigurationContent>
  );
}

function PhoneContent({ schoolId, resources }: { schoolId: string; resources: SchoolStepResourceEntity[] }) {
  const fileResources = resources.filter((resource) => resource.type === 'file');

  const fileIds = fileResources?.map((resource) => resource.source as string);
  const { data: files } = api.admissions.getFiles.useQuery(
    { school_id: schoolId, ids: fileIds },
    { enabled: !!schoolId && !!fileIds }
  );

  if (!resources.length) {
    return <PhoneEmptyState />;
  }

  return (
    <PhoneContainer>
      <PhoneHeader
        title="Revisa la información escolar"
        description="En los siguientes documentos podrás encontrar información acerca del colegio y el proceso de admisión."
      />

      <PhoneBody>
        <AnimatePresence>
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {resources?.map((resource, _index) => {
              const isFile = resource.type === 'file';
              const file = files?.find((file) => file.id === resource.source) as UrlFileEntity;

              return (
                <motion.div
                  key={resource.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                    layout: { duration: 0.4, ease: 'easeInOut' },
                  }}
                >
                  {isFile ? <FileCard resource={resource} file={file} /> : <VideoCard resource={resource} />}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </PhoneBody>
    </PhoneContainer>
  );
}

ScholarInfoConfigurationPage.auth = true;
