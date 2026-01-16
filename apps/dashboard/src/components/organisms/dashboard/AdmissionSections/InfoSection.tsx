import * as InfoBox from '/src/components/ui/InfoBox';
import * as List from '/src/components/ui/List';
import LinkToIcon from '/public/assets/icons/ic_link_to.svg';
import { cn } from '@cometa/utils';
import { formatDateWithSpanishFormat } from '/src/utils/general';
import {
  AdmissionStepStatus,
  ApplicationFormEntity,
  StatusEnum,
  StudentLeadEntity,
} from '@cometa/trpc/src/admissions/types';
import { Tooltip } from '/src/components/atoms/Tooltip';
import { api } from '/src/utils/api';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BasicInfo,
  basicInfoSchema,
  FormBasicInfoValues,
  BasicEditableSection,
  ContactInfo,
  contactInfoSchema,
  FormContactInfoValues,
  ContactEditableSection,
  AdmissionInfoType,
  admissionInfoSchema,
  FormAdmissionInfoValues,
  AdmissionEditableSection,
} from '../../../admissions/detail';
import { format, parse } from 'date-fns';
import { useSession } from 'next-auth/react';

export function InfoSection({ studentLead }: Readonly<{ studentLead?: StudentLeadEntity }>) {
  const { data: session } = useSession();
  const userId = session?.user.id as string;
  const { data: applicationForm } = api.admissions.getApplicationForm.useQuery(
    { studentLeadId: studentLead?.id || '' },
    { enabled: !!studentLead?.id }
  );

  return (
    <>
      <DroppedOutBanner studentLead={studentLead} />

      <div className="grid grid-cols-9 gap-6 bg-[#FAFBFB]">
        <div className="flex flex-col col-span-6 gap-6 mb-6">
          <BasicSection userId={userId} studentLead={studentLead} applicationForm={applicationForm} />
          <ContactSection userId={userId} studentLead={studentLead} applicationForm={applicationForm} />
          <AdmissionSection studentLead={studentLead} />
          <AssociatedTutors studentLead={studentLead} />
        </div>

        <div className="flex flex-col col-span-3 gap-6">
          <AdmissionCheckList studentLead={studentLead} />
          <AdmissionInfo studentLead={studentLead} />
        </div>
      </div>
    </>
  );
}

function BasicSection({
  userId,
  studentLead,
  applicationForm,
}: Readonly<{
  userId: string;
  studentLead?: Readonly<StudentLeadEntity>;
  applicationForm?: Readonly<ApplicationFormEntity>;
}>) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const genders = useMemo(
    () => ({
      male: 'Masculino',
      female: 'Femenino',
    }),
    []
  );

  const { data: country } = api.location.getCountry.useQuery(
    { countryId: applicationForm?.nationality || '' },
    { enabled: !!applicationForm?.nationality }
  );

  const memoizedCountry = useMemo(() => country, [country]);

  const { data: state } = api.location.getState.useQuery(
    { stateId: applicationForm?.birthplace || '' },
    { enabled: !!applicationForm?.birthplace }
  );

  const memoizedState = useMemo(() => state, [state]);

  const birthplace = useMemo(
    () => (applicationForm?.is_outside_mx ? 'Fuera de México' : memoizedState?.name || ''),
    [applicationForm?.is_outside_mx, memoizedState]
  );

  const basicInfo: BasicInfo = useMemo(
    () => ({
      first_name: studentLead?.first_name || '',
      last_name: studentLead?.last_name || '',
      birthdate: formatDateWithSpanishFormat(studentLead?.birthdate as string) || '',
      gender: studentLead?.gender ? genders[studentLead.gender] : '',
      curp: applicationForm?.curp || '',
      nationality: memoizedCountry?.name || '',
      birthplace: birthplace || '',
      is_outside_mx: applicationForm?.is_outside_mx || false,
    }),
    [studentLead, genders, memoizedCountry, birthplace]
  );

  const defaultValues = {
    ...basicInfo,
    gender: studentLead?.gender || '',
    birthdate: studentLead?.birthdate
      ? format(parse(studentLead.birthdate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
      : '',
    nationality: applicationForm?.nationality || '',
    birthplace: applicationForm?.birthplace || '',
  };

  const form = useForm<FormBasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues,
    mode: 'all',
    reValidateMode: 'onSubmit',
  });

  const guardian = studentLead?.guardian_leads?.[0] || {};

  const { reset } = form;

  useEffect(() => {
    if (studentLead) {
      reset(defaultValues);
    }
  }, [basicInfo]);

  return (
    <BasicEditableSection
      userId={userId}
      applicationForm={applicationForm}
      studentLeadId={studentLead?.id as string}
      schoolId={studentLead?.school_id as string}
      guardianId={guardian?.external_id as string}
      basicInfo={basicInfo}
      form={form}
      defaultValues={defaultValues}
      isEditing={isEditing}
      isLoading={isLoading}
      setIsEditing={setIsEditing}
      setIsLoading={setIsLoading}
    />
  );
}

