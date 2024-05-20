import { twMerge } from 'tailwind-merge';
import Logo from '/src/components/Logo';
import LogoCollapse from '/src/components/LogoCollapse';
import CollapseButton from './CollapseButton';
import useCollapseDrawer from '/src/hooks/useCollapseDrawer';
import NavbarSelectSchool from './NavbarSelectSchool';
import { sidebarConfig } from './NavConfig';
import { NavSectionVertical } from '/src/components/nav-section';
import { useRouter } from 'next/router';
import { sendTrackEvent } from '/src/utils/events';
import { PATH_PORTAL } from '/src/routes/paths';
import { WHAT_TALK_TO_US } from '/src/utils/linksWhatsapp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Price from '/public/assets/icons/navbar/ic_price.svg';
import { useGetPermissions } from '/src/guards/AuthGuard';
import { AnimatePresence, motion } from 'framer-motion';
import { useFlags } from '/flags/client';
import { useSession } from 'next-auth/react';

const DashboardSidebar = () => {
  const permissions = useGetPermissions();
  const { isCollapse, collapseClick, onToggleCollapse, onHoverEnter, onHoverLeave } = useCollapseDrawer();
  const widthTransition = !isCollapse ? 'w-[280px]' : 'w-[117px]';
  const router = useRouter();
  const isPayManual = router.pathname === '/pay/manual' ?? false;
  const handleClickManualPayment = () => {
    sendTrackEvent('dashboard: Manual Payment Initiated', {});
    router.push(PATH_PORTAL.pay.manual);
  };
  const session = useSession();
  const flags = useFlags({ traits: { email: session.data?.user.email } }).flags;
  const isConceptActivated = flags?.concepts ?? false;
  const sidebarConfigFiltered = sidebarConfig.filter((item) => {
    if (item.title === 'Conceptos') {
      return isConceptActivated;
    }
    return true;
  });

  return (
    <div
      className={twMerge(
        'h-full overflow-auto z-[20] top-0 left-0 row-span-2 relative ease-in-out duration-500 -mt-14',
        widthTransition
      )}
    >
      <div
        className={twMerge(
          'bg-white z-10 h-full border-r fixed flex flex-col gap-2 p-6 ease-in-out outline-none duration-300',
          widthTransition
        )}
        onMouseEnter={onHoverEnter}
        onMouseLeave={onHoverLeave}
      >
        <div className="mb-6 relative h-[60px]">
          <AnimatePresence>
            {isCollapse ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="absolute flex flex-row items-center justify-center w-full"
                key="LogoCollapse"
              >
                <LogoCollapse />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                transition={{ delay: 0.5 }}
                className="absolute flex flex-row items-center justify-between w-full"
                key="Logo"
              >
                <Logo />
                <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <NavbarSelectSchool isCollapse={isCollapse} />
        <NavSectionVertical navConfig={sidebarConfigFiltered} isCollapse={isCollapse} />
        {permissions?.can_add_payment ? (
          <>
            {!isPayManual ? (
              <motion.button
                className="bg-[#00AB55] hover:bg-[#007B55] rounded-lg min-h-[48px] text-white font-bold text-sm flex items-center justify-center py-3 gap-2 cursor-pointer whitespace-nowrap w-full shadow-[0_8px_16px_0_rgba(0,171,85,0.24)] transition-all duration-300 ease-in-out relative"
                onClick={handleClickManualPayment}
              >
                <AnimatePresence>
                  {!isCollapse && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      key="Registrar"
                      className="absolute"
                      data-testid="registerpayment-button"
                    >
                      Registrar pago
                    </motion.div>
                  )}
                  {isCollapse && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.5 } }}
                      transition={{ delay: 0.3 }}
                      key="Price"
                      className="absolute"
                    >
                      <Price />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : null}
          </>
        ) : null}
        <div className="flex-col justify-end hidden h-full">
          <div className="text-green-500 font-normal text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap outline-none h-[80px] rounded-lg hover:bg-[#EBF8F1]">
            {!isCollapse ? (
              <>
                <WhatsAppIcon />
                <a href={WHAT_TALK_TO_US}>Hablar con Cometa</a>
              </>
            ) : (
              <WhatsAppIcon sx={{ fontSize: 32 }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
