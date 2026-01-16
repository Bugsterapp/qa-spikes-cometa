import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from 'next/link';

import { PATH_AUTH } from '../../routes/paths';
import { Events } from '../../constants/events';
import { sendTrackEvent } from '../../utils/events';

import { FormProvider } from '../hook-form';
import { Input } from '@cometa/recreo/v2/components/ui/input';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import { Label } from '@cometa/recreo/v2/components/ui/label';
import { cn } from '@cometa/utils';
import { api } from '../../utils/api';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  hideSuccessState?: boolean;
}

export default function ResetPasswordForm({ onSuccess, hideSuccessState }: ResetPasswordFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    register,
    watch,
    formState: { isSubmitting },
  } = methods;

  const resetPasswordMutation = api.auth.resetPassword.useMutation();

  const isValidEmail = (email: string) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const onSubmit = async (data: { email: string }) => {
    try {
      setErrorMessage('');
      await resetPasswordMutation.mutateAsync({ email: data.email });
      sendTrackEvent(Events.auth_reset_password, {
        email: data.email,
        success: true,
      });
      setIsSuccess(true);
      onSuccess?.();
    } catch (error) {
      sendTrackEvent(Events.auth_reset_password, {
        email: data.email,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      setErrorMessage('Hubo un error al enviar el correo de recuperación. Inténtalo de nuevo.');
    }
  };

  if (isSuccess) {
    if (hideSuccessState) {
      return (
        <div className="space-y-6 font-lota antialiased">
          <Button
            type="button"
            variant="neutral"
            size="lg"
            style={{ fontSize: '16px' }}
            className="w-full h-12 font-lota"
            asChild
          >
            <Link href={PATH_AUTH.login}>Volver al inicio de sesión</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6 font-lota antialiased">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-lota">Correo de recuperación enviado</h2>
          <p className="text-sm text-gray-600 font-lota">
            Si tu correo está registrado, te llegará un mensaje para restablecer tu contraseña. No olvides también
            revisar tu bandeja de spam.
          </p>
        </div>

        <Button
          type="button"
          variant="neutral"
          size="lg"
          style={{ fontSize: '16px' }}
          className="w-full h-12 font-lota"
          asChild
        >
          <Link href={PATH_AUTH.login}>Volver al inicio de sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6 font-lota antialiased">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600 font-lota">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="email"
            style={{
              fontSize: '16px',
              color: watch('email')?.trim() ? '#9197AF' : '#000000',
            }}
            className="font-lota"
          >
            Correo electrónico
          </Label>
          <Input
            id="email"
            {...register('email')}
            autoComplete="email"
            data-testid="reset-email-input"
            placeholder="Ingresa tu correo electrónico"
            type="email"
          />
        </div>

        <Button
          type="submit"
          variant="neutral"
          size="lg"
          disabled={!watch('email')?.trim() || !isValidEmail(watch('email')) || isSubmitting}
          data-testid="reset-password-button"
          style={{ fontSize: '16px' }}
          className={cn(
            'w-full h-12 font-lota',
            (!watch('email')?.trim() || !isValidEmail(watch('email')) || isSubmitting) &&
              'disabled:opacity-100 disabled:bg-[#E9EEF7] disabled:text-[#A2ABB9] disabled:pointer-events-auto disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Enviando...' : 'Restablecer mi contraseña'}
        </Button>

        <div className="text-center">
          <Link
            href={PATH_AUTH.login}
            className="underline transition-colors hover:text-gray-800 font-lota"
            style={{ fontSize: '16px', color: '#697086' }}
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </FormProvider>
  );
}
