import { ReactNode } from 'react';
import { Root, Content, CollapsibleContentProps } from '@radix-ui/react-collapsible';
import { cn } from '~/lib/cn';

interface AccordionOrderDetailsProps extends CollapsibleContentProps {
  children: ReactNode;
  open: boolean;
  divider?: 'top' | 'bottom' | 'both' | 'none';
}
export const Divider = () => <hr className="border-t-0 border-b border-x-0 border-b-[#adbbcc4d]" />;
const AccordionOrderDetails = ({ open, children, divider = 'both', className }: AccordionOrderDetailsProps) => (
  <Root open={open}>
    <Content
      className={cn(
        'data-[state=open]:animate-accordion-slide-up data-[state=closed]:animate-accordion-slide-down overflow-hidden flex flex-col mb-2 max-h-fit',
        className
      )}
    >
      {['top', 'both'].includes(divider) && <Divider />}
      {children}
      {['bottom', 'both'].includes(divider) && <Divider />}
    </Content>
  </Root>
);
export default AccordionOrderDetails;
