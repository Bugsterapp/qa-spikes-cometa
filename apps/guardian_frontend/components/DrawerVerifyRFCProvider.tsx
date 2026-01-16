import type { AssignBilling, RetrieveGuardian } from '@cometa/trpc';
import { useSendTrackEvent } from '@cometa/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { type DetailedHTMLProps, type InputHTMLAttributes, type ReactNode, useState } from 'react';
import BoxColorText from '~/components/atoms/guardians/BoxColorText';
import * as Drawer from '~/components/atoms/guardians/Drawer';
import { HelperTextWithIcon } from '~/components/CustomFormField';
import { useUTMRouter as useRouter } from '~/components/UtmNavigation';
import { Button } from '~/components/ui/Button';
import { TrackEvents } from '~/constants/events';
import DrawerVerifyRFCContext from '~/contexts/DrawerVerifyRFCContext';
import type { DependantErrorRFC } from '~/contexts/VerifyRFCContext';
import { useAlert } from '~/hooks';
import { useSendEvent } from '~/hooks/useSendEvent';
import { useVerifyRFC } from '~/hooks/useVerifyRFC';
import { cn } from '~/lib/cn';
import IcFile from '~/public/icons/file.svg';
import IcInfo from '~/public/icons/information-white.svg';
import { useSelectedSchool } from '~/stores/globalStore';
import { api } from '~/utils/api';
import { addColorsToDependents, type Color } from '~/utils/colors';

export enum VerifyStatus {
  INVOICE_DISMISSED = 'invoice_dismissed',
  NO_INVOICE = 'no_invoice',
}

