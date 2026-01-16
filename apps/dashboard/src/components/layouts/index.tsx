import { cn } from '@cometa/utils';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import DashboardLayout, { type DashboardLayoutVariants } from './dashboard';
import LogoOnlyLayout from './LogoOnlyLayout';
import { useSelectedSchool } from '/src/guards/AuthGuard';

const cobrowseLicenseKey = process.env.NEXT_PUBLIC_COBROWSE_LICENSE_KEY;
interface LayoutProps {
  variant?: 'dashboard' | 'logoOnly';
  children: any;
  title?: string;
  meta?: React.ReactNode;
  dashboardVariant?: DashboardLayoutVariants['variant'];
}

const CobrowseIdentifier = () => {
  const { data: session } = useSession();
  const school = useSelectedSchool();

  useEffect(() => {
    if (cobrowseLicenseKey) {
      if (window && 'CobrowseIO' in window) {
        window.CobrowseIO.customData = {
          user_id: session?.user.id,
          user_name: `${session?.user.name} ${session?.user.last_name}`,
          user_email: session?.user.email,
          school_name: school?.name,
        };
      }
    }
  }, [session, school]);

  return null;
};

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
        <LogoOnlyLayout>{children}</LogoOnlyLayout>
      </>
    );
  }
  return (
    <>
      <Head>
        <title>{`${title} | Cometa`}</title>
        {meta}
      </Head>
      {cobrowseLicenseKey && (
        <Script id="cobrowse-io" strategy="afterInteractive">
          {`
            (function(w,t,c,p,s,e){p=new Promise(function(r){w[c]={client:function(){if(!s){
            s=document.createElement(t);s.src='https://js.cobrowse.io/CobrowseIO.js';s.async=1;s.crossOrigin='anonymous';
            e=document.getElementsByTagName(t)[0];e.parentNode.insertBefore(s,e);s.onload=function()
            {r(w[c]);};}return p;}};});})(window,'script','CobrowseIO');

            CobrowseIO.license = "${cobrowseLicenseKey}";
            CobrowseIO.client().then(function(){
                CobrowseIO.start();
            });
          `}
        </Script>
      )}
      <DashboardLayout variant={dashboardVariant}>
        <div
          className={cn({
            'mb-0': dashboardVariant === 'stretch',
          })}
        >
          {children}
          {cobrowseLicenseKey && <CobrowseIdentifier />}
        </div>
      </DashboardLayout>
    </>
  );
}
