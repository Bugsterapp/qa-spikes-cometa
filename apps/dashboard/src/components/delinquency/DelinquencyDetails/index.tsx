import React, { memo } from 'react';
import { useSelectedSchool } from '../../../guards/AuthGuard';
import { api } from '../../../utils/api';
import Grid from '../../atoms/Grid';
import LinkDetail from '../../atoms/LinkDetail';
import { Title, Value } from '../../payments/FulfillmentDetail';
import SidebarHeader from '../../molecules/dashboard/SidebarHeader';
import Link from 'next/link';
import Mail from '../../../../public/assets/icons/studentDetail/mail.svg';
import Phone from '../../../../public/assets/icons/studentDetail/phone.svg';
import Link_To from '../../../../public/assets/icons/ic_link_to.svg';
import { formatPrice } from '../../../utils/general';

export const DelinquencyDetails = memo(function DelinquencyDetails({
  student_id,
  total_debt,
  handleCloseDetails,
}: {
  student_id: string;
  total_debt?: string;
  handleCloseDetails: () => void;
}) {
  const selectedSchool = useSelectedSchool();
  const { data: studentDelinquency, isPending: isLoading } = api.delinquency.getDelinquencyByStudentId.useQuery(
    {
      student_id,
      school_id: selectedSchool?.id as string,
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  const studentPath = (studentId: string) => `/students/${studentId}?prev=/delinquency`;

  return (
    <div className="flex flex-col px-8">
      <div className="sticky top-0 z-10 w-full bg-white">
        <SidebarHeader title="Detalle de morosidad" onClose={handleCloseDetails} />
      </div>
      <div className="flex flex-col">
        <h3 className="text-xs font-bold pb-1 text-gray-600 border-[rgba(145, 158, 171, 0.24)] border-solid border-b mb-6">
          ÓRDENES PAGADAS
        </h3>
        <Grid columns={['grid-cols-4']} className="mb-5">
          <Title text="Estudiante:" />
          <div className="col-span-3">
            <LinkDetail
              href={studentPath(student_id)}
              text={`${studentDelinquency?.first_name} ${studentDelinquency?.last_name}`}
              message="Ver detalle del estudiante"
              loading={isLoading}
              className="w-full"
              target="_self"
            />
          </div>
        </Grid>
        <Grid columns={['grid-cols-4']} className="mb-5">
          <Title text="Matrícula:" />

          <Value text={studentDelinquency?.enrollment_code || ''} />
        </Grid>
        <Grid columns={['grid-cols-4']} className="mb-5">
          <Title text="Nivel y grado:" />
          <div className=" text-sm font-semibold divide-x divide-x-[rgba(145, 158, 171, 0.24)] w-fit text-foreground col-span-2">
            <span>{studentDelinquency?.section}</span> <span className="pl-1">{studentDelinquency?.level}</span>
          </div>
        </Grid>
      </div>
      <div className="flex flex-col mt-8">
        <h3 className="text-xs font-bold pb-1 text-gray-600 border-[rgba(145, 158, 171, 0.24)] border-solid border-b">
          TUTORES VINCULADOS
        </h3>
        <div className="flex flex-col divide-y">
          {(studentDelinquency?.guardians as unknown as Guardian.Guardian[])?.map((guardian) => (
            <Link
              href={`/guardian/${guardian.id}`}
              key={guardian.id}
              className="py-5 px-3.5 items-start grid grid-cols-[1fr_auto] pb-6 border-b border-[rgba(145, 158, 171, 0.24)] border-solid last:border-none last:mb-6 hover:bg-blue-secondary-200/[0.04] hover:cursor-pointer"
            >
              <h4 className="col-start-1 row-start-1 mb-2 text-sm font-bold">
                {guardian.first_name} {guardian.last_name}
              </h4>
              <div className="col-span-1 col-start-1 flex items-center divide-x divide-[#DFE3E8]">
                <span className="flex items-center pr-4 text-xs">
                  <Mail className="w-4 mr-2 text-[#98A2B3]" /> {guardian.email}
                </span>
                <span className="flex items-center pl-4 text-xs">
                  <Phone className="w-4 mr-2 text-[#98A2B3]" />
                  {guardian.phone}
                </span>
              </div>
              <Link_To className="row-start-1" />
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-between px-4 py-5 font-bold rounded-lg bg-blue-secondary-200/[0.04]">
          <span>Deuda total</span>
          <span className="text-right">{total_debt ? formatPrice(total_debt) : '-'}</span>
        </div>
      </div>
    </div>
  );
});
