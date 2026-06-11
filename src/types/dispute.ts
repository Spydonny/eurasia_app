export interface Dispute {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  reference_type: string;
  reference_id: string;
  created_at: string;
  updated_at: string;
}

export interface DisputeComment {
  id: string;
  dispute_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface CreateDisputeRequest {
  title: string;
  description: string;
  type: string;
  reference_type?: string;
  reference_id?: string;
}
