import DashboardHeader from './header';
import DashboardSidebar from './navbar/DashboardSidebar';
import Grid from '/src/components/atoms/Grid';
import useCollapseDrawer from '/src/hooks/useCollapseDrawer';
import { cn } from '/src/utils/cn';
import BackgroundDownload, { useBackgroundStore } from '../../BackgroundDownload/BackgroundDownload';
import { cva, VariantProps } from 'class-variance-authority';
import { useRouter } from 'next/router';
import BackgroundConceptAssign, {
  useBackgroundConceptAssignStore,
} from '../../BackgroundDownload/BackgroundAssignConcepts';
import { useEffect, useState } from 'react';
import BackgroundDeassignConcepts, {
  useBackgroundConceptDeassignStore,
} from '../../BackgroundDownload/BackgroundDeassignConcepts';

const variants = cva(`py-2 px-4 w-full transition-all`, {
  variants: {
    variant: {
      stretch: 'px-0 max-h-[calc(100vh-70px)] py-1',
      default: 'xl:px-5 2xl:px-16 3xl:px-32',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type DashboardLayoutVariants = VariantProps<typeof variants>;

export default function DashboardLayout({
  children,
  variant,
}: { children: React.ReactNode } & DashboardLayoutVariants) {
  const { isCollapse } = useCollapseDrawer();
  const router = useRouter();
  const query = router.query;
  const hasConceptId = query?.conceptId;
  const isConceptsPage = router.pathname === '/concepts';
  const statusDownload = useBackgroundStore((state) => state.status);
  const statusConceptAssign = useBackgroundConceptAssignStore((state) => state.status);
  const statusConceptDeassign = useBackgroundConceptDeassignStore((state) => state.status);

  const [workingComponents, setWorkingComponents] = useState<string[]>([]);
  useEffect(() => {
    const statuses = ['working', 'success', 'error'];
    const components = ['download', 'assign', 'deassign'];
    let newWorkingComponents = [...workingComponents];

    components.forEach((component) => {
      let status;
      if (component === 'download') {
        status = statusDownload;
      } else if (component === 'assign') {
        status = statusConceptAssign;
      } else {
        status = statusConceptDeassign;
      }

      if (statuses.includes(status) && !newWorkingComponents.includes(component)) {
        newWorkingComponents.push(component);
      } else if (!statuses.includes(status)) {
        newWorkingComponents = newWorkingComponents.filter((item) => item !== component);
      }
    });

    setWorkingComponents(newWorkingComponents);
  }, [statusDownload, statusConceptAssign, statusConceptDeassign]);
  return (
    <Grid columns={['grid-cols-[auto_1fr]']} className="mx-auto max-w-screen-3xl">
      <DashboardHeader />
      <DashboardSidebar />
      <main
        className={cn(variants({ variant }), {
          '2lg:max-w-[calc(100vw-120px)]': isCollapse,
          '2lg:max-w-[calc(100vw-280px)]': !isCollapse,
          'bg-[#F4F6F8] !p-0': hasConceptId,
          'h-screen': isConceptsPage,
        })}
      >
        {children}
      </main>
      <div className="">
        <BackgroundConceptAssign
          isCollapse={isCollapse}
          className={cn({
            'bottom-[80px] z-[12]': workingComponents.indexOf('assign') === 1,
            'bottom-0 z-[13]': workingComponents.indexOf('assign') === 0,
          })}
        />
        <BackgroundDeassignConcepts
          isCollapse={isCollapse}
          className={cn({
            'bottom-[80px] z-[12]': workingComponents.indexOf('deassign') === 1,
            'bottom-0 z-[13]': workingComponents.indexOf('deassign') === 0,
          })}
        />
        <BackgroundDownload
          className={cn({
            'bottom-[80px] z-[12]': workingComponents.indexOf('download') === 1,
            'bottom-0 z-[13]': workingComponents.indexOf('download') === 0,
          })}
        />
      </div>
    </Grid>
  );
}
