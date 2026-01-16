import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
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
import { SchoolStepTags, SchoolStepDocsEntity } from '@cometa/trpc/src/admissions/types';
import {
  ConfigurationLayout,
  ConfigurationHeader,
  ConfigurationContent,
  SectionHeader,
  ListItem,
  AddButton,
  SortableListItem,
  PhoneHeader,
  PhoneBody,
  PhoneContainer,
} from '/src/components/admissions/setup/shared';
import { PhoneEmptyState } from '/src/components/admissions/setup/shared/phone';
import { DocumentUploadDrawer } from '/src/components/admissions/setup/admission-steps/document-drawer';
import { useUpdateStepStatus } from '/src/components/admissions/setup/hooks/useUpdateStepStatus';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentsConfigurationPage() {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const schoolId = selectedSchool?.id as string;
  const [isDocumentDrawerOpen, setIsDocumentDrawerOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<SchoolStepDocsEntity | null>(null);
  const [localDocuments, setLocalDocuments] = useState<SchoolStepDocsEntity[]>([]);

  const { data: schoolSteps = [] } = api.admissions.getSchoolSteps.useQuery({ schoolId }, { enabled: !!schoolId });

  const documentsStep = schoolSteps.find((step) => step.tag === SchoolStepTags.Documents);
  const schoolStepId = documentsStep?.id as string;

  const { data: fetchedDocuments = [], refetch: refetchDocuments } = api.admissions.getSchoolStepDocs.useQuery(
    { school_step_id: schoolStepId },
    { enabled: !!schoolStepId }
  );

  useEffect(() => {
    const sortedDocuments = [...(fetchedDocuments as SchoolStepDocsEntity[])].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
    setLocalDocuments(sortedDocuments);
  }, [fetchedDocuments]);

  const documents = localDocuments;

  const upsertDocumentsMutation = api.admissions.upsertSchoolStepDocs.useMutation();

  const stepNumber = documentsStep?.order || 1;

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

  function handleEditDocument(document: SchoolStepDocsEntity) {
    setEditingDocument(document);
    setIsDocumentDrawerOpen(true);
  }

  function handleDocumentSuccess() {
    refetchDocuments();
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
        let updatedDocuments: SchoolStepDocsEntity[] = [];

        setLocalDocuments((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          const newItems = arrayMove(items, oldIndex, newIndex);

          updatedDocuments = newItems.map((document, index) => ({
            ...document,
            order: index + 1,
          }));

          return updatedDocuments;
        });

        try {
          await upsertDocumentsMutation.mutateAsync(
            updatedDocuments.map((doc) => ({
              id: doc.id as string,
              name: doc.name as string,
              description: doc.description || '',
              tag: doc.tag as string,
              active: doc.active as boolean,
              order: doc.order as number,
              school_step_id: schoolStepId,
              level_ids: doc.level_ids || '',
            }))
          );
          refetchDocuments();
        } catch (error) {
          refetchDocuments();
        }
      }
    },
    [schoolStepId, upsertDocumentsMutation, refetchDocuments]
  );

  return (
    <div className="font-lota antialiased">
      <ConfigurationHeader title="Carga de documentos" onBack={handleBack} onClose={handleClose} />

      <ConfigurationLayout
        leftContent={
          <DocumentsContent
            stepNumber={stepNumber}
            documents={documents}
            onConfigureDocument={handleConfigureDocument}
            onEditDocument={handleEditDocument}
            onDragEnd={handleDragEnd}
            totalSteps={schoolSteps.length}
          />
        }
        rightContent={<PhoneContent documents={documents} />}
      />

      <DocumentUploadDrawer
        isOpen={isDocumentDrawerOpen}
        onClose={handleCloseDrawer}
        onSuccess={handleDocumentSuccess}
        schoolStepId={schoolStepId}
        document={editingDocument}
      />
    </div>
  );
}

type DocumentsContentProps = {
  stepNumber: number;
  documents: SchoolStepDocsEntity[];
  onConfigureDocument: () => void;
  onEditDocument: (document: SchoolStepDocsEntity) => void;
  onDragEnd: (event: DragEndEvent) => void;
  totalSteps: number;
};

function DocumentsContent({
  stepNumber,
  documents,
  onConfigureDocument,
  onEditDocument,
  onDragEnd,
  totalSteps,
}: DocumentsContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { handleSaveAndUpdateStatus } = useUpdateStepStatus(SchoolStepTags.Documents);

  return (
    <ConfigurationContent
      title="Carga de documentos"
      stepNumber={stepNumber}
      description="Define los documentos que las familias deberán subir para completar la postulación. Ellos los verán en la app y podrán cargarlos desde ahí."
      onSave={() => handleSaveAndUpdateStatus()}
      isDisabled={documents.length === 0}
      totalSteps={totalSteps}
    >
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Documentos solicitados"
          tooltip="Estos son los documentos que las familias deberán subir desde su app."
        />

        <div className="space-y-2">
          {documents.length === 0 ? (
            <ListItem title="Configurar documento" onClick={onConfigureDocument} showDragHandle />
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext
                  items={documents.map((document) => document.id as string)}
                  strategy={verticalListSortingStrategy}
                >
                  {documents.map((document) => (
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

function PhoneContent({ documents }: { documents: SchoolStepDocsEntity[] }) {
  if (!documents.length) {
    return <PhoneEmptyState />;
  }

  return (
    <PhoneContainer>
      <PhoneHeader title="Carga de documentos" description="Carga los diferentes documentos y archivos requeridos." />

      <PhoneBody>
        <AnimatePresence>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {documents.map((document, _index) => (
              <motion.div
                key={document.id}
                className="space-y-1"
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
                <h3 className="text-xs font-semibold text-neutral-900">{document.name}</h3>

                <motion.div
                  className="border border-dashed border-neutral-200 rounded-lg p-4 bg-white text-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xs text-neutral-600">
                    <span className="text-info-700 font-bold underline">Haz click aquí</span> para subir los archivos
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </PhoneBody>
    </PhoneContainer>
  );
}

DocumentsConfigurationPage.auth = true;
