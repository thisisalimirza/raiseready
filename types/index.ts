export interface User {
  id: string;
  email: string;
  created_at: string;
  payment_status?: string;
  stripe_customer_id?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
}

export interface Pack {
  id: string;
  user_id: string;
  job_title: string;
  city_or_remote: string;
  current_salary: number;
  target_salary?: number;
  achievements: string[];
  market_data: MarketData;
  negotiation_content: string;
  created_at: string;
}

export interface MarketData {
  average: number;
  p25: number;
  p75: number;
  source: string;
}

export interface RolePlaySession {
  id: string;
  pack_id: string;
  messages: ChatMessage[];
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}