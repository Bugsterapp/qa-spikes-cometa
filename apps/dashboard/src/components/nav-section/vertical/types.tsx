export interface NavSectionVerticalProps {
  navConfig: NavConfig[];
  isCollapse: boolean;
}

export interface NavConfig {
  icon: React.ReactNode;
  title: string;
  path: string;
}
