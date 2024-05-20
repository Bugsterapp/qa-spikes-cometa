import PropTypes from 'prop-types';
import useOffSetTop from '../../../../hooks/useOffSetTop';
import { HEADER } from '../../../../config';

import AccountPopover from './AccountPopover';
import { useRouter } from 'next/router';
import { cn } from '/src/utils/cn';

DashboardHeader.propTypes = {
  isCollapse: PropTypes.bool,
  onOpenSidebar: PropTypes.func,
  verticalLayout: PropTypes.bool,
};

export default function DashboardHeader() {
  const isOffset = useOffSetTop(HEADER.DASHBOARD_DESKTOP_HEIGHT);
  const router = useRouter();
  const query = router.query;
  const hasConceptId = query?.conceptId;

  return (
    <header
      className={cn('sticky top-0 bg-white z-20 col-start-2 col-end-[-1] row-span-1 h-16 px-10', {
        ' shadow-sm': !hasConceptId,
      })}
      data-collapsed={isOffset}
    >
      <div
        className={cn('flex items-center h-full justify-between', {
          'flex-row-reverse': !hasConceptId,
        })}
      >
        {hasConceptId && (
          <button className="flex items-center h-full focus:outline-none" onClick={() => router.push('/concepts')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.8333 9.16659H7.5L10.2417 6.42493C10.3198 6.34746 10.3818 6.25529 10.4241 6.15374C10.4664 6.05219 10.4882 5.94327 10.4882 5.83326C10.4882 5.72325 10.4664 5.61433 10.4241 5.51278C10.3818 5.41123 10.3198 5.31906 10.2417 5.24159C10.0855 5.08639 9.87432 4.99927 9.65417 4.99927C9.43401 4.99927 9.2228 5.08639 9.06667 5.24159L5.49167 8.82492C5.17868 9.13605 5.00186 9.55861 5 9.99992C5.00406 10.4383 5.1807 10.8575 5.49167 11.1666L9.06667 14.7499C9.14437 14.8271 9.2365 14.8882 9.33781 14.9297C9.43912 14.9712 9.54762 14.9924 9.65711 14.992C9.76661 14.9917 9.87496 14.9697 9.97597 14.9274C10.077 14.8852 10.1687 14.8234 10.2458 14.7457C10.323 14.6681 10.3841 14.5759 10.4256 14.4746C10.4672 14.3733 10.4883 14.2648 10.488 14.1553C10.4876 14.0458 10.4656 13.9375 10.4234 13.8364C10.3811 13.7354 10.3194 13.6437 10.2417 13.5666L7.5 10.8333H15.8333C16.0543 10.8333 16.2663 10.7455 16.4226 10.5892C16.5789 10.4329 16.6667 10.2209 16.6667 9.99992C16.6667 9.77891 16.5789 9.56695 16.4226 9.41067C16.2663 9.25439 16.0543 9.16659 15.8333 9.16659Z"
                fill="#454F5B"
              />
            </svg>
            <p className="gap-1 text-xs font-bold">VOLVER</p>
          </button>
        )}
        <AccountPopover />
      </div>
    </header>
  );
}
