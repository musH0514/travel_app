import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderActionContextValue {
  rightAction: ReactNode | null;
  setRightAction: (node: ReactNode | null) => void;
}

const HeaderActionContext = createContext<HeaderActionContextValue>({
  rightAction: null,
  setRightAction: () => {},
});

export const HeaderActionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rightAction, setRightAction] = useState<ReactNode | null>(null);

  return (
    <HeaderActionContext.Provider value={{ rightAction, setRightAction }}>
      {children}
    </HeaderActionContext.Provider>
  );
};

export const useHeaderAction = () => useContext(HeaderActionContext);
