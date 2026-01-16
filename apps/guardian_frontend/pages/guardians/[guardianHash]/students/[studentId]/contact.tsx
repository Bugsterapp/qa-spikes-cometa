'use client';

import Head from 'next/head';
import { BackButton } from '~/components/BackButton';
import { api } from '~/utils/api';
import { Card, CardContent, CardItem, CardTitle } from '~/components/Card';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { Button, Drawer, Input, ContainerError, Label, PhoneInput, Select } from '@cometa/recreo';
import { PencilIcon } from 'lucide-react';
import { useSelectedSchool } from '~/stores/globalStore';
import { Controller, FieldValues, useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { State } from '@cometa/trpc/src/students/types';
import { StudentEntity } from '@cometa/trpc/src/students/types-mapping';
import { useSendEvent } from '~/hooks/useSendEvent';
import { TrackEvents } from '~/constants/events';
import { ReactNode, useEffect, useState } from 'react';
import { useToggle } from '@cometa/hooks';

type InfoItem = {
  label: string;
  value: string | number | null | undefined;
};

const REQUIRED_MESSAGE = 'Falta completar este campo.';

const phoneSchema = z.object({
  home_phone: z.string().min(1, REQUIRED_MESSAGE),
});

const addressSchema = z.object({
  street: z.string().min(1, REQUIRED_MESSAGE),
  interior_number: z.string().min(1, REQUIRED_MESSAGE),
  neighborhood: z.string().min(1, REQUIRED_MESSAGE),
  municipality: z.string().min(1, REQUIRED_MESSAGE),
  state_id: z.string({ required_error: REQUIRED_MESSAGE }),
  zip_code: z.string().min(1, REQUIRED_MESSAGE),
});

type FormPhoneValues = z.infer<typeof phoneSchema>;
type FormAddressValues = z.infer<typeof addressSchema>;

function ContactPage() {
  const router = useRouter();
  const { guardianHash } = router.query;
  const studentId = router.query.studentId as string;

  const { data: studentAdditionalInfo } = api.student.getStudentAdditionalInfo.useQuery({ studentId });

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const addressForm = useForm<FormAddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: studentAdditionalInfo?.address?.street || undefined,
      interior_number: studentAdditionalInfo?.address?.interior_number?.toString() || undefined,
      neighborhood: studentAdditionalInfo?.address?.neighborhood || undefined,
      municipality: studentAdditionalInfo?.address?.municipality || undefined,
      zip_code: studentAdditionalInfo?.address?.zip_code || undefined,
      state_id: studentAdditionalInfo?.address?.state?.id || undefined,
    },
  });

  const phoneForm = useForm<FormPhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      home_phone: studentAdditionalInfo?.address?.home_phone || undefined,
    },
  });

  const {
    formState: { isDirty: isAddressDirty },
    reset: resetAddress,
  } = addressForm;

  const {
    formState: { isDirty: isPhoneDirty },
    reset: resetPhone,
  } = phoneForm;

  const { toggle: isOpen, onOpen, onClose } = useToggle();

  function handleDiscardOnClickBack() {
    if ((isEditingPhone && isPhoneDirty) || (isEditingAddress && isAddressDirty)) {
      onOpen();
      return;
    }

    router.push(`/guardians/${guardianHash}/students/${studentId}`);
  }

  function restorePhoneForm() {
    resetPhone({
      home_phone: studentAdditionalInfo?.address?.home_phone || undefined,
    });
  }

  function restoreAddressForm() {
    resetAddress({
      street: studentAdditionalInfo?.address?.street || undefined,
      interior_number: studentAdditionalInfo?.address?.interior_number?.toString() || undefined,
      neighborhood: studentAdditionalInfo?.address?.neighborhood || undefined,
      municipality: studentAdditionalInfo?.address?.municipality || '',
      state_id: studentAdditionalInfo?.address?.state?.id || undefined,
      zip_code: studentAdditionalInfo?.address?.zip_code || undefined,
    });
  }

  function handleDiscard() {
    restorePhoneForm();
    restoreAddressForm();
    onClose();
    setIsEditingPhone(false);
    setIsEditingAddress(false);
  }

  useEffect(() => {
    restorePhoneForm();
    restoreAddressForm();
  }, [studentAdditionalInfo]);

  return (
    <main className="flex flex-col gap-6 px-5 py-6">
      <div onClick={handleDiscardOnClickBack} className="flex items-center gap-3 hover:cursor-pointer">
        <BackButton arrowColor="#1C1C1D" circleColor="#F3F6FB" />
        <span className="text-sm font-semibold uppercase">Volver</span>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-bold text-[#22222A]">Detalles de contacto</h1>
        <p className="text-sm text-[#535765]">
          Información de contacto del estudiante disponible para uso del colegio.
        </p>
      </header>

      <PhoneSection
        student={studentAdditionalInfo}
        form={phoneForm}
        isEditing={isEditingPhone}
        isLoading={isLoadingPhone}
        isOpen={isOpen}
        restoreForm={restorePhoneForm}
        onClose={onClose}
        onDiscard={handleDiscard}
        setIsEditing={setIsEditingPhone}
        setIsLoading={setIsLoadingPhone}
      />

      <AddressSection
        student={studentAdditionalInfo}
        form={addressForm}
        isEditing={isEditingAddress}
        isLoading={isLoadingAddress}
        isOpen={isOpen}
        restoreForm={restoreAddressForm}
        onClose={onClose}
        onDiscard={handleDiscard}
        setIsEditing={setIsEditingAddress}
        setIsLoading={setIsLoadingAddress}
      />
    </main>
  );
}