function ContactSection({
  userId,
  studentLead,
  applicationForm,
}: Readonly<{
  userId: string;
  studentLead?: StudentLeadEntity;
  applicationForm?: ApplicationFormEntity;
}>) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const contactInfo: ContactInfo = useMemo(
    () => ({
      homephone: applicationForm?.homephone || '',
      address: applicationForm?.address || '',
      interior_number: applicationForm?.interior_number || '',
      neighborhood: applicationForm?.neighborhood || '',
      municipality: applicationForm?.municipality || '',
      zipcode: applicationForm?.zipcode || '',
    }),
    [applicationForm]
  );

  const guardian = studentLead?.guardian_leads?.[0] || {};

  const form = useForm<FormContactInfoValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: { ...contactInfo },
  });

  const { reset } = form;

  useEffect(() => {
    if (applicationForm) {
      reset({ ...contactInfo });
    }
  }, [contactInfo]);

  return (
    <ContactEditableSection
      userId={userId}
      applicationForm={applicationForm}
      studentLeadId={studentLead?.id as string}
      schoolId={studentLead?.school_id as string}
      guardianId={guardian?.external_id as string}
      contactInfo={contactInfo}
      form={form}
      defaultValues={{ ...contactInfo }}
      isEditing={isEditing}
      isLoading={isLoading}
      setIsEditing={setIsEditing}
      setIsLoading={setIsLoading}
    />
  );
}

function AdmissionSection({ studentLead }: { studentLead?: StudentLeadEntity }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const admissionInfo: AdmissionInfoType = useMemo(
    () => ({
      section_id: studentLead?.section_name || '',
      school_cycle_id: studentLead?.school_cycle_name || '',
      origin_school: studentLead?.origin_school || '',
      comment: studentLead?.comment || '',
    }),
    [studentLead]
  );

  const form = useForm<FormAdmissionInfoValues>({
    resolver: zodResolver(admissionInfoSchema),
    defaultValues: {
      ...admissionInfo,
      section_id: studentLead?.section_id || '',
      school_cycle_id: studentLead?.school_cycle_id || '',
    },
  });

  const { reset } = form;

  useEffect(() => {
    reset({
      ...admissionInfo,
      section_id: studentLead?.section_id || '',
      school_cycle_id: studentLead?.school_cycle_id || '',
    });
  }, [admissionInfo]);

  return (
    <AdmissionEditableSection
      studentLeadId={studentLead?.id as string}
      schoolId={studentLead?.school_id as string}
      admissionInfo={admissionInfo}
      form={form}
      defaultValues={{
        ...admissionInfo,
        section_id: studentLead?.section_id || '',
        school_cycle_id: studentLead?.school_cycle_id || '',
      }}
      isEditing={isEditing}
      isLoading={isLoading}
      setIsEditing={setIsEditing}
      setIsLoading={setIsLoading}
    />
  );
}

export function Admission({ studentLead }: { studentLead?: StudentLeadEntity }) {
  return (
    <InfoBox.Root>
      <InfoBox.Header title="Datos de admisión" />
      <InfoBox.Content>
        <List.List>
          <List.Item className="flex items-center">
            <span className="w-[20%] text-xs leading-[18px] text-[#6E7480]">Grado de postulación:</span>
            <span className="text-base leading-6 text-[#1C1C1D]">{studentLead?.section_name}</span>
          </List.Item>
          <List.Item className="flex items-center">
            <span className="w-[20%] text-xs leading-[18px] text-[#6E7480]">Ciclo de ingreso:</span>
            <span className="text-base leading-6 text-[#1C1C1D]">{studentLead?.school_cycle_name}</span>
          </List.Item>
          <List.Item className="flex items-center">
            <span className="w-[20%] text-xs leading-[18px] text-[#6E7480]">Escuela previa:</span>
            <span
              className={cn('text-base leading-6 text-[#1C1C1D]', {
                'text-sm text-[#686F87] italic': !studentLead?.origin_school,
              })}
            >
              {studentLead?.origin_school ?? 'No especificado'}
            </span>
          </List.Item>
          <List.Item className="flex items-center">
            <span className="w-[20%] text-xs leading-[18px] text-[#6E7480]">Comentarios:</span>
            <span className="text-base leading-6 text-[#1C1C1D]">{studentLead?.comment}</span>
          </List.Item>
        </List.List>
      </InfoBox.Content>
    </InfoBox.Root>
  );
}

