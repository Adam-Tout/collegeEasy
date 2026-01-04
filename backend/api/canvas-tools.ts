/**
 * Canvas API Tools Registry
 * This file contains all available Canvas API endpoints with descriptions
 * for the AI agent to select the appropriate tool based on user queries.
 */

export interface CanvasAPITool {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  exampleUseCases: string[];
}

export const CANVAS_API_TOOLS: CanvasAPITool[] = [
  // User & Profile
  {
    id: 'get_user',
    name: 'Get Current User',
    description: 'Retrieves information about the currently authenticated user',
    endpoint: '/users/self',
    method: 'GET',
    parameters: [],
    exampleUseCases: [
      'show me my profile',
      'what is my name',
      'get my user information',
      'who am I'
    ]
  },
  {
    id: 'get_user_profile',
    name: 'Get User Profile',
    description: 'Retrieves profile information for a specific user',
    endpoint: '/users/{user_id}/profile',
    method: 'GET',
    parameters: [
      {
        name: 'user_id',
        type: 'number',
        required: true,
        description: 'The ID of the user'
      }
    ],
    exampleUseCases: [
      'get profile for user 123',
      'show user profile',
      'user information'
    ]
  },

  // Courses
  {
    id: 'list_courses',
    name: 'List Courses',
    description: 'Retrieves a list of courses the user is enrolled in',
    endpoint: '/courses',
    method: 'GET',
    parameters: [
      {
        name: 'enrollment_state',
        type: 'string',
        required: false,
        description: 'Filter by enrollment state: active, invited, creation_pending, deleted, rejected, completed, inactive'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data to include: syllabus_body, term, course_image, etc.'
      }
    ],
    exampleUseCases: [
      'show my courses',
      'list all my classes',
      'what courses am I taking',
      'get my enrolled courses'
    ]
  },
  {
    id: 'get_course',
    name: 'Get Course Details',
    description: 'Retrieves detailed information about a specific course',
    endpoint: '/courses/{course_id}',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data: syllabus_body, term, course_image, etc.'
      }
    ],
    exampleUseCases: [
      'show details for course 123',
      'get information about CS 101',
      'course details',
      'what is this course about'
    ]
  },
  {
    id: 'get_course_syllabus',
    name: 'Get Course Syllabus',
    description: 'Retrieves the syllabus content for a course',
    endpoint: '/courses/{course_id}?include[]=syllabus_body',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      }
    ],
    exampleUseCases: [
      'show me the syllabus',
      'get course syllabus',
      'what is the syllabus for this course',
      'exam dates in syllabus'
    ]
  },

  // Assignments
  {
    id: 'list_assignments',
    name: 'List Course Assignments',
    description: 'Retrieves all assignments for a specific course',
    endpoint: '/courses/{course_id}/assignments',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data: submission, assignment_visibility, overrides'
      }
    ],
    exampleUseCases: [
      'show assignments for course 123',
      'list all assignments',
      'what assignments do I have',
      'get course assignments'
    ]
  },
  {
    id: 'get_assignment',
    name: 'Get Assignment Details',
    description: 'Retrieves detailed information about a specific assignment',
    endpoint: '/courses/{course_id}/assignments/{assignment_id}',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'assignment_id',
        type: 'number',
        required: true,
        description: 'The ID of the assignment'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data: submission, assignment_visibility, overrides'
      }
    ],
    exampleUseCases: [
      'show assignment 456 details',
      'get assignment information',
      'what is this assignment about',
      'assignment requirements'
    ]
  },
  {
    id: 'get_all_assignments',
    name: 'Get All Assignments',
    description: 'Retrieves all assignments across all enrolled courses',
    endpoint: '/users/self/courses/{course_id}/assignments (for each course)',
    method: 'GET',
    parameters: [],
    exampleUseCases: [
      'show all my assignments',
      'list assignments from all courses',
      'what assignments do I have across all classes',
      'all my homework'
    ]
  },

  // Submissions
  {
    id: 'list_submissions',
    name: 'List Submissions',
    description: 'Retrieves submissions for assignments in a course',
    endpoint: '/courses/{course_id}/students/submissions',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'student_ids',
        type: 'array',
        required: false,
        description: 'Filter by student IDs (use "self" for current user)'
      },
      {
        name: 'assignment_ids',
        type: 'array',
        required: false,
        description: 'Filter by assignment IDs'
      }
    ],
    exampleUseCases: [
      'show my submissions',
      'get submission status',
      'what have I submitted',
      'check my assignment submissions'
    ]
  },
  {
    id: 'get_submission',
    name: 'Get Submission Details',
    description: 'Retrieves details about a specific submission',
    endpoint: '/courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'assignment_id',
        type: 'number',
        required: true,
        description: 'The ID of the assignment'
      },
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The ID of the user (use "self" for current user)'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data: submission_history, submission_comments, rubric_assessment'
      }
    ],
    exampleUseCases: [
      'show my submission for assignment 456',
      'get submission details',
      'check my grade',
      'submission status'
    ]
  },

  // Planner
  {
    id: 'get_planner_items',
    name: 'Get Planner Items',
    description: 'Retrieves planner items (assignments, events) for a date range',
    endpoint: '/planner/items',
    method: 'GET',
    parameters: [
      {
        name: 'start_date',
        type: 'string',
        required: false,
        description: 'Start date in ISO 8601 format (YYYY-MM-DD)'
      },
      {
        name: 'end_date',
        type: 'string',
        required: false,
        description: 'End date in ISO 8601 format (YYYY-MM-DD)'
      },
      {
        name: 'context_codes',
        type: 'array',
        required: false,
        description: 'Filter by context codes (e.g., course_123)'
      }
    ],
    exampleUseCases: [
      'show my calendar',
      'what is due this week',
      'get planner items',
      'show upcoming assignments',
      'what is due in the next 7 days'
    ]
  },

  // Files
  {
    id: 'list_course_files',
    name: 'List Course Files',
    description: 'Retrieves files available in a course',
    endpoint: '/courses/{course_id}/files',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'content_types',
        type: 'array',
        required: false,
        description: 'Filter by content types (e.g., application/pdf, image/png)'
      },
      {
        name: 'search_term',
        type: 'string',
        required: false,
        description: 'Search for files by name'
      }
    ],
    exampleUseCases: [
      'show course files',
      'list files in this course',
      'find syllabus file',
      'what files are available',
      'show PDF files'
    ]
  },
  {
    id: 'get_file',
    name: 'Get File Details',
    description: 'Retrieves information about a specific file',
    endpoint: '/files/{file_id}',
    method: 'GET',
    parameters: [
      {
        name: 'file_id',
        type: 'number',
        required: true,
        description: 'The ID of the file'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data: user, usage_rights'
      }
    ],
    exampleUseCases: [
      'get file information',
      'show file details',
      'file metadata'
    ]
  },

  // Grades
  {
    id: 'get_grades',
    name: 'Get Course Grades',
    description: 'Retrieves grade information for a course',
    endpoint: '/courses/{course_id}/enrollments/{enrollment_id}/grades',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'enrollment_id',
        type: 'number',
        required: false,
        description: 'The enrollment ID (optional, defaults to current user)'
      }
    ],
    exampleUseCases: [
      'show my grades',
      'what is my grade in this course',
      'get course grades',
      'check my gradebook'
    ]
  },
  {
    id: 'get_assignment_grades',
    name: 'Get Assignment Grades',
    description: 'Retrieves grade information for assignments',
    endpoint: '/courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'assignment_id',
        type: 'number',
        required: true,
        description: 'The ID of the assignment'
      },
      {
        name: 'user_id',
        type: 'string',
        required: true,
        description: 'The ID of the user (use "self" for current user)'
      }
    ],
    exampleUseCases: [
      'what grade did I get on assignment 456',
      'show my assignment grade',
      'check assignment score'
    ]
  },

  // Announcements
  {
    id: 'list_announcements',
    name: 'List Course Announcements',
    description: 'Retrieves announcements for a course',
    endpoint: '/announcements',
    method: 'GET',
    parameters: [
      {
        name: 'context_codes',
        type: 'array',
        required: false,
        description: 'Filter by context codes (e.g., course_123)'
      },
      {
        name: 'start_date',
        type: 'string',
        required: false,
        description: 'Start date in ISO 8601 format'
      },
      {
        name: 'end_date',
        type: 'string',
        required: false,
        description: 'End date in ISO 8601 format'
      }
    ],
    exampleUseCases: [
      'show announcements',
      'get course announcements',
      'what are the latest announcements',
      'recent announcements'
    ]
  },

  // Modules
  {
    id: 'list_modules',
    name: 'List Course Modules',
    description: 'Retrieves modules for a course',
    endpoint: '/courses/{course_id}/modules',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data: items, content_details'
      }
    ],
    exampleUseCases: [
      'show course modules',
      'list modules',
      'what modules are in this course',
      'get course content modules'
    ]
  },
  {
    id: 'list_module_items',
    name: 'List Module Items',
    description: 'Retrieves items within a module',
    endpoint: '/courses/{course_id}/modules/{module_id}/items',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'module_id',
        type: 'number',
        required: true,
        description: 'The ID of the module'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data: content_details, mastery_paths'
      }
    ],
    exampleUseCases: [
      'show items in module 789',
      'list module content',
      'what is in this module'
    ]
  },

  // Calendar Events
  {
    id: 'list_calendar_events',
    name: 'List Calendar Events',
    description: 'Retrieves calendar events for the user',
    endpoint: '/calendar_events',
    method: 'GET',
    parameters: [
      {
        name: 'context_codes',
        type: 'array',
        required: false,
        description: 'Filter by context codes (e.g., course_123)'
      },
      {
        name: 'start_date',
        type: 'string',
        required: false,
        description: 'Start date in ISO 8601 format'
      },
      {
        name: 'end_date',
        type: 'string',
        required: false,
        description: 'End date in ISO 8601 format'
      },
      {
        name: 'type',
        type: 'string',
        required: false,
        description: 'Filter by event type: event, assignment'
      }
    ],
    exampleUseCases: [
      'show calendar events',
      'what events are coming up',
      'get my calendar',
      'upcoming events'
    ]
  },

  // Discussions
  {
    id: 'list_discussions',
    name: 'List Course Discussions',
    description: 'Retrieves discussions for a course',
    endpoint: '/courses/{course_id}/discussion_topics',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'only_announcements',
        type: 'boolean',
        required: false,
        description: 'Filter to only announcements'
      },
      {
        name: 'order_by',
        type: 'string',
        required: false,
        description: 'Sort order: position, recent_activity, title'
      }
    ],
    exampleUseCases: [
      'show discussions',
      'list course discussions',
      'get discussion topics',
      'what discussions are there'
    ]
  },
  {
    id: 'get_discussion',
    name: 'Get Discussion Details',
    description: 'Retrieves details about a specific discussion',
    endpoint: '/courses/{course_id}/discussion_topics/{topic_id}',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'topic_id',
        type: 'number',
        required: true,
        description: 'The ID of the discussion topic'
      },
      {
        name: 'include',
        type: 'array',
        required: false,
        description: 'Additional data: all_dates, sections, overrides'
      }
    ],
    exampleUseCases: [
      'show discussion 123',
      'get discussion details',
      'discussion content'
    ]
  },

  // Quizzes
  {
    id: 'list_quizzes',
    name: 'List Course Quizzes',
    description: 'Retrieves quizzes for a course',
    endpoint: '/courses/{course_id}/quizzes',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'search_term',
        type: 'string',
        required: false,
        description: 'Search for quizzes by title'
      }
    ],
    exampleUseCases: [
      'show quizzes',
      'list course quizzes',
      'what quizzes are available',
      'get quiz list'
    ]
  },
  {
    id: 'get_quiz',
    name: 'Get Quiz Details',
    description: 'Retrieves details about a specific quiz',
    endpoint: '/courses/{course_id}/quizzes/{quiz_id}',
    method: 'GET',
    parameters: [
      {
        name: 'course_id',
        type: 'number',
        required: true,
        description: 'The ID of the course'
      },
      {
        name: 'quiz_id',
        type: 'number',
        required: true,
        description: 'The ID of the quiz'
      }
    ],
    exampleUseCases: [
      'show quiz 123 details',
      'get quiz information',
      'quiz details'
    ]
  }
];