type EditableSectionProps<TFormValues extends FieldValues = FieldValues> = {
  title: string;
  items: InfoItem[];
  form: UseFormReturn<TFormValues>;
  isEditing: boolean;
  isLoading: boolean;
  isOpen: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onClose: () => void;
  onDiscard: () => void;
  onSubmit: (data: TFormValues) => void;
  children: ReactNode;
};

const EditableSection = <TFormValues extends FieldValues>({
  title,
  items,
  form,
  isEditing,
  isLoading,
  isOpen,
  onEdit,
  onCancel,
  onClose,
  onDiscard,
  onSubmit,
  children,
}: EditableSectionProps<TFormValues>) => {
  const { handleSubmit } = form;

  return (
    <Card>
      <CardTitle className="py-4">
        <div className="flex items-center justify-between">
          <span>{title}</span>
          <EditButton isEditing={isEditing} onEdit={onEdit} onCancel={onCancel} />
        </div>
      </CardTitle>
      <CardContent>
        {isEditing ? (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {children}
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#1C1C1D] hover:bg-[#1C1C1D]/90 mt-2 px-5 py-2.5"
              >
                Guardar
              </Button>
            </form>
            <DiscardDialog isOpen={isOpen} isLoading={isLoading} onClose={onClose} onDiscard={onDiscard} />
          </>
        ) : (
          <InfoSection items={items} />
        )}
      </CardContent>
    </Card>
  );
};

const PhoneSection = ({
  student,
  form,
  isEditing,
  isLoading,
  isOpen,
  restoreForm,
  onClose,
  onDiscard,
  setIsEditing,
  setIsLoading,
}: {
  student: StudentEntity | null | undefined;
  form: UseFormReturn<FormPhoneValues>;
  isEditing: boolean;
  isLoading: boolean;
  isOpen: boolean;
  restoreForm: () => void;
  onClose: () => void;
  onDiscard: () => void;
  setIsEditing: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}) => {
  const sendEvent = useSendEvent();
  const router = useRouter();
  const studentId = router.query.studentId as string;
  const items: InfoItem[] = [{ label: 'Teléfono de casa', value: student?.address?.home_phone }];
  const utils = api.useUtils();

  const mutation = {
    create: api.student.createStudentAdditionalInfo.useMutation({
      onSuccess() {
        utils.student.getStudentAdditionalInfo.invalidate({ studentId });
        setIsEditing(false);
        setIsLoading(false);
      },
    }),
    update: api.student.updateStudentAdditionalInfo.useMutation({
      onSuccess() {
        utils.student.getStudentAdditionalInfo.invalidate({ studentId });
        setIsEditing(false);
        setIsLoading(false);
      },
    }),
  };

  const {
    control,
    formState: { errors, isDirty },
    watch,
    clearErrors,
  } = form;

  function handleCancel() {
    restoreForm();
    setIsEditing(false);
  }

  function handleEdit() {
    sendEvent(TrackEvents.students.editClicked);
    setIsEditing(true);
  }

  function onSubmit(data: FormPhoneValues) {
    sendEvent(TrackEvents.students.editConfirm);
    setIsLoading(true);

    if (!isDirty) {
      setIsEditing(false);
      setIsLoading(false);
      return;
    }

    student
      ? mutation.update.mutate({ data: { address: { ...data, id: student?.address?.id || null } }, studentId })
      : mutation.create.mutate({ data: { address: { ...data }, student_id: studentId } });
  }

  return (
    <EditableSection
      title="Teléfono"
      items={items}
      form={form}
      isOpen={isOpen}
      isEditing={isEditing}
      isLoading={isLoading}
      onSubmit={onSubmit}
      onClose={onClose}
      onDiscard={onDiscard}
      onCancel={handleCancel}
      onEdit={handleEdit}
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="homephone">Teléfono de casa</Label>
        <Controller
          control={control}
          name="home_phone"
          render={({ field }) => (
            <PhoneInput
              initialValue={watch('home_phone')}
              label="Teléfono de casa"
              onChange={({ number }) => {
                clearErrors('home_phone');
                field.onChange(number || '');
              }}
              error={errors.home_phone?.message as string}
            />
          )}
        />
      </div>
    </EditableSection>
  );
};

