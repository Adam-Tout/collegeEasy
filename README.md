# Canvas Student Dashboard

A modern web application that integrates with Canvas LMS to help students manage their assignments and get AI-powered assistance.

## Features

### 🔐 Canvas Authentication
- Secure login using Canvas API access tokens
- Persistent authentication state
- Support for any Canvas instance

### 📅 Assignment Calendar
- 7-day view of upcoming assignments
- Color-coded urgency indicators (red for due soon, yellow for this week, green for later)
- Click assignments to open workspace
- Real-time data from Canvas API

### 🤖 AI Assistant
- Integrated OpenAI chat interface
- Context-aware responses about your assignments
- Help with study planning and assignment guidance
- Natural language queries about coursework

### ✍️ Assignment Workspaces
- **Document Editor**: For English/writing assignments with instructions panel
- **Code Editor**: Monaco Editor with syntax highlighting for programming assignments
- Save and download functionality
- Word/character count for essays

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Code Editor**: Monaco Editor (VS Code editor)
- **AI Integration**: OpenAI API
- **Canvas Integration**: Canvas REST API

## Setup Instructions

1. **Get Canvas Access Token**:
   - Log into your Canvas account
   - Go to Account → Settings → Approved Integrations
   - Click "New Access Token"
   - Copy the generated token

2. **Run the Application**:
   ```bash
   npm install
   npm run dev
   ```

3. **Use the App**:
   - Enter your Canvas domain (e.g., `school.instructure.com`)
   - Paste your access token
   - Click "Connect to Canvas"

## Canvas API Integration

The app uses these Canvas API endpoints:
- `/api/v1/users/self` - User profile
- `/api/v1/courses` - Enrolled courses
- `/api/v1/courses/:id/assignments` - Course assignments
- `/api/v1/planner/items` - Upcoming items

## Demo Features

1. **Login Page**: Secure Canvas authentication
2. **Dashboard**: Split-screen with calendar and AI chat
3. **Calendar View**: 7-day assignment overview
4. **AI Chat**: Ask about assignments, due dates, study help
5. **Assignment Workspaces**: Click any assignment to open editor
6. **Document Editor**: For writing assignments
7. **Code Editor**: For programming assignments with Monaco

## Hackathon Notes

This project was built for a hackathon with focus on:
- **Functionality over architecture** - Working code that demonstrates the concept
- **Clean, readable code** - Well-structured components and services
- **Modern UI/UX** - Responsive design with Tailwind CSS
- **Real Canvas integration** - Actual API calls to Canvas LMS
- **AI-powered assistance** - OpenAI integration for student support

## Future Enhancements

- File upload/download to Canvas
- Real-time collaboration
- Advanced code execution environment
- Mobile app version
- Grade tracking and analytics
- Study schedule optimization

## License

Built for educational purposes and hackathon demonstration.