import { api } from './api';

export interface PricingPlan {
    id: number;
    name: string;
    llm_input_rate: number;
    llm_output_rate: number;
    stt_rate: number;
    tts_rate: number;
    default_duration_limit: number;
    is_custom: boolean;
}

export type PricingPlanCreate = Omit<PricingPlan, 'id'>;
export type PricingPlanUpdate = Partial<PricingPlanCreate>;

export const plansApi = {
    getPlans: () => api.get<PricingPlan[]>('/plans/'),
    createPlan: (data: PricingPlanCreate) => api.post<PricingPlan>('/plans/', data),
    updatePlan: (id: number, data: PricingPlanUpdate) => api.patch<PricingPlan>(`/plans/${id}`, data),
    deletePlan: (id: number) => api.delete<{ message: string }>(`/plans/${id}`),
};
