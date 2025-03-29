
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CalendarIcon, ChevronLeft, ChevronRight, ExternalLink, FileText, Home, LogOut, PlusCircle, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
  isCollapsed: boolean;
}

function SidebarItem({ to, icon: Icon, label, active, onClick, isCollapsed }: SidebarItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent",
        active ? "bg-accent" : "transparent",
        isCollapsed ? "justify-center" : ""
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
      {!isCollapsed && <span className={active ? "font-medium" : ""}>{label}</span>}
    </Link>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems = [
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/meetings/create", icon: PlusCircle, label: "Create Meeting" },
    { to: "/meetings", icon: CalendarIcon, label: "My Meetings" },
    { to: "/tasks", icon: FileText, label: "My Tasks" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white border-r flex flex-col transition-all duration-300 h-screen sticky top-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 p-4 gap-2",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <div className="flex-shrink-0 rounded-full bg-primary h-8 w-8 flex items-center justify-center">
            <span className="text-white font-semibold">SM</span>
          </div>
          {!isCollapsed && <span className="font-semibold text-lg">SmartMinutes</span>}
        </div>
        <Separator />

        {/* Nav Items */}
        <div className="flex-1 py-4 px-2">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>
        </div>
        
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex justify-center p-2"
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        {/* User section */}
        <Separator />
        <div className={cn(
          "p-4 flex gap-3 items-center",
          isCollapsed ? "flex-col" : ""
        )}>
          <div className="flex-shrink-0 rounded-full bg-secondary h-8 w-8 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className={cn(
              "flex-shrink-0",
              isCollapsed ? "" : "-mr-2"
            )}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