function AssociatedTutors({ studentLead }: { studentLead?: StudentLeadEntity }) {
  const guardianLead = studentLead?.guardian_leads?.[0];

  return (
    <InfoBox.Root>
      <InfoBox.Header title="Tutores asociados" />
      <InfoBox.Content>
        <div className="rounded-lg border p-4 gap-4 bg-[#FBFCFD] border-[#E4EBF6] flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <span className="text-base leading-6">
              {guardianLead?.first_name} {guardianLead?.last_name}
            </span>
            <span className="text-sm leading-5 text-[#686F87] flex gap-2">
              {guardianLead?.relationship && (
                <span className="pr-2 border-r border-gray-300">{guardianLead?.relationship}</span>
              )}
              <span className="pr-2 border-r border-gray-300">{guardianLead?.email}</span>
              <span>{guardianLead?.phone}</span>
            </span>
          </div>

          {guardianLead ? (
            <Tooltip message="Ver detalle del tutor" disableClick={false}>
              <a
                href={`/guardian/${guardianLead?.external_id}`}
                className="flex flex-row items-center gap-2 p-2 text-sm rounded cursor-pointer hover:bg-info/8"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkToIcon />
              </a>
            </Tooltip>
          ) : null}
        </div>
      </InfoBox.Content>
    </InfoBox.Root>
  );
}

export function AdmissionCheckList({ studentLead }: { studentLead?: StudentLeadEntity }) {
  const utils = api.useUtils();

  const upsertAdmissionStep = api.admissions.upsertAdmissionStep.useMutation({
    onSuccess: () => utils.admissions.getAdmissionDetail.invalidate(),
  });

  function handleChangeStep(schoolStepId: string, studentLeadId: string, isChecked: boolean) {
    const status = isChecked ? AdmissionStepStatus.Completed : AdmissionStepStatus.ToDo;
    upsertAdmissionStep.mutate(
      { studentLeadId, schoolStepId, status },
      {
        onSuccess: () => utils.admissions.getAdmissionDetail.invalidate(),
      }
    );
  }

  return (
    <InfoBox.Root>
      <InfoBox.Header title="Checklist de admisión" />
      <InfoBox.Content>
        <List.List>
          {studentLead?.admission_steps?.map((admissionStep) => {
            const schoolStepId = admissionStep?.school_step?.id as string;
            const studentLeadId = studentLead.id as string;
            const isVisible = admissionStep?.enabled_rules?.school ?? false;
            const isCompleted = admissionStep?.status === AdmissionStepStatus.Completed;

            return (
              <List.Item key={schoolStepId} className="flex items-center gap-2">
                {isCompleted ? <CompletedIcon /> : <PendingIcon />}
                <label htmlFor={schoolStepId} className="text-base">
                  {admissionStep?.school_step?.name}
                </label>
                <ActionButton
                  isVisible={isVisible}
                  isCompleted={isCompleted}
                  onClick={() => handleChangeStep(schoolStepId, studentLeadId, !isCompleted)}
                />
              </List.Item>
            );
          })}
        </List.List>
      </InfoBox.Content>
    </InfoBox.Root>
  );
}

function PendingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22.2C17.6333 22.2 22.2 17.6333 22.2 12C22.2 6.3667 17.6333 1.8 12 1.8C6.3667 1.8 1.8 6.3667 1.8 12C1.8 17.6333 6.3667 22.2 12 22.2ZM12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="#E4EBF6"
      />
    </svg>
  );
}

function CompletedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22.2C17.6333 22.2 22.2 17.6333 22.2 12C22.2 6.3667 17.6333 1.8 12 1.8C6.3667 1.8 1.8 6.3667 1.8 12C1.8 17.6333 6.3667 22.2 12 22.2ZM12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
        fill="#28C441"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.643 8.60924C17.045 8.96756 17.0804 9.5839 16.7221 9.98588L11.1021 16.2907L7.7664 13.2737C7.36702 12.9125 7.3361 12.2959 7.69732 11.8966C8.05854 11.4972 8.67512 11.4663 9.07449 11.8275L10.9534 13.5269L15.2664 8.6883C15.6247 8.28632 16.2411 8.25092 16.643 8.60924Z"
        fill="#28C441"
      />
    </svg>
  );
}

