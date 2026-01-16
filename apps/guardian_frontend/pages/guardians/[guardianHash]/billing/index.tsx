import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cometa/recreo/v2';
import { TaxingTypeEnum } from '@cometa/trpc';
import { useForm, useStore } from '@tanstack/react-form';
import { AlertCircle, Pencil } from 'lucide-react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { Session } from 'next-auth';
import { getSession, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle, CollapsibleCard } from '~/components/Card';
import { Drawer } from '~/components/Drawer';
import Navbar from '~/components/Navbar';
import RemoveBilling from '~/components/molecules/guardians/RemoveBilling';
import { PageViewedCategory, TrackEvents } from '~/constants/events';
import { useAlert } from '~/hooks';
import { useSendPageEvent } from '~/hooks/useSendEvent';
import useUpdateSession from '~/hooks/useUpdateSession';
import { useVerifyRFC } from '~/hooks/useVerifyRFC';
import { api } from '~/utils/api';
import { personTypeMoral } from '~/utils/static_data/personTypesTaxRegimen';
import taxRegimeValues from '~/utils/static_data/taxRegimeValues';
import { useGetWebview } from '~/stores/globalStore';

type BillingPlaceholderProps = {
  onRegister: () => void;
};

function BillingPlaceholder({ onRegister }: BillingPlaceholderProps) {
  return (
    <div className="mx-auto text-center flex flex-col items-center justify-center h-[calc(100vh_-_58px)] max-w-[280px]">
      <img
        src="/images/invoice_placeholder_es.png"
        width={93}
        height={93}
        alt="Ilustración de factura"
        className="mb-6"
      />
      <h3 className="text-lg font-bold mb-2">Datos de facturación</h3>
      <p className="text-sm text-[#444C60] max-w-[268px] mb-6">
        Todavía no has registrado un RFC. Agrégalo en segundos para poder facturar cuando realices tu próximo pago.
      </p>
      <Button variant="default" className="w-full" onClick={onRegister}>
        Registrar RFC
      </Button>
    </div>
  );
}

type CFDIEntry = {
  code?: string;
  name?: string;
  description?: string;
};

type CFDIEntriesProps = {
  cfdiConfigDetail: Record<string, CFDIEntry> | undefined;
};