/**
 * Find the best matching Canvas API tool based on user query
 */
export function findMatchingTools(query: string): CanvasAPITool[] {
  const lowerQuery = query.toLowerCase();
  const matches: { tool: CanvasAPITool; score: number }[] = [];

  for (const tool of CANVAS_API_TOOLS) {
    let score = 0;

    // Check description
    if (tool.description.toLowerCase().includes(lowerQuery)) {
      score += 2;
    }

    // Check name
    if (tool.name.toLowerCase().includes(lowerQuery)) {
      score += 3;
    }

    // Check example use cases
    for (const useCase of tool.exampleUseCases) {
      if (lowerQuery.includes(useCase.toLowerCase()) || useCase.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }
    }

    // Keyword matching
    const keywords = [
      { words: ['assignment', 'homework', 'due'], toolIds: ['list_assignments', 'get_assignment', 'get_all_assignments'] },
      { words: ['course', 'class'], toolIds: ['list_courses', 'get_course'] },
      { words: ['grade', 'score', 'score'], toolIds: ['get_grades', 'get_assignment_grades'] },
      { words: ['submission', 'submitted'], toolIds: ['list_submissions', 'get_submission'] },
      { words: ['syllabus'], toolIds: ['get_course_syllabus'] },
      { words: ['calendar', 'planner', 'upcoming', 'due'], toolIds: ['get_planner_items', 'list_calendar_events'] },
      { words: ['file', 'document'], toolIds: ['list_course_files', 'get_file'] },
      { words: ['announcement'], toolIds: ['list_announcements'] },
      { words: ['module', 'content'], toolIds: ['list_modules', 'list_module_items'] },
      { words: ['discussion', 'forum'], toolIds: ['list_discussions', 'get_discussion'] },
      { words: ['quiz', 'test', 'exam'], toolIds: ['list_quizzes', 'get_quiz'] },
      { words: ['profile', 'user', 'me'], toolIds: ['get_user', 'get_user_profile'] }
    ];

    for (const keyword of keywords) {
      if (keyword.words.some(word => lowerQuery.includes(word)) && keyword.toolIds.includes(tool.id)) {
        score += 4;
      }
    }

    if (score > 0) {
      matches.push({ tool, score });
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(m => m.tool);
}


