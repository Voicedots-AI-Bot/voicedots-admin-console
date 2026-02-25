import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard,
    FileText,
    MessageSquare,
    LogOut,
    Menu,
    X,
    UserCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

export const AdminLayout = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', to: '/', icon: LayoutDashboard },
        { name: 'Blogs', to: '/blogs', icon: FileText },
        { name: 'Messages', to: '/messages', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "w-20" : "w-64"
            )}>
                <div className="h-full flex flex-col relative">
                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex absolute -right-3 top-6 h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground shadow-sm z-50 transition-transform"
                    >
                        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                    </button>

                    <div className={cn("h-16 flex items-center border-b border-border transition-all", isCollapsed ? "justify-center px-0" : "px-6 gap-3")}>
                        <img src="/voicedotslogo.svg" alt="Voicedots" className={cn("h-7 w-auto mix-blend-difference invert dark:mix-blend-normal dark:invert-0 transition-all", isCollapsed ? "h-6" : "")} />
                        {!isCollapsed && (
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
                                Admin
                            </h1>
                        )}
                        <button
                            className="ml-auto lg:hidden mr-4"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.to}
                                title={isCollapsed ? item.name : undefined}
                                className={({ isActive }) => cn(
                                    "flex items-center rounded-lg text-sm font-medium transition-colors",
                                    isCollapsed ? "justify-center py-3 px-0" : "px-3 py-2.5",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("flex-shrink-0 transition-all", isCollapsed ? "h-6 w-6" : "h-5 w-5 mr-3")} />
                                {!isCollapsed && <span className="truncate">{item.name}</span>}
                            </NavLink>
                        ))}
                    </nav>

                    <div className={cn("absolute bottom-0 w-full border-t border-border bg-card", isCollapsed ? "p-3" : "p-4")}>
                        <div className={cn("flex items-center rounded-lg bg-secondary/50", isCollapsed ? "justify-center p-2 flex-col gap-3" : "gap-3 px-3 py-2")}>
                            <UserCircle className={cn("text-primary flex-shrink-0", isCollapsed ? "h-7 w-7" : "h-8 w-8")} />
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {user?.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">Administrator</p>
                                </div>
                            )}
                            <div className={isCollapsed ? "" : "flex-shrink-0"}>
                                <ThemeToggle />
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            title={isCollapsed ? "Sign Out" : undefined}
                            className={cn(
                                "flex items-center rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
                                isCollapsed ? "justify-center mt-3 p-2 w-full" : "mt-4 w-full gap-3 px-3 py-2.5"
                            )}
                        >
                            <LogOut className={isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3 flex-shrink-0"} />
                            {!isCollapsed && "Sign Out"}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:hidden">
                    <div className="flex items-center">
                        <button
                            className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-semibold text-foreground">Admin Portal</span>
                    </div>
                    <ThemeToggle />
                </header>

                {/* Main Area */}
                <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
