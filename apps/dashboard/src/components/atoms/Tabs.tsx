import * as RadixTabs from '@radix-ui/react-tabs';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export const Tab = React.forwardRef<HTMLDivElement, RadixTabs.TabsContentProps>((props, ref) => (
  <RadixTabs.Content {...props} ref={ref}>
    {props.children}
  </RadixTabs.Content>
));
export const TabTrigger = React.forwardRef<HTMLButtonElement, RadixTabs.TabsTriggerProps>((props, ref) => (
  <RadixTabs.Trigger
    {...props}
    ref={ref}
    data-testid={`${props.value}-tab`}
    className="py-4 bg-transparent border-b-4 border-transparent text-base data-state-active:text-[#00AB55] font-semibold text-[#637381] relative disabled:cursor-not-allowed disabled:opacity-50"
  >
    {props.children}
  </RadixTabs.Trigger>
));
export const Tabs = React.forwardRef<HTMLDivElement, RadixTabs.TabsProps & { button?: React.ReactNode }>(
  (props, ref) => (
    <RadixTabs.Root {...props} ref={ref}>
      {props.children}
    </RadixTabs.Root>
  )
);
interface ExtendedTabsListProps extends RadixTabs.TabsListProps {
  tabsListClassName?: string;
}

export const TabList = React.forwardRef<HTMLDivElement, ExtendedTabsListProps>(
  ({ tabsListClassName, ...props }, ref) => (
    <RadixTabs.List
      {...props}
      ref={ref}
      className={cn('bg-white pl-12 pr-7 flex gap-5 border-b-2 border-[#919EAB3D]/24 pt-2 relative', tabsListClassName)}
    >
      {props.children}
    </RadixTabs.List>
  )
);

export const TabsWrapper = ({
  tabs,
  tab,
  handleChangeTab,
  defaultValue,
  button,
  children,
  showShadow,
  tabsListClassName,
}: {
  tabs: { value: string; label: string }[];
  tab: string;
  showShadow?: boolean;
  tabsListClassName?: string;
  handleChangeTab: (value: string) => void;
  defaultValue: string;
  button?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabsLabels = tabs.map((tab) => tab.label).join();

  const setTabPosition = useCallback(() => {
    const currentTab = tabsRef.current[tab];
    setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
    setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
  }, [tab, tabsLabels]);

  useEffect(() => {
    setTabPosition();
    window.addEventListener('resize', setTabPosition);

    return () => window.removeEventListener('resize', setTabPosition);
  }, [setTabPosition]);
  return (
    <Tabs
      value={tab}
      defaultValue={defaultValue}
      onValueChange={handleChangeTab}
      button={button}
      className={cn({
        'shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12),_0px_0px_2px_0px_rgba(145,158,171,0.2)]': showShadow,
      })}
    >
      <TabList tabsListClassName={tabsListClassName}>
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-10">
            {tabs.map((tabFromMap) => (
              <TabTrigger
                id={tabFromMap.value + '-tab'}
                key={tabFromMap.value}
                value={tabFromMap.value}
                ref={(el) => (tabsRef.current[tabFromMap.value] = el)}
              >
                {tabFromMap.label}
              </TabTrigger>
            ))}
            <span
              className="absolute bottom-0 block h-1 bg-[#00AB55] transition-all duration-200 rounded-t-2xl"
              style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
            />
          </div>
          <button>{button}</button>
        </div>
        {children}
      </TabList>
    </Tabs>
  );
};

import { cn } from '/src/utils/cn';

export function useTab(initialTab: string) {
  const [tab, setTab] = useState(initialTab);

  const handleChangeTab = (value: string) => {
    setTab(value);
  };

  return { tab, handleChangeTab };
}
