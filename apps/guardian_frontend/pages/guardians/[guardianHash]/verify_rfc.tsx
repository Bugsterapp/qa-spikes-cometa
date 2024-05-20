import Head from 'next/head';
import React, { DetailedHTMLProps, InputHTMLAttributes, useEffect, useMemo, useState } from 'react';
import ResumeCardList from '~/components/organisms/guardians/ResumeCardList';
import TitleBackButton from '~/components/molecules/guardians/TitleBackButton';
import { useRouter } from 'next/router';
import { PayButton } from '~/components/atoms/guardians/PayButton';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { NextPageContext } from 'next';
import * as Dialog from '@radix-ui/react-dialog';
import Button from '~/components/atoms/Button';
import * as Drawer from '~/components/atoms/guardians/Drawer';
import { useAlert } from '~/hooks';
import { useVerifyRFC, useSelectionStore } from '@cometa/hooks';
import BoxColorText from '~/components/atoms/guardians/BoxColorText';
import { formatPrice } from '~/utils/orders';
import currencyjs from 'currency.js';
import { cn } from '~/lib/cn';
import { HelperTextWithIcon } from '~/components/CustomFormField';
import { api } from '~/utils/api';
import { AssignBilling, BillingStudent } from '@cometa/trpc/src/types';
import IcInfo from '/public/icons/information-white.svg';
import useSendTrackEvent from '~/hooks/useSendEvent';
import { addColorsToDependents, Color } from '~/utils/colors';
import { DependantErrorRFC } from '@cometa/contexts/src/VerifyRFCContext';
import Tour from '~/components/atoms/common/Tour';
import JoyrideTooltip from '~/components/atoms/common/JoyrideTooltip';
import { SET_RFC_INVOICE_CONFIRM } from '~/utils/joyride';
import { useTour } from '~/hooks/useTour';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';

interface ResumeProps {
  guardianHash: string;
}

interface RadioWithLabelProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  isError?: boolean;
}

