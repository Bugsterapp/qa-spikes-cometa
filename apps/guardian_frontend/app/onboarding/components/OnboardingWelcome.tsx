import React from 'react';
import WelcomeGradient from '../assets/welcome-gradient.svg';
import Cometa from '~/public/icons/cometa-isologo.svg';
import { useSession } from 'next-auth/react';
import { Button } from '~/components/ui/Button';
import { Checkbox } from '~/components/Checkbox';
import { UTMLink as Link } from '~/components/UtmNavigation';
import { Controller, useForm } from 'react-hook-form';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSendEvent } from '~/hooks/useSendEvent';
import { api } from '~/utils/api';
import { usePathname } from 'next/navigation';

const OnboardingWelcomeResolver = z.object({
  terms_acceptance: z.boolean().refine((value) => value === true, 'Debes aceptar los términos y condiciones'),
});

type OnboardingWelcomeValues = z.infer<typeof OnboardingWelcomeResolver>;

export default function OnboardingWelcome({ onSubmit }: { onSubmit: (data: OnboardingWelcomeValues) => void }) {
  const { data: session } = useSession();
  const sendEvent = useSendEvent();
  const updateGuardianMutation = api.guardian.update.useMutation();
  const { handleSubmit, control } = useForm<OnboardingWelcomeValues>({
    mode: 'all',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(OnboardingWelcomeResolver),
    defaultValues: { terms_acceptance: false },
  });
  const path = usePathname();

  const submitHandler = async (data: OnboardingWelcomeValues) => {
    if (session && session?.user.id) {
      await updateGuardianMutation.mutateAsync({
        id: session?.user.id,
        data: {
          terms_acceptance: {
            amount: 0,
            signed_site: path,
          },
        },
      });
    }

    onSubmit(data);
  };

  const schools = session?.user.schools;
  return (
    <div className="flex flex-col h-screen">
      <section className="relative">
        <WelcomeGradient />
        <div className="absolute w-16 h-16 p-4 bg-white shadow-[5px_0px_34px_0px_#57577226] -bottom-7 rounded-[1.25rem] left-5">
          <Cometa className="text-black" />
        </div>
      </section>
      <form className="flex flex-col flex-1 px-4 mt-14 pb-9" onSubmit={handleSubmit(submitHandler)}>
        <h1 className="text-[#2B2D30] text-3xl font-light">
          Te damos la <br />
          <strong className="font-semibold">bienvenida a Cometa</strong>
        </h1>
        <h2 className="text-[#4A515B] font-light mt-4 text-lg">La plataforma de pagos escolares de</h2>
        <ul className="mt-3.5 space-y-2.5">
          {schools?.map((school) => (
            <li
              key={school.id}
              className="border border-[#E2E2E2] rounded-lg px-3.5 py-4 font-bold flex gap-2 items-center"
            >
              {school.logo ? (
                <img src={school.logo} className="max-w-[30px] max-h-[30px]" alt={`Logo ${school.name}`} />
              ) : null}{' '}
              {school.name}
            </li>
          ))}
        </ul>
        <Controller
          name="terms_acceptance"
          control={control}
          render={({ field }) => (
            <div className="flex items-start gap-5 max-w-[300px] mt-auto ml-5" id="terms-acceptance">
              <Checkbox
                id="terms-and-conditions"
                className="mt-1.5"
                checked={field.value}
                onCheckedChange={field.onChange}
                onClick={() => sendEvent('Onboarding — tos clicked')}
              />
              <label htmlFor="terms-and-conditions">
                <span className="text-gray-300 select-none">
                  Acepto los{' '}
                  <Link
                    href="/terms"
                    className="text-blue-100 underline"
                    onClick={() => sendEvent('Onboarding — tos link clicked')}
                  >
                    Términos & Condiciones y políticas de privacidad.
                  </Link>
                </span>
              </label>
            </div>
          )}
        />

        <Button theme="recreo" disabled={updateGuardianMutation.isPending} className="w-full mt-9">
          Comenzar
        </Button>
      </form>
    </div>
  );
}
