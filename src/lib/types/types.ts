import { Location } from './locations';

export type UserRole = 'client' | 'freelancer' | 'admin';

export type GigStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';

export type GigCategory =
  | 'Web Development'
  | 'Graphic Design'
  | 'Content Writing'
  | 'UI/UX Design'
  | 'Digital Marketing'
  | 'Mobile Development'
  | 'Video Editing'
  | 'Translation'
  | 'Data Entry'
  | 'Other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string;
  location: Location;
  is_verified: boolean;
  created_at: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  client_id: string;
  budget: number;
  location: Location;
  category: GigCategory;
  status: GigStatus;
  deadline: string;
  created_at: string;
  applicant_count: number;
}

export interface Application {
  id: string;
  gig_id: string;
  freelancer_id: string;
  cover_letter: string;
  proposed_budget: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  gig_id: string | null;
  participants: string[];
  created_at: string;
  updated_at: string;
}
