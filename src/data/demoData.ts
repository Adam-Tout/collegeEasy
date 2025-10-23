import { CanvasAssignment, CanvasCourse, CanvasUser } from '../types/canvas';

// Demo data for testing when Canvas API is not available
export const demoUser: CanvasUser = {
  id: 12345,
  name: "Demo Student",
  sortable_name: "Student, Demo",
  short_name: "Demo",
  email: "demo@student.edu",
  login_id: "demo_student",
  avatar_url: "https://via.placeholder.com/150"
};

export const demoCourses: CanvasCourse[] = [
  {
    id: 101,
    name: "English Literature",
    course_code: "ENG101",
    start_at: "2024-01-15T00:00:00Z",
    end_at: "2024-05-15T23:59:59Z",
    workflow_state: "available",
    enrollment_term_id: 1
  },
  {
    id: 102,
    name: "Computer Science Fundamentals",
    course_code: "CS101",
    start_at: "2024-01-15T00:00:00Z",
    end_at: "2024-05-15T23:59:59Z",
    workflow_state: "available",
    enrollment_term_id: 1
  },
  {
    id: 103,
    name: "History of Art",
    course_code: "ART201",
    start_at: "2024-01-15T00:00:00Z",
    end_at: "2024-05-15T23:59:59Z",
    workflow_state: "available",
    enrollment_term_id: 1
  }
];

export const demoAssignments: CanvasAssignment[] = [
  {
    id: 1001,
    name: "Literary Analysis Essay",
    description: "Write a 1000-word analysis of the themes in Shakespeare's Hamlet. Focus on the theme of revenge and how it drives the plot. Include at least 3 scholarly sources.",
    due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    points_possible: 100,
    course_id: 101,
    html_url: "https://demo.instructure.com/courses/101/assignments/1001",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1002,
    name: "Programming Assignment: Calculator",
    description: "Create a simple calculator program in JavaScript that can perform basic arithmetic operations. Include error handling for invalid inputs.",
    due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    points_possible: 50,
    course_id: 102,
    html_url: "https://demo.instructure.com/courses/102/assignments/1002",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1003,
    name: "Art History Research Paper",
    description: "Research and write about the influence of Renaissance art on modern architecture. Include at least 5 sources and provide visual examples.",
    due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    points_possible: 150,
    course_id: 103,
    html_url: "https://demo.instructure.com/courses/103/assignments/1003",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1004,
    name: "Code Review Exercise",
    description: "Review the provided Python code and identify at least 3 potential improvements. Write a brief report explaining each suggestion.",
    due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    points_possible: 25,
    course_id: 102,
    html_url: "https://demo.instructure.com/courses/102/assignments/1004",
    submission_types: ["online_text_entry"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  }
];

// Helper function to get demo data based on current date
export const getDemoAssignments = (): CanvasAssignment[] => {
  const now = new Date();
  return demoAssignments.map(assignment => ({
    ...assignment,
    due_at: new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
};