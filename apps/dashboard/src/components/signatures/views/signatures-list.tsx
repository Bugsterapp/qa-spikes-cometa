import { useState, useMemo } from 'react';
import { Button } from '@cometa/recreo/v2';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { TemplatesTable } from '../components/templates-table';
import { CreateTemplateDialog } from '../components/create-template-dialog';
import { DeleteTemplateDialog } from '../components/delete-template-dialog';
import { EmptyState } from '../components/empty-state';
import { useTemplates, useDeleteTemplate } from '/src/components/signatures/hooks/useTemplates';

export function SignaturesPage() {
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  const { templates, isLoading } = useTemplates();
  const deleteTemplateMutation = useDeleteTemplate();

  const filteredTemplates = useMemo(() => {
    if (!search) return templates;
    return templates.filter((template) => template.name.toLowerCase().includes(search.toLowerCase()));
  }, [templates, search]);

  const handleDelete = (id: string) => {
    setSelectedTemplateId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTemplateId) {
      deleteTemplateMutation.mutate(
        { template_id: selectedTemplateId },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setSelectedTemplateId(undefined);
          },
        }
      );
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return (
    <div className="h-full relative w-full font-lota antialiased">
      <div className="flex justify-between items-center border-b px-8">
        <div className="flex flex-col py-4 gap-1">
          <h1 className="text-[#212B36] text-2xl font-bold">Contratos</h1>
          <p className="text-sm text-[#919EAB]">Crea y almacena tus contratos</p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>Crear nuevo contrato</Button>
      </div>

      {!isLoading && templates.length === 0 ? (
        <EmptyState onCreateClick={() => setCreateDialogOpen(true)} />
      ) : (
        <>
          <div className="flex items-center justify-between mt-4 px-6">
            <GlobalSearch
              placeholder="Buscar"
              search={search}
              setSearch={setSearch}
              className="focus:ring-primary focus:border-primary mb-1"
            />
          </div>

          <div className="w-full mt-4">
            <TemplatesTable templates={filteredTemplates} onDelete={handleDelete} isLoading={isLoading} />
          </div>
        </>
      )}

      <CreateTemplateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <DeleteTemplateDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        templateTitle={selectedTemplate?.name}
        isDeleting={deleteTemplateMutation.isPending}
      />
    </div>
  );
}
