'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { cn } from '~/lib/cn';

const TabsContext = React.createContext<{
  activeTab: string | undefined;
  setActiveTab: (value: string) => void;
}>({
  activeTab: undefined,
  setActiveTab: () => undefined,
});

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, defaultValue, value, onValueChange, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value ?? defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  const contextValue = React.useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return (
    <TabsContext.Provider value={contextValue}>
      <TabsPrimitive.Root
        ref={ref}
        className={cn('', className)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        {...props}
      />
    </TabsContext.Provider>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const { activeTab } = React.useContext(TabsContext);
  const [activeRect, setActiveRect] = React.useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && 'current' in ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  React.useLayoutEffect(() => {
    if (listRef.current) {
      // Use a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const activeElement = listRef.current?.querySelector(`[data-state="active"]`);
        if (activeElement) {
          const rect = activeElement.getBoundingClientRect();
          const listRect = listRef.current!.getBoundingClientRect();
          setActiveRect({
            left: rect.left - listRect.left,
            top: rect.top - listRect.top,
            width: rect.width,
            height: rect.height,
          });
          setIsInitialized(true);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  return (
    <TabsPrimitive.List
      ref={combinedRef}
      className={cn('relative flex items-center rounded-[50px] bg-white p-[4px] gap-[4px]', className)}
      {...props}
    >
      {activeRect && isInitialized && (
        <motion.div
          className="absolute bg-[#22283a] rounded-[48px] shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)]"
          initial={false}
          animate={{
            left: activeRect.left,
            top: activeRect.top,
            width: activeRect.width,
            height: activeRect.height,
          }}
          transition={{
            type: 'spring',
            duration: 0.5,
            bounce: 0.25,
            stiffness: 130,
            damping: 15,
          }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  value: string;
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, children, value, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <TabsPrimitive.Trigger
        ref={ref}
        value={value}
        className={cn(
          'relative inline-flex items-center justify-center whitespace-nowrap rounded-[48px] px-3 py-1 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1',
          'text-[#9197af] data-[state=active]:text-white z-10',
          // Show background only on first render for active tab
          !mounted &&
            'data-[state=active]:bg-[#22283a] data-[state=active]:shadow-[0px_0px_2px_0px_rgba(145,158,171,0.2),0px_12px_24px_-4px_rgba(145,158,171,0.12)]',
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </TabsPrimitive.Trigger>
    );
  }
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