const RadioWithLabel = ({ children, value, id, isError = false, ...otherProps }: RadioWithLabelProps) => (
  <>
    <div
      className={cn('my-2.5 hover:text-blue-100 hover:bg-[#ACACAC]/10 rounded-lg', {
        'border border-[#FF4842]': isError,
        'text-blue-100 bg-[#ACACAC]/10': otherProps.checked,
      })}
    >
      <label
        htmlFor={id}
        className="text-sm/6 flex flex-row items-center justify-between w-full pl-[26px] pr-4 py-[8px]"
      >
        {children}
        <input {...otherProps} type="radio" value={value} id={id} className="w-5 h-5 ml-2" />
      </label>
    </div>
    {isError && <HelperTextWithIcon isError>Los datos no coinciden con los del SAT</HelperTextWithIcon>}
  </>
);
function VerifyRFC({ guardianHash }: ResumeProps) {
  const router = useRouter();
  const { selectedItems, totalToPay, studentIds } = useSelectionStore();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openSelectorRFC, setOpenSelectorRFC] = useState(false);
  const [openIncompleteData, setOpenIncompleteData] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState<(DependantErrorRFC & Color) | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const sendTrackEvent = useSendTrackEvent();
  const { setAlert } = useAlert();
  const selectedSchool = useSelectedSchool();

  const {
    dependentsWithErrors: dependentsWithErrorsWithOutColor,
    isFetchingVerifyRfc,
    user,
    billingGuardiansIds,
    isFetchingUser,
    refetchUser,
  } = useVerifyRFC();
  const { showTour, handleShowTour } = useTour();

  if (user) user.dependents = addColorsToDependents(user.dependents) as any;
  const dependentsWithErrors = addColorsToDependents(dependentsWithErrorsWithOutColor) as (BillingStudent & Color)[];
  const haveRFC = user?.id && user.tax_id && user.billing_name && user.taxing_system && user.postal_code;
  const mutation = api.student.assignBillings.useMutation({
    onSuccess: async () => {
      refetchUser();
      setOpenSelectorRFC(false);
    },
    onError(_, variables) {
      setAlert('No se pudo cambiar, vuelva a intentarlo');
      sendTrackEvent('portal: Resume Page change billing guardian', {
        variables,
        status: 'failure',
        reason: 'Not found',
      });
    },
  });

  const assignBillings = (data: AssignBilling[]) => {
    const input = { data: { students: data } };
    return mutation.mutate(input);
  };

  const isOtherBillingGuardian = !(
    selectedDependent?.billing_guardian && selectedDependent.billing_guardian.id === user?.id
  );
  const haveOtherRFC = billingGuardiansIds.some((id) => id !== user?.id);

  const itemsQuantity = selectedItems.length;

  useEffect(() => {
    if (!itemsQuantity) router.push(`/guardians/${guardianHash}`);
  }, [itemsQuantity, guardianHash, router]);

  useSendPageViewedEvent('Resumen');

  const handlerBackButton = () => {
    router.push(`/guardians/${guardianHash}`);
  };

  const dependents = Array.from(studentIds).map((id) => dependentsWithErrors.find((dependent) => dependent.id === id));
  const oneHaveError = dependents.find((dependent) => (dependent as any)?.errorRFC);
  const oneHaveIncompleteData = dependents.find(
    (dependent) => dependent?.billing_guardian?.id === user?.id && !haveRFC
  );

  const studentsWithoutInvoice = useMemo(
    () => dependentsWithErrors.filter((d) => d?.billing_guardian === null),
    [dependentsWithErrors]
  );

  const studentsWithoutInvoiceNames = useMemo(() => {
    const names = studentsWithoutInvoice.map((s) => `${s.first_name} ${s.last_name}`);

    let formattedNames = '';
    if (names.length > 1) {
      formattedNames = `${names.slice(0, -1).join(', ')} y ${names.slice(-1)}`;
    } else {
      formattedNames = names[0];
    }

    return formattedNames;
  }, [studentsWithoutInvoice]);

  const handleContinue = () => {
    if (
      Boolean(selectedSchool?.does_invoice) &&
      studentsWithoutInvoice.length &&
      router.query.verify_status !== 'invoice_dismissed' &&
      router.query.verify_status !== 'no_invoice'
    ) {
      router.push({ query: { ...router.query, verify_status: 'no_invoice' } }, undefined, {
        shallow: true,
      });
      return;
    }

    if (oneHaveIncompleteData) {
      setOpenIncompleteData(true);
      router.push(`#card-${oneHaveIncompleteData.id}`);
    } else if (oneHaveError) {
      setOpenModal(true);
      router.push(`#card-${oneHaveError.id}`);
    } else {
      router.push(
        {
          query: {
            ...router.query,
            verify_status: 'invoice_dismissed',
          },
        },
        undefined,
        {
          shallow: true,
        }
      );
      router.push(`/guardians/${guardianHash}/payments`);
    }
  };

  const assignBillingGuardian = (dependentId: string, billingGuardianId: string | null) => {
    const data = [{ id: dependentId, billing_guardian: billingGuardianId }];
    updateSelectedRfc(billingGuardianId, dependentId);
    assignBillings(data);
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
  };

  const goToEditRFC = () => {
    const url = `/guardians/${guardianHash}/billing/edit`;
    router.push({
      pathname: url,
      query: { back: router.asPath, isEditing: true },
    });
  };

  const handleAssignRFC = (dependent: DependantErrorRFC) => {
    if (dependent.errorRFC) {
      const dependantWithErrors = dependentsWithErrors.find((dep) => dep.id === dependent.id) ?? null;
      setOpenDrawer(true);
      setSelectedDependent(dependantWithErrors);
    } else {
      setOpenSelectorRFC(true);
    }
  };

  const initSelectedRfc =
    user?.dependents?.reduce((acc, current) => ({ ...acc, [current.id]: current?.billing_guardian?.id || null }), {}) ??
    {};

  const [selectedRfc, setSelectedRfc] = useState<Record<string, string | null>>(initSelectedRfc);
  const multiAssignBillings = () => {
    const data = Object.keys(selectedRfc).map<AssignBilling>((id) => ({ id: id, billing_guardian: selectedRfc[id] }));
    assignBillings(data);
  };
  const updateSelectedRfc = (guardianId: string | null, studentId: string) => {
    const newRfc = { ...selectedRfc };
    newRfc[studentId] = guardianId;
    setSelectedRfc(newRfc);
  };
  const dependentsWithMyBilling = useMemo(
    () =>
      dependentsWithErrors.flatMap((dependent) =>
        dependent?.billing_guardian?.id === user?.id
          ? [
              <BoxColorText
                key={dependent.id}
                bgcolor={dependent?.color?.background}
                color={dependent?.color?.text}
                text={dependent?.first_name.toUpperCase() || ''}
              />,
            ]
          : []
      ),
    [dependentsWithErrors, user?.id]
  );
  const textSaveButton =
    haveRFC || JSON.stringify(initSelectedRfc) !== JSON.stringify(selectedRfc) ? 'Guardar' : 'Registrar mi RFC';

  const needsInvoiceConfirmation = router.query.verify_status === 'no_invoice';

  useEffect(() => {
    if (router.query.target) {
      const target = document.getElementById(`card-${router.query.target}-change-rfc`);

      if (target) {
        const rect = target.getBoundingClientRect();

        const scrollTo = window.scrollY + rect.top - window.innerHeight / 2;

        window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      }
    }
  }, [router.query.target]);

  return (
    <>
      <TitleBackButton title="Resumen" onClick={handlerBackButton} />
      <div className="py-[18px]">
        <div className="mx-[22px]">
          <ResumeCardList
            selectedItems={selectedItems}
            dependents={dependentsWithErrors?.length ? dependentsWithErrors : user?.dependents ?? []}
            onAssignRFC={handleAssignRFC}
            isLoadingVerify={isFetchingVerifyRfc}
            isLoading={isFetchingUser}
            isVerify
          />

          <Tour
            run={Boolean(router.query.target && showTour && !showTour.needsInvoiceConfirmation)}
            steps={SET_RFC_INVOICE_CONFIRM(router.query.target as string)}
            tooltipComponent={JoyrideTooltip}
            callback={(callback) => {
              if (callback.status === 'finished') {
                if (!showTour?.needsInvoiceConfirmation) handleShowTour('needsInvoiceConfirmation');
                router.push(
                  {
                    query: {
                      ...Object.fromEntries(Object.entries(router.query).filter((e) => e[0] !== 'target')),
                    },
                  },
                  undefined,
                  {
                    shallow: true,
                  }
                );
              }
            }}
          />
        </div>
        {Boolean(itemsQuantity) && (
          <div className="my-36">
            <PayButton
              priceTotal={totalToPay}
              itemsQuantity={itemsQuantity}
              currency={selectedItems[0].currency}
              onClick={handleContinue}
              buttonText="PAGAR"
              loading={openModal || isFetchingVerifyRfc}
            />
          </div>
        )}
      </div>
      <Drawer.Root open={Boolean(selectedSchool?.does_invoice) && needsInvoiceConfirmation}>
        <Drawer.Overlay />
        <Drawer.Content className="max-w-md">
          <div className="px-[41px] py-[46px] flex flex-col items-center">
            <Drawer.Title className="text-xl font-bold text-center text-gray-300  mb-1.5 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 60 60" className="w-[60px] mx-auto">
                <g clip-path="url(#a)">
                  <path
                    fill="#213372"
                    d="M35 32a1 1 0 0 1-1 1h-8a1 1 0 1 1 0-2h8a1 1 0 0 1 1 1Zm-4 3h-5a1 1 0 0 0 0 2h5a1 1 0 1 0 0-2Zm9-6.515V37a5.006 5.006 0 0 1-5 5H25a5.006 5.006 0 0 1-5-5V23a5.006 5.006 0 0 1 5-5h4.515a6.959 6.959 0 0 1 4.95 2.05l3.484 3.486A6.951 6.951 0 0 1 40 28.485Zm-6.949-7.021a5.01 5.01 0 0 0-1.051-.78V25a1 1 0 0 0 1 1h4.316a4.982 4.982 0 0 0-.781-1.05l-3.484-3.486ZM38 28.485c0-.165-.032-.323-.047-.485H33a3 3 0 0 1-3-3v-4.953c-.162-.015-.321-.047-.485-.047H25a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-8.515Z"
                  />
                </g>
                <circle cx="30" cy="30" r="21.5" stroke="#213372" />
                <circle cx="30" cy="30" r="25.5" stroke="#213372" stroke-opacity=".5" />
                <circle cx="30" cy="30" r="29.5" stroke="#213372" stroke-opacity=".25" />
                <defs>
                  <clipPath id="a">
                    <path fill="#fff" d="M18 18h24v24H18z" />
                  </clipPath>
                </defs>
              </svg>
              <span>Facturación</span>
            </Drawer.Title>
            <Drawer.Description className="text-sm font-medium text-center text-gray-300 max-w-[288px] flex flex-col mb-8">
              <p className="mb-4">
                No tienes asignada la facturación para {studentsWithoutInvoice.length > 1 ? 'los' : 'el'} estudiante
                {studentsWithoutInvoice.length > 1 ? 's' : null} {studentsWithoutInvoiceNames}
              </p>
              <span>¿Quieres continuar de todos modos?</span>
            </Drawer.Description>
            <Button onClick={handleContinue} className="w-full px-0 py-3 mb-4 text-sm font-medium rounded-2xl">
              Si, continuar
            </Button>
            <button
              onClick={() => {
                router.push(
                  {
                    query: {
                      ...router.query,
                      verify_status: 'invoice_dismissed',
                      target: studentsWithoutInvoice[0].id,
                    },
                  },
                  undefined,
                  {
                    shallow: true,
                  }
                );
              }}
              className="py-3 w-full font-medium text-sm bg-transparent text-blue-100 border-[1.5px] border-blue-100 rounded-2xl hover:bg-blue-100/5 active:bg-blue-100/20 "
            >
              Atrás
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>
      <Drawer.Root open={Boolean(selectedDependent) && openDrawer}>
        <Drawer.Overlay />
        <Drawer.Content className="max-w-md" onPointerDownOutside={closeDrawer}>
          <div className="px-[41px] py-[46px] flex flex-col items-center">
            <Drawer.Title className="text-xl font-bold text-center text-gray-300  mb-1.5">Facturación</Drawer.Title>
            {isOtherBillingGuardian ? (
              <>
                <Drawer.Description className="text-sm font-medium text-center text-gray-300 max-w-[288px] flex flex-col">
                  <span className="mb-5">
                    Estudiante:{' '}
                    <BoxColorText
                      bgcolor={selectedDependent?.color?.background}
                      color={selectedDependent?.color?.text}
                      text={selectedDependent?.first_name.toUpperCase() ?? ''}
                    />
                  </span>
                  <span className="mb-5">No puedes editar los datos de este RFC ya que pertenecen a otro tutor.</span>
                </Drawer.Description>
                <div className="max-w-[256px] space-y-2.5">
                  <Button
                    onClick={() => {
                      setOpenSelectorRFC(true);
                      closeDrawer();
                    }}
                    className="w-full px-0 py-3 text-sm font-medium rounded-2xl"
                  >
                    Seleccionar otro RFC
                  </Button>
                  <button
                    onClick={() => {
                      if (selectedDependent) assignBillingGuardian(selectedDependent.id, null);
                      closeDrawer();
                    }}
                    className="py-3 w-full font-medium text-sm bg-transparent text-blue-100 border-[1.5px] border-blue-100 rounded-2xl hover:bg-blue-100/5 active:bg-blue-100/20 "
                  >
                    No facturar
                  </button>
                </div>
              </>
            ) : (
              <>
                <Drawer.Description className="text-sm font-medium text-center text-gray-300 max-w-[288px] flex flex-col items-center">
                  {dependentsWithMyBilling.length > 1 ? (
                    <div className="my-5">Estos estudiantes comparten datos de facturación con error.</div>
                  ) : (
                    <div className="my-5">El siguiente estudiante tiene datos de facturación con error.</div>
                  )}
                  <div className="flex flex-row mb-5 gap-x-2">
                    <span>{dependentsWithMyBilling.length > 1 ? 'Estudiantes:' : 'Estudiante:'} </span>
                    {dependentsWithMyBilling}
                  </div>
                </Drawer.Description>
                <div className="max-w-[256px] space-y-2.5">
                  <Button onClick={goToEditRFC} className="w-full px-0 py-3 text-sm font-medium rounded-2xl">
                    Editar datos de facturación
                  </Button>
                  <button
                    onClick={() => {
                      if (haveOtherRFC) {
                        setOpenSelectorRFC(true);
                      } else {
                        selectedDependent && assignBillingGuardian(selectedDependent.id, null);
                      }
                      closeDrawer();
                    }}
                    className="py-3 w-full font-medium text-sm bg-transparent text-blue-100 border-[1.5px] border-blue-100 rounded-2xl hover:bg-blue-100/5 active:bg-blue-100/20 "
                  >
                    {haveOtherRFC ? 'Seleccionar otro RFC' : 'No facturar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Root>
      <Drawer.Root open={openSelectorRFC}>
        <Drawer.Overlay />
        <Drawer.Content className="max-w-md" onPointerDownOutside={() => setOpenSelectorRFC(false)}>
          <div className="flex flex-col items-center w-full py-6 rounded-t-2xl">
            <Drawer.Title className="text-lg font-semibold text-center text-gray-300 mb-2.5">
              ¿Cómo quieres facturar?
            </Drawer.Title>
            <Drawer.Description className="text-sm font-normal text-center text-gray-300 max-w-[339px]">
              Seleccione la facturación para cada estudiante.
            </Drawer.Description>
          </div>
          <div className="flex flex-col space-y-6 items-center max-h-[399px] overflow-auto">
            {Boolean(itemsQuantity) &&
              dependentsWithErrors.map((dependent) => {
                const items = selectedItems.filter((item) => item.student.id === dependent.id);

                const total = formatPrice(
                  items.reduce(
                    (total, item) =>
                      currencyjs(total).add('pending_amount' in item ? item.pending_amount : item.final_amount).value,
                    0
                  ),
                  items[0].currency
                );
                const othersRFC = dependent.guardians
                  .reduce((acc: DependantErrorRFC['guardians'], curr) => {
                    const isBilling = curr.id == dependent.billing_guardian?.id;
                    const enabledBySameTaxIdWithUser = haveRFC ? curr.tax_id !== user?.tax_id : true;
                    if (isBilling && curr.id !== user?.id) {
                      // anywhere is valid when is billing
                      acc.push(curr);
                    } else if (haveRFC ? curr.id !== user?.id : true) {
                      // if user has rfc, this is no include or any with same tax_id
                      const guardianHaveRFC = Boolean(curr.tax_id) && Boolean(curr.billing_name);
                      if (
                        guardianHaveRFC &&
                        enabledBySameTaxIdWithUser &&
                        !acc.some((guardian) => guardian.tax_id == curr.tax_id)
                      ) {
                        // unique tax_id
                        acc.push(curr);
                      }
                    }
                    return acc;
                  }, [])
                  .sort(
                    (prev, curr) =>
                      Number(prev.id !== dependent.billing_guardian?.id) -
                      Number(curr.id !== dependent.billing_guardian?.id)
                  );

                return (
                  <div key={dependent.id} className="flex flex-col shadow-selectRFC">
                    <div className="flex flex-wrap items-center px-[26px] py-5 bg-white rounded-t-2xl gap-x-6">
                      <div>
                        <span className="text-sm font-semibold text-gray-300 mr-1.5">Estudiante:</span>
                        <BoxColorText
                          bgcolor={dependent?.color?.background}
                          color={dependent?.color?.text}
                          text={dependent?.first_name.toUpperCase() || ''}
                        />
                      </div>
                      <div className="text-sm font-semibold">
                        <span className="text-gray-300">Total: </span>
                        <span className="text-blue-700">{total}</span>
                      </div>
                    </div>
                    <div className="px-2.5 py-5 bg-white border-t border-[#adbbcc4d]">
                      {haveRFC && (
                        <RadioWithLabel
                          isError={
                            //FIXME: We are mutating the guardians type
                            !dependent.guardians.some(
                              (guardian) => guardian.id === user.id && (guardian as any).validRFC
                            )
                          }
                          value={`${user.id}_${dependent.id}`}
                          checked={selectedRfc[dependent.id] === user.id}
                          id={`${user.id}_${dependent.id}`}
                          onChange={() => {
                            updateSelectedRfc(user.id, dependent.id);
                          }}
                        >
                          {user.billing_name}
                        </RadioWithLabel>
                      )}
                      <RadioWithLabel
                        value="no-rfc"
                        checked={selectedRfc[dependent.id] === null}
                        id={`no-rfc_${dependent.id}`}
                        onChange={() => {
                          updateSelectedRfc(null, dependent.id);
                        }}
                      >
                        No facturar
                      </RadioWithLabel>
                      {Boolean(othersRFC.length) && (
                        <>
                          <div className="text-[#0D5FD1] mt-2.5 mb-1 bg-[#CAE0FF]/25 pl-4 py-0.5 rounded text-xs/6 font-semibold">
                            Otros RFCs vinculados
                          </div>
                          {othersRFC.map((guardian) => (
                            <RadioWithLabel
                              key={`${guardian.id}_${dependent.id}`}
                              isError={!guardian.validRFC}
                              value={`${guardian.id}_${dependent.id}`}
                              checked={selectedRfc[dependent.id] === guardian.id}
                              id={`${guardian.id}_${dependent.id}`}
                              onChange={() => {
                                updateSelectedRfc(guardian.id, dependent.id);
                              }}
                            >
                              {guardian.billing_name ?? 'Datos Incompletos'}
                            </RadioWithLabel>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="w-full space-y-2.5 py-6 px-5 shadow-selectRFC flex flex-col items-center shadow-selectRFC">
            <Button
              className="max-w-[340px] w-full px-0 py-3 text-sm font-medium rounded-full"
              onClick={
                haveRFC || JSON.stringify(initSelectedRfc) !== JSON.stringify(selectedRfc)
                  ? multiAssignBillings
                  : goToEditRFC
              }
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? (
                <div
                  className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-100 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                />
              ) : (
                textSaveButton
              )}
            </Button>
            <button
              className="max-w-[340px] py-3 w-full font-medium text-sm bg-transparent text-blue-100 border-[1.5px] border-blue-100 rounded-full hover:bg-blue-100/5 active:bg-blue-100/20"
              onClick={() => {
                setOpenSelectorRFC(false);
              }}
            >
              Atrás
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>
      <Drawer.Root open={openIncompleteData}>
        <Drawer.Overlay />
        <Drawer.Content onPointerDownOutside={() => setOpenSelectorRFC(false)}>
          <div className="flex flex-col items-center w-full py-6 rounded-t-2xl">
            <IcInfo className="fill-current text-warning" />
            <Drawer.Title className="text-lg font-semibold text-center text-gray-300 mt-[18px]">
              Datos incompletos de RFC
            </Drawer.Title>
            <div className="bg-[#FFF3D9] p-2.5 rounded-md mb-2.5 mt-6 text-sm font-semibold text-gray-300">
              Facturación: <span className="font-normal">{user?.billing_name}</span>
            </div>
            <Drawer.Description className="text-xs font-medium text-center text-[#637381] max-w-[339px]">
              Por favor complete los datos de su RFC para poder asignar la facturación
            </Drawer.Description>
          </div>
          <div className="w-full space-y-2.5 py-6 px-5 shadow-selectRFC flex flex-col items-center shadow-selectRFC">
            <Button className="max-w-[340px] w-full px-0 py-3 text-sm font-medium rounded-full" onClick={goToEditRFC}>
              Completar datos
            </Button>
            <button
              className="max-w-[340px] py-3 w-full font-medium text-sm bg-transparent text-blue-100 border-[1.5px] border-blue-100 rounded-full hover:bg-blue-100/5 active:bg-blue-100/20"
              onClick={() => {
                setOpenIncompleteData(false);
              }}
            >
              Atrás
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Root>
      <Dialog.Root open={openModal}>
        <Dialog.Overlay className="fixed inset-0 flex flex-col items-center justify-center overflow-y-auto bg-black/20">
          <Dialog.Content className="max-w-[320px] w-full bg-white rounded-2xl data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out p-5 flex flex-col items-center">
            <Dialog.Title className="text-xl font-bold text-center text-gray-300 h-9 mb-1.5">Facturación</Dialog.Title>
            <Dialog.Description className="text-sm font-medium text-center text-gray-300 max-w-[288px]">
              Debes corregir los datos de RFC que muestran error.
            </Dialog.Description>
            <Button
              onClick={() => {
                setOpenModal(false);
              }}
              className="px-[95px] py-3 mt-5 text-sm font-medium rounded-2xl"
            >
              Entendido
            </Button>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Root>
    </>
  );
}

VerifyRFC.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Resumen</title>
      </Head>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const { guardianHash } = context?.query || { guardianHash: '' };

  return {
    props: {
      guardianHash,
    },
  };
}

VerifyRFC.auth = true;
export default VerifyRFC;
