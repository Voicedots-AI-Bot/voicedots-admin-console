import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientsApi, type ClientDetail } from '@/lib/clientsApi';
import {
    ArrowLeft, Copy, Check, Loader2, Trash2,
    Edit2, X, Eye, EyeOff, Key, Clock,
    Cpu, MessageCircle, Mic, Volume2, DollarSign, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatPrice } from '@/lib/utils';

type Tab = 'subscription' | 'usage' | 'billing';

export const ClientDetailPage = () => {
    const { agentId } = useParams<{ agentId: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<ClientDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('usage');
    const [copiedId, setCopiedId] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditSub, setShowEditSub] = useState(false);
    const [showResetPw, setShowResetPw] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (agentId) fetchClient();
    }, [agentId]);

    const fetchClient = async () => {
        setIsLoading(true);
        try {
            const data = await clientsApi.getClientDetail(agentId!);
            setClient(data);
        } catch (error) {
            console.error('Error fetching client:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(agentId!);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleToggleStatus = async () => {
        if (!client) return;
        try {
            const res = await clientsApi.toggleStatus(client.agent_id);
            setClient({ ...client, status: res.status });
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleDelete = async () => {
        if (!client) return;
        setIsDeleting(true);
        try {
            await clientsApi.deleteClient(client.agent_id);
            navigate('/clients');
        } catch (error) {
            console.error('Error deleting client:', error);
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-64 items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm font-medium">Loading client...</p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">Client not found.</p>
                <Link to="/clients" className="text-primary hover:underline mt-2 inline-block text-sm">← Back to Clients</Link>
            </div>
        );
    }

    const getInitials = (name: string) =>
        name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const billingItems = [
        { label: 'LLM Input', tokens: client.llm_input_tokens, rate: client.llm_input_charges, icon: Cpu },
        { label: 'LLM Output', tokens: client.llm_output_tokens, rate: client.llm_output_charges, icon: MessageCircle },
        { label: 'STT', tokens: client.duration_hours, rate: client.stt_charges, icon: Mic },
        { label: 'TTS', tokens: client.tts_characters, rate: client.tts_charges, icon: Volume2 },
    ];

    const tabs: { key: Tab; label: string }[] = [
        { key: 'usage', label: 'Usage' },
        { key: 'subscription', label: 'Subscription' },
        { key: 'billing', label: 'Billing' },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/clients" className="p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                    <p className="text-xs text-muted-foreground mt-1">Client details and subscription management</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                {/* ──── Left Panel: Profile Card ──── */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden relative">
                        {/* Decorative */}
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

                        <div className="p-6 flex flex-col items-center text-center relative z-10">
                            {client.profile_picture ? (
                                <img src={client.profile_picture} alt={client.name}
                                    className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20 mb-4" />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary ring-4 ring-primary/20 mb-4">
                                    {getInitials(client.name)}
                                </div>
                            )}

                            <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
                            <p className="text-sm text-muted-foreground">{client.email}</p>

                            <div className="flex items-center gap-1.5 mt-3 max-w-full">
                                <code className="text-[10px] bg-secondary px-2.5 py-1 rounded-md font-mono truncate max-w-[180px] sm:max-w-full" title={client.agent_id}>
                                    {client.agent_id}
                                </code>
                                <button onClick={handleCopy} className="p-1 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0" title="Copy Agent ID">
                                    {copiedId ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                    client.status === 'Active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                )}>
                                    {client.status}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {client.plan}
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-4 mb-3 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                Joined {format(new Date(client.created_at), 'MMM dd, yyyy')}
                            </p>

                            {/* Duration Progress Bar */}
                            <div className="w-full px-2 py-3 bg-secondary/20 rounded-xl space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <span>Plan Usage</span>
                                    <span>{client.duration_hours.toFixed(1)} / {client.total_duration_limit.toFixed(0)} hrs</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full transition-all duration-1000",
                                            (client.duration_hours / client.total_duration_limit) > 0.9 ? "bg-destructive" : "bg-primary"
                                        )}
                                        style={{ width: `${Math.min(100, (client.duration_hours / client.total_duration_limit) * 100)}%` }}
                                    />
                                </div>
                                {(client.duration_hours / client.total_duration_limit) >= 1 && (
                                    <p className="text-[10px] text-destructive font-bold animate-pulse">
                                        LIMIT REACHED - PAUSED
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-border px-4 py-3 flex flex-col gap-2">
                            <button
                                onClick={() => setShowEditSub(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                <Edit2 className="h-3.5 w-3.5" /> Edit Subscription
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                <Activity className="h-3.5 w-3.5" /> Toggle Status
                            </button>
                            <button
                                onClick={() => setShowResetPw(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                <Key className="h-3.5 w-3.5" /> Reset Password
                            </button>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" /> Delete Client
                    </button>
                </div>

                {/* ──── Right Panel: Tabs ──── */}
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    {/* Tab Headers */}
                    <div className="flex border-b border-border bg-secondary/30">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    "px-6 py-3.5 text-sm font-medium transition-colors relative",
                                    activeTab === tab.key
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* ─── Subscription Tab ─── */}
                        {activeTab === 'subscription' && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                    Subscription Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Plan', value: client.plan },
                                        { label: 'Status', value: client.status },
                                        { label: 'LLM Input Rate', value: `$${client.llm_input_charges.toFixed(4)}/1M tokens` },
                                        { label: 'LLM Output Rate', value: `$${client.llm_output_charges.toFixed(4)}/1M tokens` },
                                        { label: 'STT Rate', value: `₹${client.stt_charges.toFixed(4)}/hr` },
                                        { label: 'TTS Rate', value: `₹${client.tts_charges.toFixed(4)}/char` },
                                        { label: 'Auxiliary Charges', value: `₹${client.auxiliary_charges.toFixed(4)}` },
                                    ].map((item) => (
                                        <div key={item.label} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                            <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                                            <p className="text-sm font-semibold mt-1 font-mono">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── Usage Tab ─── */}
                        {activeTab === 'usage' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        Usage Statistics
                                    </h3>
                                    {client.usage_recorded_since && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Recording since {format(new Date(client.usage_recorded_since), 'MMM dd, yyyy')}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Duration', value: `${client.duration_hours.toFixed(2)} hrs`, icon: Clock },
                                        { label: 'STT Characters', value: client.stt_characters.toLocaleString(), icon: Mic },
                                        { label: 'LLM Input Tokens', value: client.llm_input_tokens.toLocaleString(), icon: Cpu },
                                        { label: 'LLM Output Tokens', value: client.llm_output_tokens.toLocaleString(), icon: MessageCircle },
                                        { label: 'TTS Characters', value: client.tts_characters.toLocaleString(), icon: Volume2 },
                                    ].map((stat) => (
                                        <div key={stat.label} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <stat.icon className="h-4 w-4 text-primary" />
                                                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                                            </div>
                                            <p className="text-lg font-bold font-mono">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── Billing Tab ─── */}
                        {activeTab === 'billing' && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                    Cost Breakdown
                                </h3>
                                <div className="space-y-3">
                                    {billingItems.map((item) => {
                                        const isLLM = item.label.startsWith('LLM');
                                        const isSTT = item.label === 'STT';
                                        
                                        const cost = isLLM 
                                            ? (item.tokens / 1000000) * item.rate 
                                            : item.tokens * item.rate;
                                            
                                        const unitLabel = isLLM ? '/1M tokens' : isSTT ? '/hr' : '/char';
                                        const currencySymbol = isLLM ? '$' : '₹';
                                        const tokenDisplay = isSTT ? item.tokens.toFixed(2) : item.tokens.toLocaleString();

                                        return (
                                            <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <item.icon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{item.label}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {tokenDisplay} × {currencySymbol}{item.rate.toFixed(4)}{unitLabel}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold font-mono">{formatPrice(cost)}</p>
                                            </div>
                                        );
                                    })}

                                    {/* Auxiliary */}
                                    {client.auxiliary_charges > 0 && (
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <DollarSign className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Auxiliary Charges</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold font-mono">{formatPrice(client.auxiliary_charges)}</p>
                                        </div>
                                    )}

                                    {/* Total */}
                                    <div className="flex items-center justify-between p-5 rounded-xl bg-primary/5 border border-primary/20">
                                        <p className="text-sm font-bold text-primary">Estimated Total Cost</p>
                                        <p className="text-xl font-bold font-mono text-primary">{formatPrice(client.estimated_cost)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ──── Delete Confirmation Dialog ──── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-foreground">Delete Client</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
                            All usage data and subscription will be permanently removed.
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-70 transition-colors flex items-center gap-2"
                            >
                                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──── Edit Subscription Modal ──── */}
            {showEditSub && (
                <EditSubscriptionModal
                    currentPlan={client.plan}
                    currentStatus={client.status}
                    currentLimit={client.total_duration_limit}
                    currentRates={{
                        llm_input_charges: client.llm_input_charges,
                        llm_output_charges: client.llm_output_charges,
                        stt_charges: client.stt_charges,
                        tts_charges: client.tts_charges,
                        auxiliary_charges: client.auxiliary_charges,
                    }}
                    agentId={client.agent_id}
                    onClose={() => setShowEditSub(false)}
                    onSuccess={() => { setShowEditSub(false); fetchClient(); }}
                />
            )}

            {/* ──── Reset Password Modal ──── */}
            {showResetPw && (
                <ResetPasswordModal
                    agentId={client.agent_id}
                    onClose={() => setShowResetPw(false)}
                />
            )}
        </div>
    );
};


/* ───── Edit Subscription Modal ───── */

const EditSubscriptionModal = ({
    currentPlan,
    currentStatus,
    currentLimit,
    currentRates,
    agentId,
    onClose,
    onSuccess,
}: {
    currentPlan: string;
    currentStatus: string;
    currentLimit: number;
    currentRates: {
        llm_input_charges: number;
        llm_output_charges: number;
        stt_charges: number;
        tts_charges: number;
        auxiliary_charges: number;
    };
    agentId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const [plan, setPlan] = useState(currentPlan);
    const [status, setStatus] = useState(currentStatus);
    const [limit, setLimit] = useState(currentLimit);
    const [rates, setRates] = useState(currentRates);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await clientsApi.updateSubscription(agentId, { 
                plan, 
                status, 
                total_duration_limit: limit,
                ...rates
            });
            onSuccess();
        } catch (error) {
            console.error('Error updating subscription:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">Edit Subscription</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Plan</label>
                        <select value={plan} onChange={(e) => setPlan(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
                            <option value="Free">Free</option>
                            <option value="Starter">Starter</option>
                            <option value="Pro">Pro</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}
                            className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Total Duration Limit (Hours)</label>
                        <input
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(parseFloat(e.target.value))}
                            className="mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>
                    <div className="pt-2 border-t border-border mt-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Custom Rates</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">LLM Input</label>
                                <input type="number" step="0.000000000001" value={rates.llm_input_charges} onChange={(e) => setRates({...rates, llm_input_charges: parseFloat(e.target.value)})}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">LLM Output</label>
                                <input type="number" step="0.000000000001" value={rates.llm_output_charges} onChange={(e) => setRates({...rates, llm_output_charges: parseFloat(e.target.value)})}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">STT Rate</label>
                                <input type="number" step="0.000000000001" value={rates.stt_charges} onChange={(e) => setRates({...rates, stt_charges: parseFloat(e.target.value)})}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">TTS Rate</label>
                                <input type="number" step="0.000000000001" value={rates.tts_charges} onChange={(e) => setRates({...rates, tts_charges: parseFloat(e.target.value)})}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving}
                        className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-70 transition-colors flex items-center gap-2">
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};


/* ───── Reset Password Modal ───── */

const ResetPasswordModal = ({
    agentId,
    onClose,
}: {
    agentId: string;
    onClose: () => void;
}) => {
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = async () => {
        setIsSaving(true);
        try {
            await clientsApi.resetPassword(agentId, password);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            console.error('Error resetting password:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">Reset Password</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>

                {success ? (
                    <div className="flex items-center gap-2 rounded-lg bg-green-100 dark:bg-green-900/30 p-4 text-sm text-green-800 dark:text-green-400">
                        <Check className="h-4 w-4" />
                        Password reset successfully!
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="text-sm font-medium">New Password</label>
                            <div className="relative mt-1.5">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                                    placeholder="Enter new password"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
                            <button onClick={handleReset} disabled={isSaving || !password}
                                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-70 transition-colors flex items-center gap-2">
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Reset Password
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
