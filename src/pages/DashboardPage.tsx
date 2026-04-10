import { useEffect, useState } from 'react';
import { blogsApi } from '@/lib/blogsApi';
import { messagesApi, type ContactMessage } from '@/lib/messagesApi';
import {
    FileText,
    MessageSquare,
    TrendingUp,
    Users,
    ArrowUpRight,
    Search,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DashboardStats {
    totalBlogs: number;
    totalMessages: number;
    publishedBlogs: number;
    unreadMessages: number;
}

export const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalBlogs: 0,
        totalMessages: 0,
        publishedBlogs: 0,
        unreadMessages: 0,
    });
    const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [chartData, setChartData] = useState<{ name: string; messages: number }[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch Stats in parallel
            const [blogStats, messageStats, allMessages] = await Promise.all([
                blogsApi.getStats(),
                messagesApi.getStats(),
                messagesApi.getMessages(),
            ]);

            setStats({
                totalBlogs: blogStats.total,
                publishedBlogs: blogStats.published,
                totalMessages: messageStats.total,
                unreadMessages: messageStats.unread,
            });

            // Get recent 5 messages
            setRecentMessages(allMessages.slice(0, 5));

            // Build chart data — last 7 days
            const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return {
                    dateStr: format(d, 'yyyy-MM-dd'),
                    name: format(d, 'EEE'),
                    messages: 0
                };
            });

            allMessages.forEach(msg => {
                const msgDateStr = msg.created_at.split('T')[0];
                const dayData = last7DaysData.find(d => d.dateStr === msgDateStr);
                if (dayData) {
                    dayData.messages += 1;
                }
            });

            setChartData(last7DaysData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Messages',
            value: stats.totalMessages.toString(),
            description: `${stats.unreadMessages} unread messages`,
            icon: MessageSquare,
            trend: 'All time',
            trendUp: true,
        },
        {
            title: 'Unread Messages',
            value: stats.unreadMessages.toString(),
            description: 'Requires attention',
            icon: Users,
            trend: 'Pending',
            trendUp: false,
        },
        {
            title: 'Total Blog Posts',
            value: stats.totalBlogs.toString(),
            description: 'All created posts',
            icon: FileText,
            trend: 'All time',
            trendUp: true,
        },
        {
            title: 'Published Blogs',
            value: stats.publishedBlogs.toString(),
            description: 'Live on website',
            icon: TrendingUp,
            trend: 'Active',
            trendUp: true,
        }
    ];

    return (
        <div className="space-y-6 lg:space-y-5">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-sm text-muted-foreground mt-1">Welcome to your admin dashboard.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <stat.icon className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold">{isLoading ? '-' : stat.value}</h2>
                            <span className={`text-xs font-medium flex items-center ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trendUp && <ArrowUpRight className="mr-1 h-3 w-3" />}
                                {!stat.trendUp && <ArrowUpRight className="mr-1 h-3 w-3 rotate-90" />}
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isLoading ? '...' : stat.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Activity Chart */}
                <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-4 flex flex-col h-[350px] lg:h-[320px]">
                    <div className="p-6 border-b border-border">
                        <h3 className="font-semibold leading-none tracking-tight">Message Volume</h3>
                        <p className="text-sm text-muted-foreground mt-1.5">Number of messages received over the last 7 days.</p>
                    </div>
                    <div className="p-6 flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="name"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--foreground))'
                                    }}
                                />
                                <Area type="monotone" dataKey="messages" name="Messages" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Messages List */}
                <div className="rounded-xl border border-border bg-card shadow-sm lg:col-span-3 flex flex-col h-[350px] lg:h-[320px]">
                    <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                        <div>
                            <h3 className="font-semibold leading-none tracking-tight">Recent Messages</h3>
                            <p className="text-sm text-muted-foreground mt-1.5">Latest contact form submissions.</p>
                        </div>
                        <Link to="/messages" className="text-sm font-medium text-primary hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="p-0 flex-1 overflow-y-auto min-h-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : recentMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center h-40 text-muted-foreground">
                                <Search className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No recent messages found.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {recentMessages.map((msg) => (
                                    <Link 
                                        key={msg.id} 
                                        to={`/messages?id=${msg.id}`}
                                        className="block p-4 hover:bg-secondary/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium text-foreground truncate">{msg.first_name} {msg.last_name}</p>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {format(new Date(msg.created_at), 'MMM dd')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                                            {msg.status && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${msg.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                    {msg.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
