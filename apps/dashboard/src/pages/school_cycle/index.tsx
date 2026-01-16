import { Button, Chip } from '@cometa/recreo';
import {
  SchoolCycleStatusStatusEnum,
  SchoolTypeEnum,
  type SchoolCycleCurrent,
  type SchoolCycleStatus,
} from '@cometa/trpc';
import { cn } from '@cometa/utils';
import * as Progress from '@radix-ui/react-progress';
import Image from 'next/image';
import RectangularCircle from 'public/assets/icons/ic_rectangular_circle.svg';
import { useEffect, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import LoadingGif from '/public/assets/gifs/SchoolCycle/loading.gif';
import Exclamation from '/public/assets/icons/ic_exclamation.svg';
import IcWarning from '/public/assets/icons/ic_warning.svg';
import Information from '/public/assets/icons/information.svg';
import IcArrow from '/public/assets/icons/recreo/arrow-small-right-L.svg';
import IcCircleSuccess from '/public/assets/icons/SchoolCycle/circle-check-filled.svg';
import IcCircleError from '/public/assets/icons/SchoolCycle/circle-error-filled.svg';

import Layout from '/src/components/layouts';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '/src/components/organisms/dashboard/SchoolCycle/Accordion';
import { SkeletonContent, useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { Events } from '/src/constants/events';
import { api } from '/src/utils/api';

enum STEPS_PAGE {
  INIT = 'init',
  VALIDATE = 'validate',
  PREVIEW = 'preview',
  LOADING = 'loading',
}

export default function SchoolCyclesPage() {
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();
  const sendTrackEventWithUserName = useSendTrackEventWithUserName();

  const [step, setStep] = useState<STEPS_PAGE>(STEPS_PAGE.INIT);
  const [validateFail, setValidateFail] = useState<string | null>(null);
  useSendPageViewedEvent('Ciclos escolares', selectedSchool);

  const { data: currentCycle, error: currentCycleError } = api.schoolCycles.currentCycle.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  useEffect(() => {
    if (currentCycleError) {
      setAlertState({
        open: true,
        severity: 'error',
        message: 'No hemos podido obtener el ciclo actual, por favor intenta de nuevo.',
      });
    }
  }, [currentCycleError]);

  const { data: statusChangeCycle } = api.schoolCycles.statusChangeCycle.useQuery(
    {
      schoolId: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id && step === STEPS_PAGE.LOADING,
      refetchInterval: 300,
    }
  );

  const mutationValidate = api.schoolCycles.validateChangeCycle.useMutation({
    onError: (error) => {
      if (error.data?.cause?.message === 'ChangeCycleError') {
        setValidateFail(error.message);
        setStep(STEPS_PAGE.VALIDATE);
      } else {
        setAlertState({
          open: true,
          severity: 'error',
          message: 'No hemos podido validar el cambio de ciclo, por favor intenta de nuevo.',
        });
      }
    },
    onSuccess: () => {
      setValidateFail(null);
      setStep(STEPS_PAGE.VALIDATE);
    },
  });

  const mutationActivate = api.schoolCycles.activateCycle.useMutation({
    onError: () => {
      sendTrackEventWithUserName(Events.school_cycle_activate_error, currentCycle);
      setAlertState({
        open: true,
        severity: 'error',
        message: `No hemos podido activar el ciclo ${currentCycle?.next_name}, por favor intenta de nuevo.`,
      });
    },
    onSuccess: () => {
      sendTrackEventWithUserName(Events.school_cycle_activate, currentCycle);
      setStep(STEPS_PAGE.LOADING);
    },
  });

  const handleActivateCycle = () => {
    mutationActivate.mutate({
      schoolId: selectedSchool?.id as string,
      id: currentCycle?.next_id as string,
    });
  };

  const validateChangeCycle = () => {
    mutationValidate.mutate({
      schoolId: selectedSchool?.id as string,
      id: currentCycle?.next_id as string,
    });
  };

  if (!currentCycle) return <SkeletonContent />;

  return (
    <div className="flex flex-col items-center py-10 min-h-screen bg-neutral-50">
      {step === STEPS_PAGE.INIT && (
        <ChangeCycleStepInit
          schoolCycle={currentCycle}
          isLoading={mutationValidate.isPending}
          validateChangeCycle={validateChangeCycle}
          allowChangeCycle={
            !selectedSchool?.has_integration &&
            (selectedSchool?.school_type === SchoolTypeEnum.K12 ||
              selectedSchool?.school_type === SchoolTypeEnum.Kindergarten)
          }
        />
      )}
      {step === STEPS_PAGE.VALIDATE && (
        <ChangeCycleStepValidate schoolCycle={currentCycle} setStep={setStep} validateFail={validateFail} />
      )}
      {step === STEPS_PAGE.PREVIEW && (
        <ChangeCycleStepPreview
          schoolCycle={currentCycle}
          setStep={setStep}
          handleActivateCycle={handleActivateCycle}
        />
      )}
      {step === STEPS_PAGE.LOADING && (
        <ChangeCycleStepLoading schoolCycle={currentCycle} statusChangeCycle={statusChangeCycle} setStep={setStep} />
      )}
    </div>
  );
}

interface ChangeCycleStepProps {
  schoolCycle: SchoolCycleCurrent;
  setStep: (step: STEPS_PAGE) => void;
  isLoading?: boolean;
}

interface ChangeCycleStepInitProps extends Omit<ChangeCycleStepProps, 'setStep'> {
  validateChangeCycle: () => void;
  allowChangeCycle: boolean;
}

const ChangeCycleStepInit = ({
  schoolCycle,
  isLoading = false,
  validateChangeCycle,
  allowChangeCycle = false,
}: ChangeCycleStepInitProps) => (
  <div className="inline-flex flex-col items-start justify-start max-w-[728px] w-full gap-y-6">
    <div className="self-stretch px-10 py-6 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-100 inline-flex justify-end items-start gap-10">
      <div className="flex flex-1 gap-4 justify-start items-center">
        <div className="inline-flex flex-col flex-1 gap-2 justify-start items-start">
          <div className="inline-flex gap-4 justify-start items-start">
            <div className="justify-center text-neutral-800 text-2xl font-bold font-lota leading-[30px]">
              {schoolCycle.name}
            </div>
            <Chip variant="green" className="text-sm">
              Ciclo actual
            </Chip>
          </div>
          <div className="justify-center text-base leading-normal flont-normal text-neutral-600 font-lota">
            Estás actualmente en el ciclo {schoolCycle.name}
          </div>
        </div>
        <RectangularCircle />
      </div>
    </div>
    {schoolCycle.next_id && (
      <Accordion type="single" collapsible className="w-full" defaultValue={!allowChangeCycle ? 'item-1' : undefined}>
        <AccordionItem
          value="item-1"
          className="px-10 py-6 rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-100 bg-white"
        >
          <AccordionTrigger className="justify-between p-0 text-lg font-bold leading-tight text-neutral-950 font-lota">
            ¿Deseas actualizar tu colegio al siguiente ciclo escolar?
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-y-8 pt-4 pb-0">
            {!allowChangeCycle ? (
              <div className="inline-flex gap-3 justify-start items-center self-stretch py-3 pr-3 pl-4 rounded-lg bg-warning-50">
                <IcWarning />
                <div className="flex-1 justify-center leading-normal text-warning-800 font-lota">
                  Tu colegio tiene ciclos personalizados, por lo que no es posible realizar el cambio de ciclo de forma
                  automática. Por favor, contacta a tu asesor a través del chat para que te ayudemos con el proceso.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-y-8">
                <div className="flex flex-col gap-y-4">
                  <div className="justify-center self-stretch text-neutral-600 font-lota">
                    Ahora puedes actualizar tu ciclo escolar al siguiente periodo de manera fácil y rápida. ¿Qué sucede
                    cuando cambias de ciclo?
                  </div>
                  <div className="inline-flex flex-col gap-4 justify-start items-start self-stretch p-6 rounded-2xl bg-neutral-50">
                    <div className="justify-center self-stretch text-base font-bold leading-normal text-neutral-600 font-lota">
                      ¿Qué sucede al cambiar de ciclo?
                    </div>
                    {[
                      `Todos los registros vinculados al ciclo ${schoolCycle.name} se actualizarán automáticamente al nuevo ciclo escolar.`,
                      'Los estudiantes pasarán al nuevo ciclo activo, a menos que tengan estado "baja" o "inactivo".',
                    ].map((item, index) => (
                      <div
                        className="inline-flex gap-2 justify-start items-start self-stretch"
                        key={`${index}-${item}`}
                      >
                        <Chip className="flex justify-center w-6 h-6 text-white rounded-full bg-neutral-700">
                          {index + 1}
                        </Chip>
                        <div className="flex-1 justify-center text-sm leading-tight text-neutral-500 font-lota">
                          {item}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="inline-flex flex-col gap-4 justify-start items-start self-stretch p-6 rounded-2xl bg-neutral-50">
                    <div className="justify-center self-stretch text-base font-bold leading-normal text-neutral-600 font-lota">
                      ¿Cuándo es el mejor momento para hacerlo?
                    </div>
                    <div className="inline-flex gap-2 justify-start items-start self-stretch">
                      <IcCircleSuccess />
                      <div className="flex-1 justify-center">
                        <span className="text-sm font-bold leading-tight text-neutral-500 font-lota">
                          Momento ideal para cambiar de ciclo:
                        </span>
                        <span className="text-sm leading-tight text-neutral-500 font-lota">
                          {' '}
                          Es recomendable realizar el cambio una vez que las clases hayan finalizado, durante el período
                          de vacaciones o antes de iniciar un nuevo ciclo escolar.
                        </span>
                      </div>
                    </div>
                    <div className="inline-flex gap-2 justify-start items-start self-stretch">
                      <IcCircleError />
                      <div className="flex-1 justify-center">
                        <span className="text-sm font-bold leading-tight text-neutral-500 font-lota">
                          Evita cambiar de ciclo:
                        </span>
                        <span className="text-sm leading-tight text-neutral-500 font-lota">
                          {' '}
                          si las clases siguen en curso para evitar desajustes en los registros y el seguimiento de los
                          estudiantes.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end self-stretch">
                  <Button
                    className={cn({
                      'cursor-progress': isLoading,
                    })}
                    variant="solid"
                    color="black"
                    onClick={validateChangeCycle}
                    disabled={isLoading}
                  >
                    Cambiar ciclo actual
                  </Button>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )}

    {!allowChangeCycle ? null : (
      <div className="inline-flex gap-3 justify-start items-center self-stretch py-3 pr-3 pl-4 rounded-lg bg-info-50">
        <Information className="w-6 h-6 text-info-500" />
        <div className="flex-1 justify-center leading-normal text-info-800 font-lota">
          Si necesitas ayuda o tienes dudas sobre el cambio de ciclo, contacta a tu asesor directamente a través de
          nuestro chat.
        </div>
      </div>
    )}
  </div>
);

interface ChangeCycleStepValidateProps extends ChangeCycleStepProps {
  validateFail: string | null;
}

enum ValidateFailCode {
  SECTION = 'section',
  INSCRITION_WITHOUT_LEVEL = 'inscription_without_level',
  INSCRITION_WITHOUT_SECTION = 'inscription_without_section',
  NEXT_CYCLE = 'next_cycle',
  NEXT_CYCLE_NOT_VALID = 'next_cycle_not_valid',
  NEXT_SECTION_OTHER_SCHOOL = 'next_section_other_school',
  SECTION_WITH_LAST_SECTION_AND_NEXT_SECTION = 'section_with_last_section_and_next_section',
}

interface ErrorMessage {
  code: ValidateFailCode;
  message: string;
  isMultiline?: boolean;
}

const mapValidateFail = (validateFail: string | null) => {
  if (validateFail?.includes('that is not the last section but has no next section')) return ValidateFailCode.SECTION;
  if (validateFail?.includes('has an inscription') && validateFail?.includes('with no level'))
    return ValidateFailCode.INSCRITION_WITHOUT_LEVEL;
  if (validateFail?.includes('has an inscription') && validateFail?.includes('with no section'))
    return ValidateFailCode.INSCRITION_WITHOUT_SECTION;
  if (validateFail?.includes('but the next school cycle is')) return ValidateFailCode.NEXT_CYCLE_NOT_VALID;
  if (validateFail?.includes('that has a next section but the next section is from another school'))
    return ValidateFailCode.NEXT_SECTION_OTHER_SCHOOL;
  if (validateFail?.includes('that is the last section but has a next section'))
    return ValidateFailCode.SECTION_WITH_LAST_SECTION_AND_NEXT_SECTION;
  return ValidateFailCode.NEXT_CYCLE;
};

const getErrorMessage = (failCode: ValidateFailCode, schoolCycle: SchoolCycleCurrent): ErrorMessage => {
  const errorMessages: Record<ValidateFailCode, ErrorMessage> = {
    [ValidateFailCode.NEXT_CYCLE]: {
      code: ValidateFailCode.NEXT_CYCLE,
      message: `El ciclo ${schoolCycle.name} no tiene configurado su siguiente ciclo.`,
    },
    [ValidateFailCode.NEXT_CYCLE_NOT_VALID]: {
      code: ValidateFailCode.NEXT_CYCLE_NOT_VALID,
      message: `El siguiente ciclo ${schoolCycle.next_name} no es válido.`,
    },
    [ValidateFailCode.SECTION]: {
      code: ValidateFailCode.SECTION,
      message:
        'Algunas secciones no tienen configurada su "siguiente sección" o no están marcadas como "última sección".',
      isMultiline: true,
    },
    [ValidateFailCode.INSCRITION_WITHOUT_LEVEL]: {
      code: ValidateFailCode.INSCRITION_WITHOUT_LEVEL,
      message: 'Algunas inscripciones no tienen configurado su nivel.',
      isMultiline: true,
    },
    [ValidateFailCode.INSCRITION_WITHOUT_SECTION]: {
      code: ValidateFailCode.INSCRITION_WITHOUT_SECTION,
      message: 'Algunas inscripciones no tienen configurada su sección.',
      isMultiline: true,
    },
    [ValidateFailCode.NEXT_SECTION_OTHER_SCHOOL]: {
      code: ValidateFailCode.NEXT_SECTION_OTHER_SCHOOL,
      message:
        'Algunas secciones tienen configurada su siguiente sección pero esta sección no pertenece al mismo colegio.',
      isMultiline: true,
    },
    [ValidateFailCode.SECTION_WITH_LAST_SECTION_AND_NEXT_SECTION]: {
      code: ValidateFailCode.SECTION_WITH_LAST_SECTION_AND_NEXT_SECTION,
      message: 'Algunas secciones tienen configurada su siguiente sección y están marcadas como "última sección".',
      isMultiline: true,
    },
  };

  return errorMessages[failCode];
};

const ErrorItem = ({ message, isMultiline = false }: { message: string; isMultiline?: boolean }) => {
  const containerClass = `inline-flex gap-2 justify-start items-${isMultiline ? 'start' : 'center'} self-stretch`;
  const textClass = `${isMultiline ? '' : 'flex-1 justify-center'} text-base font-normal leading-normal font-lota`;

  return (
    <div className={containerClass}>
      <div>
        <IcCircleError />
      </div>
      <div className={textClass}>{message}</div>
    </div>
  );
};

const ChangeCycleStepValidate = ({ schoolCycle, setStep, validateFail }: ChangeCycleStepValidateProps) => {
  const isValid = !validateFail;
  const failCode = mapValidateFail(validateFail);
  return (
    <div className="p-10 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-100 inline-flex flex-col justify-start items-end gap-10 max-w-[728px] w-full">
      {isValid ? (
        <>
          <div className="inline-flex gap-1 justify-between items-start w-full">
            <div className="flex gap-4 items-center">
              <div className="flex items-center justify-center px-2 py-3.5 bg-white border rounded-sm border-neutral-200">
                <span className="w-20 text-xs leading-none text-center font-lota">{schoolCycle.name}</span>
              </div>
              <IcArrow className="text-[#374957]" width="32" height="32" />
              <div className="flex items-center justify-center px-2 py-3.5 bg-white border rounded-sm border-neutral-200">
                <span className="w-20 text-xs leading-none text-center font-lota">{schoolCycle.next_name}</span>
              </div>
            </div>
            <Chip
              variant="default"
              className="p-2 text-sm font-semibold tracking-tight leading-normal rounded-full bg-neutral-100 font-lota"
            >
              Paso 1 de 2
            </Chip>
          </div>
          <div className="flex flex-col gap-6 justify-start items-start self-stretch">
            <div className="flex flex-col gap-2 justify-start items-start self-stretch">
              <div className="justify-center self-stretch text-2xl font-bold leading-loose font-lota">
                Está todo listo para cambiar al ciclo {schoolCycle.next_name}
              </div>
              <div className="justify-center self-stretch text-base leading-normal font-lota">
                Comprobamos que todas las configuraciones están listas para cambiar el ciclo escolar de todos tus
                estudiantes:
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-start items-start self-stretch">
              <div className="inline-flex gap-2 justify-start items-center self-stretch">
                <div>
                  <IcCircleSuccess />
                </div>
                <div className="flex-1 justify-center text-base leading-normal font-lota">
                  El ciclo {schoolCycle.next_name} ya está creado y listo para su uso.
                </div>
              </div>
              <div className="inline-flex gap-2 justify-start items-center self-stretch">
                <div>
                  <IcCircleSuccess />
                </div>
                <div className="flex-1 justify-center text-base leading-normal font-lota">
                  El ciclo {schoolCycle.next_name} tiene configurado su siguiente ciclo.
                </div>
              </div>
              <div className="inline-flex gap-2 justify-start items-start self-stretch">
                <div>
                  <IcCircleSuccess />
                </div>
                <div className="flex-1 justify-center text-base leading-normal font-lota">
                  Cada sección de este ciclo tiene su próxima sección configurada correctamente.
                </div>
              </div>
            </div>
          </div>
          <div className="inline-flex justify-start items-start">
            <Button variant="solid" color="black" className="px-6 py-3" onClick={() => setStep(STEPS_PAGE.PREVIEW)}>
              Siguiente
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="inline-flex justify-between items-start w-full">
            <div className="flex justify-center items-center w-20 h-20 rounded-full bg-error-50">
              <Exclamation className="w-5 h-5 text-error-500" />
            </div>
          </div>
          <div className="inline-flex flex-col gap-6 justify-start items-start self-stretch">
            <div className="flex flex-col gap-2 justify-start items-start self-stretch">
              <div className="justify-center self-stretch text-2xl font-bold leading-loose font-lota">
                No puedes realizar el cambio de ciclo
              </div>
              <div className="justify-center self-stretch text-base font-normal leading-normal font-lota">
                Existen problemas que impiden realizar el cambio de ciclo escolar. Estos son los motivos:
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-start items-start self-stretch">
              {(() => {
                const errorMessage = getErrorMessage(failCode, schoolCycle);
                return <ErrorItem message={errorMessage.message} isMultiline={errorMessage.isMultiline} />;
              })()}
            </div>
            <div className="justify-center self-stretch text-base font-normal leading-normal font-lota">
              Para solucionar estos problemas, contacta a tu asesor a través del chat.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface ChangeCycleStepPreviewProps extends ChangeCycleStepProps {
  handleActivateCycle: () => void;
}

const ChangeCycleStepPreview = ({ schoolCycle, setStep, handleActivateCycle }: ChangeCycleStepPreviewProps) => (
  <div className="p-10 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-100 inline-flex flex-col justify-start items-end gap-10 max-w-[728px] w-full">
    <div className="inline-flex gap-1 justify-between items-start w-full">
      <div className="flex gap-4 items-center">
        <div className="flex items-center justify-center px-2 py-3.5 bg-white border rounded-sm border-neutral-200">
          <span className="w-20 text-xs leading-none text-center font-lota">{schoolCycle.name}</span>
        </div>
        <IcArrow width="32" height="32" className="text-[#374957]" />
        <div className="flex items-center justify-center px-2 py-3.5 bg-white border rounded-sm border-neutral-200">
          <span className="w-20 text-xs leading-none text-center font-lota">{schoolCycle.next_name}</span>
        </div>
      </div>
      <Chip
        variant="default"
        className="p-2 text-sm font-semibold tracking-tight leading-normal rounded-full bg-neutral-100 font-lota"
      >
        Paso 2 de 2
      </Chip>
    </div>
    <div className="inline-flex flex-col gap-6 justify-start items-start self-stretch w-full max-w-2xl">
      <div className="flex flex-col gap-2 justify-start items-start self-stretch">
        <div className="justify-center self-stretch text-2xl font-bold leading-loose font-lota">
          Revisa cada nivel y confirma el cambio de ciclo
        </div>
        <div className="justify-center self-stretch text-base font-normal leading-normal font-lota">
          Aquí podrás ver el cambio de cada sección y grupo de tu colegio
        </div>
      </div>

      <div className="inline-flex gap-3 justify-start items-center self-stretch py-3 pr-3 pl-4 rounded-lg bg-info-50">
        <Information className="w-6 h-6 text-info-500" />
        <div className="flex-1 justify-center leading-normal text-info-800 font-lota">
          Si observas algún error en el orden y disposición de los niveles o grupos, por favor contacta a tu asesor a
          través del chat para recibir asistencia y soporte.
        </div>
      </div>
      <Accordion type="multiple" className="space-y-4 w-full" defaultValue={[schoolCycle.levels[0].id]}>
        {schoolCycle.levels.map((level) => (
          <AccordionItem
            key={level.id}
            value={level.id}
            className="p-4 rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-100"
          >
            <AccordionTrigger className="justify-between p-0 text-sm leading-tight text-neutral-950 font-lota">
              <div className="inline-flex flex-col justify-start items-start text-left">
                <span className="font-bold">{level.name}</span>
                <span>
                  {level.count_students} estudiante{level.count_students > 1 ? 's' : ''}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-y-6 mt-6">
                {level.sections.map((section) => (
                  <div
                    className="flex  flex-col items-center justify-center w-full max-w-[614px]"
                    key={`${section.next_name}-${section.name}`}
                  >
                    <div className="inline-flex gap-4 justify-around items-center p-4 w-full text-sm font-semibold leading-tight text-center text-gray-500 rounded-lg border font-lota bg-neutral-50 border-neutral-200">
                      <span className="w-full max-w-64">{section.name}</span>
                      <div className="text-[#374957] w-5 h-5">
                        <IcArrow width="20" height="20" />
                      </div>
                      <span className="w-full max-w-64">{section.next_name}</span>
                    </div>
                    {/*<div className="inline-flex gap-2 justify-around items-center p-4 w-full rounded-b-lg border-b border-x border-neutral-200">
                    <div className="inline-flex flex-col justify-start w-full items-center gap-2.5 max-w-64">
                      {Array.from(new Set(section.groups.map((group) => group.id))).map((groupId) => {
                        const group = section.groups.find((g) => g.id === groupId);
                        return (
                          <Chip
                            variant="default"
                            className="p-2 text-sm font-semibold tracking-tight rounded-full bg-neutral-100 font-lota"
                            key={group?.id}
                          >
                            {group?.name}
                          </Chip>
                        );
                      })}
                    </div>
                    <div className="text-[#374957] w-5 h-5">
                      <IcArrow width="20" height="20" />
                    </div>
                    <div className="inline-flex flex-col justify-start w-full items-center gap-2.5 max-w-64">
                      {Array.from(new Set(section.groups.map((group) => group.next_id))).map((nextId) => {
                        const nextGroup = section.groups.find((g) => g.next_id === nextId);
                        return (
                          <Chip
                            variant="default"
                            className="p-2 text-sm font-semibold tracking-tight rounded-full bg-neutral-100 font-lota"
                            key={nextGroup?.next_id}
                          >
                            {nextGroup?.next_name}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>*/}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
    <div className="flex gap-4 justify-end self-stretch">
      <Button variant="text" color="black" onClick={() => setStep(STEPS_PAGE.INIT)}>
        Atrás
      </Button>
      <Button variant="solid" color="black" onClick={handleActivateCycle}>
        Confirmar cambio de ciclo
      </Button>
    </div>
  </div>
);

const ChangeCycleStepLoading = ({
  schoolCycle,
  statusChangeCycle,
  setStep,
}: Omit<ChangeCycleStepProps, 'isLoading'> & { statusChangeCycle?: SchoolCycleStatus }) => {
  let percent = 10;
  const { setAlertState } = useAlert();
  const utils = api.useUtils();

  if (statusChangeCycle) {
    percent = statusChangeCycle.status === SchoolCycleStatusStatusEnum.SUCCESS ? 100 : 50;
  }

  useEffect(() => {
    if (statusChangeCycle?.status === SchoolCycleStatusStatusEnum.SUCCESS) {
      setTimeout(() => {
        utils.schoolCycles.currentCycle.invalidate();
        setAlertState({
          open: true,
          severity: 'success',
          message: '¡Cambio de ciclo realizado con éxito!',
        });
        setStep(STEPS_PAGE.INIT);
      }, 1000);
    }
  }, [statusChangeCycle, setStep, setAlertState, utils]);

  return (
    <div className="p-10 bg-[#fdfcfe] rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-100 inline-flex flex-col justify-start items-center gap-10 max-w-[728px] w-full">
      <Image src={LoadingGif} alt="loading" width={320} height={226} unoptimized />

      <div className="flex flex-col gap-2 justify-start items-start self-stretch">
        <div className="justify-center self-stretch text-xl font-bold leading-relaxed text-center font-lota">
          Estamos generando el cambio al ciclo {schoolCycle.next_name}
        </div>
        <div className="justify-center self-stretch text-center font-lota">
          Por favor, espera unos segundos mientras procesamos la información.
        </div>
      </div>

      <Progress.Root className="w-full h-2 rounded-lg bg-neutral-50" value={50} max={100}>
        <Progress.Indicator
          className="h-2 rounded-lg w-[var(--loader-width)] bg-galaxy-500"
          style={
            {
              '--loader-width': `${percent}%`,
            } as React.CSSProperties
          }
        />
      </Progress.Root>
    </div>
  );
};

SchoolCyclesPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Ciclos escolares" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

SchoolCyclesPage.auth = true;
