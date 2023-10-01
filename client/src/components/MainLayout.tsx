import React, { ReactNode } from 'react';
import { MainHeader } from './MainHeader';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="max-w-[1920px] mx-auto bg-noct-black min-h-screen">
      <MainHeader />
      {children}
    </div>
  );
}

export default MainLayout;