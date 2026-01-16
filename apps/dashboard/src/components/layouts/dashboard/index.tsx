import useCollapseDrawer from '/src/hooks/useCollapseDrawer';
import { cn } from '/src/utils/cn';
import BackgroundDownload, { useBackgroundStore } from '../../BackgroundDownload/BackgroundDownload';
import { cva, type VariantProps } from 'class-variance-authority';
import { useRouter } from 'next/router';
import BackgroundConceptAssign, {
  useBackgroundConceptAssignStore,
} from '../../BackgroundDownload/BackgroundAssignConcepts';
import { useEffect, useState } from 'react';
import BackgroundDeassignConcepts, {
  useBackgroundConceptDeassignStore,
} from '../../BackgroundDownload/BackgroundDeassignConcepts';
import { DashboardNavbar } from './navbar/DashboardNavbar';
import Grid from '../../atoms/Grid';
import BackgroundScholarshipAssign from '../../BackgroundProcess/BackgroundScholarshipAssign';
import { useBackgroundProcessStatus } from '/src/store/backgroundProcessStore';
import { DownloadStatusBar } from '../../DownloadManager';

const variants = cva('py-2 px-4 w-full transition-all', {
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
  const [showConfigNav, setShowConfigNav] = useState(false);
  const router = useRouter();
  const query = router.query;
  const hasConceptId = query?.conceptId;
  const isConceptsPage = router.pathname === '/concepts';
  const isScholarshipsPage = router.pathname === '/scholarships';
  const isConfigPage = router.pathname.startsWith('/school_config');

  const statusDownload = useBackgroundStore((state) => state.status);
  const statusConceptAssign = useBackgroundConceptAssignStore((state) => state.status);
  const statusConceptDeassign = useBackgroundConceptDeassignStore((state) => state.status);
  const statusScholarshipAssign = useBackgroundProcessStatus();
  const [workingComponents, setWorkingComponents] = useState<string[]>([]);
  useEffect(() => {
    const statuses = ['working', 'success', 'error'];
    const components = ['download', 'assign', 'deassign', 'assign_scholarship'];
    let newWorkingComponents = [...workingComponents];

    for (const component of components) {
      let status: string;
      if (component === 'download') {
        status = statusDownload;
      } else if (component === 'assign') {
        status = statusConceptAssign;
      } else if (component === 'deassign') {
        status = statusConceptDeassign;
      } else if (component === 'assign_scholarship') {
        status = statusScholarshipAssign;
      } else {
        status = 'idle';
      }

      if (statuses.includes(status) && !newWorkingComponents.includes(component)) {
        newWorkingComponents.push(component);
      } else if (!statuses.includes(status)) {
        newWorkingComponents = newWorkingComponents.filter((item) => item !== component);
      }
    }

    setWorkingComponents(newWorkingComponents);
  }, [statusDownload, statusConceptAssign, statusConceptDeassign]);

  return (
    <Grid columns={['grid-cols-[auto_1fr]']} className="my-0 antialiased max-w-screen-3xl">
      <DashboardNavbar showConfigNav={showConfigNav} setShowConfigNav={setShowConfigNav} />

      <main
        className={cn(variants({ variant }), {
          '2lg:max-w-[calc(100vw-120px)]': isCollapse,
          '2lg:max-w-[calc(100vw-260px)]': !isCollapse,
          '2lg:max-w-[calc(100vw-316px)]': showConfigNav,
          'bg-[#F4F6F8] !p-0 2lg:max-w-[calc(100vw-250px)]': hasConceptId,
          'h-screen': isConceptsPage,
          '2lg:max-w-[calc(100vw-250px)]': isScholarshipsPage,
          'max-h-0': variant === 'stretch' && isConfigPage,
        })}
      >
        {children}
      </main>

      <div>
        <DownloadStatusBar
          className={cn({
            'w-[calc(100vw-68px)]': isCollapse,
            'w-[calc(100vw-248px)]': !isCollapse,
          })}
        />

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
        <BackgroundScholarshipAssign
          className={cn({
            'bottom-[80px] z-[12]': workingComponents.indexOf('assign_scholarship') === 1,
            'bottom-0 z-[13]': workingComponents.indexOf('assign_scholarship') === 0,
          })}
        />
      </div>
    </Grid>
  );
}
