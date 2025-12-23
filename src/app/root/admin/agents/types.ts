import { Agent } from '@/types/agent'; // Type หลักจาก Global

export type TabStatus = 'all' | 'in_review' | 'approved' | 'rejected';
export type SortOrder = 'newest' | 'oldest';

export interface FormInputProps {
  label: string;
  name: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export interface StatusBadgeProps {
  status: string;
}

export interface UpdateAgentResponse {
    message: string;
    data: Agent;
}