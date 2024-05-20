import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '~/lib/cn';
import { getChildrenByType } from 'react-nanny';

interface TabsProps extends React.PropsWithChildren<TabsPrimitive.TabsProps> {
  hideTabs?: boolean;
}

const Tabs = ({ children, className, onValueChange, value, hideTabs, ...props }: TabsProps) => {
  const tabs = getChildrenByType(children, ['TabsTrigger']) as React.ReactElement[];
  const content = getChildrenByType(children, ['TabsContent']);
  const [activeTab, setActiveTab] = React.useState(value);
  const [sliderStyles, setSliderStyles] = React.useState<React.CSSProperties>({
    width: 0,
    transform: 'translate(0px)',
  });

  function calculateStyles() {
    const element =
      typeof window !== 'undefined' ? (document?.querySelector("button[data-state='active']") as HTMLElement) : null;

    setSliderStyles({
      width: `${element?.clientWidth ?? 0}px`,
      transform: `translate(${element?.offsetLeft ?? 0}px)`,
    });
  }

  React.useEffect(() => {
    calculateStyles();
    window.addEventListener('resize', calculateStyles);

    return () => window.removeEventListener('resize', calculateStyles);
  }, [activeTab]);

  React.useEffect(() => {
    if (value !== activeTab) setActiveTab(value);
  }, [value, activeTab]);

  return (
    <TabsPrimitive.Root
      className="w-full"
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        onValueChange && onValueChange(value);
      }}
      {...props}
    >
      {!hideTabs && (
        <TabsPrimitive.List className={cn('inline-flex items-center justify-center relative gap-2', className)}>
          {tabs}
          <span
            className="absolute -bottom-[1px] h-0.5 bg-[#4A5CFF] left-0 transition-[transform,width] ease-in-out"
            style={sliderStyles}
          />
        </TabsPrimitive.List>
      )}
      {content}
    </TabsPrimitive.Root>
  );
};

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { __TYPE?: string }
>(({ className, __TYPE, ...props }, ref) => (
  <TabsPrimitive.Trigger
    className={cn(
      'bg-transparent border-none cursor-pointer inline-flex min-w-[100px] items-center justify-center rounded-[0.185rem] px-1 py-1.5  text-sm font-medium text-[#00000099] transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-[#4A5CFF]',
      className
    )}
    {...props}
    ref={ref}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
TabsTrigger.defaultProps = {
  __TYPE: 'TabsTrigger',
};

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & { __TYPE?: string }
>(({ className, __TYPE, ...props }, ref) => (
  <TabsPrimitive.Content className={cn('mt-6', className)} {...props} ref={ref} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
TabsContent.defaultProps = {
  __TYPE: 'TabsContent',
};

export { Tabs, TabsTrigger, TabsContent };