function CFDIEntries({ cfdiConfigDetail }: CFDIEntriesProps) {
  const cfdiEntries = Object.entries(cfdiConfigDetail || {});

  const groupedByCFDI = cfdiEntries.reduce((acc, [_category, detail]) => {
    // Skip entries with missing required fields
    if (!detail?.code || !detail?.name || !detail?.description) {
      return acc;
    }

    const key = `${detail.code}|${detail.name}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(detail.description);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <>
      {Object.entries(groupedByCFDI).map(([key, descriptions]) => {
        const [code, name] = key.split('|');

        // Format descriptions with commas and "y" for the last one
        const formattedDescriptions =
          descriptions.length === 1
            ? descriptions[0]
            : descriptions.length === 2
            ? descriptions.join(' y ')
            : descriptions.slice(0, -1).join(', ') + ' y ' + descriptions[descriptions.length - 1];

        return (
          <div key={key} className="py-1 space-y-1">
            <p className="text-sm leading-5 text-[#6E7480]">
              {code} - {name}
            </p>
            <p className="text-base leading-6 text-[#22222A]">{formattedDescriptions}</p>
          </div>
        );
      })}
    </>
  );
}

type RemoveBillingDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function RemoveBillingDrawer({ open, onOpenChange, onConfirm }: RemoveBillingDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} minHeight="auto">
      <div className="flex flex-col items-center px-5 py-7">
        {/* Trash Icon */}
        <img src="/images/trash-icon.png" alt="Eliminar" className="w-[68px] h-[68px]" />

        {/* Title */}
        <Drawer.Title className="text-xl font-semibold text-[#1C1C1D]">¿Estás seguro?</Drawer.Title>

        {/* Description */}
        <Drawer.Description className="text-sm text-[#535765]">
          ¿Seguro que quieres eliminar tus datos de facturación ya registrados?
        </Drawer.Description>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-6">
          <Button variant="destructive" onClick={onConfirm}>
            Si, eliminar
          </Button>
          <Button variant="light" onClick={() => onOpenChange(false)} className="bg-[#F3F6FB]">
            Volver
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

type ValidationErrorDrawerProps = {
  open: boolean;
  message: string;
  onOpenChange: (open: boolean) => void;
};

function ValidationErrorDrawer({ open, message, onOpenChange }: ValidationErrorDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} minHeight="auto">
      <div className="flex flex-col items-center gap-3 py-4">
        {/* Error Icon */}
        <div className="w-8 h-8">
          <AlertCircle className="w-full h-full text-[#FD6262]" />
        </div>

        {/* Title */}
        <Drawer.Title className="text-xl font-semibold text-[#1C1C1D]">Los datos no coinciden</Drawer.Title>

        {/* Description */}
        <Drawer.Description className="text-sm text-[#535765] px-4">{message}</Drawer.Description>

        {/* Action Button */}
        <Button variant="destructive" className="w-full mt-4" onClick={() => onOpenChange(false)}>
          Volver a intentar
        </Button>
      </div>
    </Drawer>
  );
}

function BillingPage({ session: initialSession }: { session: Session }) {
  const router = useRouter();
  const backUrl = router.query.back as string | undefined;
  const isWebView = useGetWebview();

  const sendPageEvent = useSendPageEvent();
  const { setAlert } = useAlert();
  const updateSession = useUpdateSession();
  const { refetchDependentsWithErrors, refetchUser, user } = useVerifyRFC();
  const [isEditing, setIsEditing] = useState(Boolean(backUrl));
  const [validationError, setValidationError] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: '' });
  const [showRemoveDrawer, setShowRemoveDrawer] = useState(false);

  // Use session from hook to get reactive updates, fallback to initial session from SSR
  const { data: sessionData } = useSession();
  const session = (sessionData as Session) || initialSession;

  const hasRFC = user
    ? Boolean(user.tax_id) && Boolean(user.taxing_system)
    : Boolean(session?.user.tax_id) && Boolean(session?.user.taxing_system);

  const urlSAT = 'https://www.sat.gob.mx/aplicacion/53027/genera-tu-constancia-de-situacion-fiscal';

  const { mutateAsync } = api.guardian.update.useMutation();
  const { mutateAsync: removeBillingMutation } = api.guardian.update.useMutation();

  const getDefaultTaxingSystem = (taxingType: TaxingTypeEnum) => (taxingType === TaxingTypeEnum.M ? '601' : '605');

  const initialFormValues = {
    taxing_type: session.user.taxing_type || TaxingTypeEnum.N,
    taxing_system: session.user.taxing_system || getDefaultTaxingSystem(session.user.taxing_type || TaxingTypeEnum.N),
    tax_id: session.user.tax_id || '',
    billing_name: session.user.billing_name || '',
    postal_code: session.user.postal_code || '',
  };

  const form = useForm({
    defaultValues: initialFormValues,
    onSubmit: async ({ value }) => {
      try {
        const data = await mutateAsync({
          id: session.user?.id || '',
          data: value,
          query: {
            force: true,
          },
        });

        // Check if response contains error (mutation returns with error: true)
        if (data?.error) {
          // Check if there are field-specific errors in data.data
          if (data?.data) {
            // Get the first error message from the field errors
            const fieldErrors = Object.values(data.data);
            if (fieldErrors.length > 0 && typeof fieldErrors[0] === 'string') {
              setValidationError({
                open: true,
                message: fieldErrors[0],
              });
              return;
            }
          }
          return;
        }

        await updateSession.mutate();
        await refetchUser();

        // Verify RFC after update
        await refetchDependentsWithErrors();

        setAlert('Datos guardados correctamente', 'success');
        setIsEditing(false);

        // Redirect back if coming from another page
        if (backUrl) {
          router.push(backUrl);
        }
      } catch (error: unknown) {
        const apiError = error as {
          response?: {
            data?: { Message?: string; error?: string };
          };
        };

        // Handle caught errors (network errors, etc.)
        if (apiError?.response?.data) {
          if (apiError.response.data?.Message) {
            // Show validation error in drawer
            setValidationError({
              open: true,
              message: apiError.response.data.Message,
            });
          } else if (apiError.response.data?.error) {
            setAlert('No se puede cambiar en estos momentos');
          } else {
            setAlert('No se puede cambiar en estos momentos');
          }
        } else {
          setAlert('No se puede cambiar en estos momentos');
        }
      }
    },
  });

  const taxingType = useStore(form.store, (state) => state.values.taxing_type);

  const handleRemoveBilling = async () => {
    try {
      const formValues = {
        tax_id: '',
        billing_name: '',
        taxing_system: '',
        address_name: '',
        address_number: '',
        address_complement: '',
        postal_code: '',
        state: '',
        city: '',
        district: '',
        billable_dependents: [],
        cfdi_config: {
          monthly_fee: null,
          inscription: null,
          transport: null,
          other: null,
        },
      };

      const res = await removeBillingMutation({
        id: session?.user.id ?? '',
        data: formValues,
        query: { force: true },
      });

      if (res.error) {
        setAlert('Tus datos no pueden ser borrados en estos momentos');
        setShowRemoveDrawer(false);
        return;
      }

      await updateSession.mutate();
      await refetchUser();
      setAlert('Tus datos han sido borrados', 'success');
      setShowRemoveDrawer(false);
      setIsEditing(false);
    } catch (error) {
      setAlert('Tus datos no pueden ser borrados en estos momentos');
      setShowRemoveDrawer(false);
    }
  };

  useEffect(() => {
    sendPageEvent(TrackEvents.billing.pageViewed, PageViewedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show placeholder when no RFC and not editing and not coming from another page
  if (!hasRFC && !isEditing && !backUrl) {
    return <BillingPlaceholder onRegister={() => setIsEditing(true)} />;
  }

  return (
    <div className="flex flex-col px-5 py-6">
      <h3 className="text-lg text-[#22222A] mb-2 font-bold">Datos de facturación</h3>
      <p className="text-sm text-[#444C60]">
        Los datos deben coincidir con los datos de constancia de situación fiscal del SAT.
      </p>
      <a href={urlSAT} target="_blank" className="text-info-500 text-sm underline mb-4" rel="noopener noreferrer">
        Quiero obtener mi constancia.
      </a>
      <Card className="mb-4">
        <CardTitle className="p-4 flex-row justify-between items-center">
          <span className="mt-1">RFC</span>
          {!isEditing ? (
            <Button variant="light" className="bg-neutral-100 p-2 h-auto" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="light"
              className="bg-neutral-100"
              onClick={() => {
                // Reset form to original values
                form.reset();
                setIsEditing(false);
              }}
            >
              Cancelar
            </Button>
          )}
        </CardTitle>
        <CardContent>
          {!isEditing ? (
            // Read-only view
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#6E7480] mb-1">Facturar como</p>
                <p className="text-base text-[#22222A]">
                  {form.state.values.taxing_type === TaxingTypeEnum.M ? 'Persona Moral' : 'Persona Física'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#6E7480] mb-1">RFC</p>
                <p className="text-base text-[#22222A]">{form.state.values.tax_id || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[#6E7480] mb-1">Razón Social</p>
                <p className="text-base text-[#22222A]">{form.state.values.billing_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-[#6E7480] mb-1">Código Postal</p>
                <p className="text-base text-[#22222A]">{form.state.values.postal_code || '-'}</p>
              </div>
            </div>
          ) : (
            // Edit mode - Form
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              {/* Taxing Type - Radio Group */}
              <form.Field
                name="taxing_type"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Este campo es requerido';
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="mb-5">
                    <Label className="block mb-2 text-sm text-[#535765]">Facturar como...</Label>
                    <RadioGroup
                      value={field.state.value}
                      onValueChange={(v) => {
                        const newTaxingType = v as TaxingTypeEnum;
                        field.handleChange(newTaxingType);
                        // Set default taxing_system when person type changes
                        form.setFieldValue('taxing_system', getDefaultTaxingSystem(newTaxingType));
                        // Revalidate RFC when person type changes by triggering validation
                        form.validateField('tax_id', 'change');
                      }}
                    >
                      <div className="flex items-center p-3 has-[:checked]:bg-primary/10 has-[:checked]:border-primary rounded-lg border-[#D0D8E9] has-[:checked]:border-2 border gap-2">
                        <RadioGroupItem id="fisic_person" value={TaxingTypeEnum.N} />
                        <Label htmlFor="fisic_person" className="text-foreground w-full">
                          Persona Física
                        </Label>
                      </div>
                      <div className="flex items-center p-3 has-[:checked]:bg-primary/10 has-[:checked]:border-primary rounded-lg border-[#D0D8E9] has-[:checked]:border-2 border gap-2">
                        <RadioGroupItem id="moral_person" value={TaxingTypeEnum.M} />
                        <Label htmlFor="moral_person" className="text-foreground w-full">
                          Persona Moral
                        </Label>
                      </div>
                    </RadioGroup>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              />

              {/* Tax Regime - Select */}
              <form.Field
                name="taxing_system"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.length === 0) return 'Este campo es requerido';
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="mb-5">
                    <Label className="block mb-2 text-sm text-[#535765]">Régimen Fiscal</Label>
                    {isWebView ? (
                      <select
                        key={form.state.values.taxing_type}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full border border-[#c0c9d8] rounded-[6px] px-4 py-3 text-base text-[#22222a] bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      >
                        <option value="">Selecciona una opción</option>
                        {taxRegimeValues
                          .filter((v) => v.personTypes.includes(form.state.values.taxing_type))
                          .map((v) => (
                            <option key={v.value} value={v.value}>
                              {v.value} - {v.name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <Select
                        key={form.state.values.taxing_type}
                        value={field.state.value}
                        onValueChange={(v) => field.handleChange(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {taxRegimeValues
                              .filter((v) => v.personTypes.includes(form.state.values.taxing_type))
                              .map((v) => (
                                <SelectItem key={v.value} value={v.value}>
                                  {v.value} - {v.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              />

              {/* RFC - Input */}
              <form.Field
                name="tax_id"
                validators={{
                  onChange: ({ value, fieldApi }) => {
                    if (!value || value.length === 0) return 'Este campo es requerido';

                    const taxingType = fieldApi.form.getFieldValue('taxing_type');
                    const cleanValue = value.replace(/[\s-]/g, ''); // Remove spaces and dashes

                    // Persona Moral: 12 chars, Persona Física: 13 chars
                    const expectedLength = taxingType === personTypeMoral ? 12 : 13;
                    if (cleanValue.length !== expectedLength) {
                      return `El RFC debe tener ${expectedLength} caracteres`;
                    }

                    const rfcPattern =
                      taxingType === personTypeMoral
                        ? /^([A-ZÑ&]{3}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i
                        : /^([A-ZÑ&]{4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/i;

                    if (!rfcPattern.test(value)) return 'Formato incorrecto.';
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="mb-5">
                    <Label className="block mb-2 text-sm text-[#535765]">RFC</Label>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Ingresa tu RFC aquí"
                      className="w-full"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              />

              {/* Billing Name - Input */}
              <form.Field
                name="billing_name"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.length === 0) return 'Este campo es requerido';
                    if (!/^[a-zA-Z0-9Ññ ]+$/i.test(value)) return 'Recuerda no utilizar acentos.';
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="mb-5">
                    <Label className="block mb-2 text-sm text-[#535765]">Razón Social</Label>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      onBlur={field.handleBlur}
                      placeholder={taxingType === TaxingTypeEnum.M ? 'Nombre de la empresa' : 'Nombre(s) Apellido(s)'}
                      className="w-full uppercase placeholder:normal-case"
                    />
                    <p className="text-sm text-[#6E7480] mt-1 px-2">
                      {taxingType === TaxingTypeEnum.M
                        ? 'Evita acentos y no incluyas el régimen (S.A. de C.V.). Debe coincidir exactamente con los datos del SAT.'
                        : 'Evita acentos, debe coincidir textual con tu constancia del SAT.'}
                    </p>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              />

              {/* Postal Code - Input */}
              <form.Field
                name="postal_code"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.length === 0) return 'Este campo es requerido';
                    if (!/^\d{4,5}$/i.test(value)) return 'Formato incorrecto, mínimo 4 y máximo 5 números';
                    return undefined;
                  },
                }}
                children={(field) => (
                  <div className="mb-5">
                    <Label className="block mb-2 text-sm text-[#535765]">Código Postal</Label>
                    <Input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Código Postal"
                      className="w-full"
                    />
                    <p className="text-sm text-[#6E7480] mt-1 px-2">Igual al de tu domicilio fiscal</p>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500 mt-1">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              />

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting, state.isValid]}
                children={([canSubmit, isSubmitting, isValid]) => (
                  <Button
                    type="submit"
                    className="w-full text-white"
                    variant="secondary"
                    disabled={isSubmitting || !canSubmit || !isValid}
                  >
                    {isSubmitting ? 'Validando...' : 'Guardar'}
                  </Button>
                )}
              />
            </form>
          )}
        </CardContent>
      </Card>
      <CollapsibleCard
        title={
          <div className="px-4 py-3">
            <h4 className="text-base font-semibold">Usos de CFDI</h4>
          </div>
        }
      >
        <div className="space-y-3">
          {/* Intro text */}
          <div className="py-1">
            <p className="text-sm text-[#22222A]">
              Los usos de CFDI se asignan conforme a las reglas del SAT. Cada concepto se factura con el uso indicado y
              no es necesario editarlo.
            </p>
          </div>

          {/* CFDI entries */}
          <CFDIEntries cfdiConfigDetail={session.user.cfdi_config_detail} />
        </div>
      </CollapsibleCard>

      {/* Remove Billing Option */}
      {hasRFC && !isEditing && (
        <div className="mt-6 text-center">
          <RemoveBilling onClick={() => setShowRemoveDrawer(true)} />
        </div>
      )}

      {/* Remove Billing Drawer */}
      <RemoveBillingDrawer open={showRemoveDrawer} onOpenChange={setShowRemoveDrawer} onConfirm={handleRemoveBilling} />

      {/* Validation Error Drawer */}
      <ValidationErrorDrawer
        open={validationError.open}
        message={validationError.message}
        onOpenChange={(open) => setValidationError({ open, message: validationError.message })}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    session: await getSession(context),
  },
});

BillingPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Facturación</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar />
      </div>
      <div className="max-w-md mx-auto">{page}</div>
    </>
  );
};

BillingPage.auth = true;
export default BillingPage;
