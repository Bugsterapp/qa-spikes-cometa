import { Button, Select } from '@cometa/recreo';
import { GuardianResponse } from '@cometa/trpc/src/types';
import { Transition } from '@headlessui/react';
import * as Sentry from '@sentry/nextjs';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, FieldValues, Path, UseFormReturn } from 'react-hook-form';

import SearchIcon from '/public/assets/icons/ic_search.svg';
import Mail from '/public/assets/icons/studentDetail/mail.svg';
import Phone from '/public/assets/icons/studentDetail/phone.svg';
import Plus from '/public/assets/icons/studentDetail/plus.svg';
import Person from '/public/assets/images/person.svg';
import ErrorToast from '/src/components/ErrorToast';
import Combobox from '/src/components/molecules/dashboard/Combobox';
import Skeleton from '/src/components/molecules/dashboard/Skeleton';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';
import { GuardianQuery } from '/src/hooks/useSearch';
import ApiClient from '/src/services/ApiClient';
import { cn } from '/src/utils/cn';
import { guardianRelationshipOptions } from '/src/constants/guardianRelationship';

type AssignGuardianTabProps<TFormValues extends FieldValues = FieldValues> = {
  guardian?: GuardianResponse;
  setGuardian: (_: GuardianResponse | undefined) => void;
  isStudent?: boolean;
  form?: UseFormReturn<TFormValues>;
};

