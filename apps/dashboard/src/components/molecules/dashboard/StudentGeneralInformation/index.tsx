import { DashboardStudentDetail } from '@cometa/trpc/src/types';
import Skeleton from '../Skeleton';
import Grid from '/src/components/atoms/Grid';
import Box from '/src/components/organisms/dashboard/Box';
import { formatPrice } from '/src/utils/general';
import { cn } from '@cometa/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetPermissions } from '/src/guards/AuthGuard';

interface IStudentGeneralInformationProps {
  student: DashboardStudentDetail | undefined;
  action: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function GeneralInformation({ student, action, isLoading, className }: IStudentGeneralInformationProps) {
  const permissions = useGetPermissions();
  const shouldShowAccountSections = Boolean(permissions.can_view_account_state_section);

  if (isLoading && !student) {
    return (
      <Grid as="section" className={cn('grid-cols-2 gap-5 pb-[60px]', className)}>
        <Box className="flex flex-col px-[30px] py-6 gap-2 ">
          <div className="grid grid-cols-4">
            <Skeleton className="col-span-2" />
            <div />
            <Skeleton />
          </div>
          <div className="grid grid-cols-4 mt-2 border-b border-[#DDDDDD] pb-4">
            <Skeleton className="col-span-1" />
          </div>
          <div className="grid grid-cols-5 gap-6">
            <Skeleton className="col-span-1" />
            <Skeleton className="col-span-1" />
            <Skeleton className="col-span-1" />
          </div>
        </Box>
        <Box className="px-[30px] py-[45px] flex flex-col gap-2 ">
          <div className="grid grid-cols-5 gap-6">
            <Skeleton className="col-span-1" />
          </div>
          <div className="grid grid-cols-5 gap-6">
            <Skeleton className="col-span-1 h-[30px]" />
          </div>
        </Box>
      </Grid>
    );
  }

  return (
    <Grid as="section" className={cn('grid-cols-2 gap-5 pb-[60px]', className)}>
      <Box className="px-[30px] py-6 border border-[#E4EBF6] shadow-none">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span
              className="font-semibold text-foreground"
              data-testid={`${student?.first_name} ${student?.last_name}`}
            >{`${student?.first_name} ${student?.last_name}`}</span>
            <span
              className="no-underline text-green hover:text-green-800 bg-none cursor-pointer font-bold text-[13px] mt-1"
              onClick={action}
            >
              Ver más info
            </span>
          </div>
          <div className="flex gap-20">
            <span className="text-sm font-medium text-foreground pt-4">
              Matrícula: &nbsp;{student?.enrollment_code}
            </span>
            {student?.credential_expiration_date ? (
              <span className="text-sm font-medium text-foreground pt-4">
                Exp. de credencial: &nbsp;
                {format(parseISO(student?.credential_expiration_date), 'dd/MM/yyyy', { locale: es })}
              </span>
            ) : null}
          </div>
        </div>
      </Box>
      {shouldShowAccountSections ? (
        <Box className="px-[30px] flex flex-row items-center justify-between py-5 border border-[#E4EBF6] shadow-none">
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-foreground">Deuda total</span>
            <span className="text-3xl font-bold text-foreground" data-testid="dueTotalPrice-text">
              {formatPrice(student?.due_total_price || 0, 'MXN')}
            </span>
          </div>
        </Box>
      ) : null}
    </Grid>
  );
}
