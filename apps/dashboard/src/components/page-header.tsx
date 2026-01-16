import type { FC } from 'react';
import Header from '/src/components/molecules/dashboard/Header';
import { Button } from '@cometa/recreo/v2';

interface PageHeaderProps {
  title: string;
  action?: () => void;
  actionTitle?: string;
  children?: React.ReactNode;
}

const HeaderPage: FC<PageHeaderProps> = ({ title, action, actionTitle, children }) => (
  <div className="ml-10 ">
    <div className="flex flex-row items-center justify-between pb-3">
      <Header title={title} />
      <div className="mr-10">
        {action && (
          <Button onClick={action} data-testid="createAnnouncement-button" variant="secondary">
            {actionTitle}
          </Button>
        )}
      </div>
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);

export default HeaderPage;
