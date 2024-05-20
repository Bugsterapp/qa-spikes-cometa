import React, { useMemo, useRef, useState } from 'react';
import Dialog from '/src/components/atoms/Dialog';
import Button from './organisms/dashboard/Button';
import SidebarHeader from './molecules/dashboard/SidebarHeader';
import Sheet from './atoms/Sheet';
import { TabsWrapper as Tabs } from '/src/components/atoms/Tabs';
import { UpdateQuantityRequestActionEnum, OptionalConceptOrders, StockListHistory } from '@cometa/trpc/src/types';
import { Switch } from '/src/components/atoms/Switch';
import IcDiagonalArrowRightUp from '/public/assets/icons/ic_diagonal_arrow_right_up.svg';
import IcDiagonalArrowLeftDown from '/public/assets/icons/ic_diagonal_arrow_left_down.svg';
import TextField from '/src/components/CustomFormTexField';
import MoneyInput from '/src/components/ui/MoneyInput';
import TextAreaGrow from './atoms/TextAreaGrow/TextAreaGrow';
import { Tooltip } from './atoms/Tooltip';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SidebarVariantHistory from './SidebarVariantHistory';
import { cn } from '../utils/cn';
import { api } from '../utils/api';
import { useGetPermissions, useSelectedSchoolId } from '../guards/AuthGuard';
import useAlert from '../hooks/useAlert';
import { capitalize } from 'lodash';
import { extractPageFromURL } from '../utils/object-util';

interface ISideBarVariants {
  openSideBar: boolean;
  setOpenSideBar: (openSideBar: boolean) => void;
  selectedRow: OptionalConceptOrders['id'] | undefined;

  tabsConceptsData: { value: string; label: string }[];
  setSelectedRow: (selectedRow: OptionalConceptOrders['id'] | undefined) => void;
  serverData: OptionalConceptOrders[] | undefined;
  tab: string;
  handleChangeTab: (value: string) => void;
}

