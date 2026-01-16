import { Dialog } from '@cometa/recreo';
import { Button } from '@cometa/recreo/v2';
import { BotFiscalEntityDTO, OnboardingStatus } from '@cometa/trpc/src/bot/types';
import { keepPreviousData } from '@tanstack/react-query';
import Image from 'next/image';
import IcPlus from 'public/assets/icons/levels_grades_groups/ic_plus.svg';
import { useState } from 'react';
import Sheet from '../../components/atoms/Sheet';
import { Skeleton } from '../../components/atoms/Skeleton';
import { useFlagWithVariableMatching } from '../../components/flags/FlagsProvider';
import Layout from '../../components/layouts';
import { PageStateHandler } from '../../components/school_config';
import { FiscalEntityCard } from '../../components/school_config/fiscal_entities/FiscalEntityCard';
import { FiscalEntityDetailsDrawer } from '../../components/school_config/fiscal_entities/FiscalEntityDetailsDrawer';
import { FiscalEntityFormDrawer } from '../../components/school_config/fiscal_entities/FiscalEntityForm';
import type { FiscalEntityForm } from '../../components/school_config/fiscal_entities/FiscalEntityForm/types';
import { useGetMembership, useSelectedSchool } from '../../guards/AuthGuard';
import useAlert from '../../hooks/useAlert';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';
import { api } from '../../utils/api';
import { useFiscalEntityForm } from '../../stores/fiscalEntityFormStore';
import { FormDrawerSheet } from '../../components/school_config/CustomSheets';

type FiscalEntitiesStatusProps = {
  isInitialLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onAddNew: () => void;
};

const allowedMemberships = new Set(['OWNER', 'GENERAL_DIRECTOR', 'ADMINISTRATIVE_DIRECTOR']);

