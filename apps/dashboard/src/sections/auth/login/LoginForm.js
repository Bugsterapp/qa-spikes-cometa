import * as Yup from 'yup';
import { useState } from 'react';
import { useRouter } from 'next/router';

// next
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { signIn } from 'next-auth/react';
import TextField from '/src/components/CustomFormTexField';
import CustomInput from '/src/components/CustomInput';
import { cn } from '../../../utils/cn';
// routes
import { PATH_PORTAL } from '../../../routes/paths';
// hooks
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import { FormProvider, RHFCheckbox } from '../../../components/hook-form';
import Fade from '@mui/material/Fade';
import EyeFill from 'dashboard/public/assets/icons/ic_eye-fill.svg';
import EyeOffFill from 'dashboard/public/assets/icons/ic_eye-off-fill.svg';
import Button from '/src/components/organisms/dashboard/Button';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const _router = useRouter();
  const [isWrongUser, setIsWrongUSer] = useState(false);

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
    formState: { errors, isSubmitting },
    register,
    watch,
  } = methods;

  const isMountedRef = useIsMountedRef();

  const [showPassword, setShowPassword] = useState(false);

  const loginUser = async (email, password) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    const { status, ok, error } = result;

    if (status === 401) {
      setIsWrongUSer(true);
      setTimeout(() => {
        setIsWrongUSer(false);
      }, 3000);
    }

    if (status === 200) {
      if (ok) _router.push(PATH_PORTAL.root);
      if (error) {
        reset();
        if (isMountedRef.current) {
          setError('afterSubmit', { ...error, message: error.message });
        }
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      await loginUser(data.email, data.password);
    } catch (error) {
      reset();
      if (isMountedRef.current) {
        setError('afterSubmit', { ...error, message: error.message });
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-8">
        <TextField label="Correo electrónico" error={errors.email?.message} value={watch('email')}>
          <CustomInput {...register('email')} autoComplete="email" data-testid="email-input" />
        </TextField>
        <TextField label="Contraseña" error={errors.password?.message} value={watch('password')}>
          <CustomInput
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            data-testid="password-input"
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <EyeFill /> : <EyeOffFill />}
                </IconButton>
              </InputAdornment>
            }
          />
        </TextField>
      </div>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <RHFCheckbox name="remember" label="Recuerdame" data-testid="remember-checkbox" />
        {/* TO DO <NextLink href={PATH_AUTH.resetPassword} passHref>
          <Link variant="subtitle2">Olvidaste tu contraseña?</Link>
        </NextLink> */}
        <Fade in={isWrongUser} timeout={2000}>
          <Alert severity="error">Verifica tu usuario y/o contraseña</Alert>
        </Fade>
      </Stack>

      <Button
        className={cn('w-full', {
          'opacity-50': isSubmitting,
        })}
        type="submit"
        data-testid="login-button"
      >
        Iniciar sesion
      </Button>
    </FormProvider>
  );
}