export default function SidebarVariants({
  openSideBar,
  setOpenSideBar,
  selectedRow,
  serverData,
  tabsConceptsData,
  tab,
  handleChangeTab,
}: ISideBarVariants) {
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [action, setAction] = useState(UpdateQuantityRequestActionEnum.SUM);
  const [isLimited, setisLimited] = useState<boolean>(
    serverData?.find((item) => item.id === selectedRow)?.stock?.is_limited ? true : false
  );
  const { setAlertState } = useAlert();
  const utils = api.useUtils();
  const permissions = useGetPermissions();

  const handleOpenDialog = (action: UpdateQuantityRequestActionEnum) => {
    setAction(action);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const baseSchema = z.object({
    quantity: z
      .number()
      .nullable()
      .refine((val) => val !== null, {
        message: 'Completa este campo para continuar',
      }),
    observations: z.string().nullable(),
  });

  const schemaSum = baseSchema.refine((data) => data.quantity !== null && data.quantity >= 0, {
    message: 'El monto debe ser mayor a 0',
    path: ['quantity'],
  });
  const selectedRowData = serverData?.find((item) => item.id === selectedRow) || null;
  const additionalRefinement = (data: { quantity: number | null }) => {
    const currentStock = selectedRowData?.stock?.quantity ?? 0;
    const newStock = currentStock - (data.quantity ?? 0);
    return newStock >= 0;
  };

  const schemaSubtract = baseSchema
    .refine((data) => data.quantity !== null && data.quantity >= 0, {
      message: 'El monto debe ser mayor a 0',
      path: ['quantity'],
    })
    .refine(additionalRefinement, {
      message: 'El nuevo stock no puede ser menor a 0',
      path: ['quantity'],
    });

  const schema = action === UpdateQuantityRequestActionEnum.SUM ? schemaSum : schemaSubtract;

  type IFormData = z.infer<typeof schema>;

  const toEditQuantityForm = useForm<IFormData>({
    resolver: zodResolver(action === UpdateQuantityRequestActionEnum.SUM ? schemaSum : schemaSubtract),
    defaultValues: {
      quantity: null,
      observations: '',
    },
  });
  const selectedSchoolId = useSelectedSchoolId();
  const { reset } = toEditQuantityForm;
  const changeLimiteMutation = api.concepts.conceptsChangeLimitedType.useMutation({
    onSuccess: async () => {
      // i do the invalidations this way so we can see the changes in the UI look faster. The table will look like it's updating faster than the other part of the concepts.
      await utils.concepts.conceptsStockHistoryList.invalidate();
      await utils.concepts.optionalConceptsOrdersList.invalidate();
      await utils.concepts.invalidate();
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No hemos podido cambiar el tipo de stock, por favor intenta de nuevo.',
      });
      setisLimited(!isLimited);
    },
  });
  const updateQuantityMutation = api.concepts.conceptsUpdateQuantity.useMutation({
    onSuccess: async () => {
      await utils.concepts.conceptsStockHistoryList.invalidate();
      await utils.concepts.optionalConceptsOrdersList.invalidate();
      reset();
      handleCloseDialog();
      setAlertState({
        open: true,
        severity: 'success',
        message: 'El stock se actualizó correctamente.',
      });
    },
    onError: () => {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No hemos podido actualizar el stock, por favor intenta de nuevo.',
      });
    },
  });
  const handleChangeSwitch = async () => {
    setisLimited(!isLimited);
    await changeLimiteMutation.mutate({
      school_id: selectedSchoolId || '',
      is_limited: !isLimited,
      stock_id: selectedRowData?.stock?.id || '',
    });
  };

  const onSubmitForm: SubmitHandler<IFormData> = async (dataForm) => {
    await updateQuantityMutation.mutate({
      id: selectedRowData?.stock?.id || '',
      schoolId: selectedSchoolId || '',
      action,
      quantity: dataForm.quantity || 0,
      observations: dataForm.observations || '',
    });
  };
  const {
    data: stockHistory,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.concepts.conceptsStockHistoryList.useInfiniteQuery(
    {
      id: selectedRowData?.stock?.id || '',
      schoolId: selectedSchoolId || '',
      pageSize: 10,
    },
    {
      getNextPageParam: (lastPage) => extractPageFromURL(lastPage?.next as string) ?? undefined,
      getPreviousPageParam: (firstPage) => firstPage ?? undefined,
      enabled: !!selectedRowData?.stock?.id && !!selectedSchoolId,
    }
  );
  const flatData = useMemo(() => stockHistory?.pages?.flatMap((page) => page?.results ?? []), [stockHistory]);
  const computeIsRepeatedFlag = (stockHistory: StockListHistory[]) => {
    const datesEncountered = new Set();
    const historyWithFlag = stockHistory.map((entry) => {
      const entryDate = new Date(entry.created).toDateString();
      const isRepeated = datesEncountered.has(entryDate);
      datesEncountered.add(entryDate);
      return { ...entry, is_repeated: isRepeated };
    });

    return historyWithFlag;
  };

  const flatDataWithRepeated = computeIsRepeatedFlag(flatData || []).filter((item) => item.action !== 'SET_FIRST_TIME');
  const [isScrolling, setIsScrolling] = useState(false);
  const handleScroll = (isScrolling: boolean) => {
    setIsScrolling(isScrolling);
  };
  return (
    <div className="">
      <Sheet
        open={openSideBar}
        onOpenChange={(open) => {
          setOpenSideBar(open);
        }}
      >
        <Sheet.Content
          disableAutoFocus
          className="shadow-lg shadow-[#919EAB]"
          onStartedScroll={handleScroll}
          sheetWithoutBackground
        >
          <SidebarHeader
            title="Detalle variante"
            onClose={() => {
              setOpenSideBar(!openSideBar);
            }}
            boxClassName="px-8"
          />
          <div className="sticky top-[77px]">
            {selectedRow ? (
              <Tabs
                tabs={tabsConceptsData}
                tab={tab}
                handleChangeTab={handleChangeTab}
                defaultValue="details"
                tabsListClassName="px-10 "
                showShadow={isScrolling}
              />
            ) : (
              <></>
            )}
          </div>
          <div
            className={cn('h-[2px] bg-green transition-all duration-300  ease-linear animate-pulse', {
              'w-full': changeLimiteMutation.isLoading,
              'bg-red-300 duration-700': changeLimiteMutation.isError,
              'translate-x-full opacity-0 w-0 duration-300': !changeLimiteMutation.isLoading,
            })}
          />
          {selectedRow && tab === 'details' ? (
            <div className="px-8 py-5 pb-10">
              <div className="pb-6 ">
                <h2 className="border-b border-[#919EAB3D] pb-1 mb-4 text-[#637381] text-xs uppercase py-2 font-bold">
                  INFORMACIÓN GENERAL
                </h2>
                <p className="text-xs text-[#637381] mt-3">
                  Esta es la información que verán los tutores al momento de realizar el pago de esta variante.
                </p>
              </div>
              {selectedRow && (
                <div>
                  <div className="mb-6">
                    <p className="text-xs text-[#919EAB]"> Nombre </p>
                    <p className="text-lg text-[#1C1C1D]"> {selectedRowData?.name} </p>
                  </div>
                  <div className="mb-6">
                    <p className="text-xs text-[#919EAB]"> Precio </p>
                    <p className="text-lg text-[#1C1C1D]">MXN {selectedRowData?.price}</p>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-[#637381] border-b border-[#919EAB3D] pb-1">INVENTARIO</h2>
                    <p className="text-xs text-[#637381] mt-3">
                      El inventario limitará el número de veces que se puede pagar esta variante. Si el inventario llega
                      a 0, esta variante será marcada como “Sin stock”.
                    </p>
                    <div className="">
                      <div className="mt-6 mb-4 flex items-center border-b border-gray-300 pb-3">
                        <h3 className="text-[#212B36] ">Stock ilimitado</h3>
                        <Tooltip message="Las variantes con stock ilimitado, no tienen un limite de veces que pueden ser pagadas.">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 ml-2 mr-4"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2ZM13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V11C11 10.4477 11.4477 10 12 10C12.5523 10 13 10.4477 13 11V16ZM11 8C11 8.55228 11.4477 9 12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8Z"
                              fill="#919EAB"
                            />
                          </svg>
                        </Tooltip>

                        <Tooltip
                          message="Actualmente no tienes permisos para modificar el stock de este concepto."
                          disableClick={!!permissions.can_edit_stock}
                          disableHover={!!permissions.can_edit_stock}
                        >
                          <Switch
                            id="waive-surcharge"
                            checked={!isLimited}
                            disabled={changeLimiteMutation.isLoading || !permissions.can_edit_stock}
                            onCheckedChange={handleChangeSwitch}
                            className={cn('align-middle disabled:cursor-wait', {
                              'disabled:cursor-not-allowed': !permissions.can_edit_stock,
                            })}
                          />
                        </Tooltip>
                      </div>
                      <p className="text-xs text-[#919EAB]">Stock disponible</p>
                    </div>
                    {!changeLimiteMutation.isLoading && isLimited ? (
                      <div className="flex items-center justify-between">
                        <p className="text-lg text-[#1C1C1D]">
                          {selectedRowData?.stock !== null
                            ? selectedRowData?.stock?.quantity +
                              ' ' +
                              `${
                                selectedRowData?.stock?.quantity && selectedRowData?.stock?.quantity > 1
                                  ? 'unidades'
                                  : 'unidad'
                              }`
                            : '0 unidades'}
                        </p>
                        {permissions.can_edit_stock && (
                          <div className="border border-l border-r-0 border-y-0 flex items-center border-gray-300">
                            <Button
                              variant="ghost"
                              className="flex items-center gap-1"
                              onClick={() => {
                                handleOpenDialog(UpdateQuantityRequestActionEnum.SUM);
                              }}
                            >
                              <IcDiagonalArrowRightUp />
                              <p className="text-sm text-green">Aumentar stock</p>
                            </Button>
                            <Button
                              variant="ghost"
                              className="flex items-center gap-1"
                              onClick={() => {
                                handleOpenDialog(UpdateQuantityRequestActionEnum.SUBTRACT);
                              }}
                            >
                              <IcDiagonalArrowLeftDown />
                              <p className="text-sm text-green">Reducir stock</p>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg text-[#1C1C1D]">Ilimitado</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {selectedRow && tab === 'history-of-changes' && (
            <SidebarVariantHistory
              data={flatDataWithRepeated || []}
              hasNextPage={hasNextPage || false}
              fetchNextPage={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoading}
              isFetching={isFetching}
            />
          )}
        </Sheet.Content>
      </Sheet>
      <DialogToEditQuantityForm
        open={isDialogOpen}
        title={action === UpdateQuantityRequestActionEnum.SUM ? 'Aumentar' : 'Reducir'}
        onClose={handleCloseDialog}
        dataFromBack={selectedRowData}
        key={`${selectedRow}-${action}`}
        toEditQuantityForm={toEditQuantityForm}
        onSubmitForm={onSubmitForm}
        isMutating={updateQuantityMutation.isLoading}
      />
    </div>
  );
}

interface IDialogToEditQuantity {
  open: boolean;
  title: string;
  onClose: () => void;
  dataFromBack: OptionalConceptOrders | null;
  toEditQuantityForm: any;
  onSubmitForm: any;
  isMutating?: boolean;
}

const DialogToEditQuantityForm: React.FC<IDialogToEditQuantity> = ({
  open,
  title,
  onClose,
  dataFromBack,
  toEditQuantityForm,
  onSubmitForm,
  isMutating,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textarea = textAreaRef.current;

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    reset,
    watch,
  } = toEditQuantityForm;

  const unitSingularOrPlural = (quantity: number) => (quantity === 1 ? 'unidad' : 'unidades');

  const quantityResult =
    title === 'Aumentar'
      ? (dataFromBack?.stock?.quantity ?? 0) + watch('quantity')
      : (dataFromBack?.stock?.quantity ?? 0) - watch('quantity');
  return (
    <Dialog.Root
      open={open}
      position="right"
      onOpenChange={() => {
        reset();
        onClose();
      }}
    >
      <Dialog.Title>{title} stock</Dialog.Title>
      <Dialog.Description>
        <span className="font-semibold">Registra el movimiento en el inventario de esta variante.</span>
      </Dialog.Description>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmitForm)}>
        <div className="flex-col flex gap-2">
          <div className="flex justify-between gap-4">
            <div className="mb-10 mt-2 max-w-[220px]">
              <Controller
                control={control}
                name="quantity"
                render={({ field }) => (
                  <MoneyInput
                    {...field}
                    prefix=""
                    label={`Unidades a ${capitalize(title)}`}
                    error={errors.quantity?.message}
                  />
                )}
              />
            </div>
            <div
              className={`transition-opacity duration-700 ease-in-out ${
                watch('quantity') ? 'opacity-1' : 'opacity-0'
              } bg-[#F9FAFB] py-2 px-2 rounded-xl h-max mt-2 w-[147px]`}
            >
              {watch('quantity') && (
                <>
                  <p className="text-xs text-[#919EAB] text-end">Nuevo stock disponible</p>
                  <p className="text-[#212B36] text-end">
                    {quantityResult} {unitSingularOrPlural(quantityResult)}
                  </p>
                </>
              )}
            </div>
          </div>
          <Controller
            control={control}
            name="observations"
            render={({ field }) => (
              <TextField label="Comentario (opcional)" textareaGrow value={watch('observations')} className="mb-2">
                <TextAreaGrow
                  {...field}
                  ref={textAreaRef}
                  id="observations"
                  className="border-none"
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    if (textarea) {
                      textarea.style.overflowY = 'auto';
                      textarea.style.maxHeight = '200px';
                      textarea.style.height = 'auto';
                      if (textarea.scrollHeight > 200) {
                        textarea.style.height = '200px';
                      } else {
                        textarea.style.height = `${textarea.scrollHeight}px`;
                      }
                    }

                    setValue('observations', event.target.value);
                  }}
                  errors={false}
                />
              </TextField>
            )}
          />
          <div className="flex justify-center gap-10">
            <Button
              id="dialog-variant-cancel"
              variant="ghost"
              type="button"
              size="tooltip"
              className="text-green"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Descartar
            </Button>
            <Button
              type="submit"
              id="dialog-variant-save"
              size="tooltip"
              className="min-w-[156px]"
              disabled={isMutating}
            >
              {isMutating ? <img src="/assets/oval.svg" alt="loading" className="mx-auto h-5" /> : 'Guardar'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog.Root>
  );
};
