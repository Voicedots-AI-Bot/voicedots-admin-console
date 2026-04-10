import { useEffect, useState } from 'react';
import { 
    Loader2, Save, AlertCircle, CheckCircle2, 
    Plus, Trash2, Edit3, LayoutGrid, 
    Zap, Gem, Building2, UserCircle2, Clock
} from 'lucide-react';
import { settingsApi, type GlobalSettings } from '@/lib/settingsApi';
import { plansApi, type PricingPlan, type PricingPlanCreate, type PricingPlanUpdate } from '@/lib/plansApi';
import { cn, formatRate, toDecimalString } from '@/lib/utils';

export const SettingsPage = () => {
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'plans' | 'defaults'>('plans');

    // For editing/creating plans
    const [editingPlan, setEditingPlan] = useState<PricingPlan | Partial<PricingPlanCreate> | null>(null);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [settingsData, plansData] = await Promise.all([
                settingsApi.getSettings(),
                plansApi.getPlans()
            ]);
            setSettings(settingsData);
            setPlans(plansData);
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setError('Failed to load settings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveGlobal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        
        try {
            await settingsApi.updateSettings(settings);
            setSuccess('Global defaults saved successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenPlanModal = (plan?: PricingPlan) => {
        if (plan) {
            setEditingPlan({ ...plan });
        } else {
            setEditingPlan({
                name: '',
                llm_input_rate: settings?.default_llm_input_rate || 0.00000015,
                llm_output_rate: settings?.default_llm_output_rate || 0.0000006,
                stt_rate: settings?.default_stt_rate || 0.00000005,
                tts_rate: settings?.default_tts_rate || 0.00000005,
                default_duration_limit: 1,
                is_custom: true
            });
        }
        setIsPlanModalOpen(true);
    };

    const handleSavePlan = async () => {
        if (!editingPlan || !editingPlan.name) return;
        setIsSaving(true);
        setError(null);

        try {
            if ('id' in editingPlan && editingPlan.id) {
                await plansApi.updatePlan(editingPlan.id, editingPlan as PricingPlanUpdate);
            } else {
                await plansApi.createPlan(editingPlan as PricingPlanCreate);
            }
            await fetchData();
            setIsPlanModalOpen(false);
            setSuccess('Plan saved successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save plan.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePlan = async (id: number) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        setIsLoading(true);
        try {
            await plansApi.deletePlan(id);
            await fetchData();
            setSuccess('Plan deleted.');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to delete plan.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !settings) {
        return (
            <div className="flex flex-col h-64 items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm font-medium">Loading settings...</p>
            </div>
        );
    }

    const planIcon = (name: string) => {
        name = name.toLowerCase();
        if (name.includes('free')) return <UserCircle2 className="h-5 w-5 text-muted-foreground" />;
        if (name.includes('starter')) return <Zap className="h-5 w-5 text-blue-500" />;
        if (name.includes('pro')) return <Gem className="h-5 w-5 text-purple-500" />;
        return <Building2 className="h-5 w-5 text-amber-500" />;
    };

    return (
        <div className="space-y-6 lg:space-y-5 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage global defaults and pricing plans for VoiceDots.</p>
                </div>
                
                <div className="flex p-1 bg-secondary/50 rounded-xl border border-border w-fit">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'plans' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Pricing Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('defaults')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'defaults' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Global Defaults
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <p>{success}</p>
                </div>
            )}

            {activeTab === 'plans' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Standard Pricing Plans</h2>
                        <button
                            onClick={() => handleOpenPlanModal()}
                            className="inline-flex items-center justify-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 transition-colors"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Custom Plan
                        </button>
                    </div>

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div key={plan.id} className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/50 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="p-2.5 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors shadow-inner">
                                        {planIcon(plan.name)}
                                    </div>
                                    <div className="flex gap-1 items-center">
                                        <button 
                                            onClick={() => handleOpenPlanModal(plan)}
                                            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        {(plan.is_custom || !['Free', 'Starter', 'Pro', 'Enterprise'].includes(plan.name)) && (
                                            <button 
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-1">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        {plan.name}
                                        {plan.is_custom && <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-medium text-muted-foreground">CUSTOM</span>}
                                    </h3>
                                    <p className="text-sm font-medium text-primary">{plan.default_duration_limit} Hours included</p>
                                </div>

                                <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-tight">LLM In/Out</span>
                                        <span className="font-mono text-foreground">{formatRate(plan.llm_input_rate, 'USD')} / {formatRate(plan.llm_output_rate, 'USD')}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-tight">STT/TTS</span>
                                        <span className="font-mono text-foreground">{formatRate(plan.stt_rate, 'INR')} / {formatRate(plan.tts_rate, 'INR')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSaveGlobal} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Rate Controls */}
                        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 lg:p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-lg font-bold border-b border-border pb-4">
                                <LayoutGrid className="h-5 w-5 text-primary" />
                                Fallback Charge Rates
                            </div>
                            <p className="text-xs text-muted-foreground">These rates are used if a plan does not specify its own rates or for individual adjustments.</p>
                            
                            <div className="space-y-4 pt-2">
                                {[
                                    { label: 'LLM Input Rate', key: 'default_llm_input_rate', unit: '$/1M tokens' },
                                    { label: 'LLM Output Rate', key: 'default_llm_output_rate', unit: '$/1M tokens' },
                                    { label: 'STT Rate', key: 'default_stt_rate', unit: '₹/hr' },
                                    { label: 'TTS Rate', key: 'default_tts_rate', unit: '₹/char' },
                                ].map((field) => (
                                    <div key={field.key} className="space-y-1.5">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{field.label} ({field.unit})</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={toDecimalString(settings?.[field.key as keyof GlobalSettings] as number || 0)}
                                            onChange={(e) => setSettings({ ...settings!, [field.key]: parseFloat(e.target.value) || 0 })}
                                            className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Limit Controls */}
                        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 lg:p-5 shadow-sm h-fit">
                            <div className="flex items-center gap-2 text-lg font-bold border-b border-border pb-4">
                                <Clock className="h-5 w-5 text-primary" />
                                Fallback Limits
                            </div>
                            
                            <div className="space-y-1.5 pt-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Default Duration (Hours)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={settings?.default_duration_hours || 0}
                                    onChange={(e) => setSettings({ ...settings!, default_duration_hours: parseFloat(e.target.value) })}
                                    className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                />
                                <p className="text-[11px] text-muted-foreground mt-2 italic">
                                    Determines the initial credit limit for clients not assigned to a specific plan.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 rounded-xl bg-primary px-10 py-3 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-all shadow-xl shadow-primary/20 active:scale-95"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Save Global Defaults
                        </button>
                    </div>
                </form>
            )}

            {/* Plan Modal */}
            {isPlanModalOpen && editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)} />
                    <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                            <div>
                                <h2 className="text-xl font-bold">{'id' in editingPlan ? 'Edit Pricing Plan' : 'Create Custom Plan'}</h2>
                                <p className="text-xs text-muted-foreground mt-1">Configure rates and duration for clients on this plan.</p>
                            </div>
                            <button onClick={() => setIsPlanModalOpen(false)} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto no-scrollbar">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Plan Name</label>
                                <input
                                    type="text"
                                    value={editingPlan.name || ''}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                    placeholder="e.g., Growth, Advance"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">LLM Input Rate ($/1M tokens)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={toDecimalString(editingPlan.llm_input_rate || 0)}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, llm_input_rate: parseFloat(e.target.value) || 0 })}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">LLM Output Rate ($/1M tokens)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={toDecimalString(editingPlan.llm_output_rate || 0)}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, llm_output_rate: parseFloat(e.target.value) || 0 })}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">STT Rate (₹/hr)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={toDecimalString(editingPlan.stt_rate || 0)}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, stt_rate: parseFloat(e.target.value) || 0 })}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">TTS Rate (₹/char)</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={toDecimalString(editingPlan.tts_rate || 0)}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, tts_rate: parseFloat(e.target.value) || 0 })}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Default Duration (Hours)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={editingPlan.default_duration_limit || 0}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, default_duration_limit: parseFloat(e.target.value) })}
                                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-border shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsPlanModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePlan}
                                disabled={isSaving}
                                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
