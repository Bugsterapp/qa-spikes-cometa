import { useSession } from 'next-auth/react';
import Layout from '/src/components/layouts';
import * as Sentry from '@sentry/nextjs';
import { useRouter } from 'next/router';
import { api } from '/src/utils/api';
import { useGetPermissions, useSelectedSchool } from '/src/guards/AuthGuard';
import IcClose from '/public/assets/icons/ic_circle_error.svg';
import IcCheck from '/public/assets/icons/ic_check_outline.svg';
import IcStudents from '/public/assets/icons/ic_students.svg';
import { renderDateShort, renderMoney } from '/src/utils/datagridHeaders';
import { useState } from 'react';
import Sheet from '/src/components/atoms/Sheet';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { z } from 'zod';
import { Step1OrderSelection } from '/src/components/organisms/dashboard/ConceptAssigment/OrdersSelected';
import useToggle from '/src/hooks/useToggle';
import { Step2StudentSelection } from '/src/components/organisms/dashboard/ConceptAssigment/StudentSelected';
import Status from '/src/components/Status';
import useAlert from '/src/hooks/useAlert';
import Dialog from '/src/components/atoms/Dialog';
import { Step3AssignDetail } from '/src/components/organisms/dashboard/ConceptAssigment/AssignDetail';
import { DetailConcept } from '@cometa/trpc/src/types';
import Button from '/src/components/organisms/dashboard/Button';
import ThreeDotsDropdown from '../../components/atoms/ThreeDotsDropdown';
import { useFlags } from '/flags/client';
import { useBackgroundConceptAssignStore } from '/src/components/BackgroundDownload/BackgroundAssignConcepts';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';

ConceptDetail.getLayout = function getLayout(page: JSX.Element) {
  return <Layout title="Detalle de Concepto">{page}</Layout>;
};

type CompoundingsNoSingle = {
  [key: string]: string;
};

enum Steps {
  Step1 = 'STEP_1_ORDERS',
  Step2 = 'STEP_2_STUDENTS',
  Step3 = 'STEP_3_DETAIL',
}

export const SelectedOrdersSchema = z.object({
  orders: z.array(z.any()).nonempty(),
});

export const SelectedStudentsSchema = z.object({
  students: z.array(z.any()).nonempty(),
});

export const AssignDetailSchema = SelectedOrdersSchema.merge(SelectedStudentsSchema);

export type FormValuesOrders = z.infer<typeof SelectedOrdersSchema>;
export type FormValuesStudents = z.infer<typeof SelectedStudentsSchema>;
export type FormValuesAssignDetail = z.infer<typeof AssignDetailSchema>;
export type FormValues = FormValuesOrders & FormValuesStudents & FormValuesAssignDetail;

export type StepAssingProps<T> = {
  setData?: (data: T) => void;
  onNext: () => void;
  onBack: () => void;
  formData?: Partial<FormValues>;
  concept?: DetailConcept;
  saving?: boolean;
};

