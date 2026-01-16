import Dialog from '../atoms/Dialog';
import IcClose from '/public/assets/icons/ic_close.svg';
import IcCheck from '/public/assets/icons/ic_check.svg';
import IcCopy from '/public/assets/icons/ic_copy.svg';
import IlustratorShareTable from '/public/assets/illustrations/ilustrator_share_table.png';
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@cometa/recreo';
import { Share2 } from 'lucide-react';
import { Tooltip } from '../atoms/Tooltip';
import { api } from '/src/utils/api';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';

type ShareTableProps = {
  tableName: string;
  relativeUrl: string;
  filters?: Record<string, any>;
  columns?: Record<string, any>;
};

export function ShareTableAction({ tableName, relativeUrl, filters = {}, columns = {} }: ShareTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewLink, setViewLink] = useState('');
  const selectedSchool = useSelectedSchool();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const upsertTableLinkMutation = api.tableLinks.upsertTableLink.useMutation({
    onSuccess: (data: unknown) => {
      if (typeof data === 'object' && data !== null && 'hash' in data && typeof data.hash === 'string') {
        setViewLink(`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/s/${data.hash}`);
      }
    },
  });

  const handleOpen = () => {
    setIsOpen(true);

    sendTrackEventWithUserName(`dashboard: ${tableName} | ShareTable Clicked`, {
      table_name: tableName,
      relative_url: relativeUrl,
    });

    if (selectedSchool?.id) {
      upsertTableLinkMutation.mutate({
        school_id: selectedSchool.id,
        table_name: tableName,
        relative_url: relativeUrl,
        filters,
        columns,
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(viewLink);
    setCopied(true);

    sendTrackEventWithUserName(`dashboard: ${tableName} | ShareTable Link Copied`, {
      table_name: tableName,
      relative_url: relativeUrl,
      link: viewLink,
    });

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <>
      <Tooltip message="Compartir">
        <Button variant="solid-light" color="black" size="medium" className="px-2" onClick={handleOpen}>
          <Share2 className="h-4 w-6" strokeWidth={2} />
        </Button>
      </Tooltip>

      <Dialog.Root
        classNames="min-w-[610px] px-0 pt-0 pb-0"
        open={isOpen}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            handleClose();
          }
        }}
      >
        <div className="flex justify-end px-6 mt-6">
          <Dialog.Close onClick={handleClose}>
            <IcClose />
          </Dialog.Close>
        </div>

        <div className="px-16 pt-0">
          <div className="bg-white rounded-lg overflow-hidden">
            <Image src={IlustratorShareTable} alt="Vista de tabla compartida" className="w-full h-auto" />
          </div>
        </div>

        <div className="px-10 mt-6">
          <h2 className="text-l font-bold text-center">
            ¡Comparte esta vista personalizada con otros usuarios del {selectedSchool?.name}!
          </h2>
        </div>

        <div className="px-10 pb-6 mt-6">
          <p className="text-sm text-[#717993] mb-4 text-center">
            Has aplicado filtros y ajustes a la tabla. Comparte esta vista con otros usuarios mediante este enlace.
            Quien lo reciba verá la tabla exactamente como la configuraste.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#F4F6F8] rounded-lg px-4 py-3 text-[#637381] text-sm overflow-hidden whitespace-nowrap overflow-ellipsis text-left">
              {viewLink || 'Generando enlace...'}
            </div>
            <Button
              variant="solid"
              color={copied ? 'legacy' : 'galaxy'}
              size="medium"
              onClick={handleCopyLink}
              disabled={!viewLink || upsertTableLinkMutation.isPending}
            >
              {copied ? (
                <>
                  <IcCheck /> Copiado
                </>
              ) : (
                <>
                  <IcCopy className="mr-1" /> Copiar enlace
                </>
              )}
            </Button>
          </div>
        </div>
      </Dialog.Root>
    </>
  );
}
