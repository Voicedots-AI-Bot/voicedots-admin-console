import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { blogsApi } from '@/lib/blogsApi';
import { ArrowLeft, Save, Image as ImageIcon, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RichTextEditor } from '@/components/RichTextEditor';

export const BlogEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = id !== 'new';

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [published, setPublished] = useState(false);
    const [featureImageUrl, setFeatureImageUrl] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isEditing) {
            loadBlog();
        }
    }, [id]);

    const loadBlog = async () => {
        try {
            const data = await blogsApi.getBlog(id!);
            setTitle(data.title || '');
            setSlug(data.slug || '');
            setContent(data.content || '');
            setPublished(data.published || false);
            setFeatureImageUrl(data.feature_image_url || '');
        } catch (error) {
            console.error('Error loading blog:', error);
            setErrorMsg('Failed to load blog.');
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = () => {
        if (!title) return;
        setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!title || !slug || !content) {
            setErrorMsg('Please fill out all required fields (Title, Slug, Concept).');
            return;
        }

        setIsSaving(true);
        try {
            const blogData = {
                title,
                slug,
                content,
                published,
                feature_image_url: featureImageUrl || undefined,
            };

            if (isEditing) {
                await blogsApi.updateBlog(id!, blogData);
            } else {
                await blogsApi.createBlog(blogData);
            }

            navigate('/blogs');
        } catch (error: any) {
            console.error('Error saving blog:', error);
            setErrorMsg(error.message || 'Failed to save blog.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-64 items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm font-medium">Loading editor...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/blogs" className="p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Blog Post' : 'Create New Post'}</h1>
                        <p className="text-xs text-muted-foreground mt-1">Publish to the Voicedots platform.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-lg bg-primary py-2.5 px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-70"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditing ? 'Save Changes' : 'Publish Post'}
                </button>
            </div>

            {errorMsg && (
                <div className="bg-destructive/15 border border-destructive/30 text-destructive p-4 rounded-xl flex items-start gap-3">
                    <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm font-medium">{errorMsg}</div>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
                        <div>
                            <label className="text-sm font-semibold text-foreground">Post Title <span className="text-destructive">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g. The Future of Conversational AI"
                                className="mt-2 w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-foreground">URL Slug <span className="text-destructive">*</span></label>
                                <button onClick={generateSlug} className="text-xs font-medium text-primary hover:underline flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Auto-generate</button>
                            </div>
                            <div className="flex items-center mt-2 overflow-hidden rounded-lg border border-input bg-background/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                <span className="bg-secondary/50 px-3 py-2.5 text-muted-foreground text-sm font-medium border-r border-border select-none">voicedots.com/blogs/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="the-future-of-ai"
                                    className="flex-1 bg-transparent px-3 py-2.5 text-foreground focus:outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-foreground mb-3 block">Content Details <span className="text-destructive">*</span></label>
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Start writing your thoughts here..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        <div className="bg-secondary/30 p-4 border-b border-border">
                            <h3 className="font-semibold text-sm">Publishing Settings</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-lg border transition-all ${published ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-secondary/50'}`}>
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        checked={published}
                                        onChange={(e) => setPublished(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground">Published Status</span>
                                    <span className="text-xs text-muted-foreground mt-1">If unchecked, this post will be saved as a draft and hidden from the live website.</span>
                                </div>
                            </label>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-foreground block">Feature Image</label>
                                <p className="text-xs text-muted-foreground mb-3">Enter a URL for the cover image, or leave empty.</p>
                                {featureImageUrl ? (
                                    <div className="relative group rounded-lg overflow-hidden border border-border aspect-video shadow-sm">
                                        <img src={featureImageUrl} alt="Feature" className="object-cover w-full h-full" />
                                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all flex flex-col items-center justify-center gap-3">
                                            <button
                                                onClick={() => setFeatureImageUrl('')}
                                                className="text-destructive-foreground text-sm font-medium bg-destructive px-4 py-2 rounded-lg hover:bg-destructive/90 shadow-md transition-colors"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <input
                                            type="url"
                                            value={featureImageUrl}
                                            onChange={(e) => setFeatureImageUrl(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                        />
                                        <div className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-input bg-background/50 mt-3">
                                            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <span className="text-xs text-muted-foreground">Enter an image URL above</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
