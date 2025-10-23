export interface CanvasUser {
  id: number;
  name: string;
  sortable_name: string;
  short_name: string;
  email: string;
  login_id: string;
  avatar_url: string;
  primary_email?: string; // Optional field for compatibility
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  start_at: string;
  end_at: string;
  workflow_state: string;
  enrollment_term_id: number;
  // Optional syllabus body if included by API
  syllabus_body?: string;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  course_id: number;
  html_url: string;
  submission_types: string[];
  has_submitted_submissions: boolean;
  submissions_download_url: string;
}

export interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string;
  workflow_state: 'submitted' | 'unsubmitted' | 'graded' | 'pending_review';
  score: number;
  grade: string;
  attempt: number;
}

export interface PlannerItem {
  id: number;
  title: string;
  context_name: string;
  context_type: string;
  plannable_type: string;
  plannable_date: string;
  plannable: {
    id: number;
    title: string;
    points_possible: number;
    due_at: string;
  };
  course_id: number;
  html_url: string;
}

export interface CanvasAuth {
  accessToken: string;
  domain: string;
}

// New: Canvas File type for course files (used to locate syllabus documents)
export interface CanvasFile {
  id: number;
  display_name: string;
  filename: string;
  content_type: string;
  size: number;
  url: string; // public file download URL
}