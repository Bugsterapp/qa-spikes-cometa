import { createColumnHelper } from '@tanstack/react-table';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { AlertTriangleIcon, DownloadIcon, FileIcon, TrashIcon } from 'lucide-react';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { Button } from '@cometa/recreo';
import { useEffect, useState } from 'react';
import { Dialog } from '@cometa/recreo';
import { FileEntity } from '@cometa/trpc/src/students/types';
import { StudentsServiceClient } from '/src/utils/apiStudents';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { useSession } from 'next-auth/react';
import { api } from '/src/utils/api';
import useAlert from '/src/hooks/useAlert';
import { DocumentUploadSheet } from './DocumentUploadSheet';
import { useToggle } from '@cometa/hooks';

const DOCUMENT_TYPES = [
  { type: 'birth_certificate', label: 'Acta de nacimiento' },
  { type: 'curp', label: 'CURP' },
  { type: 'student_id_number', label: 'NIA' },
  { type: 'father_id_card', label: 'INE padre' },
  { type: 'mother_id_card', label: 'INE madre' },
  { type: 'proof_of_residence', label: 'Comprobante de domicilio' },
  { type: 'student_transfer_certificate', label: 'Cédula de movimiento del estudiante' },
  { type: 'good_conduct_letter', label: 'Carta de buena conducta' },
  { type: 'no_debt_letter', label: 'Carta de no adeudo' },
  { type: 'student_access_contract', label: 'Contrato de acceso a estudiantes' },
  { type: 'preschool_report_cards', label: 'Boletas de preescolar' },
  { type: 'elementary_report_cards', label: 'Boletas de primaria' },
  { type: 'middle_school_report_cards', label: 'Boletas de secundaria' },
  { type: 'preschool_certificate', label: 'Certificado de preescolar' },
  { type: 'elementary_certificate', label: 'Certificado de primaria' },
  { type: 'middle_school_certificate', label: 'Certificado de secundaria' },
  { type: 'other', label: 'Otros' },
];

function ActionIcon({
  children,
  message,
  onClick,
}: {
  children: React.ReactNode;
  message: string;
  onClick?: () => void;
}) {
  return (
    <Tooltip message={message}>
      <button type="button" className="p-2 hover:bg-slate-100 rounded-full cursor-pointer" onClick={onClick}>
        {children}
      </button>
    </Tooltip>
  );
}

type DocumentDefinition = {
  id: string;
  name: string;
  tag: string;
};

type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

function ConfirmDeleteDialog({ open, onClose, onDelete }: ConfirmDeleteModalProps) {
  function handleDelete() {
    onDelete();
    onClose();
  }

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            onClose();
          }
        }}
      >
        <Dialog.Title className="text-center mb-4">
          <h3 className="text-xl font-bold">Eliminar archivos permanentemente</h3>
        </Dialog.Title>

        <Dialog.Description className="px-8 mb-0">
          <p className="text-gray-500 text-center mb-8">
            ¿Estás seguro que deseas eliminar los archivos registrados de forma permanente?
          </p>

          <div className="bg-amber-50 rounded-lg p-4 flex items-center gap-2">
            <AlertTriangleIcon className="text-amber-500" />
            <p className="text-amber-800 text-left">Una vez eliminados, los archivos no podrán recuperarse.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button variant="text" color="black" onClick={onClose}>
              Volver
            </Button>
            <Button variant="solid" onClick={handleDelete} className="bg-red-400 hover:bg-red-500">
              Eliminar
            </Button>
          </div>
        </Dialog.Description>
      </Dialog.Root>
    </>
  );
}

function DocumentNameColumn({
  document,
  filesByEntity,
}: {
  document: DocumentDefinition;
  filesByEntity: Record<string, FileEntity>;
}) {
  const files = filesByEntity[document.id]?.file_details || [];
  return (
    <div className="flex gap-2 items-center">
      <span>{document.name}</span>
      {files.length > 0 ? (
        <span className="text-green-800 bg-green-100 px-2 py-1 rounded-full font-semibold">Disponible</span>
      ) : null}
    </div>
  );
}

