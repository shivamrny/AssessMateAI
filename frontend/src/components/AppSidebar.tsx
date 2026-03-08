import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  BarChart3,
  LogOut,
  PlusCircle,
  FileText,
  Trophy,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminItems: SidebarItem[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' },
    { label: 'Manage Teachers', icon: <Users size={18} />, path: '/admin/teachers' },
    { label: 'Manage Students', icon: <GraduationCap size={18} />, path: '/admin/students' },
    { label: 'Exams Overview', icon: <ClipboardList size={18} />, path: '/admin/exams' },
    { label: 'Analytics', icon: <BarChart3 size={18} />, path: '/admin/analytics' },
  ];

  const teacherItems: SidebarItem[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/teacher-dashboard' },
    { label: 'Create Exam', icon: <PlusCircle size={18} />, path: '/teacher-dashboard/create-exam' },
    { label: 'Manage Exams', icon: <ClipboardList size={18} />, path: '/teacher-dashboard/manage-exams' },
    { label: 'Results & Analytics', icon: <BarChart3 size={18} />, path: '/teacher-dashboard/analytics' },
  ];

  const studentItems: SidebarItem[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/student-dashboard' },
    { label: 'Available Exams', icon: <FileText size={18} />, path: '/student-dashboard/exams' },
    { label: 'Past Exams', icon: <ClipboardList size={18} />, path: '/student-dashboard/past-exams' },
    { label: 'Performance Report', icon: <Trophy size={18} />, path: '/student-dashboard/performance' },
  ];

  const items =
    auth.role === 'teacher'
      ? teacherItems
      : studentItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-60 min-h-[calc(100vh-3.5rem)] bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="flex-1 py-4">
        <div className="px-4 mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {auth.role === 'teacher' ? 'Teacher Panel' : 'Student Panel'}
          </p>
        </div>
        <nav className="space-y-0.5 px-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
