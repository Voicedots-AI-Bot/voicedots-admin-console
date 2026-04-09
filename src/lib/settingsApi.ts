import { api } from './api';

export interface GlobalSettings {
    default_llm_input_rate: number;
    default_llm_output_rate: number;
    default_stt_rate: number;
    default_tts_rate: number;
    default_duration_hours: number;
}

export const settingsApi = {
    getSettings: () => api.get<GlobalSettings>('/settings/'),
    updateSettings: (data: Partial<GlobalSettings>) => api.patch<GlobalSettings>('/settings/', data),
};
