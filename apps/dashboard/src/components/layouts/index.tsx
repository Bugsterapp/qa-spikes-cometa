import Head from 'next/head';
import DashboardLayout, { DashboardLayoutVariants } from './dashboard';
import LogoOnlyLayout from './LogoOnlyLayout';
import { cn } from '/src/utils/cn';

interface LayoutProps {
  variant?: 'dashboard' | 'logoOnly';
  children: any;
  title?: string;
  meta?: React.ReactNode;
  dashboardVariant?: DashboardLayoutVariants['variant'];
}

export default function Layout({
  variant = 'dashboard',
  children,
  title,
  meta,
  dashboardVariant = 'default',
}: LayoutProps) {
  if (variant === 'logoOnly') {
    return (
      <>
        <Head>
          <title>{`${title} | Cometa`}</title>
          {meta}
        </Head>
        <LogoOnlyLayout>{children}</LogoOnlyLayout>;
      </>
    );
  }
  return (
    <>
      <Head>
        <title>{`${title} | Cometa`}</title>
        {meta}
      </Head>

      <DashboardLayout variant={dashboardVariant}>
        <div
          className={cn({
            'mb-0': dashboardVariant === 'stretch',
          })}
        >
          {children}
        </div>
      </DashboardLayout>
    </>
  );
}