function ConceptDetail() {
  const { data: session } = useSession();
  const { setAlertState } = useAlert();
  const flags = useFlags({ traits: { email: session?.user.email } }).flags;
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const router = useRouter();
  const conceptId = router.query.conceptId as string;
  const selectedSchool = useSelectedSchool();
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(Steps.Step1);
  const [formData, setFormData] = useState<Partial<FormValues>>();
  const [alertToCloseSheet, setAlertToCloseSheet] = useState(false);
  const { toggle: openAssignOrders, onClose: onCloseAssignOrders, onOpen: onOpenAssingOrders } = useToggle();
  const utils = api.useUtils();
  const permissions = useGetPermissions();
  const { setIsWorking, addToQueue } = useBackgroundConceptAssignStore((state) => state);
  const { data: concept } = api.schools.schoolsConceptDetail.useQuery(
    {
      school_id: selectedSchool?.id as string,
      concept_id: conceptId,
    },
    {
      enabled: !!conceptId && !!selectedSchool,
    }
  );
  const isSingleOrder = concept?.orders?.length === 1 && concept?.months_to_pay?.length === 0;

  const { data: categories } = api.schools.schoolsConceptsFilters.useQuery({ school_id: selectedSchool?.id as string });
  const createAssignMutation = api.schools.schoolsAssignmentsCreate.useMutation();
  useSendPageViewedEvent('dashboard: delinquency table', selectedSchool);

  const typeValue = (type: string) => {
    switch (type) {
      case 'PERCENT':
        return 'Porcentual';
      case 'AMOUNT':
        return 'Monto';
      case 'FIXED':
        return 'Fijo';
      default:
        return;
    }
  };

  const parsePayload = () => {
    const students = formData?.students
      ?.filter((student) => !student?.total_student_by_section && !student?.total_student_by_level)
      .map((student) => student?.id);
    const orders = formData?.orders?.map((order) => order?.id);
    const payload = {
      students: students as string[],
      orders: orders as string[],
      concept: conceptId,
    };
    return payload;
  };

  const handleCreate = async () => {
    try {
      const payload = parsePayload();
      await createAssignMutation.mutate(
        {
          school_id: selectedSchool?.id || '',
          data: payload,
        },
        {
          onSuccess: async (data: any) => {
            await utils.schools.schoolsStudentsByLevelList.invalidate();
            // this is the correct type: MassiveConceptAssignmentHistory
            addToQueue(data.id);
            setIsWorking();
            onCloseAssignOrders();
            sendTrackEventWithUserName('Back: Bulk Concept Assignment (Success)');
            setFormData({});
            setCurrentStep(Steps.Step1);
            setAlertToCloseSheet(false);
          },
          onError: () => {
            onCloseAssignOrders();
            setFormData({});
            setCurrentStep(Steps.Step1);
            setAlertToCloseSheet(false);
            sendTrackEventWithUserName('Back: Bulk Concept Assignment (Failure)');
            setAlertState({
              open: true,
              severity: 'error',
              message: <>No se pudo crear la asignación masiva de conceptos. </>,
            });
            Sentry.captureException(new Error('No se pudo crear la asignación masiva de conceptos'));
          },
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  const handleData = (data: Partial<FormValues>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    const eventsNames = {
      STEP_1_ORDERS: 'Bulk Concept Assignment P1 (Orders Selected)',
      STEP_2_STUDENTS: 'Bulk Concept Assignment P2 (Students Selected)',
      STEP_3_DETAIL: 'Bulk Concept Assignment P3 (Confirmation)',
    };
    sendTrackEventWithUserName(eventsNames[currentStep]);
    switch (currentStep) {
      case Steps.Step1:
        setCurrentStep(Steps.Step2);
        break;
      case Steps.Step2:
        setCurrentStep(Steps.Step3);
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case Steps.Step1:
        return onCloseAssignOrders();
      case Steps.Step2:
        setCurrentStep(Steps.Step1);
        break;
      case Steps.Step3:
        setCurrentStep(Steps.Step2);
        break;
      default:
        break;
    }
  };

  const compoundingsNoSingle: CompoundingsNoSingle = {
    DAILY: 'Diariamente',
    WEEKLY: 'Cada semana',
    MONTHLY: 'Mensualmente',
  };

  const checkIfHasMonthsToPay = () => {
    if (concept?.months_to_pay && concept?.months_to_pay.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  type Order = {
    attributes: { id: string; name: string; type: string }[];
  };

  type InputData = {
    orders: Order[];
  };

  type Result = { type: string; names: string[] }[];

  function extractAttributes(data: InputData): Result {
    const attributesMap: Map<string, Set<string>> = new Map();

    for (const order of data.orders) {
      for (const attr of order.attributes) {
        if (!attributesMap.has(attr.type)) {
          attributesMap.set(attr.type, new Set());
        }
        attributesMap.get(attr.type)?.add(attr.name);
      }
    }

    const result: Result = [];

    attributesMap.forEach((namesSet, type) => {
      result.push({ type: type, names: Array.from(namesSet) });
    });

    return result;
  }

  const formatName = (input: string) =>
    input
      .split(' - ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' / ');
  const deleteConceptMutation = api.concepts.deleteConcept.useMutation({
    onSuccess: async () => {
      await utils.schools.schoolsConceptsList.invalidate();
    },
  });
  const handleOpenDeleteConceptModal = async () => {
    setOpenDialog(true);
  };
  const handleDeleteConcept = async () => {
    setOpenDialog(false);
    await deleteConceptMutation.mutate({ schoolId: selectedSchool?.id as string, conceptId: conceptId });
    setAlertState({
      open: true,
      severity: 'success',
      message: (
        <>
          Se ha eliminado el concepto <strong>{concept?.name || ''}</strong>
        </>
      ),
    });

    setOpenDialog(false);
    router.push('/concepts');
  };
  const formIsDirty = !!formData?.orders || !!formData?.students;
  return (
    <div>
      <Sentry.ErrorBoundary
        beforeCapture={(scope) =>
          scope.setContext('state', {
            session,
            conceptId,
          })
        }
      >
        <div className="sticky top-16 bg-white flex items-center justify-between">
          <p className="py-5 px-10 text-2xl font-bold">{concept?.name}</p>
          <div className="flex gap-3 px-3 py-4">
            {permissions?.can_add_concept_assignment ? (
              <div className="flex gap-3">
                {flags?.mass_assign_concept ? (
                  <button
                    className="flex items-center text-sm font-semibold text-white bg-[#00AB55] rounded-lg px-4 py-2 gap-2"
                    onClick={onOpenAssingOrders}
                  >
                    <IcStudents />
                    Asignar estudiantes
                  </button>
                ) : null}
                <ThreeDotsDropdown
                  handleClick={handleOpenDeleteConceptModal}
                  label="Eliminar concepto"
                  allowAction={concept?.can_be_deleted}
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 py-8 pl-10 space-y-6">
            <div className="space-y-2.5 rounded-2xl px-8 py-10 bg-white">
              <p className="border-b-2 pb-2 mb-6 font-bold text-xs text-[#637381] select-none">DATOS GENERALES</p>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Nombre:</p>
                <p className="text-sm font-semibold break-all">{concept?.name}</p>
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Tipo de concepto:</p>
                <p className="text-sm font-semibold">
                  {categories?.type.find((category) => category.id === concept?.type)?.name}
                </p>
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Ciclo escolar:</p>
                <p className="text-sm font-semibold">{concept?.school_cycle?.name}</p>
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">
                  Opcional / <br />
                  Obligatorio
                </p>
                <p className="text-sm font-semibold">{concept?.optional ? 'Opcional' : 'Obligatorio'}</p>
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">¿En dónde se puede pagar el concepto?</p>
                <div>
                  {concept?.payment_only_in_dashboard ? (
                    <Status variant="success">Directo al colegio</Status>
                  ) : (
                    <div className="flex gap-1">
                      <Status variant="info">Portal de Cometa</Status>
                      <Status variant="success">Directo al colegio</Status>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Cuenta de abono:</p>
                {concept?.payment_only_in_dashboard ? (
                  <p>-</p>
                ) : (
                  <div>
                    <p className="text-sm font-semibold">{concept?.bank_account?.public_summary}</p>
                    <p className="text-xs font-normal">{concept?.bank_account?.account_number}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2.5 rounded-2xl px-8 py-10 bg-white">
              <p className="border-b-2 pb-2 mb-6 font-bold text-xs text-[#637381]">INFORMACIÓN DE FACTURACIÓN</p>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">¿Cobra IVA?:</p>
                {concept?.has_sales_tax ? (
                  <>
                    <p className="mr-2 text-sm font-semibold">Sí</p>
                    <IcCheck />
                  </>
                ) : (
                  <>
                    <p className="mr-2 text-sm font-semibold">No</p>
                    <IcClose />
                  </>
                )}
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Código de producto:</p>
                <p className="text-sm font-semibold">{concept?.tax_code ? concept?.tax_code : '-'}</p>
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Tipo de unidad:</p>
                <p className="text-sm font-semibold">{concept?.tax_unit ? concept?.tax_unit : '-'}</p>
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Complemento educativo:</p>
                <div className="flex text-sm font-semibold">
                  {concept?.institutional_id ? (
                    <>
                      <p className="mr-2 text-sm font-semibold">Sí</p>
                      <IcCheck />
                    </>
                  ) : (
                    <>
                      <p className="mr-2 text-sm font-semibold">No</p>
                      <IcClose />
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center mt-6">
                <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">RVOE:</p>
                <p className="text-sm font-semibold">{concept?.institutional_id ? concept?.institutional_id : '-'}</p>
              </div>
            </div>
            {concept?.interest_schema && concept?.interest_schema.length > 0 && (
              <div className="space-y-2.5 rounded-2xl px-8 py-10 bg-white">
                <p className="border-b-2 pb-2 mb-6 font-bold text-xs text-[#637381]">RECARGOS</p>
                <div className="flex items-center mt-6">
                  <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Aplica desde:</p>
                  <p className="text-sm font-semibold">
                    {concept?.interest_schema[0].day_offset} días después de la fecha de vencimiento
                  </p>
                </div>
                <div className="flex items-center mt-6">
                  <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Tipo de recargo:</p>
                  <p className="text-sm font-semibold">{typeValue(concept?.interest_schema[0].type || '')}</p>
                </div>
                <div className="flex items-center mt-6">
                  <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Valor de recargo:</p>
                  <p className="text-sm text-[#B72136] font-semibold bg-[#FF4842] bg-opacity-[0.16] px-2 rounded-md">
                    {concept?.interest_schema[0].value} {concept?.interest_schema[0].type === 'AMOUNT' ? 'MXN' : '%'}
                  </p>
                </div>
                <div className="flex items-center mt-6">
                  <p className="text-xs text-[#637381] font-medium w-[25%] mr-3">Frecuencia:</p>
                  <p className="text-sm font-semibold">
                    {compoundingsNoSingle[concept?.interest_schema[0].compounding || '']}
                  </p>
                </div>
              </div>
            )}
            {concept?.early_bird_discounts && concept?.early_bird_discounts.length > 0 && (
              <div className="space-y-2.5 rounded-2xl px-8 py-10 bg-white">
                <p className="border-b-2 pb-2 mb-6 font-bold text-xs text-[#637381]">DESCUENTOS PRONTO PAGO</p>
                {concept.early_bird_discounts.map((discount, index) => (
                  <div key={index} className="flex p-4 mt-6 border-2 rounded-lg">
                    <div className="w-[25%] mr-3">
                      <p className="text-xs text-[#637381] font-medium">Valor de dscto:</p>
                      <p className="text-sm text-[#229A16] w-fit font-semibold bg-[#54D62C] bg-opacity-[0.16] px-2 rounded-md">
                        {discount.discount_value} {discount.discount_type === 'AMOUNT' ? 'MXN' : '%' || ''} dscnto
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#637381] font-medium">Vigencia del descuento:</p>
                      <p className="text-xs text-[#637381] font-medium">
                        {isSingleOrder
                          ? `Hasta el ${format(
                              subDays(new Date(concept?.orders[0]?.due || ''), discount?.up_to_days - 1),
                              'PPP',
                              {
                                locale: es,
                              }
                            )}`
                          : `Hasta ${discount.up_to_days} días antes de la fecha de vencimiento`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(concept?.orders?.[0]?.attributes) && concept?.orders[0]?.attributes?.length !== 0 && (
              <div className="w-full col-span-2">
                <div className="space-y-2.5 rounded-2xl px-8 py-10 bg-white">
                  <p className="border-b-2 pb-2 mb-6 font-bold text-xs text-[#637381]">ATRIBUTOS</p>
                  {concept?.orders &&
                    extractAttributes({ orders: concept?.orders }).map((attribute, index) => (
                      <div key={index} className="p-4 border-2 rounded-lg">
                        <span className="text-base font-semibold">{attribute.type}</span>
                        <div className="flex flex-row gap-1 mt-2">
                          {attribute.names.map((name, index) => (
                            <span key={index} className="bg-[#919EAB29] rounded-[50px] py-[5px] px-[12px]">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <div className="col-span-2 py-8 pr-10 ">
            <div className="space-y-2.5 rounded-2xl px-8 py-10 bg-white">
              <p className="border-b-2 pb-2 mb-6 font-bold text-xs text-[#637381]">ÓRDENES</p>
              {concept?.orders &&
                concept?.orders.length > 0 &&
                concept?.orders.map((order, index) => (
                  <div key={index} className="py-4 border-b-2">
                    <p className="text-base font-semibold">
                      {checkIfHasMonthsToPay() ? order.name : formatName(order.name)}
                    </p>
                    <div className="flex flex-row justify-between">
                      {checkIfHasMonthsToPay() && <p>{renderDateShort(order.due)}</p>}
                      <p>{renderMoney(order.price)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        {openAssignOrders && (
          <Sheet
            open={openAssignOrders}
            onOpenChange={(open) => {
              if (!open && !formIsDirty) {
                onCloseAssignOrders();
              } else {
                setAlertToCloseSheet(true);
              }
            }}
          >
            <Sheet.Content>
              <div className="px-8">
                <SidebarHeader
                  title="Asignación masiva de conceptos"
                  onClose={() => {
                    if (!formIsDirty) {
                      onCloseAssignOrders();
                    } else {
                      setAlertToCloseSheet(true);
                    }
                  }}
                />
              </div>
              {currentStep === Steps.Step1 && (
                <Step1OrderSelection
                  setData={handleData}
                  onNext={handleNext}
                  onBack={handleBack}
                  setAlertToCloseSheet={setAlertToCloseSheet}
                  formData={formData}
                />
              )}
              {currentStep === Steps.Step2 && (
                <Step2StudentSelection
                  setData={handleData}
                  onNext={handleNext}
                  onBack={handleBack}
                  formData={formData}
                />
              )}
              {currentStep === Steps.Step3 && (
                <Step3AssignDetail
                  onNext={handleCreate}
                  onBack={handleBack}
                  formData={formData}
                  concept={concept}
                  saving={createAssignMutation.isLoading}
                />
              )}
            </Sheet.Content>
          </Sheet>
        )}
        <Dialog.Root open={alertToCloseSheet} position="center" classNames="right-12">
          <Dialog.Title>¿Estás seguro que deseas cancelar la asignación masiva de estudiantes?</Dialog.Title>
          <Dialog.Description>
            Se cancelará el proceso y no se asignará el concepto <span className="font-semibold">{concept?.name}</span>{' '}
            a los{' '}
            <span className="font-semibold">
              {formData?.students &&
                formData?.students?.filter(
                  (student) => !student.total_student_by_section && !student.total_student_by_level
                ).length}
            </span>{' '}
            estudiantes seleccionados.
          </Dialog.Description>
          <div className="flex justify-center gap-x-10">
            <Button
              id="dialog-in-drawer-cancel"
              variant="ghost"
              size="tooltip"
              onClick={() => setAlertToCloseSheet(false)}
            >
              Atrás
            </Button>
            <Button
              variant="cancel"
              size="tooltip"
              onClick={() => {
                onCloseAssignOrders();
                setFormData({});
                setCurrentStep(Steps.Step1);
                setAlertToCloseSheet(false);
              }}
            >
              Si, cancelar
            </Button>
          </div>
        </Dialog.Root>
      </Sentry.ErrorBoundary>
      <Dialog.Root open={openDialog} position="center" onOpenChange={(state) => setOpenDialog(state)}>
        <Dialog.Title>¿Estás seguro que deseas eliminar este concepto?</Dialog.Title>
        <Dialog.Description>
          Al eliminar un concepto se borra todo registro del mismo. Ya no podrá asignarse a ningún estudiante ni se
          mostrará en la lista de conceptos del colegio.
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Dialog.Close className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap">
            Cancelar
          </Dialog.Close>
          <button
            className="text-white font-bold	py-2 px-8 rounded-lg text-sm	hover:opacity-90  whitespace-nowrap bg-red-500 shadow-[0_8px_16px_#FF48423D]"
            onClick={handleDeleteConcept}
          >
            Sí, eliminar
          </button>
        </div>
      </Dialog.Root>
      <Dialog.Root open={openDialog} position="center" onOpenChange={(state) => setOpenDialog(state)}>
        <Dialog.Title>¿Estás seguro que deseas eliminar este concepto?</Dialog.Title>
        <Dialog.Description>
          Al eliminar un concepto se borra todo registro del mismo. Ya no podrá asignarse a ningún estudiante ni se
          mostrará en la lista de conceptos del colegio.
        </Dialog.Description>
        <div className="flex justify-center gap-x-10">
          <Dialog.Close
            className="text-[#637381] bg-transparent font-bold	py-2 px-8 text-sm	hover:opacity-90 whitespace-nowrap"
            data-testid="cancel-Dialogbutton"
          >
            Cancelar
          </Dialog.Close>
          <button
            className="text-white font-bold	py-2 px-8 rounded-lg text-sm	hover:opacity-90  whitespace-nowrap bg-red-500 shadow-[0_8px_16px_#FF48423D]"
            onClick={handleDeleteConcept}
            data-testid="yesDelete-Dialogbutton"
          >
            Sí, eliminar
          </button>
        </div>
      </Dialog.Root>
    </div>
  );
}

ConceptDetail.auth = true;

export default ConceptDetail;
