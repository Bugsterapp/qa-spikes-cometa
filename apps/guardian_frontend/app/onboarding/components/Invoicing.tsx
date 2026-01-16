import React from 'react';
import { Button } from '~/components/ui/Button';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '~/utils/api';
import { Fieldset } from '~/components/FormField';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import CustomFormField from '~/components/CustomFormField';
import { InformationDrawer } from '~/components/Drawer.Variants';
import { OnboardingStageEnum, TaxingTypeEnum } from '@cometa/trpc';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { WHAT_ONBOARDING_HELP } from '~/utils/linksWhatsapp';
import Dialog from '~/components/molecules/common/Dialog';
import { useOnboardingStore } from '../store/OnboardingStoreProvider';
import { HelpTooltipIcon } from '~/components/atoms/HelpTooltipIcon';
import { RadioGroup, RadioGroupItem } from '~/components/RadioGroup';
import { personTypeDefault, personTypeMoral } from '~/utils/static_data/personTypesTaxRegimen';
import { cn } from '@cometa/utils';
import taxRegimeValues from '~/utils/static_data/taxRegimeValues';
import HelpLink from '~/components/atoms/guardians/HelpLink';
import { Session } from 'next-auth';
import Combobox from '~/components/ui/Combobox';
import { useAlert } from '~/hooks';
import Card from '~/components/ui/Card';
import { useSendEvent } from '~/hooks/useSendEvent';

