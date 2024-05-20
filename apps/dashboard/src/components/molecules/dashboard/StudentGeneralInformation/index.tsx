import { DashboardStudentDetail } from '@cometa/trpc/src/types';
import Skeleton from '../Skeleton';
import Grid from '/src/components/atoms/Grid';
import Box from '/src/components/organisms/dashboard/Box';
import { formatPrice } from '/src/utils/general';

interface IStudentGeneralInformationProps {
  student: DashboardStudentDetail | undefined;
  isLoading?: boolean;
  action: () => void;
}

const GeneralInformation = ({ student, isLoading, action }: IStudentGeneralInformationProps) =>
  !isLoading && student ? (
    <Grid as="section" className="grid-cols-2 gap-5 pb-[60px]">
      <Box className="px-[30px] py-6">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span
              className="font-semibold text-secondary"
              data-testid={`${student?.first_name} ${student?.last_name}`}
            >{`${student?.first_name} ${student?.last_name}`}</span>
            <span
              className="no-underline text-green hover:text-green-800 bg-none cursor-pointer font-bold text-[13px] mt-1"
              onClick={action}
            >
              Ver más info
            </span>
          </div>
          <span className="text-sm font-medium text-secondary py-4 border-b border-[#DDDDDD]">
            Matrícula: &nbsp;{student?.enrollment_code}
          </span>
          <div className="flex flex-row gap-8 text-sm font-medium text-secondary pt-4">
            <span data-testid="levelName-text">Nivel: {student?.section?.level_name}</span>
            <span data-testid="grade-text">Grado: {student?.section?.grade}</span>
            <span data-testid="group-text">Sección: {student?.section?.group}</span>
          </div>
        </div>
      </Box>
      <Box className="px-[30px] py-[45px] flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="font-semibold text-secondary">Deuda total</span>
          <span className="text-3xl font-bold text-secondary" data-testid="dueTotalPrice-text">
            {formatPrice(student?.due_total_price || 0, 'MXN')}
          </span>
        </div>
      </Box>
    </Grid>
  ) : (
    <Grid as="section" className="grid-cols-2 gap-5 pb-[60px]">
      <Box className="px-[30px] py-6 flex flex-col gap-2">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </Box>
      <Box className="px-[30px] py-[45px] flex flex-col gap-2 items-center justify-between">
        <Skeleton />
        <Skeleton />
      </Box>
    </Grid>
  );

export default GeneralInformation;