const AddressSection = ({
  student,
  form,
  isEditing,
  isLoading,
  isOpen,
  restoreForm,
  onClose,
  onDiscard,
  setIsEditing,
  setIsLoading,
}: {
  student: StudentEntity | null | undefined;
  form: UseFormReturn<FormAddressValues>;
  isEditing: boolean;
  isLoading: boolean;
  isOpen: boolean;
  restoreForm: () => void;
  onClose: () => void;
  onDiscard: () => void;
  setIsEditing: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}) => {
  const router = useRouter();
  const studentId = router.query.studentId as string;
  const sendEvent = useSendEvent();
  const items: InfoItem[] = [
    { label: 'Dirección', value: student?.address?.street },
    { label: 'Número interior', value: student?.address?.interior_number },
    { label: 'Colonia', value: student?.address?.neighborhood },
    { label: 'Municipio / Delegación', value: student?.address?.municipality },
    { label: 'Estado', value: student?.address?.state?.name },
    { label: 'Código postal', value: student?.address?.zip_code },
  ];
  const utils = api.useUtils();

  const mutation = {
    create: api.student.createStudentAdditionalInfo.useMutation({
      onSuccess() {
        utils.student.getStudentAdditionalInfo.invalidate({ studentId });
        setIsEditing(false);
        setIsLoading(false);
      },
    }),
    update: api.student.updateStudentAdditionalInfo.useMutation({
      onSuccess() {
        utils.student.getStudentAdditionalInfo.invalidate({ studentId });
        setIsEditing(false);
        setIsLoading(false);
      },
    }),
  };

  const {
    control,
    formState: { errors, isDirty },
    register,
  } = form;

  const statesReponse = api.student.getStates.useQuery();
  const states = (statesReponse.data as State[]) || [];

  function handleCancel() {
    restoreForm();
    setIsEditing(false);
  }

  function handleEdit() {
    sendEvent(TrackEvents.students.editClicked);
    setIsEditing(true);
  }

  function onSubmit(data: FormAddressValues) {
    sendEvent(TrackEvents.students.editConfirm);
    setIsLoading(true);

    if (!isDirty) {
      setIsEditing(false);
      setIsLoading(false);
      return;
    }

    student
      ? mutation.update.mutate({
          data: {
            address: {
              ...data,
              id: student?.address?.id || null,
              interior_number: data?.interior_number || null,
            },
          },
          studentId,
        })
      : mutation.create.mutate({
          data: { address: { ...data, interior_number: data?.interior_number || null }, student_id: studentId },
        });
  }

  return (
    <EditableSection
      title="Dirección"
      items={items}
      form={form}
      isEditing={isEditing}
      isLoading={isLoading}
      isOpen={isOpen}
      onSubmit={onSubmit}
      onCancel={handleCancel}
      onEdit={handleEdit}
      onClose={onClose}
      onDiscard={onDiscard}
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="street">Dirección</Label>
        <Input
          {...register('street')}
          type="text"
          error={errors.street?.message as string}
          isLegacy={false}
          className="text-base text-[#1C1C1D]"
          onClick={() => sendEvent(TrackEvents.students.editContactStreetClicked)}
        />
        <ContainerError error={errors.street?.message as string} />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="interior_number">Número interior</Label>
        <Input
          {...register('interior_number')}
          type="text"
          error={errors.interior_number?.message as string}
          isLegacy={false}
          className="text-base text-[#1C1C1D]"
          onClick={() => sendEvent(TrackEvents.students.editContactInteriorNumberClicked)}
        />
        <ContainerError error={errors.interior_number?.message as string} />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="neighborhood">Colonia</Label>
        <Input
          {...register('neighborhood')}
          type="text"
          error={errors.neighborhood?.message as string}
          isLegacy={false}
          className="text-base text-[#1C1C1D]"
          onClick={() => sendEvent(TrackEvents.students.editContactNeighborhoodClicked)}
        />
        <ContainerError error={errors.neighborhood?.message as string} />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="municipality">Municipio</Label>
        <Input
          {...register('municipality')}
          type="text"
          error={errors.municipality?.message as string}
          isLegacy={false}
          className="text-base text-[#1C1C1D]"
          onClick={() => sendEvent(TrackEvents.students.editContactMunicipalityClicked)}
        />
        <ContainerError error={errors.municipality?.message as string} />
      </div>

      <div className="flex flex-col gap-1">
        <Controller
          control={control}
          name="state_id"
          render={({ field: { onChange, value } }) => (
            <Select
              placeholder="Estado"
              className="w-full outline-none min-h-[56px] h-full mb-1"
              onValueChange={(value) => {
                onChange(value || '');
              }}
              value={value || ''}
              defaultValue={student?.address?.state?.id as string}
              error={errors.state_id?.message as string}
            >
              <Select.Content className="w-full outline-none">
                {states?.map((state) => (
                  <Select.Item
                    key={state.id}
                    value={state.id as string}
                    className="w-full hover:bg-[#F5FAFF] outline-none"
                  >
                    <div className="flex gap-2">{state.name}</div>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="zip_code">Código postal</Label>
        <Input
          {...register('zip_code')}
          type="text"
          error={errors.zip_code?.message as string}
          isLegacy={false}
          className="text-base text-[#1C1C1D]"
          onClick={() => sendEvent(TrackEvents.students.editContactZipCodeClicked)}
        />
        <ContainerError error={errors.zip_code?.message as string} />
      </div>
    </EditableSection>
  );
};

function InfoSection({ items }: { items: InfoItem[] }) {
  return (
    <CardContent>
      {items.map(({ label, value }) => (
        <CardItem key={label} label={label} value={value} />
      ))}
    </CardContent>
  );
}

function DiscardDialog({
  isOpen,
  isLoading,
  onClose,
  onDiscard,
}: {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDiscard: () => void;
}) {
  if (!isOpen) return null;

  return (
    <Drawer.Root open={isOpen} className="max-w-sm gap-3 text-center" minHeight="30%">
      <div className="flex flex-col items-center gap-3">
        <DiscardIcon />
        <Drawer.Title>Descartar cambios</Drawer.Title>
      </div>

      <Drawer.Description>
        <p>Los cambios realizados no se guardarán.</p>
        <p>¿Estás seguro que quieres continuar?</p>
      </Drawer.Description>

      <div className="flex flex-col gap-3">
        <Button
          className="bg-[#FD6262] hover:bg-[#FD6262]/90 text-white text-sm font-semibold px-5 py-2.5 w-full"
          onClick={onDiscard}
          disabled={isLoading}
        >
          Descartar
        </Button>
        <Drawer.Close
          onClick={onClose}
          className="bg-transparent text-[#1C1C1D] hover:bg-[#F3F6FB] text-sm font-semibold px-5 py-2.5 w-full rounded-full"
          disabled={isLoading}
        >
          Volver
        </Drawer.Close>
      </div>
    </Drawer.Root>
  );
}

function DiscardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32C24.8366 32 32 24.8366 32 16C32 11.7565 30.3143 7.68687 27.3137 4.68629C24.3131 1.68571 20.2435 0 16 0ZM17.6 22.4C17.6 23.2837 16.8837 24 16 24C15.1163 24 14.4 23.2837 14.4 22.4V14.4C14.4 13.5163 15.1163 12.8 16 12.8C16.8837 12.8 17.6 13.5163 17.6 14.4V22.4ZM14.4 9.6C14.4 10.4837 15.1163 11.2 16 11.2C16.8837 11.2 17.6 10.4837 17.6 9.6C17.6 8.71634 16.8837 8 16 8C15.1163 8 14.4 8.71634 14.4 9.6Z"
        fill="#FD6262"
      />
    </svg>
  );
}

function EditButton({ isEditing, onCancel, onEdit }: { isEditing: boolean; onCancel: () => void; onEdit: () => void }) {
  const selectedSchool = useSelectedSchool();
  const canEdit = Boolean(selectedSchool?.config_portal?.edit_student_contact_portal);

  if (!canEdit) return null;

  if (isEditing) {
    return (
      <Button
        onClick={onCancel}
        className="text-[#1C1C1D] bg-[#F3F6FB] hover:bg-[#E4EBF6] text-sm font-semibold px-4 py-1.5 flex gap-2 items-center"
      >
        Cancelar
      </Button>
    );
  }

  return (
    <Button
      onClick={onEdit}
      className="text-[#1C1C1D] bg-[#F3F6FB] hover:bg-[#E4EBF6] text-sm font-semibold w-9 h-9 p-0 flex items-center justify-center rounded-full"
    >
      <PencilIcon className="w-4 h-4" />
    </Button>
  );
}

ContactPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <>
      <Head>
        <title>Detalles de contacto</title>
      </Head>

      <main className="max-w-sm mx-auto">{page}</main>
    </>
  );
};

ContactPage.auth = true;

export default ContactPage;
