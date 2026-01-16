import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { UserDTO } from '@cometa/trpc';
import { parsePhoneNumber } from 'libphonenumber-js';

const REQUIRED_MESSAGE = 'Falta completar este campo.';
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]{2,50}$/;

export type UserFormDTO = Omit<UserDTO, 'id' | 'last_login'>;

const schema = z.object({
  first_name: z
    .string()
    .min(1, REQUIRED_MESSAGE)
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(NAME_REGEX, 'El nombre contiene caracteres no válidos'),
  last_name: z
    .string()
    .min(1, REQUIRED_MESSAGE)
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(NAME_REGEX, 'El apellido contiene caracteres no válidos'),
  email: z
    .string()
    .min(1, REQUIRED_MESSAGE)
    .email('Ingresa una dirección de correo válida')
    .max(254, 'El correo es demasiado largo'),
  membership: z.string().min(1, REQUIRED_MESSAGE),
  mobile: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

type UseUserFormProps = {
  user?: UserDTO;
  mode?: 'create' | 'edit';
  onSave: (data: UserFormDTO) => void;
  existingEmails?: Set<string>;
  existingPhones?: Set<string>;
};

export function useUserForm({ user, mode = 'edit', onSave, existingEmails, existingPhones }: UseUserFormProps) {
  const defaultValues = {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    membership: user?.membership || '',
    mobile: user?.mobile ?? undefined,
  };

  const refinedSchema = schema
    .refine(
      (data) => {
        if (!existingEmails) return true;
        return !existingEmails.has(data.email.toLowerCase().trim());
      },
      {
        message: 'Este correo ya está registrado en el sistema',
        path: ['email'],
      }
    )
    .refine(
      (data) => {
        if (!data.mobile || !existingPhones) return true;
        const trimmedMobile = data.mobile.trim();
        return trimmedMobile === '' || !existingPhones.has(trimmedMobile);
      },
      {
        message: 'Este teléfono ya está registrado en el sistema',
        path: ['mobile'],
      }
    )
    .refine(
      (data) => {
        if (!data.mobile) return true;
        const trimmedMobile = data.mobile.trim();

        try {
          const phoneNumber = parsePhoneNumber(trimmedMobile);
          return phoneNumber.isValid();
        } catch {
          return false;
        }
      },
      {
        message: 'Ingresa un número de teléfono válido',
        path: ['mobile'],
      }
    );

  const form = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(refinedSchema),
    mode: 'onBlur',
  });

  const { handleSubmit, reset } = form;

  const onSubmit = (data: FormValues) => {
    const sanitizedData = {
      ...data,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim().toLowerCase(),
      mobile: data.mobile && data.mobile.trim() !== '' ? data.mobile : null,
      membership_id: '',
    };

    onSave(sanitizedData);

    if (mode === 'create') {
      reset(defaultValues);
    }
  };

  const submitForm = () => {
    handleSubmit(onSubmit)();
  };

  return {
    ...form,
    onSubmit,
    submitForm,
    defaultValues,
  };
}
