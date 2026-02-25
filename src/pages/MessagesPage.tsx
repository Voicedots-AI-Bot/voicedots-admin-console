import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Search, Info, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    created_at: string;
}

export const MessagesPage = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredMessages(messages);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = messages.filter(msg =>
            msg.first_name?.toLowerCase().includes(lowerQuery) ||
            msg.last_name?.toLowerCase().includes(lowerQuery) ||
            msg.email?.toLowerCase().includes(lowerQuery) ||
            msg.message?.toLowerCase().includes(lowerQuery)
        );
        setFilteredMessages(filtered);
    }, [searchQuery, messages]);

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            if (!import.meta.env.VITE_SUPABASE_URL) return;
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
            setFilteredMessages(data || []);

            // If a message was selected, update its reference
            if (selectedMessage) {
                const updated = data?.find(m => m.id === selectedMessage.id);
                if (updated) setSelectedMessage(updated);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'resolved' ? 'unread' : 'resolved';
        try {
            const { error } = await supabase
                .from('contacts')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Refresh local state silently
            const updatedMessages = messages.map(msg =>
                msg.id === id ? { ...msg, status: newStatus } : msg
            );
            setMessages(updatedMessages);
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update message status.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Messages Center</h1>
                    <p className="text-muted-foreground mt-1 text-sm">View messages submitted via the contact form.</p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-input rounded-xl bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden lg:col-span-1 h-[calc(100vh-220px)] min-h-[500px] flex flex-col shadow-sm">
                    <div className="p-5 border-b border-border bg-secondary/30 font-semibold flex items-center justify-between">
                        <span>Inbox</span>
                        <span className="bg-primary/10 text-primary text-xs py-1 px-2.5 rounded-full font-bold">{filteredMessages.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
                                <Info className="h-8 w-8 mb-3 opacity-20" />
                                No messages found.
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <button
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`w-full text-left p-5 transition-all outline-none ${selectedMessage?.id === msg.id
                                        ? 'bg-primary/5 hover:bg-primary/10 border-l-[3px] border-primary'
                                        : 'hover:bg-secondary/50 border-l-[3px] border-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className={`font-semibold text-sm truncate pr-2 flex items-center gap-2 ${selectedMessage?.id === msg.id ? 'text-primary' : 'text-foreground'}`}>
                                            {msg.first_name} {msg.last_name}
                                            {msg.status === 'resolved' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                        </span>
                                        <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                                            {format(new Date(msg.created_at), 'MMM dd')}
                                        </span>
                                    </div>
                                    <div className="text-[13px] text-muted-foreground truncate mb-2">{msg.email}</div>
                                    <div className="text-[13px] text-foreground/70 line-clamp-2 leading-relaxed">{msg.message}</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Detail View */}
                <div className="rounded-2xl border border-border bg-card lg:col-span-2 shadow-sm h-[calc(100vh-220px)] min-h-[500px] flex flex-col relative overflow-hidden">
                    {/* Decorative gradient background element for modern feel */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

                    {selectedMessage ? (
                        <>
                            <div className="p-8 border-b border-border space-y-5 bg-background/50 backdrop-blur-sm z-10">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-bold tracking-tight">{selectedMessage.first_name} {selectedMessage.last_name}</h2>
                                            <span className={`text-[10px] px-2.5 py-1 uppercase tracking-wider rounded-full font-bold shadow-sm ${selectedMessage.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/50'}`}>
                                                {selectedMessage.status || 'UNREAD'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 text-muted-foreground text-sm">
                                            <div className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center">
                                                <Mail className="h-4 w-4" />
                                            </div>
                                            <a href={`mailto:${selectedMessage.email}`} className="font-medium hover:text-primary hover:underline transition-all">
                                                {selectedMessage.email}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                                            {format(new Date(selectedMessage.created_at), 'MMM dd, yyyy · h:mm a')}
                                        </span>
                                        <button
                                            onClick={() => toggleStatus(selectedMessage.id, selectedMessage.status)}
                                            className={`text-xs px-4 py-2 mt-1 rounded-xl border font-semibold transition-all flex items-center gap-2 shadow-sm ${selectedMessage.status === 'resolved'
                                                ? 'border-border text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                                                : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
                                                }`}
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            {selectedMessage.status === 'resolved' ? 'Mark as Unread' : 'Mark as Resolved'}
                                        </button>
                                    </div>
                                </div>

                                {selectedMessage.phone && (
                                    <div className="inline-flex items-center gap-2 text-[13px] bg-secondary/30 border border-border px-4 py-2 rounded-lg text-foreground">
                                        <span className="font-medium text-muted-foreground">Phone Number:</span> <span className="font-semibold">{selectedMessage.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto z-10">
                                <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">Message Content</h3>
                                <div className="text-foreground whitespace-pre-wrap leading-loose border border-border/60 rounded-2xl p-7 bg-background shadow-sm text-[15px]">
                                    {selectedMessage.message || <span className="text-muted-foreground italic">No message content provided.</span>}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 z-10">
                            <div className="h-20 w-20 bg-secondary/50 rounded-full flex items-center justify-center mb-5 border border-border">
                                <Info className="h-10 w-10 opacity-40" />
                            </div>
                            <p className="text-xl font-semibold text-foreground">No message selected</p>
                            <p className="text-sm text-center max-w-sm mt-2 opacity-80">
                                Select a message from the list on the left to read its full contents and mark it as resolved.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
