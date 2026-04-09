import { api } from './api';

export interface Blog {
    id: string;
    title: string;
    slug: string;
    content: string | null;
    published: boolean;
    feature_image_url: string | null;
    created_at: string;
}

export interface BlogCreateData {
    title: string;
    slug: string;
    content?: string;
    published?: boolean;
    feature_image_url?: string;
}

export const blogsApi = {
    getBlogs: () => api.get<Blog[]>('/blogs/'),

    getBlog: (id: string) => api.get<Blog>(`/blogs/${id}`),

    getStats: () => api.get<{ total: number; published: number }>('/blogs/stats'),

    createBlog: (data: BlogCreateData) => api.post<Blog>('/blogs/', data),

    updateBlog: (id: string, data: Partial<BlogCreateData>) =>
        api.put<Blog>(`/blogs/${id}`, data),

    togglePublish: (id: string) =>
        api.patch<{ message: string; published: boolean }>(`/blogs/${id}/publish`),

    deleteBlog: (id: string) => api.delete(`/blogs/${id}`),
};
