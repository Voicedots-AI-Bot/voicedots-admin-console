import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientsApi, type ClientListItem } from '@/lib/clientsApi';
import { 
    Search, Plus, Users, UserCheck, Crown, Star,
    X, Copy, Check, CheckCircle2, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatPrice } from '@/lib/utils';

export const ClientsListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [clients, setClients] = useState<ClientListItem[]>([]);
    const [filteredClients, setFilteredClients] = useState<ClientListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchClients();
        if (location.state?.success) {
            setNotification({ type: 'success', message: location.state.success });
            window.history.replaceState({}, document.title);
            setTimeout(() => setNotification(null), 5000);
        }
    }, [location]);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredClients(clients);
            return;
        }
        const q = searchQuery.toLowerCase();
        setFilteredClients(
            clients.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.agent_id.toLowerCase().includes(q)
            )
        );
    }, [searchQuery, clients]);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const data = await clientsApi.getClients();
            setClients(data);
            setFilteredClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (e: React.MouseEvent, agentId: string) => {
        e.stopPropagation();
        try {
            const res = await clientsApi.toggleStatus(agentId);
            setClients(prev =>
                prev.map(c => c.agent_id === agentId ? { ...c, status: res.status } : c)
            );
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleCopyAgentId = (e: React.MouseEvent, agentId: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(agentId);
        setCopiedId(agentId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const stats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'Active').length,
        free: clients.filter(c => c.plan === 'Free').length,
        paid: clients.filter(c => c.plan !== 'Free').length,
    };

    const planColors: Record<string, string> = {
        Free: 'bg-secondary text-muted-foreground',
        Starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        Pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        Enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };

    return (
        <div className="space-y-6">
            {notification && (
                <div className={cn(
                    "fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-8 duration-300",
                    notification.type === 'success' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                )}>
                    {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="text-sm font-medium">{notification.message}</p>
                    <button onClick={() => setNotification(null)} className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your VoiceDots clients and subscriptions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-input rounded-xl bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/clients/add')}
                        className="inline-flex items-center justify-center rounded-xl bg-primary py-2.5 px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Client
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Clients', value: stats.total, icon: Users, color: 'text-primary' },
                    { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-green-500' },
                    { label: 'Free Plan', value: stats.free, icon: Star, color: 'text-muted-foreground' },
                    { label: 'Paid Plans', value: stats.paid, icon: Crown, color: 'text-amber-500' },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                        </div>
                        <p className="text-2xl font-bold mt-2">{isLoading ? '-' : stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Client List */}
            <div className="space-y-4">
                {/* Desktop View */}
                <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Client</th>
                                    <th className="px-6 py-4 font-medium">Agent ID</th>
                                    <th className="px-6 py-4 font-medium">Plan</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Created</th>
                                    <th className="px-6 py-4 font-medium text-right">Est. Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            {searchQuery ? 'No clients match your search.' : 'No clients yet. Create your first client to get started.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr
                                            key={client.agent_id}
                                            onClick={() => navigate(`/clients/${client.agent_id}`)}
                                            className="hover:bg-secondary/20 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {client.profile_picture ? (
                                                        <img src={client.profile_picture} alt={client.name}
                                                            className="h-9 w-9 rounded-full object-cover ring-2 ring-border" />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-primary/20">
                                                            {getInitials(client.name)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-foreground truncate">{client.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <code className="text-[10px] bg-secondary px-2 py-0.5 rounded-md font-mono truncate max-w-[120px]" title={client.agent_id}>
                                                        {client.agent_id}
                                                    </code>
                                                    <button
                                                        onClick={(e) => handleCopyAgentId(e, client.agent_id)}
                                                        className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0"
                                                        title="Copy Agent ID"
                                                    >
                                                        {copiedId === client.agent_id ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                                                    planColors[client.plan] || planColors.Free
                                                )}>
                                                    {client.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => handleToggleStatus(e, client.agent_id)}
                                                    className={cn(
                                                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors",
                                                        client.status === 'Active'
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                                                            : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                                                    )}
                                                >
                                                    {client.status}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap text-xs">
                                                {format(new Date(client.created_at), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-mono text-xs font-medium">
                                                    {formatPrice(client.estimated_cost)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {isLoading ? (
                        <div className="flex justify-center p-12 bg-card rounded-2xl border border-border">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border text-sm">
                            No clients found.
                        </div>
                    ) : (
                        filteredClients.map((client) => (
                            <div
                                key={client.agent_id}
                                onClick={() => navigate(`/clients/${client.agent_id}`)}
                                className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-4 hover:border-primary/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {client.profile_picture ? (
                                            <img src={client.profile_picture} alt={client.name}
                                                className="h-10 w-10 rounded-full object-cover ring-2 ring-border" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary ring-2 ring-primary/20">
                                                {getInitials(client.name)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-foreground">{client.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{client.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(e, client.agent_id); }}
                                        className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight transition-colors",
                                            client.status === 'Active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        )}
                                    >
                                        {client.status}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Plan</p>
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold mt-1",
                                            planColors[client.plan] || planColors.Free
                                        )}>
                                            {client.plan}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Est. Cost</p>
                                        <p className="text-[13px] font-mono font-bold mt-1">{formatPrice(client.estimated_cost)}</p>
                                    </div>
                                </div>

                                {/* Progress Bar in List */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                        <span>Usage</span>
                                        <span>{client.duration_hours.toFixed(1)} / {client.total_duration_limit.toFixed(0)} hrs</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className={cn(
                                                "h-full transition-all duration-1000",
                                                (client.duration_hours / client.total_duration_limit) > 0.9 ? "bg-destructive" : "bg-primary"
                                            )}
                                            style={{ width: `${Math.min(100, (client.duration_hours / client.total_duration_limit) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <code className="text-[10px] bg-secondary px-2 py-0.5 rounded-md font-mono truncate max-w-[140px]" title={client.agent_id}>
                                            {client.agent_id}
                                        </code>
                                        <button
                                            onClick={(e) => handleCopyAgentId(e, client.agent_id)}
                                            className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0"
                                        >
                                            {copiedId === client.agent_id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                                        Joined {format(new Date(client.created_at), 'MMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
