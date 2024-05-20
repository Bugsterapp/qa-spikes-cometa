import * as RadixTabs from '@radix-ui/react-tabs';
import React, { useEffect, useRef, useState } from 'react';

export const Tab = React.forwardRef<HTMLDivElement, RadixTabs.TabsContentProps>((props, ref) => (
  <RadixTabs.Content {...props} ref={ref}>
    {props.children}
  </RadixTabs.Content>
));
export const TabTrigger = React.forwardRef<HTMLButtonElement, RadixTabs.TabsTriggerProps>((props, ref) => (
  <RadixTabs.Trigger
    {...props}
    ref={ref}
    className="py-5 bg-transparent border-b-4 border-transparent text-lg data-state-active:text-[#00AB55] font-semibold text-[#637381] relative disabled:cursor-not-allowed disabled:opacity-50"
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

export const TabList = React.forwardRef<HTMLDivElement, RadixTabs.TabsListProps>((props, ref) => (
  <RadixTabs.List
    {...props}
    ref={ref}
    className="bg-white pl-12 pr-7 flex gap-5 border-b-2 border-[#919EAB3D]/24 pt-2 relative"
  >
    {props.children}
  </RadixTabs.List>
));

export const TabsWrapper = ({
  tabs,
  tab,
  handleChangeTab,
  button,
  children,
}: {
  tabs: { value: string; label: string }[];
  tab: string;
  handleChangeTab: (value: string) => void;
  button?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);

  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    function setTabPosition() {
      const currentTab = tabsRef.current[tab];
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
      setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
    }

    setTabPosition();
    window.addEventListener('resize', setTabPosition);

    return () => window.removeEventListener('resize', setTabPosition);
  }, [tab]);
  return (
    <Tabs defaultValue="due" value={tab} onValueChange={handleChangeTab} button={button}>
      <TabList>
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-10">
            {tabs.map((tabFromMap) => (
              <TabTrigger
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
          <div>{button}</div>
        </div>
        {children}
      </TabList>
    </Tabs>
  );
};
