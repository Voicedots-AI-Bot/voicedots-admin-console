import { useEffect, useState } from 'react';
import { blogsApi, type Blog } from '@/lib/blogsApi';
import { Plus, Edit2, Trash2, ExternalLink, Globe, GlobeLock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const BlogsManagerPage = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const data = await blogsApi.getBlogs();
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;

        try {
            await blogsApi.deleteBlog(id);
            setBlogs(blogs.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog.');
        }
    };

    const togglePublish = async (id: string, currentStatus: boolean) => {
        // Optimistic UI update
        setBlogs(blogs.map(b => b.id === id ? { ...b, published: !currentStatus } : b));

        try {
            await blogsApi.togglePublish(id);
        } catch (error) {
            // Revert if error
            setBlogs(blogs.map(b => b.id === id ? { ...b, published: currentStatus } : b));
            console.error('Error updating publish status:', error);
            alert('Failed to update status.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blogs Manager</h1>
                    <p className="text-muted-foreground mt-2">Create, edit, and manage your blog posts.</p>
                </div>
                <Link
                    to="/blogs/new"
                    className="inline-flex items-center justify-center rounded-lg bg-primary py-2.5 px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Post
                </Link>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>
                                    </td>
                                </tr>
                            ) : blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground border-t border-border">
                                        No blogs found. Create your first post to get started.
                                    </td>
                                </tr>
                            ) : (
                                blogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{blog.title}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-xs">/{blog.slug}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blog.published ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {blog.published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {format(new Date(blog.created_at), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`https://voicedots.com/blogs/${blog.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-muted-foreground hover:bg-secondary/80 rounded-lg transition-colors"
                                                    title="View Live"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                                <button
                                                    onClick={() => togglePublish(blog.id, blog.published)}
                                                    className={`p-2 rounded-lg transition-colors ${blog.published ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:bg-secondary/80'}`}
                                                    title={blog.published ? "Unpublish" : "Publish"}
                                                >
                                                    {blog.published ? <Globe className="h-4 w-4" /> : <GlobeLock className="h-4 w-4" />}
                                                </button>
                                                <div className="w-px h-4 bg-border mx-1"></div>
                                                <Link
                                                    to={`/blogs/${blog.id}`}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
