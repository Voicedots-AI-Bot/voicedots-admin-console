import { api } from './api';

export interface ContactMessage {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    message: string | null;
    status: string;
    created_at: string;
}

export const messagesApi = {
    getMessages: () => api.get<ContactMessage[]>('/messages/'),

    getStats: () => api.get<{ total: number; unread: number }>('/messages/stats'),

    updateStatus: (id: string, status: string) =>
        api.patch(`/messages/${id}/status`, { status }),
};