const StudentViewVariants: Variants = {
  enter: (direction: number) => ({
    x: direction < 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  visible: {
    x: '0%',
    opacity: 1,
    transition: {
      x: {
        bounce: 0.1,
      },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      opacity: {
        ease: 'easeInOut',
      },
    },
  }),
};

const BillingResolver = z.object({
  taxRegime: z.object({ name: z.string(), value: z.string(), personTypes: z.array(z.string()) }),
  taxId: z
    .string()
    .min(1, 'El RFC es requerido.')
    .refine((data) => data !== 'XAXX010101000', 'Este RFC no es válido'),
  billingName: z
    .string()
    .min(1, 'La razón social es requerida.')
    .regex(/^[a-zA-Z0-9Ññ &üÜ.]+$/, 'Recuerda no utilizar acentos.'),
  postalCode: z.string().min(1, 'El código postal es requerido.'),
  personType: z.nativeEnum(TaxingTypeEnum),
});

type BillingValues = z.infer<typeof BillingResolver>;

const urlSAT = 'https://www.sat.gob.mx/aplicacion/53027/genera-tu-constancia-de-situacion-fiscal';

export default function Invoicing({ onSubmit, session }: { onSubmit: () => void; session: Session }) {
  const sendEvent = useSendEvent();
  const guardianMutation = api.guardian.update.useMutation();
  const studentMutation = api.student.assignBillings.useMutation();
  const { data: guardianData } = api.guardian.get.useQuery({ id: session?.user.id || '' });
  const [isEditing, setIsEditing] = React.useState(false);
  const [setBackWithConfirmation, setConfirmationBackCallback, step] = useOnboardingStore((state) => [
    state.setBackWithConfirmation,
    state.setConfirmationBackCallback,
    state.step,
  ]);

  const taxRegime = taxRegimeValues.find((tax) => tax.value === guardianData?.taxing_system) ?? undefined;
  const [confirmation, setConfirmation] = React.useState(false);
  const { setAlert } = useAlert();
  const {
    register,
    formState: { errors, isDirty, isSubmitting },
    control,
    handleSubmit,
    clearErrors,
    watch,
    setError,
    reset,
  } = useForm<BillingValues>({
    mode: 'all',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(BillingResolver),
    defaultValues: {
      personType: (guardianData?.taxing_type ?? personTypeDefault) as TaxingTypeEnum | undefined,
      taxId: guardianData?.tax_id ?? undefined,
      billingName: guardianData?.billing_name ?? undefined,
      postalCode: guardianData?.postal_code ?? undefined,
      taxRegime,
    },
  });
  const isDirtyRef = React.useRef(false);

  isDirtyRef.current = isDirty;

  const hasBillingSetted = session.user.dependents.some((d) => d.billing_guardian.id !== null);

  const onBackIntempt = () => {
    if (!isDirtyRef.current) {
      setIsEditing(false);
      setBackWithConfirmation(false);
    } else {
      setConfirmation(true);
    }
  };

  const personType = watch('personType');

  const taxRegimeValuesByPersonType = taxRegimeValues.filter((tax) => tax.personTypes.includes(personType));
  const utils = api.useUtils();

  const onFormSubmit = async (values: BillingValues) => {
    sendEvent('Onboarding — onboarding invoice opt-in complete');
    const res = await guardianMutation.mutateAsync({
      id: session.user.id,
      data: {
        taxing_type: values.personType,
        tax_id: values.taxId,
        billing_name: values.billingName,
        postal_code: values.postalCode,
        taxing_system: values.taxRegime.value,
        onboarding_stage: 'COMPLETED',
      },
    });

    if (res.error) {
      if (res?.data && res?.status === 400) {
        Object.keys(res.data).forEach((key) => setError(`root.${key}`, { type: 'validate', message: res.data[key] }));
      } else if (res?.status !== 200) setAlert('Error al guardar datos');
      return;
    }

    if (!hasBillingSetted) {
      const students = session.user.dependents.map((d) => ({ id: d.id, billing_guardian: session.user.id }));

      await studentMutation.mutateAsync({
        data: { students },
      });
    }

    await utils.guardian.get.invalidate();

    onSubmit();
  };

  return (
    <>
      <AnimatePresence initial={false} mode="wait" custom={isEditing ? -1 : 1}>
        {!isEditing && (
          <motion.div
            custom={-1}
            key="student-list"
            variants={StudentViewVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            className="flex flex-col flex-auto h-full px-4 pt-8 mb-auto"
          >
            <h5 className="mb-8 text-2xl font-semibold tracking-wide text-[#1C1C1D]">
              ¿Quieres completar o revisar tus datos de facturación?
            </h5>

            <Card className="flex flex-col">
              <span className="text-[#1C1C1D] text-lg font-bold">
                {hasBillingSetted ? 'Sabías que..' : 'Infomación adicional'}
              </span>
              <p>
                {hasBillingSetted
                  ? 'Puedes facturar con Cometa de automáticamente para recibir beneficios educativos.'
                  : 'Cuando confirmes tu RFC se asignará automáticamente a tus estudiantes. Podrás editar o cambiar tu RFC durante el proceso de pago de todas maneras.'}
              </p>
            </Card>

            <div className="mt-auto">
              <Button
                theme="recreo"
                type="button"
                onClick={() => {
                  sendEvent('Onboarding — onboarding invoice opt-in started');
                  setIsEditing(true);
                  setConfirmationBackCallback(onBackIntempt);
                  setBackWithConfirmation(true);
                  reset({
                    personType: (guardianData?.taxing_type ?? personTypeDefault) as TaxingTypeEnum | undefined,
                    taxId: guardianData?.tax_id ?? undefined,
                    billingName: guardianData?.billing_name ?? undefined,
                    postalCode: guardianData?.postal_code ?? undefined,
                    taxRegime,
                  });
                }}
                className="mb-[25px] w-full font-bold"
              >
                Sí
              </Button>
              <Button
                variant="border"
                theme="recreo"
                type="button"
                onClick={() => {
                  sendEvent('Onboarding — onboarding invoice opt-in skip clicked');
                  guardianMutation.mutate({ id: session.user.id, data: { onboarding_stage: 'COMPLETED' } });
                  onSubmit();
                }}
                className="w-full"
              >
                Por ahora no
              </Button>
            </div>
          </motion.div>
        )}
        {isEditing && (
          <motion.div
            custom={1}
            key="student-form"
            variants={StudentViewVariants}
            initial="enter"
            animate="visible"
            exit="exit"
            className="px-4"
          >
            <div className="flex flex-col flex-1">
              <article className="text-gray-300 mb-9">
                <h3 className="mb-8 text-xl font-bold text-[#1C1C1D]">Complete los datos de facturación.</h3>
                <p className="mb-8 font-light">
                  Los datos deben coincidir con los de tu{' '}
                  <span className="font-semibold">constancia de situación fiscal.</span>{' '}
                  <a
                    href={urlSAT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-medium underline cursor-pointer text-blue"
                    onClick={() => sendEvent('Onboarding — obtain certificate clicked')}
                  >
                    Quiero obtener mi constancia
                  </a>
                </p>
              </article>
              <form className="text-gray-300 mb-[37px]" onSubmit={handleSubmit(onFormSubmit)}>
                <Fieldset>
                  <legend className="font-semibold" id="demo-radio-buttons-group-label">
                    Facturar como
                  </legend>
                  <Controller
                    name="personType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        className="flex items-center gap-4"
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={personTypeDefault}
                            id="physical-person"
                            className="border-[#2B2D30] text-[#2B2D30] pointer-events-auto"
                            onClick={() =>
                              sendEvent('Onboarding — invoice as clicked', { person_type: 'Persona física' })
                            }
                          />
                          <label htmlFor="physical-person">Persona física</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={personTypeMoral}
                            id="legal-person"
                            className="border-[#2B2D30] text-[#2B2D30] pointer-events-auto"
                            onClick={() =>
                              sendEvent('Onboarding — invoice as clicked', { person_type: 'Persona moral' })
                            }
                          />
                          <label htmlFor="legal-person">Empresa</label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </Fieldset>
                <Fieldset>
                  <CustomFormField
                    label="RFC*"
                    htmlFor="taxId"
                    error={errors.taxId?.message ?? errors.root?.rfc?.message}
                  >
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <CustomInput
                          theme="recreo"
                          placeholder="RFC*"
                          className="placeholder-transparent bg-white rounded-[14px] p-5 enabled:hover:outline-[#212121]"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          onClick={() => sendEvent('Onboarding — invoice rfc edited')}
                        />
                      )}
                      name="taxId"
                    />
                  </CustomFormField>
                  <CustomFormField
                    label="Razón Social*"
                    labelClassName="font-normal group-data-[error=false]:group-focus-within:text-gray-200"
                    error={
                      errors?.billingName || errors.root?.billing_name ? (
                        <span className="flex flex-row items-center">
                          {errors.billingName?.message ?? errors.root?.billing_name.message}
                          <HelpTooltipIcon>
                            <p className="text-xs">
                              {personType !== personTypeDefault ? 'La razón social' : 'El nombre y apellido'} debe
                              coincidir con el que tengas registrado en tu constancia de situación fiscal.
                            </p>
                            <a href={urlSAT} target="_blank" rel="noreferrer" className="underline">
                              Obtener constancia de situación fiscal
                            </a>
                          </HelpTooltipIcon>
                        </span>
                      ) : undefined
                    }
                    helperText={
                      errors?.billingName === undefined && errors.root?.billing_name === undefined ? (
                        personType !== personTypeDefault ? (
                          <p>
                            La razón social debe ser <span className="font-medium">sin</span> el régimen capital (
                            SA.DE.CV). <span className="font-medium">No se deben utilizar acentos </span> para que
                            coincida con lo registrado en el SAT.
                          </p>
                        ) : (
                          <p>
                            <span className="font-medium">No se deben utilizar acentos </span> para que coincida con lo
                            registrado en el SAT.
                          </p>
                        )
                      ) : null
                    }
                  >
                    <CustomInput
                      theme="recreo"
                      placeholder="Nombre/s y apellido/s"
                      {...register('billingName')}
                      className={cn(
                        'bg-white rounded-[14px] p-5 placeholder-transparent enabled:hover:outline-[#212121]',
                        {
                          'focus:placeholder-gray-200': personType === personTypeDefault,
                        }
                      )}
                      onClick={() => sendEvent('Onboarding — invoice business name edited')}
                    />
                  </CustomFormField>
                  <Controller
                    control={control}
                    name="taxRegime"
                    render={({ field }) => (
                      <Combobox
                        key={`combobox-${personType}`}
                        options={taxRegimeValuesByPersonType}
                        sorterOptions={{ keys: ['value', 'name'] }}
                        itemToString={(item) => (item ? `${item?.value} - ${item?.name}` : '')}
                        onSelectedItemChange={(value) => {
                          sendEvent('Onboarding — invoice tax regime edited', { tax_regime: value.selectedItem });
                          field.onChange(value.selectedItem);
                        }}
                        placeholder="Régimen fiscal*"
                        optionIdentifier="name"
                        initialSelectedItem={field.value}
                      />
                    )}
                  />
                  <CustomFormField
                    labelClassName="font-normal group-data-[error=false]:group-focus-within:text-gray-200"
                    label="Código Postal*"
                    htmlFor="postalCode"
                    error={
                      (errors?.postalCode || errors?.root?.postal_code) && (
                        <span className="flex flex-row items-center">
                          {errors?.postalCode?.message ?? errors?.root?.postal_code.message}
                          <HelpTooltipIcon>
                            <p className="text-xs">
                              El código postal debe coincidir con el que tengas registrado en tu constancia de situación
                              fiscal.
                            </p>
                            <a href={urlSAT} target="_blank" rel="noreferrer" className="underline">
                              Obtener constancia de situación fiscal
                            </a>
                          </HelpTooltipIcon>
                        </span>
                      )
                    }
                  >
                    <CustomInput
                      theme="recreo"
                      placeholder=""
                      className="p-5 rounded-[14px]"
                      {...register('postalCode')}
                      onClick={() => sendEvent('Onboarding — invoice zip code edited')}
                    />
                  </CustomFormField>
                </Fieldset>
                <HelpLink href={WHAT_ONBOARDING_HELP} className="block my-12 text-[#2B2D30]" />
                <Button
                  className="block w-full mx-auto mt-6 lg:mt-12"
                  disabled={guardianMutation.isPending || isSubmitting || studentMutation.isPending}
                  theme="recreo"
                >
                  Continuar
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={confirmation && isDirty}>
        <Dialog.Content className="w-screen px-5">
          <div className="flex flex-col space-y-6">
            <span className="text-sm text-center">¿Quieres volver sin confirmar los datos de facturación?</span>
            <Button
              className="px-5 py-3 text-sm"
              theme="recreo"
              onClick={() => {
                sendEvent('Onboarding — back button confirm', {
                  step_number: step,
                  step_name: OnboardingStageEnum.BILLING,
                });
                setIsEditing(false);
                setBackWithConfirmation(false);
                setConfirmation(false);
              }}
              data-testid="confirm-alertButton"
            >
              Continuar de todos modos
            </Button>
            <Dialog.Close
              className="text-sm text-[#2B2D30] bg-transparent"
              onClick={() => {
                sendEvent('Onboarding — back button cancel', {
                  step_number: step,
                  step_name: OnboardingStageEnum.BILLING,
                });
                setConfirmation(false);
              }}
              data-testid="cancel-alertButton"
            >
              Cancelar
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog>
      <InformationDrawer
        intent="error"
        open={Boolean(Object.keys(errors.root ?? {}).length)}
        title="Los datos no coinciden con los registrados en el SAT."
        description={
          <div className="text-center">
            <label className="font-medium">¿Qué puedo hacer?</label>
            <ol className="space-y-1 font-medium list-decimal list-inside mt-2.5">
              <li>Revisar los datos ingresados.</li>
              <li>
                Revisar tu <span className="font-semibold"> Constancia de situación fiscal</span> para registrar los
                datos correctamente.
              </li>
            </ol>
          </div>
        }
        onClick={() => {
          sendEvent('Onboarding - error button dismiss clicked', { lastStep: OnboardingStageEnum.BILLING });
          clearErrors();
        }}
      />
    </>
  );
}
