import { api } from './api';

export interface ClientListItem {
    agent_id: string;
    name: string;
    email: string;
    plan: string;
    status: string;
    created_at: string;
    profile_picture: string | null;
    estimated_cost: number;
    duration_hours: number;
    total_duration_limit: number;
}

export interface ClientDetail {
    user_id: string;
    agent_id: string;
    name: string;
    email: string;
    profile_picture: string | null;
    created_at: string;
    plan: string;
    status: string;
    llm_input_charges: number;
    llm_output_charges: number;
    stt_charges: number;
    tts_charges: number;
    auxiliary_charges: number;
    total_duration_limit: number;
    duration_hours: number;
    stt_characters: number;
    llm_input_tokens: number;
    llm_output_tokens: number;
    tts_characters: number;
    estimated_cost: number;
    usage_recorded_since: string | null;
}

export interface ClientCreateData {
    email: string;
    name: string;
    agent_id: string;
    password: string;
    plan: string;
    total_duration_limit?: number;
}

export const clientsApi = {
    getClients: () => api.get<ClientListItem[]>('/clients/'),

    getClientDetail: (agentId: string) =>
        api.get<ClientDetail>(`/clients/${agentId}`),

    createClient: (data: ClientCreateData) =>
        api.post<ClientListItem>('/clients/', data),

    updateSubscription: (agentId: string, data: { 
        plan?: string; 
        status?: string; 
        total_duration_limit?: number;
        llm_input_charges?: number;
        llm_output_charges?: number;
        stt_charges?: number;
        tts_characters?: number;
        auxiliary_charges?: number;
    }) =>
        api.patch(`/clients/${agentId}/subscription`, data),

    toggleStatus: (agentId: string) =>
        api.patch<{ message: string; status: string }>(`/clients/${agentId}/toggle-status`),

    resetPassword: (agentId: string, newPassword: string) =>
        api.patch(`/clients/${agentId}/reset-password`, { new_password: newPassword }),

    deleteClient: (agentId: string) =>
        api.delete(`/clients/${agentId}`),
};