export default function FiscalEntitiesPage() {
  const selectedSchool = useSelectedSchool();
  const membership = useGetMembership();
  const { setAlertState } = useAlert();
  const { isEnabled: enableFiscalEntitiesFlag } = useFlagWithVariableMatching('enable_fiscal_entities');

  const utils = api.useUtils();
  const { clearNewEntityForm, clearEntityForm, loadEntity } = useFiscalEntityForm();

  const openDrawerForEntity = (entity?: BotFiscalEntityDTO | null) => {
    setEditingFiscalEntity(entity || null);
    loadEntity(entity);
    setShowFiscalEntityDrawer(true);
  };

  const [showFiscalEntityDrawer, setShowFiscalEntityDrawer] = useState(false);
  const [editingFiscalEntity, setEditingFiscalEntity] = useState<BotFiscalEntityDTO | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [viewingFiscalEntity, setViewingFiscalEntity] = useState<BotFiscalEntityDTO | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingFiscalEntity, setDeletingFiscalEntity] = useState<BotFiscalEntityDTO | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const {
    data: fiscalEntities,
    isPending: isLoading,
    isError: isFiscalEntitiesError,
  } = api.bot.getFiscalEntities.useQuery(
    {
      schoolId: selectedSchool?.id ?? '',
    },
    {
      enabled: !!selectedSchool?.id && enableFiscalEntitiesFlag,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
      placeholderData: keepPreviousData,
    }
  );

  const entities = fiscalEntities ?? [];

  const createFiscalEntityMutation = api.bot.createFiscalEntity.useMutation({
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'Error al crear la entidad fiscal',
      });
    },
  });

  const deleteFiscalEntityMutation = api.bot.deleteFiscalEntity.useMutation({
    onError: (error) => {
      setAlertState({
        open: true,
        severity: 'error',
        message: error.message ?? 'Error al eliminar la entidad fiscal',
      });
    },
  });

  const handleSave = async (formValues: FiscalEntityForm) => {
    if (!selectedSchool?.id) {
      return;
    }

    const fiscalEntityData = {
      ...formValues,
      country: 'MX',
    };

    const isDeclinedEntity = editingFiscalEntity && editingFiscalEntity.status === OnboardingStatus.Declined;

    setShowFiscalEntityDrawer(false);
    setEditingFiscalEntity(null);
    setIsMutating(true);

    createFiscalEntityMutation.mutate(
      {
        schoolId: selectedSchool.id,
        data: fiscalEntityData,
      },
      {
        onSuccess: () => {
          if (isDeclinedEntity) {
            deleteFiscalEntityMutation.mutate(
              { fiscalEntityId: editingFiscalEntity.id },
              {
                onSuccess: () => {
                  void utils.bot.getFiscalEntities.invalidate().then(() => {
                    clearEntityForm(editingFiscalEntity.id);
                    setIsMutating(false);
                    setAlertState({
                      open: true,
                      severity: 'success',
                      message: 'Solicitud enviada exitosamente',
                    });
                  });
                },
              }
            );
          } else {
            void utils.bot.getFiscalEntities.invalidate().then(() => {
              clearNewEntityForm();
              setIsMutating(false);
              setAlertState({
                open: true,
                severity: 'success',
                message: 'Entidad fiscal creada correctamente',
              });
            });
          }
        },
        onError: () => {
          setIsMutating(false);
        },
      }
    );
  };

  const handleDelete = (fiscalEntity: BotFiscalEntityDTO) => {
    setDeletingFiscalEntity(fiscalEntity);
    setShowDeleteDialog(true);
  };

  const handleDeleteById = (fiscalEntityId: string) => {
    const fiscalEntity = entities.find((entity) => entity.id === fiscalEntityId);
    if (fiscalEntity) {
      handleDelete(fiscalEntity);
    }
  };

  const handleConfirmDelete = () => {
    setShowDetailsDrawer(false);
    setViewingFiscalEntity(null);
    setShowFiscalEntityDrawer(false);
    setEditingFiscalEntity(null);
    setShowDeleteDialog(false);
    setDeletingFiscalEntity(null);

    if (deletingFiscalEntity) {
      setIsMutating(true);
      deleteFiscalEntityMutation.mutate(
        { fiscalEntityId: deletingFiscalEntity.id },
        {
          onSuccess: () => {
            void utils.bot.getFiscalEntities.invalidate().then(() => {
              clearEntityForm(deletingFiscalEntity.id);
              setIsMutating(false);
              setAlertState({
                open: true,
                severity: 'success',
                message: 'Entidad fiscal eliminada correctamente',
              });
            });
          },
          onError: () => {
            setIsMutating(false);
          },
        }
      );
    }
  };

  const handleView = (fiscalEntity: BotFiscalEntityDTO) => {
    setViewingFiscalEntity(fiscalEntity);
    setShowDetailsDrawer(true);
  };

  const isEmpty = !isLoading && !isMutating && entities.length === 0;
  const showSkeletons = isLoading || isMutating;

  useSendPageViewedEvent('Entidades fiscales', selectedSchool);

  const canViewPage = allowedMemberships.has(membership ?? '') && enableFiscalEntitiesFlag;

  if (isFiscalEntitiesError) {
    return (
      <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
        <FiscalEntitiesStatus
          isInitialLoading={false}
          isError={isFiscalEntitiesError}
          isEmpty={false}
          onAddNew={() => openDrawerForEntity()}
        />
      </PageStateHandler>
    );
  }

  return (
    <PageStateHandler canViewPage={canViewPage} selectedSchool={selectedSchool}>
      <div className="w-full h-full">
        <div className="flex flex-col items-start px-8 sm:px-0 pt-6 pb-28 flex-1 w-full bg-white rounded-xl shadow-none">
          <div className="w-full max-w-[540px] mx-auto">
            <div className="content-stretch flex flex-col gap-8 items-start justify-start relative w-full">
              <div className="content-stretch flex flex-col gap-1 items-start justify-start leading-[0] not-italic relative shrink-0 w-full">
                <div className="font-lota font-semibold relative shrink-0 text-[#22283a] text-[24px] w-full">
                  <p className="leading-[32px]">Entidades fiscales</p>
                </div>
                <div
                  className="flex flex-col font-lota justify-center relative shrink-0
                  text-[#444c60] text-[16px] w-full"
                >
                  <p className="leading-[24px]">
                    Registra aquí las entidades fiscales que utilizarás para tu facturación
                  </p>
                </div>
              </div>

              <div className="content-stretch flex flex-col gap-4 items-start justify-start relative shrink-0 w-full">
                {isEmpty || showSkeletons ? (
                  <FiscalEntitiesStatus
                    isInitialLoading={showSkeletons}
                    isError={false}
                    isEmpty={isEmpty && !showSkeletons}
                    onAddNew={() => openDrawerForEntity()}
                  />
                ) : (
                  <>
                    {entities.map((fiscalEntity) => (
                      <FiscalEntityCard
                        key={fiscalEntity.id}
                        fiscalEntity={fiscalEntity}
                        onView={handleView}
                        onEdit={(fiscalEntity) => openDrawerForEntity(fiscalEntity)}
                      />
                    ))}

                    <div className="sticky bottom-0 w-full -mt-4">
                      <div className="absolute bottom-full left-0 right-0 h-20 pointer-events-none" />
                      <div className="bg-white pt-4 pb-6">
                        <Button variant="ghost" className="gap-1" onClick={() => openDrawerForEntity()}>
                          <div className="overflow-clip relative shrink-0 size-4">
                            <IcPlus width="16" height="16" className="text-[#22283a]" />
                          </div>
                          <div className="flex flex-col font-lota font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#22283a] text-[14px] text-nowrap">
                            <p className="leading-[20px] whitespace-pre">Agregar entidad fiscal</p>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={showDetailsDrawer} onOpenChange={setShowDetailsDrawer}>
        <Sheet.Content className="max-h-[calc(100vh-16px)] h-full max-w-[564px] w-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
          <FiscalEntityDetailsDrawer
            fiscalEntity={viewingFiscalEntity}
            onClose={() => {
              setShowDetailsDrawer(false);
              setViewingFiscalEntity(null);
            }}
            onDelete={handleDelete}
            onCSDUpdate={() => {
              void utils.bot.getFiscalEntities.invalidate();
            }}
          />
        </Sheet.Content>
      </Sheet>

      <FormDrawerSheet open={showFiscalEntityDrawer} onOpenChange={setShowFiscalEntityDrawer}>
        <FiscalEntityFormDrawer
          onClose={() => {
            setShowFiscalEntityDrawer(false);
            setEditingFiscalEntity(null);
          }}
          onSave={handleSave}
          onDelete={handleDeleteById}
          fiscalEntity={editingFiscalEntity}
        />
      </FormDrawerSheet>

      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Title>¿Quieres eliminar esta entidad fiscal?</Dialog.Title>
        <div className="flex justify-between max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-8">
          <Dialog.Close
            onClick={() => {
              setShowDeleteDialog(false);
              setDeletingFiscalEntity(null);
            }}
            asChild
          >
            <Button className="w-full" variant="ghost">
              No, volver
            </Button>
          </Dialog.Close>
          <Button
            className="w-full bg-[#FF4842] hover:bg-[#c73833] text-white"
            onClick={handleConfirmDelete}
            disabled={deleteFiscalEntityMutation.isPending}
          >
            {deleteFiscalEntityMutation.isPending ? 'Eliminando...' : 'Si, eliminar'}
          </Button>
        </div>
      </Dialog.Root>
    </PageStateHandler>
  );
}

function FiscalEntitiesStatus({ isInitialLoading, isError, isEmpty, onAddNew }: Readonly<FiscalEntitiesStatusProps>) {
  if (isInitialLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-h-[400px] overflow-y-auto">
        <Skeleton className="w-full h-20" variant="card" />
        <Skeleton className="w-full h-20" variant="card" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="w-full p-8 text-center border-2 border-dashed border-red-200 rounded-lg">
        <p className="text-red-500 text-sm">Error al cargar las entidades fiscales. Intenta de nuevo.</p>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="bg-[#f8f9fb] rounded-[16px] p-[24px] flex flex-col items-center justify-center gap-6 h-[368px] w-full">
        <div className="flex flex-col items-center justify-start gap-4 w-full">
          <div className="w-20 h-20 bg-center bg-cover bg-no-repeat shrink-0">
            <Image
              src="/assets/images/fiscal_entities.png"
              alt="Entidades fiscales"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col items-center justify-start gap-2 text-center w-full max-w-[466px]">
            <h3 className="text-[#22283a] text-base font-semibold font-lota leading-6">
              Registra tus entidades fiscales
            </h3>
            <p className="text-[#444c60] text-sm font-normal font-lota leading-5 max-w-[428px]">
              Al crear tus conceptos de cobro podrás determinar la entidad fiscal a utilizar para su facturación.
            </p>
          </div>
        </div>
        <Button variant="light" size="sm" className="gap-1" onClick={onAddNew}>
          <IcPlus className="w-4 h-4" />
          Agregar entidad fiscal
        </Button>
      </div>
    );
  }
  return null;
}

FiscalEntitiesPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Entidades fiscales" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

FiscalEntitiesPage.auth = true;
