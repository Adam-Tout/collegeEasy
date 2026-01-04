# 📚 Complete Canvas API Tools List

## All 23 Tools with Descriptions

### User & Profile (2 tools)

1. **get_user**
   - **Description**: Retrieves information about the currently authenticated user
   - **Endpoint**: `GET /users/self`
   - **Use Cases**: "show me my profile", "what is my name", "get my user information"

2. **get_user_profile**
   - **Description**: Retrieves profile information for a specific user
   - **Endpoint**: `GET /users/{user_id}/profile`
   - **Use Cases**: "get profile for user 123", "show user profile"

### Courses (3 tools)

3. **list_courses**
   - **Description**: Retrieves a list of courses the user is enrolled in
   - **Endpoint**: `GET /courses`
   - **Use Cases**: "show my courses", "list all my classes", "what courses am I taking"

4. **get_course**
   - **Description**: Retrieves detailed information about a specific course
   - **Endpoint**: `GET /courses/{course_id}`
   - **Use Cases**: "show details for course 123", "get information about CS 101"

5. **get_course_syllabus**
   - **Description**: Retrieves the syllabus content for a course
   - **Endpoint**: `GET /courses/{course_id}?include[]=syllabus_body`
   - **Use Cases**: "show me the syllabus", "get course syllabus", "exam dates in syllabus"

### Assignments (3 tools)

6. **list_assignments**
   - **Description**: Retrieves all assignments for a specific course
   - **Endpoint**: `GET /courses/{course_id}/assignments`
   - **Use Cases**: "show assignments for course 123", "list all assignments"

7. **get_assignment**
   - **Description**: Retrieves detailed information about a specific assignment
   - **Endpoint**: `GET /courses/{course_id}/assignments/{assignment_id}`
   - **Use Cases**: "show assignment 456 details", "get assignment information"

8. **get_all_assignments**
   - **Description**: Retrieves all assignments across all enrolled courses
   - **Endpoint**: Multiple course calls combined
   - **Use Cases**: "show all my assignments", "list assignments from all courses"

### Submissions (2 tools)

9. **list_submissions**
   - **Description**: Retrieves submissions for assignments in a course
   - **Endpoint**: `GET /courses/{course_id}/students/submissions`
   - **Use Cases**: "show my submissions", "get submission status"

10. **get_submission**
    - **Description**: Retrieves details about a specific submission
    - **Endpoint**: `GET /courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}`
    - **Use Cases**: "show my submission for assignment 456", "check my grade"

### Planner & Calendar (2 tools)

11. **get_planner_items**
    - **Description**: Retrieves planner items (assignments, events) for a date range
    - **Endpoint**: `GET /planner/items`
    - **Use Cases**: "show my calendar", "what is due this week", "upcoming assignments"

12. **list_calendar_events**
    - **Description**: Retrieves calendar events for the user
    - **Endpoint**: `GET /calendar_events`
    - **Use Cases**: "show calendar events", "what events are coming up"

### Files (2 tools)

13. **list_course_files**
    - **Description**: Retrieves files available in a course
    - **Endpoint**: `GET /courses/{course_id}/files`
    - **Use Cases**: "show course files", "list files in this course", "find syllabus file"

14. **get_file**
    - **Description**: Retrieves information about a specific file
    - **Endpoint**: `GET /files/{file_id}`
    - **Use Cases**: "get file information", "show file details"

### Grades (2 tools)

15. **get_grades**
    - **Description**: Retrieves grade information for a course
    - **Endpoint**: `GET /courses/{course_id}/enrollments/{enrollment_id}/grades`
    - **Use Cases**: "show my grades", "what is my grade in this course"

16. **get_assignment_grades**
    - **Description**: Retrieves grade information for assignments
    - **Endpoint**: `GET /courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}`
    - **Use Cases**: "what grade did I get on assignment 456", "show my assignment grade"

### Announcements (1 tool)

17. **list_announcements**
    - **Description**: Retrieves announcements for a course
    - **Endpoint**: `GET /announcements`
    - **Use Cases**: "show announcements", "get course announcements", "recent announcements"

### Modules (2 tools)

18. **list_modules**
    - **Description**: Retrieves modules for a course
    - **Endpoint**: `GET /courses/{course_id}/modules`
    - **Use Cases**: "show course modules", "list modules", "what modules are in this course"

19. **list_module_items**
    - **Description**: Retrieves items within a module
    - **Endpoint**: `GET /courses/{course_id}/modules/{module_id}/items`
    - **Use Cases**: "show items in module 789", "list module content"

### Discussions (2 tools)

20. **list_discussions**
    - **Description**: Retrieves discussions for a course
    - **Endpoint**: `GET /courses/{course_id}/discussion_topics`
    - **Use Cases**: "show discussions", "list course discussions"

21. **get_discussion**
    - **Description**: Retrieves details about a specific discussion
    - **Endpoint**: `GET /courses/{course_id}/discussion_topics/{topic_id}`
    - **Use Cases**: "show discussion 123", "get discussion details"

### Quizzes (2 tools)

22. **list_quizzes**
    - **Description**: Retrieves quizzes for a course
    - **Endpoint**: `GET /courses/{course_id}/quizzes`
    - **Use Cases**: "show quizzes", "list course quizzes", "what quizzes are available"

23. **get_quiz**
    - **Description**: Retrieves details about a specific quiz
    - **Endpoint**: `GET /courses/{course_id}/quizzes/{quiz_id}`
    - **Use Cases**: "show quiz 123 details", "get quiz information"

## 🎯 How AI Recognizes Tools

The AI uses **intelligent matching**:

1. **Keyword Matching**: Matches query words to tool keywords
   - "assignments" → assignment tools
   - "grades" → grade tools
   - "courses" → course tools

2. **Use Case Matching**: Compares query to example use cases
   - "show my courses" → matches `list_courses` use case

3. **Description Matching**: Searches tool descriptions
   - "what's due" → matches planner/calendar tools

4. **Score Ranking**: Returns top 5 matches
   - AI selects best tool via OpenAI function calling

## ✅ All Tools Verified

- ✅ All 23 tools have complete descriptions
- ✅ All tools have example use cases
- ✅ All tools have parameter definitions
- ✅ All tools have endpoint paths
- ✅ All tools are ready for AI selection


