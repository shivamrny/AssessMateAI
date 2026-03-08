import { ReactNode } from 'react';
import Sidebar from '@/components/AppSidebar';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar />
      <main className="flex-1 p-6 bg-background overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