function ActionButton({
  isVisible,
  isCompleted,
  onClick,
}: {
  isVisible: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) {
  if (!isVisible) return null;

  const tooltipMessage = isCompleted ? 'Volver a marcar como pendiente' : 'Marcar como completado';
  return (
    <Tooltip message={tooltipMessage}>
      <div onClick={onClick} className="hover:cursor-pointer">
        {isCompleted ? <PendingButton /> : <CompleteButton />}
      </div>
    </Tooltip>
  );
}

function CompleteButton() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#F3F6FB" />
      <g clip-path="url(#clip0_3347_48469)">
        <path
          d="M22.0194 11.5857L13.9583 19.6462C13.9041 19.7006 13.8397 19.7438 13.7688 19.7733C13.6978 19.8027 13.6218 19.8179 13.545 19.8179C13.4682 19.8179 13.3921 19.8027 13.3212 19.7733C13.2503 19.7438 13.1859 19.7006 13.1317 19.6462L10.0144 16.526C9.96017 16.4716 9.89576 16.4284 9.82484 16.3989C9.75391 16.3695 9.67787 16.3543 9.60107 16.3543C9.52428 16.3543 9.44823 16.3695 9.37731 16.3989C9.30639 16.4284 9.24198 16.4716 9.18778 16.526V16.526C9.13337 16.5802 9.0902 16.6446 9.06074 16.7155C9.03128 16.7864 9.01611 16.8625 9.01611 16.9393C9.01611 17.0161 9.03128 17.0921 9.06074 17.163C9.0902 17.234 9.13337 17.2984 9.18778 17.3526L12.3063 20.4705C12.6353 20.7988 13.0811 20.9833 13.5459 20.9833C14.0107 20.9833 14.4565 20.7988 14.7854 20.4705L22.8459 12.4117C22.9003 12.3575 22.9434 12.2932 22.9728 12.2223C23.0022 12.1514 23.0173 12.0755 23.0173 11.9987C23.0173 11.922 23.0022 11.846 22.9728 11.7752C22.9434 11.7043 22.9003 11.6399 22.8459 11.5857C22.7918 11.5313 22.7273 11.4881 22.6564 11.4587C22.5855 11.4292 22.5095 11.4141 22.4327 11.4141C22.3559 11.4141 22.2798 11.4292 22.2089 11.4587C22.138 11.4881 22.0736 11.5313 22.0194 11.5857Z"
          fill="#1C1C1D"
        />
      </g>
      <defs>
        <clipPath id="clip0_3347_48469">
          <rect width="14" height="14" fill="white" transform="translate(9 9)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function PendingButton() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" transform="matrix(-1 0 0 1 32 0)" fill="#F3F6FB" />
      <g clip-path="url(#clip0_3347_48522)">
        <path
          d="M10.1888 16.5104C10.3013 17.8403 10.8651 19.0918 11.7866 20.0572C12.7081 21.0226 13.9321 21.644 15.2553 21.8181C16.5785 21.9923 17.9215 21.7088 19.0615 21.0147C20.2015 20.3207 21.0699 19.2577 21.5227 18.0022C21.9754 16.7467 21.9854 15.3741 21.5508 14.1122C21.1162 12.8503 20.2633 11.7749 19.1335 11.0644C18.0036 10.3539 16.6649 10.0511 15.3393 10.2061C14.0136 10.3611 12.7809 10.9647 11.8455 11.9167H13.6666C13.8213 11.9167 13.9697 11.9781 14.0791 12.0875C14.1885 12.1969 14.25 12.3453 14.25 12.5C14.25 12.6547 14.1885 12.8031 14.0791 12.9125C13.9697 13.0219 13.8213 13.0833 13.6666 13.0833H11.2499C10.9626 13.0832 10.6872 12.969 10.4841 12.7659C10.281 12.5628 10.1668 12.2873 10.1666 12.0001V9.58333C10.1666 9.42862 10.2281 9.28025 10.3375 9.17085C10.4469 9.06146 10.5952 9 10.75 9V9C10.9047 9 11.053 9.06146 11.1624 9.17085C11.2718 9.28025 11.3333 9.42862 11.3333 9.58333V10.7955C12.5066 9.74709 13.9992 9.12512 15.5698 9.03016C17.1403 8.93521 18.697 9.37284 19.9881 10.2723C21.2791 11.1717 22.229 12.4803 22.6841 13.9865C23.1392 15.4927 23.0729 17.1084 22.4959 18.5722C21.919 20.0361 20.8651 21.2625 19.5047 22.0532C18.1444 22.8438 16.5571 23.1525 14.9996 22.9292C13.442 22.7059 12.0054 21.9637 10.9219 20.8228C9.83847 19.6818 9.17159 18.2087 9.02912 16.6417C9.02159 16.5604 9.03106 16.4785 9.05693 16.4011C9.0828 16.3238 9.1245 16.2526 9.17938 16.1923C9.23426 16.1319 9.30111 16.0836 9.37567 16.0505C9.45023 16.0174 9.53088 16.0002 9.61246 16C9.75476 15.9983 9.89261 16.0496 9.99915 16.144C10.1057 16.2383 10.1733 16.3689 10.1888 16.5104V16.5104Z"
          fill="#1C1C1D"
        />
      </g>
      <defs>
        <clipPath id="clip0_3347_48522">
          <rect width="14" height="14" fill="white" transform="matrix(-1 0 0 1 23 9)" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function AdmissionInfo({ studentLead }: { studentLead?: StudentLeadEntity }) {
  return (
    <InfoBox.Root>
      <InfoBox.Header title="Info. adicional" />
      <InfoBox.Content>
        <List.List>
          <List.Item className="flex flex-col gap-0">
            <span className="text-xs leading-[18px] text-[#6E7480]">Fecha de creación:</span>
            <span className="text-base leading-6 text-[#1C1C1D]">
              {formatDateWithSpanishFormat(studentLead?.created_at as string)}
            </span>
          </List.Item>
          <List.Item className="flex flex-col gap-0">
            <span className="text-xs leading-[18px] text-[#6E7480]">Creado por:</span>
            <span className="text-base leading-6 text-[#1C1C1D]">Tutor ({studentLead?.created_by})</span>
          </List.Item>
        </List.List>
      </InfoBox.Content>
    </InfoBox.Root>
  );
}

function DroppedOutBanner({ studentLead }: { studentLead?: StudentLeadEntity }) {
  const isDroppedOut = [StatusEnum.DroppedOut, StatusEnum.NotAdmitted].includes(studentLead?.status as StatusEnum);
  if (!isDroppedOut) return null;

  const droppedOutReason = studentLead?.dropped_out_reason || 'No especificado';
  const wasDroppedOut = studentLead?.status === StatusEnum.DroppedOut;

  const label = wasDroppedOut ? 'Motivo de abandono' : 'Motivo de rechazo';

  return (
    <div className="pb-6 bg-[#FAFBFB]">
      <div
        className={cn('bg-[#FFEFEF] text-[#E65959] flex items-center gap-3 px-4 py-3 rounded-lg', {
          'bg-[#FFF9E6] text-[#8C6A04]': wasDroppedOut,
        })}
      >
        {wasDroppedOut ? <DroppedOutIcon /> : <NotAdmittedIcon />}
        <p>
          <span className="font-bold">{label}:</span> {droppedOutReason}
        </p>
      </div>
    </div>
  );
}

function DroppedOutIcon() {
  return (
    <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.5601 14.3L13.8901 1.58C13.2598 0.593999 12.1703 -0.00262451 11.0001 -0.00262451C9.82987 -0.00262451 8.74038 0.593999 8.1101 1.58L0.440101 14.3C-0.111353 15.2192 -0.130414 16.3629 0.390101 17.3C0.992074 18.3551 2.11533 19.0046 3.3301 19H18.6701C19.8766 19.0129 20.9979 18.3797 21.6101 17.34C22.1462 16.3926 22.1271 15.2292 21.5601 14.3ZM11.0001 15C10.4478 15 10.0001 14.5523 10.0001 14C10.0001 13.4477 10.4478 13 11.0001 13C11.5524 13 12.0001 13.4477 12.0001 14C12.0001 14.5523 11.5524 15 11.0001 15ZM11.0001 12C11.5524 12 12.0001 11.5523 12.0001 11V7C12.0001 6.44771 11.5524 6 11.0001 6C10.4478 6 10.0001 6.44771 10.0001 7V11C10.0001 11.5523 10.4478 12 11.0001 12Z"
        fill="#FFC107"
      />
    </svg>
  );
}

function NotAdmittedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 7.34784 18.9464 4.8043 17.0711 2.92893C15.1957 1.05357 12.6522 0 10 0ZM10 15C9.44771 15 9 14.5523 9 14C9 13.4477 9.44771 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15ZM10 12C10.5523 12 11 11.5523 11 11V6C11 5.44772 10.5523 5 10 5C9.44771 5 9 5.44772 9 6V11C9 11.5523 9.44771 12 10 12Z"
        fill="#FD6262"
      />
    </svg>
  );
}
