import * as Yup from 'yup';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

import { PATH_PORTAL, PATH_AUTH } from '../../../routes/paths';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import { FormProvider } from '../../../components/hook-form';
import { Events } from '../../../constants/events';
import { sendTrackEvent } from '../../../utils/events';

import { Input } from '@cometa/recreo/v2/components/ui/input';
import { Button } from '@cometa/recreo/v2/components/ui/button';
import { Checkbox } from '@cometa/recreo/v2/components/ui/checkbox';
import { Label } from '@cometa/recreo/v2/components/ui/label';

import EyeFill from 'dashboard/public/assets/icons/ic_eye_outline-on.svg';
import EyeOffFill from 'dashboard/public/assets/icons/ic_eye_outline-off.svg';
import { cn } from '@cometa/utils';
import ICWarning from '/public/assets/icons/ic_warning.svg';

export default function LoginForm() {
  const _router = useRouter();
  const [isWrongUser, setIsWrongUSer] = useState(false);
  const [noSchoolMembership, setNoSchoolMembership] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
    remember: true,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { isSubmitting },
    register,
    watch,
  } = methods;

  const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isMountedRef = useIsMountedRef();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionError = sessionStorage.getItem('auth_error');

    if (urlParams.get('error') === 'no_school_membership' || sessionError === 'no_school_membership') {
      setNoSchoolMembership(true);
      sessionStorage.removeItem('auth_error');
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const loginUser = async (email, password, remember) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      remember,
    });

    const { status, ok, error } = result;

    if (status === 401) {
      sendTrackEvent(Events.auth_login, {
        email: email,
        success: false,
        error_type: 'invalid_credentials',
      });
      setIsWrongUSer(true);
      setTimeout(() => {
        setIsWrongUSer(false);
      }, 3000);
    }

    if (status === 200) {
      if (ok) {
        sendTrackEvent(Events.auth_login, {
          email: email,
          success: true,
          login_method: 'credentials',
          remember_me: remember,
        });
        _router.push(PATH_PORTAL.root);
      }
      if (error) {
        sendTrackEvent(Events.auth_login, {
          email: email,
          success: false,
          error_type: 'other_error',
          error_message: error.message,
        });
        reset();
        if (isMountedRef.current) {
          setError('afterSubmit', { ...error, message: error.message });
        }
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      await loginUser(data.email, data.password, data.remember);
    } catch (error) {
      sendTrackEvent(Events.auth_login, {
        email: data.email,
        success: false,
        error_type: 'unexpected_error',
        error_message: error.message,
      });
      reset();
      if (isMountedRef.current) {
        setError('afterSubmit', { ...error, message: error.message });
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} autoComplete="on">
      <div className="space-y-6 login-form font-lota antialiased">
        {isWrongUser && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600 font-lota">Correo o contraseña incorrecta.</p>
          </div>
        )}

        {noSchoolMembership && (
          <div className="bg-yellow-50 rounded-lg p-3 flex items-center space-x-3">
            <ICWarning className="w-6 h-6 flex-shrink-0" />
            <p className="text-base text-yellow-800 font-lota">
              Tus permisos fueron desactivados. Si crees que esto es un error, por favor contacta a tu administrador.
            </p>
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
            data-testid="email-input"
            placeholder="Ingresa tu correo electrónico"
            type="email"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            style={{
              fontSize: '16px',
              color: watch('password')?.trim() ? '#9197AF' : '#000000',
            }}
            className="font-lota"
          >
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              data-testid="password-input"
              placeholder="Ingresa tu contraseña"
              isError={isWrongUser}
            />
            {watch('password')?.trim() ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 hover:bg-gray-200 rounded-md transition-colors shrink-0"
              >
                {showPassword ? <EyeFill className="w-6 h-6" /> : <EyeOffFill className="w-6 h-6" />}
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center cursor-pointer font-lota">
            <Checkbox {...register('remember')} defaultChecked data-testid="remember-checkbox" />
            <span className="text-sm text-foreground font-semibold font-lota">
              Mantenerme conectado en este dispositivo
            </span>
          </Label>
        </div>

        <Button
          type="submit"
          variant="neutral"
          size="lg"
          disabled={
            !watch('email')?.trim() || !watch('password')?.trim() || !isValidEmail(watch('email')) || isSubmitting
          }
          data-testid="login-button"
          style={{ fontSize: '16px' }}
          className={cn(
            'w-full h-12 font-lota',
            (!watch('email')?.trim() || !watch('password')?.trim() || !isValidEmail(watch('email')) || isSubmitting) &&
              'disabled:opacity-100 disabled:bg-[#E9EEF7] disabled:text-[#A2ABB9] disabled:pointer-events-auto disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>

        <div className="space-y-4">
          <div className="text-center">
            <Link
              href={PATH_AUTH.resetPassword}
              className="underline transition-colors hover:text-gray-800 font-lota"
              style={{ fontSize: '16px', color: '#697086' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
