import React, { ReactNode } from 'react';
import { Sidebar } from '../ui/Sidebar';
import { TopBar } from '../ui/TopBar';

/**
 * @component AppLayout
 * @description Main layout with sidebar navigation for the ChargeCars app
 * @example
 * <AppLayout>
 *   <YourPageContent />
 * </AppLayout>
 */

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className = "" }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar />
        
        {/* Page Content */}
        <main className={`flex-1 overflow-auto bg-content1 ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
} 