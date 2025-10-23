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
    name: "Advanced Algorithms",
    course_code: "CS401",
    start_at: "2024-01-15T00:00:00Z",
    end_at: "2024-05-15T23:59:59Z",
    workflow_state: "available",
    enrollment_term_id: 1
  },
  {
    id: 102,
    name: "Machine Learning Fundamentals",
    course_code: "CS301",
    start_at: "2024-01-15T00:00:00Z",
    end_at: "2024-05-15T23:59:59Z",
    workflow_state: "available",
    enrollment_term_id: 1
  },
  {
    id: 103,
    name: "Data Structures & Algorithms",
    course_code: "CS201",
    start_at: "2024-01-15T00:00:00Z",
    end_at: "2024-05-15T23:59:59Z",
    workflow_state: "available",
    enrollment_term_id: 1
  },
  {
    id: 104,
    name: "Web Development",
    course_code: "CS301",
    start_at: "2024-01-15T00:00:00Z",
    end_at: "2024-05-15T23:59:59Z",
    workflow_state: "available",
    enrollment_term_id: 1
  },
  {
    id: 105,
    name: "Database Systems",
    course_code: "CS302",
    start_at: "2024-01-15T00:00:00Z",
    end_at: "2024-05-15T23:59:59Z",
    workflow_state: "available",
    enrollment_term_id: 1
  }
];

export const demoAssignments: CanvasAssignment[] = [
  // Today's assignments
  {
    id: 1001,
    name: "Binary Tree Implementation",
    description: "Implement a complete binary tree data structure in Python with insertion, deletion, and traversal methods. Include unit tests and documentation.",
    due_at: new Date().toISOString(), // Today
    points_possible: 100,
    course_id: 103,
    html_url: "https://demo.instructure.com/courses/103/assignments/1001",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1002,
    name: "React Component Library",
    description: "Build a reusable component library with TypeScript. Include at least 5 components: Button, Input, Modal, Card, and Table. Use Storybook for documentation.",
    due_at: new Date().toISOString(), // Today
    points_possible: 150,
    course_id: 104,
    html_url: "https://demo.instructure.com/courses/104/assignments/1002",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  
  // Tomorrow's assignments
  {
    id: 1003,
    name: "Neural Network from Scratch",
    description: "Implement a simple neural network using only NumPy. Train it on the MNIST dataset and achieve at least 85% accuracy. Include visualization of training progress.",
    due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    points_possible: 200,
    course_id: 102,
    html_url: "https://demo.instructure.com/courses/102/assignments/1003",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1004,
    name: "Database Design Project",
    description: "Design a normalized database schema for an e-commerce platform. Include ER diagrams, SQL DDL statements, and explain your design decisions.",
    due_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    points_possible: 120,
    course_id: 105,
    html_url: "https://demo.instructure.com/courses/105/assignments/1004",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  
  // This week's assignments
  {
    id: 1005,
    name: "Algorithm Optimization Challenge",
    description: "Optimize the given sorting algorithm to achieve O(n log n) time complexity. Compare performance with built-in sort functions and provide detailed analysis.",
    due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
    points_possible: 80,
    course_id: 101,
    html_url: "https://demo.instructure.com/courses/101/assignments/1005",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1006,
    name: "Full-Stack Web Application",
    description: "Build a complete web application with React frontend, Node.js backend, and PostgreSQL database. Include authentication, CRUD operations, and deployment.",
    due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    points_possible: 300,
    course_id: 104,
    html_url: "https://demo.instructure.com/courses/104/assignments/1006",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1007,
    name: "Machine Learning Model Deployment",
    description: "Deploy a trained ML model using Docker and create a REST API. Include model versioning, monitoring, and A/B testing capabilities.",
    due_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days
    points_possible: 180,
    course_id: 102,
    html_url: "https://demo.instructure.com/courses/102/assignments/1007",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1008,
    name: "Distributed Systems Simulation",
    description: "Simulate a distributed system with multiple nodes, message passing, and fault tolerance. Implement consensus algorithms and analyze performance.",
    due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
    points_possible: 250,
    course_id: 101,
    html_url: "https://demo.instructure.com/courses/101/assignments/1008",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1009,
    name: "Database Performance Tuning",
    description: "Optimize a given database schema and queries. Use indexing, query optimization, and caching strategies. Provide before/after performance metrics.",
    due_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days
    points_possible: 140,
    course_id: 105,
    html_url: "https://demo.instructure.com/courses/105/assignments/1009",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  },
  {
    id: 1010,
    name: "Advanced Data Structures Project",
    description: "Implement and compare multiple advanced data structures: B-trees, Red-Black trees, and Hash tables. Include performance benchmarks and use cases.",
    due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    points_possible: 160,
    course_id: 103,
    html_url: "https://demo.instructure.com/courses/103/assignments/1010",
    submission_types: ["online_text_entry", "online_upload"],
    has_submitted_submissions: false,
    submissions_download_url: ""
  }
];

// Helper function to get demo data - always returns the same assignments
export const getDemoAssignments = (): CanvasAssignment[] => {
  return demoAssignments;
};