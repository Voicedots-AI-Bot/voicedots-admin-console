import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi, type ClientCreateData } from '@/lib/clientsApi';
import { plansApi, type PricingPlan } from '@/lib/plansApi';
import { 
    ChevronLeft, Loader2, Eye, EyeOff, AlertCircle, 
    User, Mail, Hash, ShieldCheck, CheckCircle2, Server
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AddClientPage = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<ClientCreateData>({
        name: '',
        email: '',
        agent_id: '',
        password: '',
        plan: 'Free',
        total_duration_limit: 1,
    });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await plansApi.getPlans();
                setPlans(data);
                const freePlan = data.find(p => p.name === 'Free');
                if (freePlan) {
                    setForm(prev => ({ ...prev, total_duration_limit: freePlan.default_duration_limit }));
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
            } finally {
                setIsLoadingPlans(false);
            }
        };
        fetchPlans();
    }, []);

    const handleChange = (field: keyof ClientCreateData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handlePlanChange = (planName: string) => {
        const selectedPlan = plans.find(p => p.name === planName);
        if (selectedPlan) {
            setForm(prev => ({
                ...prev,
                plan: planName,
                total_duration_limit: selectedPlan.default_duration_limit
            }));
        } else {
            setForm(prev => ({ ...prev, plan: planName }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await clientsApi.createClient(form);
            navigate('/clients', { state: { success: 'Client created successfully!' } });
        } catch (err: any) {
            setError(err.message || 'Failed to create client. Please check the details and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/clients')}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Clients
                </button>
            </div>

            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
                <p className="text-muted-foreground">Configure a new VoiceDots client account and subscription.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Client Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4">
                            <User className="h-5 w-5 text-primary" />
                            Client Information
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Agent ID
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        required
                                        value={form.agent_id}
                                        onChange={(e) => handleChange('agent_id', e.target.value)}
                                        className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                        placeholder="agent_unique_001"
                                    />
                                </div>
                                <p className="text-[11px] text-muted-foreground">Unique identifier used for API authentication.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={form.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-lg font-semibold border-b border-border pb-4">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Plan Configuration
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium leading-none">Select Subscription Plan</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {isLoadingPlans ? (
                                        <div className="flex items-center justify-center p-8 bg-secondary/20 rounded-xl border border-dashed border-border">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        plans.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handlePlanChange(p.name)}
                                                className={cn(
                                                    "flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left",
                                                    form.plan === p.name 
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                                        : "border-secondary bg-background hover:border-border"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                                        form.plan === p.name ? "border-primary" : "border-muted-foreground/30"
                                                    )}>
                                                        {form.plan === p.name && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{p.name}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                                            {p.default_duration_limit} Hours included
                                                        </p>
                                                    </div>
                                                </div>
                                                {form.plan === p.name && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Custom Duration Limit (Hours)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.1"
                                        value={form.total_duration_limit}
                                        onChange={(e) => handleChange('total_duration_limit', parseFloat(e.target.value))}
                                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
                                    />
                                    <p className="text-[11px] text-muted-foreground">Adjust the usage limit for this specific client.</p>
                                </div>

                                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Plan Summary</p>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Plan Type</span>
                                            <span className="font-semibold">{form.plan}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Default Rate</span>
                                            <span className="font-semibold">Standard</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Sticky Actions */}
                <div className="space-y-6">
                    <div className="sticky top-6 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                        <div className="space-y-1">
                            <h3 className="font-bold">Next Steps</h3>
                            <p className="text-sm text-muted-foreground">Review carefully before creating.</p>
                        </div>
                        
                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Create Client
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/clients')}
                                className="w-full h-11 rounded-xl border border-border bg-background text-sm font-medium hover:bg-secondary transition-all"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="pt-6 border-t border-border mt-6">
                            <div className="flex gap-3 text-xs text-muted-foreground">
                                <Server className="h-4 w-4 shrink-0" />
                                <p>This will allocate resources and create a unique database entry for the client.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
