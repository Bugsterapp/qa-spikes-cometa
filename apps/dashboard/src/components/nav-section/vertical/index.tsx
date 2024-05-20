import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';
import { NavSectionVerticalProps } from './types';

const itemStyles = {
  unToggle:
    'bg-[#00AB5514] text-[#00AB55] font-semibold text-[14px] h-[50px] rounded-xl flex items-center px-5 flex-row gap-4 cursor-pointer transition-all duration-100 ease-in-out active:bg-[#00AB5514] active:text-[#00AB55] ',
  toggle:
    'text-[14px] hover:bg-[#F4F6F8] text-[#637381] h-[50px] rounded-xl flex items-center px-5 flex-row gap-4 cursor-pointer transition-all duration-100 ease-in-out ',
};

const NavSectionVertical = ({ navConfig, isCollapse }: NavSectionVerticalProps) => {
  const router = useRouter();
  const checked = (item: { path: string }) => item.path === router.pathname;

  return (
    <div className="mb-2 space-y-2 z-10">
      {navConfig.map((item) => (
        <div key={item.title}>
          {item.title === 'Conceptos' && (
            <p className={`font-bold text-xs pl-6 py-4 pr-2 flex ${isCollapse ? 'justify-center' : ''}`}>
              {isCollapse ? 'ADMIN' : 'ADMINISTRACIÓN'}
            </p>
          )}
          <Link
            key={item.path}
            href={item.path}
            scroll
            className={twMerge(
              checked(item) ? itemStyles.unToggle : itemStyles.toggle,
              'transition-all whitespace-nowrap'
            )}
          >
            <div className="w-6 h-6 min-w-[24px]">{item.icon}</div>

            <div className="flex">
              <p
                className={`${
                  isCollapse ? 'scale-x-95 opacity-0' : 'scale-x-100 opacity-100'
                } transition-transform origin-left`}
                data-testid={`${item.title}-link`}
              >
                {item.title}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default NavSectionVertical;