function FilesColumn({
  document,
  filesByEntity,
  fileEntity,
}: {
  document?: DocumentDefinition;
  filesByEntity?: Record<string, FileEntity>;
  fileEntity?: FileEntity;
}) {
  // Support both document-based and direct fileEntity usage
  const files =
    fileEntity?.file_details || (document && filesByEntity ? filesByEntity[document.id]?.file_details : []) || [];
  const fileIcons = files.slice(0, 2).map((file) => <FileIcon key={file.id} className="text-neutral-300" />);
  const extraFilesCount = files.length - 2;

  if (files.length === 0) {
    return '-';
  }

  return (
    <Tooltip message={`${files.length} archivo${files.length > 1 ? 's' : ''}`} className="flex items-center py-1">
      {fileIcons}
      {extraFilesCount > 0 ? <span className="text-gray-500 pl-1">+{extraFilesCount}</span> : null}
    </Tooltip>
  );
}

function UploadDateColumn({
  document,
  filesByEntity,
  fileEntity,
}: {
  document?: DocumentDefinition;
  filesByEntity?: Record<string, FileEntity>;
  fileEntity?: FileEntity;
}) {
  const selectedSchool = useSelectedSchool();
  // Support both document-based and direct fileEntity usage
  const entity = fileEntity || (document && filesByEntity ? filesByEntity[document.id] : undefined);
  const createdAt = entity?.created_at;
  const createdById = entity?.created_by;

  const { data: createdBy } = api.schools.getUser.useQuery(
    {
      school_id: selectedSchool?.id as string,
      user_id: createdById as string,
    },
    { enabled: !!createdById && !!selectedSchool?.id }
  );

  if (!createdAt || !createdById) return '-';

  const displayName = createdBy ? `${createdBy.first_name} ${createdBy.last_name}`.trim() || createdBy.email : '-';

  return (
    <div className="flex flex-col">
      <span>
        {new Intl.DateTimeFormat('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(createdAt))}
      </span>
      <span className="text-gray-600 text-sm max-w-36 truncate" title={displayName}>
        {displayName}
      </span>
    </div>
  );
}

function ActionsColumn({
  document,
  filesByEntity,
  handleDownloadFile,
  openDeleteDialog,
  openUploadDialog,
}: {
  document: DocumentDefinition;
  filesByEntity: Record<string, FileEntity>;
  handleDownloadFile: (id: string) => void;
  openDeleteDialog: (fileId: string) => void;
  openUploadDialog: (name: string, typeId: string, tagId: string) => void;
}) {
  const file = filesByEntity[document.id];
  const fileDetails = file?.file_details || [];
  const hasFiles = fileDetails.length > 0;

  return (
    <>
      {hasFiles ? (
        <div className="flex gap-2 justify-center">
          <ActionIcon
            message="Descargar archivos"
            onClick={() => {
              if (file?.id) {
                handleDownloadFile(file.id);
              }
            }}
          >
            <DownloadIcon size={14} />
          </ActionIcon>
          <ActionIcon
            message="Eliminar archivos"
            onClick={() => {
              const fileId = filesByEntity[document.id]?.id;
              if (fileId) {
                openDeleteDialog(fileId);
              }
            }}
          >
            <TrashIcon size={14} />
          </ActionIcon>
        </div>
      ) : (
        <Button
          variant="solid-light"
          color="black"
          size="small"
          onClick={() => openUploadDialog(document.name, document.id, document.tag)}
        >
          Subir archivos
        </Button>
      )}
    </>
  );
}

type DocumentsSectionProps = {
  entityId: string;
  documentDefinitions: DocumentDefinition[];
  isLoading?: boolean;
};

export function DocumentsSection({
  entityId,
  documentDefinitions: intialDocDefinitions,
  isLoading,
}: DocumentsSectionProps) {
  const selectedSchool = useSelectedSchool();
  const { data: session } = useSession();

  const [documentDefinitions, setDocumentDefinitions] = useState<DocumentDefinition[]>(intialDocDefinitions);
  const [filesByEntity, setFilesByEntity] = useState<Record<string, FileEntity>>({});

  const { toggle: isUploadSheetOpen, onOpen: onOpenUploadSheet, onClose: onCloseUploadSheet } = useToggle();
  const [preselectedDocument, setPreselectedDocument] = useState<{
    name: string;
    typeId: string;
    tagId: string;
  } | null>(null);

  const openUploadDialog = (name: string, typeId: string, tagId: string) => {
    setPreselectedDocument({ name, typeId, tagId });
    onOpenUploadSheet();
  };

  const closeUploadSheet = () => {
    setPreselectedDocument(null);
    onCloseUploadSheet();
  };

  const [deleteTarget, setDeleteTarget] = useState<{ fileId: string } | null>(null);
  const isDeleteModalOpen = !!deleteTarget;
  const openDeleteDialog = (fileId: string) => setDeleteTarget({ fileId });
  const closeDeleteDialog = () => setDeleteTarget(null);

  const { setAlertState } = useAlert();

  const { data: files, refetch: refetchFiles } = api.students.getFiles.useQuery(
    { entity_id: entityId },
    {
      enabled: !!entityId,
    }
  );

  const { mutateAsync: deleteFile } = api.students.deleteFile.useMutation();
  const { mutateAsync: getFile } = api.students.getFile.useMutation();

  useEffect(() => {
    setDocumentDefinitions(intialDocDefinitions);
  }, [intialDocDefinitions]);

  useEffect(() => {
    if (!files) return;

    setFilesByEntity({});
    const newFilesByEntity = files.reduce((acc, file) => {
      if (file.type_id) {
        acc[file.type_id] = file;
      }
      return acc;
    }, {} as Record<string, FileEntity>);

    setFilesByEntity(newFilesByEntity);
  }, [files]);

  // Calculate unavailable document types (document definition IDs that already have files uploaded)
  const documentTypesUnavailable = documentDefinitions
    .filter((doc) => {
      const fileEntity = filesByEntity[doc.id];
      return fileEntity?.file_details && fileEntity.file_details.length > 0;
    })
    .map((doc) => doc.tag);

  // Get files with null tagId (uncategorized files)
  const uncategorizedFiles = (files || []).filter((file) => !file.type_id);

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteFile({
      file_id: deleteTarget.fileId,
    });

    refetchFiles();
    closeDeleteDialog();
    setAlertState({
      open: true,
      message: 'Archivo eliminado',
      severity: 'success',
    });
  }

  async function handleUpload(files: File[], documentTag: string, documentType: string | null, description?: string) {
    // For "other" type, use the description as the name, otherwise find the document type name
    const documentName = description || DOCUMENT_TYPES.find((doc) => doc.type === documentTag)?.label || 'Documento';

    await StudentsServiceClient.createFileApiV1FilesSchoolIdPost(
      selectedSchool?.id as string,
      {
        name: documentName,
        files_in: files,
        entity_id: entityId,
        tag: documentTag,
        ...(documentType && { type_id: documentType }),
        created_by: session?.user.id as string,
        description: description || '',
      },
      {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN}` },
      }
    );

    refetchFiles();
    closeUploadSheet();
    setAlertState({
      open: true,
      message: 'Archivo cargado',
      severity: 'success',
    });
  }

  async function handleDownloadFile(id: string) {
    const file = await getFile({
      file_id: id,
      download: true,
    });

    if (!file?.download_url) return;

    window.open(file.download_url, '_blank');
    setAlertState({
      open: true,
      message: 'Archivo descargado',
      severity: 'success',
    });
  }

  // Columns for categorized documents
  const columnHelper = createColumnHelper<DocumentDefinition>();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Documento',
      cell: (info) => <DocumentNameColumn document={info.row.original} filesByEntity={filesByEntity} />,
    }),
    columnHelper.display({
      header: 'Archivos',
      cell: (info) => <FilesColumn document={info.row.original} filesByEntity={filesByEntity} />,
    }),
    columnHelper.display({
      header: 'Fecha de subida',
      cell: (info) => <UploadDateColumn document={info.row.original} filesByEntity={filesByEntity} />,
    }),
    columnHelper.display({
      header: 'Acciones',
      cell: (info) => (
        <ActionsColumn
          document={info.row.original}
          filesByEntity={filesByEntity}
          handleDownloadFile={handleDownloadFile}
          openDeleteDialog={openDeleteDialog}
          openUploadDialog={openUploadDialog}
        />
      ),
    }),
  ];

  // Columns for uncategorized files (tagId null)
  type UncategorizedFile = FileEntity;
  const uncategorizedColumnHelper = createColumnHelper<UncategorizedFile>();
  const uncategorizedColumns = [
    uncategorizedColumnHelper.accessor('name', {
      header: 'Nombre del documento',
      cell: (info) => <span className="font-medium">{info.getValue() || 'Sin nombre'}</span>,
    }),
    uncategorizedColumnHelper.display({
      header: 'Archivos',
      cell: (info) => <FilesColumn fileEntity={info.row.original} />,
    }),
    uncategorizedColumnHelper.display({
      header: 'Fecha de subida',
      cell: (info) => <UploadDateColumn fileEntity={info.row.original} />,
    }),
    uncategorizedColumnHelper.display({
      header: 'Acciones',
      cell: (info) => {
        const file = info.row.original;
        const fileDetails = file?.file_details || [];
        const hasFiles = fileDetails.length > 0;

        return (
          <>
            {hasFiles && (
              <div className="flex gap-2 justify-center">
                <ActionIcon message="Descargar archivos" onClick={() => handleDownloadFile(file.id as string)}>
                  <DownloadIcon size={14} />
                </ActionIcon>
                <ActionIcon
                  message="Eliminar archivos"
                  onClick={() => {
                    if (file.id) {
                      openDeleteDialog(file.id);
                    }
                  }}
                >
                  <TrashIcon size={14} />
                </ActionIcon>
              </div>
            )}
          </>
        );
      },
    }),
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center px-4 py-2 bg-white border-t border-gray-200 w-full h-[70vh]">
        <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold mb-2">Listado de documentos</h1>
          <p className="text-sm text-gray-600">
            Aquí puedes gestionar los documentos del estudiante. Sube, revisa o descarga los archivos requeridos de su
            expediente escolar.
          </p>
        </div>
        <Button
          variant="solid-light"
          color="black"
          size="medium"
          onClick={onOpenUploadSheet}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          Cargar documentos
        </Button>
      </div>
      {documentDefinitions.length > 0 && (
        <TableVirtualized
          data={documentDefinitions ?? []}
          columns={columns}
          emptyStateText="Aún no hay documentos adjuntos"
          tableLayout="auto"
          hideFooter
          rounded
          addMorePaddingFirstRow
          isFirstColumnExpanded
          totalCount={documentDefinitions.length}
          totalFetched={documentDefinitions.length}
          isLoading={false}
          hasNextPage={false}
          fetchNextPage={() => void 0}
          maxHeight={(documentDefinitions ?? []).length * 66 + 54}
        />
      )}
      {uncategorizedFiles.length > 0 && (
        <div className="mt-8">
          {documentDefinitions.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold">Otros documentos</h2>
              <p className="text-sm text-gray-600">Documentos cargados sin categoría específica</p>
            </div>
          )}
          <TableVirtualized
            data={uncategorizedFiles}
            columns={uncategorizedColumns}
            emptyStateText="No hay otros documentos"
            tableLayout="auto"
            hideFooter
            rounded
            addMorePaddingFirstRow
            isFirstColumnExpanded
            totalCount={uncategorizedFiles.length}
            totalFetched={uncategorizedFiles.length}
            isLoading={false}
            hasNextPage={false}
            fetchNextPage={() => void 0}
            maxHeight={uncategorizedFiles.length * 66 + 54}
          />
        </div>
      )}

      <DocumentUploadSheet
        open={isUploadSheetOpen}
        onClose={closeUploadSheet}
        onSubmit={handleUpload}
        documentTypes={DOCUMENT_TYPES}
        documentTypesUnavailable={documentTypesUnavailable}
        preselectedDocument={preselectedDocument}
      />
      <ConfirmDeleteDialog open={isDeleteModalOpen} onClose={closeDeleteDialog} onDelete={handleDelete} />
    </>
  );
}
