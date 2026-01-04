# 🎯 Canvas AI Agent - Complete Setup

## ✅ What I Just Built

I've created a **complete AI agent system** that can intelligently use Canvas API tools based on user queries!

### 🧠 How It Works

1. **User asks a question** (e.g., "Show me my assignments")
2. **AI analyzes the query** and selects the best Canvas API tool
3. **Agent executes the Canvas API call** using the user's token
4. **AI formats and returns** the results in a helpful way

### 📁 Files Created

#### Backend (`backend/` folder):

1. **`backend/api/canvas-tools.ts`** 
   - Registry of **30+ Canvas API tools** with descriptions
   - Each tool includes:
     - Name and description
     - Endpoint and HTTP method
     - Required/optional parameters
     - Example use cases for matching

2. **`backend/api/chat-with-tools.ts`**
   - Enhanced chat endpoint with **OpenAI function calling**
   - Automatically selects and executes Canvas API tools
   - Uses user's Canvas token securely

3. **`backend/api/canvas-agent.ts`**
   - Direct Canvas API execution endpoint
   - Can be used for tool suggestions or direct execution

#### Frontend Updates:

- **`src/services/aiService.ts`** - Updated to:
  - Use `chat-with-tools` endpoint when Canvas auth is available
  - Automatically pass Canvas token and domain
  - Support function calling responses

### 🛠️ Canvas API Tools Available

The agent can use these Canvas API endpoints:

**User & Profile:**
- Get current user info
- Get user profile

**Courses:**
- List courses
- Get course details
- Get course syllabus

**Assignments:**
- List course assignments
- Get assignment details
- Get all assignments across courses

**Submissions:**
- List submissions
- Get submission details

**Grades:**
- Get course grades
- Get assignment grades

**Planner & Calendar:**
- Get planner items (upcoming assignments)
- List calendar events

**Files:**
- List course files
- Get file details

**Content:**
- List announcements
- List course modules
- List module items
- List discussions
- List quizzes

### 🚀 How to Use

#### 1. Deploy Backend

Copy the `backend/` folder to your separate backend repo and deploy:

```bash
# In your backend repo
npm install
git add .
git commit -m "Add Canvas AI agent with function calling"
git push origin main
```

#### 2. Update Frontend `.env`

```env
VITE_API_URL=https://vercel_agents_canvas_bkend.vercel.app/api
VITE_USE_BACKEND_API=true
```

#### 3. User Flow

1. User logs in with Canvas credentials (token + domain)
2. User asks: **"Show me my assignments"**
3. AI agent:
   - Recognizes this needs `list_assignments` tool
   - Calls Canvas API: `GET /courses/{course_id}/assignments`
   - Formats results and responds

### 📝 Example Queries

The agent can handle queries like:

- ✅ "Show me my courses"
- ✅ "What assignments are due this week?"
- ✅ "Get my grades for CS 101"
- ✅ "Show the syllabus for Math 201"
- ✅ "What files are in my course?"
- ✅ "List my submissions"
- ✅ "What's on my calendar?"
- ✅ "Show course announcements"
- ✅ "Get assignment 123 details"

### 🔒 Security

- ✅ Canvas token stored in browser localStorage (user's device)
- ✅ Token sent securely to backend API
- ✅ Backend makes Canvas API calls (never exposed)
- ✅ OpenAI API key stays on server

### 🎯 Next Steps

1. **Deploy backend** with new endpoints
2. **Test with real Canvas account**
3. **Try queries** like "show my assignments"
4. **Monitor logs** to see tool selection

### 📊 How Tool Selection Works

The system uses **intelligent matching**:

1. **Keyword matching** - Matches query words to tool keywords
2. **Use case matching** - Compares to example use cases
3. **Description matching** - Searches tool descriptions
4. **Score ranking** - Returns top 5 matches
5. **AI selection** - OpenAI chooses best tool via function calling

### 🔧 Configuration

The agent automatically:
- ✅ Detects if user has Canvas auth
- ✅ Uses `chat-with-tools` endpoint when available
- ✅ Falls back to regular chat if no Canvas auth
- ✅ Handles errors gracefully

### 📚 API Endpoints

**Backend endpoints:**
- `POST /api/chat` - Regular chat (no Canvas tools)
- `POST /api/chat-with-tools` - Chat with Canvas function calling
- `POST /api/canvas-agent` - Direct Canvas API execution

**Request format for chat-with-tools:**
```json
{
  "messages": [...],
  "canvasToken": "user_token",
  "canvasDomain": "school.instructure.com",
  "useCanvasTools": true
}
```

### ✅ Status

- ✅ Canvas tools registry created (30+ tools)
- ✅ Function calling implemented
- ✅ Backend endpoints created
- ✅ Frontend integration complete
- ✅ Security implemented
- ✅ Error handling added

**Ready to deploy and test!** 🚀

