import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeftIcon, Trash2Icon } from 'lucide-react';
import { Button, Dialog, DialogContent } from '@cometa/recreo/v2';
import { api } from '/src/utils/api';
import { TemplateInfoTab } from './template-info-tab';
import { TemplateSignaturesTab } from './template-signatures-tab';
import { DeleteTemplateDialog } from '/src/components/signatures/components/delete-template-dialog';
import { TemplateEditView } from './template-edit';
import { TabsWrapper, useTab } from '/src/components/ui/Tabs';
import { useDeleteTemplate } from '/src/components/signatures/hooks/useTemplates';

interface TemplateDetailViewProps {
  templateId: string;
}

export function TemplateDetailView({ templateId }: TemplateDetailViewProps) {
  const router = useRouter();
  const { tab, handleChangeTab } = useTab('info');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const utils = api.useUtils();

  const { data: template, isPending: isLoading } = api.students.getTemplate.useQuery(
    { template_id: templateId },
    {
      enabled: !!templateId,
    }
  );

  const deleteTemplateMutation = useDeleteTemplate();

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteTemplateMutation.mutate(
      { template_id: templateId },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          router.push('/signatures');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
      </div>
    );
  }

  if (!template) {
    return null;
  }

  const tabs = [
    { value: 'info', label: 'Info. general' },
    { value: 'signatures', label: 'Firmas' },
  ];

  function handleOnEditTempalte() {
    setEditDialogOpen(false);
    utils.students.getTemplateFields.invalidate();
    handleChangeTab('info');
  }

  return (
    <div className="h-full w-full font-lota antialiased bg-white flex flex-col">
      <div className="px-8 py-4 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex justify-start items-center gap-1">
          <Link href="/signatures" className="flex items-center gap-1 hover:underline w-fit">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon size={16} />
            </Button>
          </Link>
          <h1 className="text-[#212B36] text-2xl font-bold">{template.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleEdit} variant="secondary">
            Editar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full border border-[#D0D8E9] bg-white shadow-[0_1px_2px_0_rgba(34,40,58,0.05)]"
          >
            <Trash2Icon size={20} />
          </Button>
        </div>
      </div>

      <div className="bg-white border-b flex-shrink-0">
        <TabsWrapper
          tab={tab}
          tabs={tabs}
          handleChangeTab={handleChangeTab}
          defaultValue="info"
          tabsListClassName="pl-0 px-8 border-b border-b-[#D5DEED]"
          tabsTriggerClassName="text-sm text-[#8B93A0] py-3 data-state-active:text-primary"
          tabUnderlineClassName="bg-primary"
        />
      </div>

      <div className={tab === 'signatures' ? 'pt-6 pb-0 flex-1 overflow-hidden' : 'p-8'}>
        {tab === 'info' && <TemplateInfoTab template={template} />}
        {tab === 'signatures' && <TemplateSignaturesTab />}
      </div>

      <DeleteTemplateDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        templateTitle={template.name}
        isDeleting={deleteTemplateMutation.isPending}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className="w-full max-w-full sm:max-w-full h-screen p-0 flex flex-col rounded-none"
          showCloseButton={false}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <TemplateEditView templateId={templateId} onClose={handleOnEditTempalte} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
