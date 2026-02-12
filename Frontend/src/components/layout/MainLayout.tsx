import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {!hideSidebar && <Sidebar isOpen={sidebarOpen} />}
      
      <main
        className={cn(
          'min-h-[calc(100vh-4rem)] pt-16 transition-all duration-300',
          !hideSidebar && (sidebarOpen ? 'ml-60' : 'ml-[72px]')
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
