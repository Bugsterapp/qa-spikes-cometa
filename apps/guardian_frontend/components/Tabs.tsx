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
  const [activeTab, setActiveTab] = React.useState(value || tabs[0]?.props?.value);
  const [sliderStyles, setSliderStyles] = React.useState<React.CSSProperties>({
    width: 0,
    transform: 'translate(0px)',
  });
  const [isMounted, setIsMounted] = React.useState(false);

  function calculateStyles() {
    if (typeof window === 'undefined') return;

    // Try to find the active button by data-state attribute
    let element = document?.querySelector("button[data-state='active']") as HTMLElement;

    // Fallback: if not found, try to find by role and value match
    if (!element && activeTab) {
      const buttons = document.querySelectorAll('button[role="tab"]');
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i] as HTMLElement;
        const value = btn.getAttribute('value') || btn.getAttribute('data-value');
        if (value === activeTab) {
          element = btn;
          break;
        }
      }
    }

    // If still not found, try first tab button as last resort
    if (!element) {
      element = document.querySelector('button[role="tab"]') as HTMLElement;
    }

    if (element && element.clientWidth > 0) {
      setSliderStyles({
        width: `${element.clientWidth}px`,
        transform: `translate(${element.offsetLeft}px)`,
      });
    }
  }

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    // Multiple attempts to calculate styles at different timings
    const timers: NodeJS.Timeout[] = [];

    // Try immediately
    calculateStyles();

    // Try with requestAnimationFrame
    requestAnimationFrame(() => {
      calculateStyles();
    });

    // Try at multiple intervals to catch different render timings
    [10, 50, 100, 200, 300, 500].forEach((delay) => {
      const timer = setTimeout(calculateStyles, delay);
      timers.push(timer);
    });

    // Add resize listener
    window.addEventListener('resize', calculateStyles);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', calculateStyles);
    };
  }, [isMounted]);

  React.useEffect(() => {
    if (!isMounted) return;

    // Recalculate when active tab changes with delay
    requestAnimationFrame(() => {
      calculateStyles();
    });
    const timer = setTimeout(calculateStyles, 50);
    return () => clearTimeout(timer);
  }, [activeTab, isMounted]);

  React.useEffect(() => {
    if (value && value !== activeTab) {
      setActiveTab(value);
    }
  }, [value]);

  return (
    <TabsPrimitive.Root
      className="w-full"
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        onValueChange && onValueChange(value);
      }}
      style={
        {
          '--slider-color': '#873aff',
        } as React.CSSProperties
      }
      {...props}
    >
      {!hideTabs && (
        <TabsPrimitive.List
          className={cn('flex items-center justify-center relative w-full', className)}
          ref={(el) => {
            if (el && isMounted) {
              // Force calculation when the list is rendered
              setTimeout(calculateStyles, 0);
            }
          }}
        >
          {tabs}

          <span
            className="absolute left-0 bottom-0 h-[3px] bg-[var(--slider-color)] transition-[transform,width] ease-in-out rounded-full"
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
      'bg-transparent border-none cursor-pointer inline-flex basis-0 grow items-center justify-center rounded-[0.185rem] px-1 py-1.5 text-sm font-normal text-[#444c60] data-[state=active]:font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-[#873aff]',
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
