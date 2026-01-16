import { useState, ReactNode } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { Button, Dialog, Drawer } from '@cometa/recreo';
import { MethodEnum, SlimGuardian } from '@cometa/trpc';
import { cn } from '@cometa/utils';
import { api } from '~/utils/api';

export function GuardianExists({
  open,
  onClose,
  guardian,
}: {
  open: boolean;
  onClose: () => void;
  guardian?: SlimGuardian;
}) {
  const [method, setMethod] = useState<MethodEnum>();

  const [sent, setSent] = useState(false);
  const sendCode = api.guardian.sendCode.useMutation({
    onSuccess: () => setSent(true),
  });

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const Component = isDesktop ? Dialog : Drawer;

  if (!guardian) {
    return null;
  }

  const phone = guardian.phone as string;
  const email = guardian.email as string;

  const options = [
    {
      name: MethodEnum.WHATSAPP,
      value: phone,
      icon: <PhoneIcon className="w-4 mr-2 text-[#98A2B3]" />,
      label: maskPhone(phone),
    },
    {
      name: MethodEnum.MAIL,
      value: email,
      icon: <MailIcon className="w-4 mr-2 text-[#98A2B3]" />,
      label: maskEmail(email),
    },
  ];

  const isEmail = method === 'MAIL';
  const methodText = isEmail
    ? 'Hemos enviado tu link de ingreso al siguiente correo:'
    : 'Hemos enviado tu link de ingreso al siguiente número de WhatsApp:';
  const reminderText = isEmail
    ? 'Recuerda que el link de ingreso expira en 24 horas. Si no encuentras el correo, puede encontrarse en tu bandeja de spam.'
    : 'Recuerda que el link de ingreso expira en 24 horas. No olvides guardar nuestro número de WhatsApp para futuras consultas.';

  if (sent) {
    return (
      <Component.Root open={open}>
        <Component.Title>{methodText}</Component.Title>

        <div className="my-3 text-start">
          <div className="flex items-center p-3 bg-white rounded-lg border-2 border-[#e4ebf6]">
            <label className="flex items-center w-full">
              {isEmail ? (
                <>
                  <MailIcon className="w-4 mr-2 text-[#98A2B3]" />
                  <span className="flex-grow">{maskEmail(email)}</span>
                </>
              ) : (
                <>
                  <PhoneIcon className="w-4 mr-2 text-[#98A2B3]" />
                  <span className="flex-grow">{maskPhone(phone)}</span>
                </>
              )}
            </label>
          </div>
          <p className="font-normal text-sm text-[#637381] my-5 text-center">{reminderText}</p>
          <Button size="medium" color="black" variant="solid" className="w-full" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </Component.Root>
    );
  }

  return (
    <Component.Root open={open}>
      <Component.Title>¡Ya existe alguien registrado con esos datos!</Component.Title>

      <Component.Description>
        Si ya tienes una cuenta con Cometa, inicia sesión en tu cuenta para crear un nuevo proceso de admisión.
      </Component.Description>

      <div className="my-3">
        <p className="font-normal text-sm text-[#637381] mb-2">
          Selecciona en dónde deseas recibir tu link de ingreso:
        </p>
        <div className="mt-6 mb-8 flex flex-col gap-3">
          {options.map((option) => (
            <RadioButton
              key={option.name}
              name={option.name}
              value={option.name}
              checked={method === option.name}
              onChange={() => setMethod(option.name)}
              icon={option.icon}
              label={option.label}
            />
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Button variant="text" size="medium" color="black" className="order-2 md:order-1 w-full" onClick={onClose}>
            Volver
          </Button>
          <Button
            size="medium"
            color="black"
            variant="solid"
            className="order-1 md:order-2 w-full"
            disabled={!method}
            onClick={() => {
              const option = options.find((option) => option.name === method);
              sendCode.mutate({ method: method as MethodEnum, value: option?.value as string });
            }}
          >
            Recibir link de ingreso
          </Button>
        </div>
      </div>
    </Component.Root>
  );
}

type RadioButtonProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  label: string;
};
export function RadioButton({ name, value, checked, onChange, icon, label }: RadioButtonProps) {
  return (
    <div
      className={cn('flex items-center p-3 bg-white rounded-lg border-2 border-[#e4ebf6]', {
        'border-purple-600': checked,
      })}
    >
      <input
        type="radio"
        id={name}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <label htmlFor={name} className="flex items-center w-full cursor-pointer">
        {icon}
        <span className="flex-grow">{label}</span>
        <div
          className={cn('w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#212b36]', {
            'border-purple-600': checked,
          })}
        >
          {checked ? <div className="w-3 h-3 rounded-full bg-purple-600" /> : null}
        </div>
      </label>
    </div>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18" className={className}>
      <path
        fill="currentColor"
        d="M14.25.759766H3.75c-.9942.001191-1.94733.396664-2.65034 1.099664C.396661 2.56243.00119089 3.51557 0 4.50977v9.00003c.00119089.9942.396661 1.9473 1.09966 2.6503.70301.703 1.65614 1.0985 2.65034 1.0997h10.5c.9942-.0012 1.9473-.3967 2.6503-1.0997.703-.703 1.0985-1.6561 1.0997-2.6503V4.50977c-.0012-.9942-.3967-1.94734-1.0997-2.65034-.703-.703-1.6561-1.098473-2.6503-1.099664ZM3.75 2.25977h10.5c.4491.00088.8876.13613 1.2592.38835.3716.25222.6592.60986.8258 1.0269l-5.7435 5.74425c-.4227.42098-.99494.65733-1.5915.65733-.59656 0-1.16882-.23635-1.5915-.65733L1.665 3.67502c.16661-.41704.45421-.77468.82579-1.0269.37157-.25222.81012-.38747 1.25921-.38835Zm10.5 13.50003H3.75c-.59674 0-1.16903-.2371-1.59099-.659-.42196-.422-.65901-.9943-.65901-1.591V5.63477l4.848 4.84503c.70397.7022 1.65769 1.0965 2.652 1.0965s1.948-.3943 2.652-1.0965L16.5 5.63477v7.87503c0 .5967-.2371 1.169-.659 1.591-.422.4219-.9943.659-1.591.659Z"
      />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 19" className={className}>
      <g fill="currentColor" clipPath="url(#a)">
        <path d="M11.25.00976562h-4.5C5.7558.0109565 4.80267.406427 4.09966 1.10943c-.703.703-1.09847 1.65614-1.09966 2.65034V14.2598c.00119.9942.39666 1.9473 1.09966 2.6503.70301.703 1.65614 1.0985 2.65034 1.0997h4.5c.9942-.0012 1.9473-.3967 2.6503-1.0997.703-.703 1.0985-1.6561 1.0997-2.6503V3.75977c-.0012-.9942-.3967-1.94734-1.0997-2.65034C13.1973.406427 12.2442.0109565 11.25.00976563v-1e-8ZM6.75 1.50977h4.5c.5967 0 1.169.23705 1.591.65901.4219.42195.659.99425.659 1.59099v8.25003h-9V3.75977c0-.59674.23705-1.16904.65901-1.59099.42196-.42196.99425-.65901 1.59099-.65901Zm4.5 15.00003h-4.5c-.59674 0-1.16903-.2371-1.59099-.659-.42196-.422-.65901-.9943-.65901-1.591v-.75h9v.75c0 .5967-.2371 1.169-.659 1.591-.422.4219-.9943.659-1.591.659Z" />
        <path d="M9 15.7598c.41422 0 .75001-.3358.75001-.75s-.33579-.75-.75001-.75c-.41421 0-.75.3358-.75.75s.33579.75.75.75Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 .00976562h18v18H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

function maskPhone(phone: string) {
  return `${phone.substring(0, 5)}*******`;
}

function maskEmail(email: string) {
  const [userName, domainName] = email.split('@');
  return `${userName.substring(0, 3)}***@${domainName}`;
}