const useAssignBillings = (onSuccess: () => void, initSelectedRfc: Record<string, string | null>) => {
  const { refetchUser } = useVerifyRFC();
  const [selectedRfc, setSelectedRfc] = useState<Record<string, string | null>>(initSelectedRfc);
  const sendTrackEvent = useSendTrackEvent();
  const { setAlert } = useAlert();
  const mutation = api.student.assignBillings.useMutation({
    onSuccess: async () => {
      refetchUser();
      onSuccess();
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

  const updateSelectedRfc = (guardianId: string | null, studentId: string) => {
    const newRfc = { ...selectedRfc };
    newRfc[studentId] = guardianId;
    setSelectedRfc(newRfc);
  };

  const assignBillingGuardian = (dependentId: string, billingGuardianId: string | null) => {
    const data = [{ id: dependentId, billing_guardian: billingGuardianId }];
    updateSelectedRfc(billingGuardianId, dependentId);
    assignBillings(data);
  };
  const multiAssignBillings = () => {
    const data = Object.keys(selectedRfc).map<AssignBilling>((id) => ({
      id: id,
      billing_guardian: selectedRfc[id],
    }));
    assignBillings(data);
  };
  return {
    assignBillingGuardian,
    multiAssignBillings,
    isLoading: mutation.isPending,
    selectedRfc,
    updateSelectedRfc,
  };
};

interface DrawerVerifyRFCProviderProps {
  children: ReactNode;
}

enum OpenDrawersEnum {
  HAS_ERROR = 1,
  INCOMPLETE_DATA = 2,
  SELECTOR_RFC = 3,
}

export const DrawerVerifyRFCProvider = ({ children }: DrawerVerifyRFCProviderProps) => {
  const router = useRouter();
  const selectedSchool = useSelectedSchool();
  const sendEvent = useSendEvent();

  const { user, dependentsWithErrors: dependentsWithErrorsWithOutColor } = useVerifyRFC();
  const userHasRFC = !!(user?.id && user.tax_id && user.billing_name && user.taxing_system && user.postal_code);
  const dependentsWithErrors = addColorsToDependents<DependantErrorRFC>(dependentsWithErrorsWithOutColor);

  const initSelectedRfc =
    user?.dependents?.reduce(
      (acc, current) => ({
        ...acc,
        [current.id]: current?.billing_guardian?.id || null,
      }),
      {}
    ) ?? {};

  const [openDrawer, setOpenDrawer] = useState<OpenDrawersEnum | null>(null);
  const [selectedDependentId, setSelectedDependentId] = useState<string>('');

  const closeDrawers = () => {
    sendEvent(TrackEvents.checkout.summary.cancelInvoicing);
    setOpenDrawer(null);
    setSelectedDependentId('');
  };
  const { assignBillingGuardian, multiAssignBillings, isLoading, selectedRfc, updateSelectedRfc } = useAssignBillings(
    () => {
      closeDrawers();
    },
    initSelectedRfc
  );

  const goToEditRFC = () => {
    router.push({
      pathname: '/guardians/[guardianHash]/billing',
      query: {
        back: router.asPath,
        isEditing: true,
        guardianHash: router.query.guardianHash,
      },
    });
  };

  const openHasError = openDrawer === OpenDrawersEnum.HAS_ERROR;
  const handleAssignRFC = (dependent: DependantErrorRFC) => {
    if (dependent.errorRFC) {
      setSelectedDependentId(dependent.id);
    } else {
      setOpenDrawer(OpenDrawersEnum.SELECTOR_RFC);
    }
  };
  const studentsWithoutInvoice = dependentsWithErrors.filter((d) => d?.billing_guardian === null);
  const allSuccess = (skipValidation?: boolean) => {
    if (skipValidation) return true;
    const oneHaveError = dependentsWithErrors.find((dependent) => dependent.errorRFC);

    const oneHaveIncompleteData = dependentsWithErrors.find(
      (dependent) => dependent?.billing_guardian?.id === user?.id && !userHasRFC
    );

    if (
      Boolean(selectedSchool?.does_invoice) &&
      studentsWithoutInvoice.length &&
      router.query.verify_status !== VerifyStatus.INVOICE_DISMISSED &&
      router.query.verify_status !== VerifyStatus.NO_INVOICE
    ) {
      router.push({ query: { ...router.query, verify_status: VerifyStatus.NO_INVOICE } }, undefined, {
        shallow: true,
      });
      return false;
    }

    if (oneHaveIncompleteData) {
      setOpenDrawer(OpenDrawersEnum.INCOMPLETE_DATA);
      router.push(`#card-${oneHaveIncompleteData.id}`);
      return false;
    }
    if (oneHaveError) {
      setOpenDrawer(OpenDrawersEnum.HAS_ERROR);
      router.push(`#card-${oneHaveError.id}`);
      return false;
    }
    return true;
  };

  return (
    <DrawerVerifyRFCContext.Provider
      value={{
        handleAssignRFC,
        allSuccess,
        studentsWithoutInvoice,
        openHasError,
      }}
    >
      {children}
      <DialogHasError open={openHasError} onClose={closeDrawers} />
      <DrawerIncompleteData
        open={openDrawer === OpenDrawersEnum.INCOMPLETE_DATA}
        onClose={closeDrawers}
        user={user}
        goToEditRFC={goToEditRFC}
      />
      <DrawerDependentErrorRFC
        open={!!selectedDependentId}
        onClose={closeDrawers}
        dependents={dependentsWithErrors}
        goToEditRFC={goToEditRFC}
        user={user}
        selectedDependentId={selectedDependentId}
        openChangeRFC={() => setOpenDrawer(OpenDrawersEnum.SELECTOR_RFC)}
        assignBilling={assignBillingGuardian}
      />
      <DrawerSelectorRFC
        open={openDrawer === OpenDrawersEnum.SELECTOR_RFC}
        onClose={closeDrawers}
        dependents={dependentsWithErrors}
        goToEditRFC={() => {
          sendEvent(TrackEvents.checkout.summary.registerTaxId);
          goToEditRFC();
        }}
        user={user}
        hasRFC={userHasRFC}
        isLoading={isLoading}
        selectedRfc={selectedRfc}
        initSelectedRfc={initSelectedRfc}
        updateSelectedRfc={updateSelectedRfc}
        assignBillings={multiAssignBillings}
      />
    </DrawerVerifyRFCContext.Provider>
  );
};

interface DialogHasErrorProps {
  open: boolean;
  onClose: () => void;
}

const DialogHasError = ({ open, onClose }: DialogHasErrorProps) => (
  <Dialog.Root open={open}>
    <Dialog.Overlay className="fixed inset-0 flex flex-col items-center justify-center overflow-y-auto bg-black/20">
      <Dialog.Content className="max-w-[320px] w-full bg-white rounded-2xl data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out p-5 flex flex-col items-center">
        <Dialog.Title className="text-xl font-bold text-center text-gray-300 h-9 mb-1.5">Facturación</Dialog.Title>
        <Dialog.Description className="text-sm font-medium text-center text-gray-300 max-w-[288px]">
          Debes corregir los datos de RFC que muestran error.
        </Dialog.Description>
        <Button onClick={onClose} className="px-[95px] mt-5 font-medium" size="small">
          Entendido
        </Button>
      </Dialog.Content>
    </Dialog.Overlay>
  </Dialog.Root>
);

interface DrawerIncompleteDataProps extends DialogHasErrorProps {
  user?: RetrieveGuardian;
  goToEditRFC: () => void;
}

const DrawerIncompleteData = ({ open, onClose, user, goToEditRFC }: DrawerIncompleteDataProps) => (
  <Drawer.Root open={open}>
    <Drawer.Overlay />
    <Drawer.Content className="max-w-md" onPointerDownOutside={onClose}>
      <div className="flex flex-col items-center w-full py-6 rounded-t-2xl">
        <IcInfo className="h-20 fill-current text-warning" />
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
      <div className="mx-auto max-w-[340px] w-full space-y-2.5 py-6 px-5 shadow-selectRFC flex flex-col items-center">
        <Button className="w-full px-0 font-medium" onClick={goToEditRFC} size="small">
          Completar datos
        </Button>
        <Button variant="border" size="small" onClick={onClose}>
          Atrás
        </Button>
      </div>
    </Drawer.Content>
  </Drawer.Root>
);

interface DrawerDependentErrorRFCProps extends DrawerIncompleteDataProps {
  dependents: (DependantErrorRFC & Color)[];
  selectedDependentId: string;
  openChangeRFC: () => void;
  assignBilling: (dependentId: string, billingGuardianId: string | null) => void;
}

const DrawerDependentErrorRFC = ({
  open,
  onClose,
  dependents,
  selectedDependentId,
  user,
  goToEditRFC,
  openChangeRFC,
  assignBilling,
}: DrawerDependentErrorRFCProps) => {
  const { billingGuardiansIds } = useVerifyRFC();
  const selectedDependent = dependents.find((dependent) => dependent.id === selectedDependentId);
  const isOtherBillingGuardian = !(
    selectedDependent?.billing_guardian && selectedDependent.billing_guardian.id === user?.id
  );
  const dependentsWithMyBilling = dependents.flatMap((dependent) =>
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
  );
  const hasOtherRFC = billingGuardiansIds.some((id) => id !== user?.id);

  return (
    <Drawer.Root open={selectedDependent && open}>
      <Drawer.Overlay />
      <Drawer.Content className="max-w-md" onPointerDownOutside={onClose}>
        <div className="px-[41px] py-[46px] flex flex-col items-center">
          <Drawer.Title className="text-xl font-bold text-center text-gray-300 mb-1.5">Facturación</Drawer.Title>
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
                <Button onClick={openChangeRFC} className="w-full px-0 font-medium" size="small">
                  Seleccionar otro RFC
                </Button>
                <Button
                  variant="border"
                  size="small"
                  onClick={() => {
                    assignBilling(selectedDependentId, null);
                    onClose();
                  }}
                >
                  No facturar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Drawer.Description className="text-sm font-medium text-center text-gray-300 max-w-[288px] flex flex-col items-center">
                <div className="my-5">
                  {dependentsWithMyBilling.length > 1
                    ? 'Estos estudiantes comparten '
                    : 'El siguiente estudiante tiene '}
                  datos de facturación con error.
                </div>
                <div className="flex flex-row mb-5 gap-x-2">
                  <span>{dependentsWithMyBilling.length > 1 ? 'Estudiantes:' : 'Estudiante:'} </span>
                  {dependentsWithMyBilling}
                </div>
              </Drawer.Description>
              <div className="max-w-[256px] space-y-2.5">
                <Button onClick={goToEditRFC} className="w-full px-0 font-medium" size="small">
                  Editar datos de facturación
                </Button>
                <Button
                  variant="border"
                  size="small"
                  onClick={() => {
                    if (hasOtherRFC) {
                      openChangeRFC();
                    } else {
                      selectedDependent && assignBilling(selectedDependentId, null);
                      onClose();
                    }
                  }}
                >
                  {hasOtherRFC ? 'Seleccionar otro RFC' : 'No facturar'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
};

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

const getOthersRFC = (dependent: DependantErrorRFC, user?: RetrieveGuardian, hasRFC?: boolean) =>
  dependent.guardians
    .reduce((acc: DependantErrorRFC['guardians'], curr) => {
      const isBilling = curr.id == dependent.billing_guardian?.id;
      const enabledBySameTaxIdWithUser = hasRFC ? curr.tax_id !== user?.tax_id : true;
      if (isBilling && curr.id !== user?.id) {
        // anywhere is valid when is billing
        acc.push(curr);
      } else if (hasRFC ? curr.id !== user?.id : true) {
        // if user has rfc, this is no include or any with same tax_id
        const guardianHaveRFC = Boolean(curr.tax_id) && Boolean(curr.billing_name);
        if (guardianHaveRFC && enabledBySameTaxIdWithUser && !acc.some((guardian) => guardian.tax_id == curr.tax_id)) {
          // unique tax_id
          acc.push(curr);
        }
      }
      return acc;
    }, [])
    .sort(
      (prev, curr) =>
        Number(prev.id !== dependent.billing_guardian?.id) - Number(curr.id !== dependent.billing_guardian?.id)
    );

interface DrawerSelectorRFCProps extends DialogHasErrorProps {
  dependents: (DependantErrorRFC & Color)[];
  user?: RetrieveGuardian;
  hasRFC: boolean;
  isLoading: boolean;
  selectedRfc: Record<string, string | null>;
  initSelectedRfc: Record<string, string | null>;
  updateSelectedRfc: (guardianId: string | null, studentId: string) => void;
  assignBillings: () => void;
  goToEditRFC: () => void;
}

const DrawerSelectorRFC = ({
  open,
  onClose,
  dependents,
  goToEditRFC,
  hasRFC,
  isLoading,
  selectedRfc,
  initSelectedRfc,
  updateSelectedRfc,
  assignBillings,
  user,
}: DrawerSelectorRFCProps) => {
  const canAssignRFC = hasRFC || JSON.stringify(initSelectedRfc) !== JSON.stringify(selectedRfc);
  const [actionButton, textButton] = canAssignRFC ? [assignBillings, 'Guardar'] : [goToEditRFC, 'Registrar mi RFC'];
  return (
    <Drawer.Root open={open}>
      <Drawer.Overlay />
      <Drawer.Content className="max-w-md px-6" onPointerDownOutside={onClose}>
        <div className="flex flex-col items-center w-full py-6 rounded-t-2xl">
          <Drawer.Title className="text-lg font-semibold text-center text-gray-300 mb-2.5">
            ¿Cómo quieres facturar?
          </Drawer.Title>
          <Drawer.Description className="text-sm font-normal text-center text-gray-300 max-w-[339px]">
            Seleccione la facturación para cada estudiante.
          </Drawer.Description>
        </div>
        <div className="flex flex-col space-y-6 items-center max-h-[399px] overflow-auto">
          {dependents.map((dependent) => {
            const othersRFC = getOthersRFC(dependent, user, hasRFC);
            return (
              <div key={dependent.id} className="flex flex-col w-full shadow-selectRFC">
                <div className="flex flex-wrap items-center px-[26px] py-5 bg-white rounded-t-2xl gap-x-6">
                  <div>
                    <span className="text-sm font-semibold text-gray-300 mr-1.5">Estudiante:</span>
                    <BoxColorText
                      bgcolor={dependent?.color?.background}
                      color={dependent?.color?.text}
                      text={dependent?.first_name.toUpperCase() || ''}
                    />
                  </div>
                </div>
                <div className="px-2.5 py-5 bg-white border-t border-[#adbbcc4d]">
                  {hasRFC && user && (
                    <RadioWithLabel
                      isError={!dependent.guardians.some((guardian) => guardian.id === user.id && guardian.validRFC)}
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
        <div className="mx-auto max-w-[340px] w-full space-y-2.5 py-6 px-5 shadow-selectRFC flex flex-col items-center">
          <Button className="w-full px-0 font-medium" size="small" onClick={actionButton} disabled={isLoading}>
            {isLoading ? (
              <div
                className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-100 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                data-testid="loading-spinner"
              />
            ) : (
              textButton
            )}
          </Button>
          <Button variant="border" size="small" onClick={onClose}>
            Atrás
          </Button>
        </div>
      </Drawer.Content>
    </Drawer.Root>
  );
};

interface DrawerEmptyRFCProps {
  open: boolean;
  studentsWithoutInvoice: DependantErrorRFC[];
  handleContinue: () => void;
  handleBack: () => void;
}

const getStudentNames = (students: Pick<DependantErrorRFC, 'first_name' | 'last_name'>[]) => {
  const names = students.map((s) => `${s.first_name} ${s.last_name}`);

  let formattedNames = '';
  if (names.length > 1) {
    formattedNames = `${names.slice(0, -1).join(', ')} y ${names.slice(-1)}`;
  } else {
    formattedNames = names[0];
  }

  return formattedNames;
};

export const DrawerEmptyRFC = ({ open, studentsWithoutInvoice, handleBack, handleContinue }: DrawerEmptyRFCProps) => (
  <Drawer.Root open={open}>
    <Drawer.Overlay />
    <Drawer.Content className="max-w-md">
      <div className="px-[41px] py-[46px] flex flex-col items-center">
        <Drawer.Title className="text-xl font-bold text-center text-gray-300  mb-1.5 flex flex-col items-center">
          <IcFile className="w-[60px] mx-auto" />
          <span>Facturación</span>
        </Drawer.Title>
        <Drawer.Description className="text-sm font-medium text-center text-gray-300 max-w-[288px] flex flex-col mb-8">
          <p className="mb-4">
            No tienes asignada la facturación para {studentsWithoutInvoice.length > 1 ? 'los' : 'el'} estudiante
            {studentsWithoutInvoice.length > 1 ? 's' : null} {getStudentNames(studentsWithoutInvoice)}
          </p>
          <span>¿Quieres continuar de todos modos?</span>
        </Drawer.Description>
        <Button onClick={handleContinue} className="w-full px-0 mb-4 font-medium" size="small">
          Si, continuar
        </Button>
        <Button variant="border" size="small" onClick={handleBack}>
          Atrás
        </Button>
      </div>
    </Drawer.Content>
  </Drawer.Root>
);
