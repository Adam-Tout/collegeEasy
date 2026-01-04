# 📊 Canvas API Tools - Usage Explanation

## Actual Count: **23 Tools** (Not 30+)

I apologize for the confusion - I said "30+" but actually implemented **23 tools**. Here's the breakdown:

## ✅ All 23 Tools Are Available

**Yes, all 23 tools are available to the AI agent!**

### How They're Used:

1. **All 23 tools are registered** in `CANVAS_API_TOOLS` array
2. **All 23 are converted to OpenAI functions** in `chat-with-tools.ts`
3. **AI can select ANY of them** based on user queries
4. **AI uses function calling** to pick the right tool(s)

### Tool Categories (23 total):

1. **User & Profile** (2 tools)
   - `get_user`
   - `get_user_profile`

2. **Courses** (3 tools)
   - `list_courses`
   - `get_course`
   - `get_course_syllabus`

3. **Assignments** (3 tools)
   - `list_assignments`
   - `get_assignment`
   - `get_all_assignments`

4. **Submissions** (2 tools)
   - `list_submissions`
   - `get_submission`

5. **Planner & Calendar** (2 tools)
   - `get_planner_items`
   - `list_calendar_events`

6. **Files** (2 tools)
   - `list_course_files`
   - `get_file`

7. **Grades** (2 tools)
   - `get_grades`
   - `get_assignment_grades`

8. **Announcements** (1 tool)
   - `list_announcements`

9. **Modules** (2 tools)
   - `list_modules`
   - `list_module_items`

10. **Discussions** (2 tools)
    - `list_discussions`
    - `get_discussion`

11. **Quizzes** (2 tools)
    - `list_quizzes`
    - `get_quiz`

## 🎯 How AI Selects Tools

The AI doesn't use ALL tools at once - it intelligently selects the right one(s) based on:

1. **User Query Analysis**: 
   - "Show my courses" → selects `list_courses`
   - "What's due this week?" → selects `get_planner_items`
   - "Show my grades" → selects `get_grades`

2. **OpenAI Function Calling**:
   - AI receives all 23 tools as available functions
   - Analyzes the user's message
   - Decides which tool(s) to call
   - Can call multiple tools if needed

3. **Context Awareness**:
   - If user is in an assignment workspace, AI knows the course/assignment context
   - Can use that context to select appropriate tools

## 📝 Example Scenarios

### Scenario 1: "Show me my courses"
- **AI selects**: `list_courses`
- **Tool used**: 1 of 23
- **Result**: Returns user's courses

### Scenario 2: "What assignments are due this week?"
- **AI selects**: `get_planner_items` or `list_assignments`
- **Tool used**: 1-2 of 23
- **Result**: Returns upcoming assignments

### Scenario 3: "Show my grades for CS 101"
- **AI might select**: 
  1. `get_course` (to get course ID)
  2. `get_grades` (to get grades)
- **Tools used**: 2 of 23
- **Result**: Returns course grades

## ✅ Summary

- **Total Tools**: 23 (not 30+ - I was optimistic!)
- **All Available**: Yes, all 23 are registered and available
- **All Used**: No, AI selects only the ones needed for each query
- **Smart Selection**: AI picks the right tool(s) based on user intent

The system is designed to be **efficient** - the AI only calls the tools it needs, not all 23 at once!

## 🔧 Want More Tools?

If you need additional Canvas API endpoints, I can add them to the registry. Just let me know which ones you'd like!