export const AssignGuardianTab = <TFormValues extends FieldValues>({
  guardian,
  setGuardian,
  isStudent = true,
  form,
}: AssignGuardianTabProps<TFormValues>) => {
  const control = form?.control;
  const errors = form?.formState?.errors;

  const { data: session } = useSession();
  const selectedSchoolId = useSelectedSchoolId();
  const [query, setQuery] = useState('');

  const onSelectGuardian = (selectedGuardian: GuardianQuery['results'][number]) => {
    setGuardian(selectedGuardian as GuardianResponse);
  };

  const onUnSelectGuardian = () => {
    setGuardian(undefined);
  };

  const getSchoolGuardians = async (search: string) => {
    const response = await ApiClient.getGuardiansOnSchool(selectedSchoolId, search);
    return response?.results as GuardianQuery['results'];
  };

  const {
    data: schoolGuardians,
    isFetching,
    isFetched,
  } = useQuery<GuardianQuery['results']>({
    queryKey: ['guardians_on_school', selectedSchoolId, query],
    queryFn: () => getSchoolGuardians(query),
    placeholderData: keepPreviousData,
    enabled: !guardian,
  });

  const {
    data,
    isPending: isLoading,
    isError,
  } = useQuery<GuardianResponse>({
    queryFn: async () => {
      const req = await ApiClient.getGuardian(selectedSchoolId, guardian?.id);
      return req;
    },
    queryKey: ['guardian_students', guardian?.id],
    enabled: Boolean(guardian),
  });

  const students = data?.dependents;

  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setContext('state', {
          students,
          guardian,
          session,
          selectedSchoolId,
        });
      }}
    >
      <ErrorToast message="Ocurrió un error inesperado, por favor intenta de nuevo." show={isError} />
      <div className="col-span-2">
        {!guardian && (
          <Transition
            appear
            show={Boolean(!guardian)}
            enter="transition-opacity duration-75"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Root
              classNames="relative flex flex-row items-center w-full outline-none border border-[#919EAB52] rounded-lg"
              icon={<SearchIcon />}
            >
              <>
                <Combobox.Input
                  classNames="py-4 border-none text-base placeholder:text-[#919EAB] rounded-r-lg w-full active:outline-none focus:outline-none peer focus:ring-0"
                  placeholder="Nombre o apellido"
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Combobox.Options classNames="absolute z-10 flex flex-col w-full px-3 py-4 mt-1 text-base list-none bg-white rounded-md shadow-lg top-full h-fit max-h-60 focus:outline-none sm:text-sm">
                  <div className="overflow-y-scroll">
                    {schoolGuardians ? (
                      <>
                        {schoolGuardians?.map((element: GuardianQuery['results'][number]) => (
                          <Combobox.Option value={element} key={`guardian-option-${element.id}`}>
                            <li
                              className={cn(
                                'grid grid-cols-[85%_1fr] gap-2 items-center justify-between w-full p-2 bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]'
                              )}
                              onClick={() => onSelectGuardian(element)}
                            >
                              <div className="flex flex-col items-start font-normal">
                                <span className="text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]">
                                  {element.first_name} {element.last_name}
                                </span>
                                <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]">
                                  {element.email}
                                </span>
                              </div>
                              <div className="flex justify-between items-center bg-[#919EAB29] bg-opacity-[16%] max-w-[56px] rounded-full p-2">
                                <Person />
                                <span className="mr-1 text-sm">{element.dependents_count}</span>
                              </div>
                            </li>
                          </Combobox.Option>
                        ))}
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 align-center justify-center w-full text-gray-600 h-fit bg-white border-none rounded-lg outline-none hover:bg-gray-200 cursor-pointer active:bg-[#919EAB29]">
                        <Skeleton />
                        <Skeleton />
                      </div>
                    )}
                    {schoolGuardians?.length === 0 && !isFetching && (
                      <div className="flex flex-col items-start gap-1 p-1 font-normal text-gray-600">
                        <span className="text-base">No se encontraron resultados</span>
                      </div>
                    )}
                    {isFetching && (
                      <div className="flex py-2 pr-4">
                        <div className="flex flex-col gap-2 align-center justify-center w-full text-gray-600 h-fit bg-white border-none rounded-lg outline-none cursor-pointer active:bg-[#919EAB29]">
                          <Skeleton className="max-w-[250px]" />
                          <Skeleton className="max-w-[250px]" />
                        </div>
                        <div className="h-10 w-14 rounded-full bg-gradient-to-r from-[#DFDFDF3D] to-[#AFAFAF52] transition-colors animate-pulse" />
                      </div>
                    )}
                  </div>
                </Combobox.Options>
              </>
            </Combobox.Root>
          </Transition>
        )}
        {guardian && isStudent ? (
          <Transition
            appear
            show={Boolean(guardian)}
            enter="transition-opacity duration-75"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="rounded-lg border border-[#3366FF] py-5 px-9 items-start grid grid-cols-[1fr_auto] mb-6">
              <h4 className="col-start-1 mb-2 text-sm font-bold">
                {guardian?.first_name} {guardian?.last_name}
              </h4>
              <div className="col-span-1 col-start-1 flex items-center divide-x divide-[#DFE3E8]">
                <a className="flex items-center pr-4 text-xs">
                  <Mail className="w-4 mr-2 text-[#98A2B3]" /> {guardian?.email}
                </a>
                <a className="flex items-center pl-4 text-xs">
                  <Phone className="w-4 mr-2 text-[#98A2B3]" />
                  {guardian?.phone}
                </a>
              </div>
              <Button className="col-start-2 row-start-1 bg-transparent justify-self-end" onClick={onUnSelectGuardian}>
                <Plus className="rotate-45 text-[#212B36] w-4" />
              </Button>
            </div>

            {form && (
              <div className="space-y-6 my-6">
                <Controller
                  control={control}
                  name={'relationship' as Path<TFormValues>}
                  render={({ field }) => (
                    <Select
                      placeholder={`Parentesco con el ${isStudent ? 'estudiante' : 'postulante'}`}
                      className="w-full outline-none min-h-[56px] h-full mb-1"
                      onValueChange={(value) => {
                        field.onChange(value || '');
                      }}
                      value={field.value || ''}
                      error={errors?.relationship?.message as string | undefined}
                    >
                      <Select.Content className="w-full outline-none">
                        {guardianRelationshipOptions?.map((option) => (
                          <Select.Item
                            key={option.id}
                            value={option.id}
                            className="w-full hover:bg-[#F5FAFF] outline-none"
                          >
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
            )}

            <div className="rounded-lg bg-[#3366FF] bg-opacity-8 py-5 px-6">
              <h4 className="text-[#637381] font-bold mb-4">Estudiantes asignados</h4>
              <ul className="space-y-2">
                {isLoading && !isFetched ? (
                  <li className="text-sm text-[#212B36] flex flex-col gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={`skeleton-assigned-student-${index}`} className="w-full h-4" />
                    ))}
                  </li>
                ) : students && students.length > 0 ? (
                  students.map((student) => (
                    <li className="text-sm text-[#212B36] flex items-center" key={student.id}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-2 h-2 mr-1" fill="none" viewBox="0 0 8 9">
                        <circle cx="4" cy="4.00977" r="4" fill="#36F" />
                      </svg>
                      {student.first_name} {student.last_name}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#212B36] flex items-center">
                    <span className="text-gray-500 italic">No hay estudiantes asignados</span>
                  </li>
                )}
              </ul>
            </div>
          </Transition>
        ) : null}
      </div>
    </Sentry.ErrorBoundary>
  );
};
