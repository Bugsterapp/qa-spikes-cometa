import * as Sentry from '@sentry/nextjs';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { MEMBERSHIPS } from '../../constants/memberships';
import { useWelcomeFlowStore, type TeamMember } from '../../stores/welcomeFlowStore';
import { getInitials } from '../../utils/get-initials';
import { AddUserDrawer } from './AddUserDrawer';
import IcArrowRight from '../../../public/assets/icons/ic_arrow_right_stroke.svg';
import IcClose from '../../../public/assets/icons/ic_close_stroke.svg';
import IcPlusSecondary from '../../../public/assets/icons/ic_plus_secondary_stroke.svg';
import IcPlusAdd from '../../../public/assets/icons/ic_plus_add.svg';
import { useSelectedSchoolId } from '../../guards/AuthGuard';
import { api } from '../../utils/api';
import { Tooltip } from '../atoms/Tooltip';
import { StatusBadge } from '../onboarding/StatusBadge';
import { Button } from '@cometa/recreo/v2';

type TeamSetupStepProps = {
  onNext: () => void;
};

export function TeamSetupStep({ onNext }: Readonly<TeamSetupStepProps>) {
  const store = useWelcomeFlowStore();
  const teamMembers = store((state) => state.teamMembers);
  const setTeamMembers = store((state) => state.setTeamMembers);
  const addTeamMember = store((state) => state.addTeamMember);
  const removeTeamMember = store((state) => state.removeTeamMember);
  const selectedSchoolId = useSelectedSchoolId();
  const { data: session } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  const { data: existingUsers = [] } = api.schools.getUsers.useQuery(
    {
      schoolId: selectedSchoolId as string,
      query: {},
    },
    {
      enabled: !!selectedSchoolId,
    }
  );

  const filteredExistingUsers = session?.user?.email
    ? existingUsers.filter((user) => user.email.toLowerCase().trim() !== session.user.email?.toLowerCase().trim())
    : existingUsers;

  const normalizedExistingUsers = useMemo(
    () => ({
      emails: new Set(existingUsers.map((user) => user.email.toLowerCase().trim())),
      phones: new Set(existingUsers.map((user) => user.mobile?.trim()).filter(Boolean)),
    }),
    [existingUsers]
  );

  useEffect(() => {
    if (teamMembers.length === 0) return;

    const tempMembers = teamMembers.map((member) => ({
      ...member,
      normalizedEmail: member.email.toLowerCase().trim(),
      normalizedMobile: member.mobile?.trim() || null,
    }));

    const filteredMembers = tempMembers.filter((member) => {
      const emailExists = normalizedExistingUsers.emails.has(member.normalizedEmail);
      const mobileExists = member.normalizedMobile
        ? normalizedExistingUsers.phones.has(member.normalizedMobile)
        : false;
      return !emailExists && !mobileExists;
    });

    if (filteredMembers.length < teamMembers.length) {
      setTeamMembers(filteredMembers);
    }
  }, [normalizedExistingUsers, teamMembers, setTeamMembers]);

  function handleSaveUser(user: {
    first_name: string;
    last_name: string;
    email: string;
    mobile?: string | null;
    membership: string;
  }) {
    setIsSavingUser(true);

    const newUser: TeamMember = {
      id: crypto.randomUUID(),
      ...user,
    };
    addTeamMember(newUser);
    setIsDrawerOpen(false);
    setIsSavingUser(false);
  }

  return (
    <div className="w-full h-full relative pt-[73px]">
      <div className="absolute left-1/2 top-[129px] translate-x-[-50%] w-[600px] pb-[65px]">
        <div className="flex flex-col gap-8 items-end">
          <div className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-[24px] leading-[32px] font-semibold text-[#22283a] font-lota">
                  Configura tu colegio más rápido
                </h1>
                <div className="flex flex-col gap-6">
                  <p className="text-[16px] leading-[24px] text-[#697086] font-lota">
                    Para completar la configuración, necesitaremos datos bancarios, fiscales y legales. Si no los tienes
                    a la mano, puedes invitar a colaboradores clave de tu colegio, como el{' '}
                    <span className="font-semibold text-[#22283a]">Contador</span>,{' '}
                    <span className="font-semibold text-[#22283a]">Tesorero</span> o{' '}
                    <span className="font-semibold text-[#22283a]">Abogado</span>, para que los ingresen por ti.
                  </p>
                </div>
              </div>
              <div className="w-full h-0 relative">
                <div className="absolute bottom-0 left-0 right-0 top-[-1px] h-px bg-[#edf2fc]" />
              </div>
            </div>

            {teamMembers.length === 0 && filteredExistingUsers.length === 0 ? (
              <div className="bg-[#f8f9fb] flex flex-col gap-6 items-center justify-center p-[24px] rounded-2xl w-full">
                <div className="flex flex-col gap-2 items-center justify-start w-full">
                  <div className="shrink-0 size-[120px] relative">
                    <Image src="/assets/team-illustration.png" alt="Team illustration" fill className="object-cover" />
                  </div>

                  <div className="flex flex-col gap-2 items-center justify-start w-full">
                    <div className="font-lota font-normal leading-[20px] text-[#444c60] text-[14px] text-center w-[422px]">
                      <p className="block mb-0">¿A quién deberías invitar primero?</p>
                      <p className="block">
                        Te sugerimos empezar por el Contador, Tesorero o Abogado para agilizar la configuración inicial.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row items-start justify-start">
                  <Button variant="light" size="sm" onClick={() => setIsDrawerOpen(true)}>
                    <IcPlusAdd className="w-4 h-4" />
                    Agregar colaborador clave
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <Sentry.ErrorBoundary>
                  <div className="flex flex-col gap-4 w-full">
                    {filteredExistingUsers.map((user) => (
                      <UserCard key={user.id} member={user} />
                    ))}
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    {teamMembers.map((member) => (
                      <UserCard key={member.id} member={member} onRemove={removeTeamMember} />
                    ))}
                  </div>
                </Sentry.ErrorBoundary>

                <Button variant="light" size="sm" onClick={() => setIsDrawerOpen(true)}>
                  <IcPlusSecondary className="w-4 h-4" />
                  Agregar colaborador clave
                </Button>
              </div>
            )}
          </div>

          <Button variant="neutral" size="lg" className="px-6" onClick={onNext}>
            {teamMembers.length === 0 && filteredExistingUsers.length === 0 ? 'Omitir por ahora' : 'Finalizar'}
            {(teamMembers.length > 0 || filteredExistingUsers.length > 0) && <IcArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <Sentry.ErrorBoundary>
        <AddUserDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleSaveUser}
          isLoading={isSavingUser}
        />
      </Sentry.ErrorBoundary>
    </div>
  );
}

function UserCard({ member, onRemove }: Readonly<{ member: TeamMember; onRemove?: (id: string) => void }>) {
  const initials = getInitials(member.first_name, member.last_name);
  const fullName = `${member.first_name} ${member.last_name}`;
  const roleDisplay = MEMBERSHIPS[member.membership as keyof typeof MEMBERSHIPS] || member.membership;

  return (
    <div className="rounded-xl p-4 w-full border border-[#d0d8e9] bg-[#f8f9fb]">
      <Tooltip
        message={onRemove ? undefined : 'Este usuario ya ha sido creado en cometa'}
        className="flex items-center gap-3 w-full"
      >
        <div className="bg-[#f3ebff] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
          <span className="text-[#873aff] font-semibold text-sm font-lota leading-5">{initials}</span>
        </div>
        <div className="flex flex-col gap-1 grow min-h-0 min-w-0">
          <div className="self-stretch flex items-center gap-2 leading-none">
            <div
              className="min-h-0 font-semibold font-lota tracking-[-0.4px]
              overflow-ellipsis overflow-hidden whitespace-nowrap text-base"
            >
              {fullName}
            </div>
            <div className="bg-[#f3ebff] px-2 py-0.5 rounded-md shrink-0">
              <span className="text-[#873aff] font-semibold text-xs font-lota">{roleDisplay}</span>
            </div>
          </div>
          <div className="font-lota font-normal text-sm leading-5 text-[#697086] overflow-ellipsis overflow-hidden whitespace-nowrap w-full">
            {member.email}
          </div>
        </div>
        {onRemove ? (
          <button
            onClick={() => onRemove(member.id)}
            className="w-9 h-9 rounded-full transition-colors flex items-center justify-center flex-shrink-0 hover:bg-white/50"
          >
            <IcClose className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
            <StatusBadge variant="completed" />
          </div>
        )}
      </Tooltip>
    </div>
  );
}
