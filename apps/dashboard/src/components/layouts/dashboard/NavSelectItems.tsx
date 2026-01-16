import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Tooltip } from '/src/components/atoms/Tooltip';
import React from 'react';
import { cn } from '/src/utils/cn';
import { useRouter } from 'next/router';
import { NavItem } from '../../nav-section/vertical/types';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface NavSelectItemsProps {
  isCollapse: boolean;
  openItemModal: boolean;
  setOpenItemModal: React.Dispatch<React.SetStateAction<boolean>>;
  itemStyles: {
    checked: string;
    normal: string;
  };
}

interface ListProps {
  text: string;
  path: string;
}

const ListItem = ({ text, path }: ListProps) => (
  <Link href={path}>
    <div className="pl-3 h-[36px] cursor-pointer hover:font-semibold text-xs hover:bg-[#00AB5514] hover:text-[#00AB55] rounded-lg">
      <div className="flex flex-row items-center">
        <div className="mr-[10px] ml-3 py-[15px]">
          <div className="w-[6px] h-[6px] bg-[#A2ABB9] hover:bg-[#00AB55] rounded-full" />
        </div>
        <span className="py-2 pr-3 w-full">{text}</span>
      </div>
    </div>
  </Link>
);

const SimpleListItem = ({ text, path }: ListProps) => (
  <Link href={path}>
    <div className="flex flex-row items-center gap-2 px-3 h-[36px] cursor-pointer hover:font-semibold text-sm hover:bg-[#00AB5514] hover:text-[#00AB55] rounded-lg">
      <span>{text}</span>
    </div>
  </Link>
);

const NavSelectItems: React.FC<NavSelectItemsProps & { item: NavItem }> = ({
  isCollapse,
  openItemModal,
  setOpenItemModal,
  itemStyles,
  item,
}: NavSelectItemsProps & { item: NavItem }) => {
  const router = useRouter();
  const isActive = (item: { path: string }) => router.pathname.includes(item.path);

  return !isCollapse ? (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger
          className={cn({
            [itemStyles.checked]: isActive(item),
          })}
        >
          <div className="flex items-center gap-3 font-medium">
            <div className="flex flex-shrink-0 w-[16px] h-[16px] hover:text-[#00AB55] transition-all">{item.icon}</div>

            <div className="flex flex-grow">
              <p className="" data-testid={`${item.title}-link`}>
                {item.title}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {item.children?.map((child, index) => (
            <ListItem key={index} text={child.title} path={child.path} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ) : (
    <div
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === 'Space') {
          event.preventDefault();
          setOpenItemModal(!openItemModal);
        }
      }}
      className={cn(itemStyles.normal, 'transition-all whitespace-nowrap', {
        [itemStyles.checked]: isActive(item),
        'justify-center px-0 gap-0': isCollapse,
      })}
      onClick={() => setOpenItemModal(!openItemModal)}
    >
      {isCollapse && openItemModal && (
        <div className="absolute bg-white border left-20 top-80 border-[#E4EBF6] shadow-conceptButton w-[222px] p-[10px] rounded-md z-50 transition-all duration-300 ease-in-out">
          {item.children?.map((child, index) => (
            <SimpleListItem key={index} text={child.title} path={child.path} />
          ))}
        </div>
      )}
      <Tooltip key={item.path} message={item.title} disableHover={!isCollapse}>
        <div className="flex flex-shrink-0 w-[16px] h-[16px]">{item.icon}</div>
      </Tooltip>
    </div>
  );
};
export default NavSelectItems;

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => <AccordionPrimitive.Item ref={ref} className={cn('', className)} {...props} />);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between h-[40px] text-sm text-[#454D64] hover:bg-[#00AB5514] hover:text-[#00AB55] rounded-lg transition-all [&[data-state=open]>svg]:rotate-180 px-3',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
