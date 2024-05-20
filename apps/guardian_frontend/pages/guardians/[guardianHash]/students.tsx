import React, { useEffect } from 'react';
import Head from 'next/head';
import useSendPageViewedEvent from '~/hooks/useSendPageViewedEvent';
import { OnboardingStudentInfo } from '~/components/OnboardingSteps';
import { api } from '~/utils/api';
import { useSelectedSchool } from '~/components/molecules/common/AuthGlobal';
import { useIsPolling, useIsRecentAdded, useOpenFormStudent, useSelectedStudent } from './onboarding';
import Navbar from '~/components/organisms/guardians/Navbar';
import Arrow from '~/public/icons/ic_arrow_right.svg';
import { useStudentsPoller } from '~/hooks/useStudentsPoller';
import { useRouter } from 'next/router';
import { useVerifyRFC } from '@cometa/hooks';
import { GenderEnum } from '@cometa/trpc';

function Student() {
  const router = useRouter();
  const school = useSelectedSchool();
  const [selected, setSelected] = useSelectedStudent();
  const [openFormStudent, setOpenFormStudent] = useOpenFormStudent();
  const [isPolling] = useIsPolling();
  const { refetchUser } = useVerifyRFC();
  const { setIsRecentAdded } = useIsRecentAdded();

  const genericCurp = {
    male: 'XEXX010101HNEXXXA4',
    female: 'XEXX010101MNEXXXA8',
  };
  useEffect(() => {
    setIsRecentAdded(false);
  }, [setIsRecentAdded]);

  const { data: guardianStudentsFilters, isLoading: isLoadingStudents, refetch } = useStudentsPoller();

  const studentMutation = api.student.update.useMutation();
  const createStudentMutation = api.schools.createStudent.useMutation();

  useSendPageViewedEvent('Students');

  const allowStudentEdit = Boolean(school?.config_dashboard?.edit_student_portal);

  const back = () => {
    if (selected && openFormStudent) {
      setSelected(null);
      setOpenFormStudent(false);
    }
  };

  const getGenericCURPByGender = (gender: GenderEnum | undefined) =>
    gender === GenderEnum.M ? genericCurp.male : genericCurp.female;

  const countStudents = guardianStudentsFilters?.length ?? 0;

  return (
    <>
      <Head>
        <title>Students</title>
      </Head>
      <div className="sticky top-0 z-20">
        <Navbar disabledTitle={isPolling || !countStudents} disabledMenu={isPolling || !countStudents} hideTour />
      </div>
      <div className="container relative z-10 block max-w-[600px] px-6 pb-6 mx-auto">
        <div className="flex flex-col max-w-sm mx-auto">
          {openFormStudent && (
            <div className="inline-flex items-center justify-center h-20 gap-5 py-5 pl-6 mb-3 border-b border-y-[#E3E0FF]">
              <button
                className="flex items-center justify-center flex-shrink-0 p-2 bg-white rounded-full w-9 h-9"
                onClick={() => back()}
              >
                <Arrow className="text-[#4A5CFF] w-3 rotate-180" />
              </button>
              <div className="text-lg font-semibold leading-10 text-indigo-900 grow shrink basis-0">
                Detalle de estudiante
              </div>
            </div>
          )}
          {!countStudents && !isLoadingStudents && (
            <div className="flex-col justify-start items-start gap-2.5 inline-flex mb-9 mt-4">
              <div className="text-xl font-semibold leading-7 tracking-tight text-slate-600">
                Por favor ingresa los datos del estudiante
              </div>
              <div className="leading-7 tracking-tight text-slate-600">
                Los datos requeridos al dar de alta el estudiante son necesarios para poder asociarle los conceptos y
                que puedas visualizarlos.
              </div>
            </div>
          )}
          <div>
            <OnboardingStudentInfo
              allowEdit={allowStudentEdit}
              allowAdd={!!school && Boolean(school.is_provider) && !isLoadingStudents}
              schoolId={school?.id ?? ''}
              isLoading={studentMutation.isLoading || isLoadingStudents}
              onContinue={() => {
                router.push(
                  `/guardians/${router.query.guardianHash}/?tab=${school?.is_provider ? 'optionals' : 'subscriptions'}`
                );
              }}
              onSubmit={async ({ id, birthdate, ...values }) => {
                const manageResponse = (res: Record<string, any>) => {
                  if (res.error) {
                    return { data: res.data, status: res.status };
                  }
                  refetchUser();
                  refetch();
                };

                const curp =
                  values.identifier || (school?.is_provider ? getGenericCURPByGender(values.gender) : undefined);

                const student_birthdate = `${birthdate.year}-${birthdate.month
                  .toString()
                  .padStart(2, '0')}-${birthdate.day.toString().padStart(2, '0')}`;
                if (!id) {
                  return createStudentMutation
                    .mutateAsync({
                      data: [
                        {
                          ...values,
                          identifier: curp,
                          birthdate: student_birthdate,
                          school: school?.id ?? '',
                        },
                      ],
                    })
                    .then((res) => {
                      if (!res.error) setIsRecentAdded(true);
                      return manageResponse(res);
                    });
                }
                return studentMutation
                  .mutateAsync({ id, data: { ...values, identifier: curp, birthdate: student_birthdate } })
                  .then((res) => manageResponse(res));
              }}
              students={guardianStudentsFilters ?? []}
            />
          </div>
        </div>
      </div>
    </>
  );
}

Student.auth = true;

export default Student;
