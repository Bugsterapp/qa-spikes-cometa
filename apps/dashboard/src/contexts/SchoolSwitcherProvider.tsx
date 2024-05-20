import { createContext, useState, Dispatch, SetStateAction } from 'react';

interface SchoolSwitcherType {
  selectedCounter: number;
  setSelectedCounter: Dispatch<SetStateAction<number>>;
}

const SchoolSwitcherDefaultState: SchoolSwitcherType = {
  selectedCounter: 0,
  setSelectedCounter: (): void => {
    // default state
  },
};

export const SchoolSwitcherContext = createContext<SchoolSwitcherType>(SchoolSwitcherDefaultState);

const SchoolSwitcherContextProvider: React.FC<any> = ({ children }: any) => {
  const [selectedCounter, setSelectedCounter] = useState<number>(0);

  return (
    <SchoolSwitcherContext.Provider
      value={{
        selectedCounter,
        setSelectedCounter,
      }}
    >
      {children}
    </SchoolSwitcherContext.Provider>
  );
};

export default SchoolSwitcherContextProvider;
