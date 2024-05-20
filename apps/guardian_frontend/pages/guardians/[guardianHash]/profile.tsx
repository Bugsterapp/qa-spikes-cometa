import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '~/components/organisms/guardians/Navbar';
import { WHAT_PROFILE } from '~/utils/linksWhatsapp';
import type { Session } from 'next-auth';
import CustomInput from '~/components/atoms/guardians/CustomInput';
import FormField from '~/components/FormField';
import { cn } from '~/lib/cn';
import * as Select from '@radix-ui/react-select';
import ExpandMore from '/public/icons/ic_expand_more.svg';
import { GetServerSideProps } from 'next';
import Link from 'next/link';

interface ProfileProps {
  session: Session;
}
function Profile({ session }: ProfileProps) {
  const _router = useRouter();
  const { guardianHash } = _router.query;
  const Values = {
    email: session.user.email || '',
    phone: session.user.phone || '',
    landline: session.user.landline || '',
    gender: session.user.gender || '',
  };

  interface TextFieldProps {
    label: string;
    value?: string;
    name: string;
    disabled?: boolean;
  }

  const TextField = ({ label, value, name, disabled }: TextFieldProps) => (
    <FormField
      label={label}
      disabled={disabled}
      className="mb-3"
      labelClassName={cn({ 'translate-x-2 -translate-y-4 scale-[0.625]': value })}
    >
      <CustomInput name={name} className="px-5 pt-[25px] pb-[18px] rounded-[14px]" disabled={disabled} value={value} />
    </FormField>
  );
  const gender = { M: 'Masculino', F: 'Femenino' };
  return (
    <>
      <Head>
        <title>Mi Perfil</title>
      </Head>
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>

      <div className="max-w-[600px] content-center px-7 pt-[26px] mx-auto">
        <div className="pl-3.5">
          <h5 className="mb-5 text-xl font-bold text-gray-300">Mi Perfil</h5>
          <p className="text-sm text-gray-300">Nombres y apellidos:</p>
          <p className="text-sm font-bold text-gray-300">
            {session.user.first_name} {session.user.last_name}
          </p>
        </div>

        <form className="flex flex-col">
          <div className="flex-auto mb-16">
            <div className="mt-6 mb-4">
              <TextField label="Email" value={Values.email} disabled name="email" />
              <TextField label="Celular" value={Values.phone} disabled name="phone" />
              <TextField label="Teléfono" value={Values.landline} disabled name="landline" />
              <FormField
                label="Género"
                className="mb-3"
                disabled
                labelClassName={cn({ 'translate-x-2 -translate-y-4 scale-[0.625]': Values.gender })}
              >
                <Select.Root value={Values.gender} disabled>
                  <Select.Trigger className="px-5 pt-[25px] pb-[18px] rounded-[14px] w-full flex flex-row justify-between disabled:text-[#909095] disabled:bg-[#EBEBEB]">
                    <Select.Value aria-label={Values.gender}>
                      {gender[Values.gender as keyof typeof gender]}
                    </Select.Value>
                    <ExpandMore fill="currentColor" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="w-full p-2 bg-white">
                      <Select.Viewport className="w-full">
                        {Object.entries(gender).map(([key, value]) => (
                          <Select.Item value={key} key={key}>
                            <Select.ItemText>{value}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </FormField>
            </div>
            <div className="px-5 pt-4">
              <p className="text-gray-300">
                Para solicitar el cambio de alguno de estos datos contáctanos vía
                <a className="ml-1 text-blue-100 underline" rel="noreferrer" target="_blank" href={WHAT_PROFILE}>
                  WhatsApp.
                </a>
              </p>
            </div>
          </div>
          <Link
            className="font-bold text-white bg-blue-100 rounded-full hover:bg-[#3340b2] active:bg-blue-100 px-4 w-full min-w-[48px] h-14 shadow-xl mb-12 flex items-center justify-center"
            href={`/guardians/${guardianHash}`}
          >
            Volver al home
          </Link>
        </form>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    session: await getSession(context),
  },
});
Profile.auth = true;
export default Profile;
