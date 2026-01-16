import React from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  value: string;
  index: string;
  [key: string]: any;
}

export const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
  >
    {value === index && <div className="pt-1 pb-5 px-2.5">{children}</div>}
  </div>
);
