export interface Report {
  id: string;
  reporter_id: string;
  report_type: string;
  status: string;
  target_user_id: string;
  target_entity_type: string;
  target_entity_id: string;
  reason: string;
  description: string;
  reviewed_by: string;
  resolution: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportRequest {
  report_type: string;
  reason: string;
  description?: string;
  target_user_id?: string;
  target_entity_type?: string;
  target_entity_id?: string;
}
