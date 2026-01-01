# Canvas AI Assistant

A sophisticated, AI-powered Canvas LMS integration that helps students manage assignments, get intelligent study assistance, and optimize their learning experience.

## ✨ Features

### 🔐 User Management
- **Secure Authentication**: Email/password registration and login
- **Profile Management**: Update personal information and preferences
- **Multi-Canvas Support**: Connect multiple Canvas accounts per user
- **Demo Mode**: Try the app with sample assignments without Canvas API connection

### 🎨 Sophisticated UI/UX
- **Modern Design System**: Sophisticated color palette with gradients and animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Glass Morphism Effects**: Modern UI with backdrop blur and transparency
- **Smooth Animations**: Fade-in, slide-in, and pulse animations for better UX

### 🤖 AI-Powered Assistance
- **Intelligent Chat Interface**: Context-aware AI assistant powered by GPT-4.1-nano
- **Document Analysis**: Upload PDFs and text files for AI analysis
- **Exam Date Detection**: Automatically extract exam dates from syllabi
- **Study Planning**: Get personalized study recommendations
- **Demo Mode Support**: Works with demo data when API key is not configured

### 📅 Assignment Management
- **7-Day Calendar View**: Visual assignment calendar with color-coded urgency
- **Clickable Assignments**: Click any assignment to view details in workspace
- **Assignment Workspaces**: Dedicated spaces for writing and coding assignments
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Document Editor**: Rich text editor for writing assignments
- **Demo Assignments**: 10 sample assignments available for testing UI/UX

### 💳 Subscription System
- **Multiple Plans**: Free, Basic, Premium, and Enterprise tiers
- **Feature Gating**: Different capabilities based on subscription level
- **Payment Integration**: Ready for Stripe integration
- **Subscription Management**: Easy plan upgrades and cancellations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - app works in demo mode without it)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adam-Tout/collegeEasy.git
   cd collegeEasy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   The `.env` file should already exist (created from `env.example`). If not, create it:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key on **line 7**:
   ```env
   VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
   
   **Note**: The app works in demo mode without an API key, but AI features will use pre-defined responses instead of real AI.

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   If `npm` is not recognized, you may need to refresh your terminal or use the full path:
   ```bash
   & "C:\Program Files\nodejs\npm.cmd" run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Demo Mode

The app includes a **demo mode** that works without Canvas API or OpenAI API keys:
- **Demo User**: Login with `demo@example.com` / `demo123`
- **Demo Assignments**: 10 sample assignments across 5 courses
- **Clickable Assignments**: Click any assignment in the calendar to view it in the workspace
- **Demo AI**: Pre-defined responses when OpenAI API key is not configured

This allows you to test and develop the UI/UX without needing API connections.

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **Zustand** for state management
- **React Router** for navigation
- **Monaco Editor** for code editing
- **PDF.js** for document parsing
- **OpenAI SDK** for AI features (GPT-4.1-nano-2025-04-14)

### Design System
- **Primary Colors**: Deep blue theme (#2563eb)
- **Secondary Colors**: Emerald green theme (#10b981)
- **Accent Colors**: Purple theme (#a855f7)
- **Neutral Colors**: Sophisticated grays
- **Status Colors**: Success, warning, error states

### Component Architecture
```
src/
├── components/          # Reusable UI components
│   ├── AssignmentWorkspace.tsx
│   ├── CalendarView.tsx
│   ├── ChatInterface.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── CodeEditor.tsx
│   ├── DocumentAttachment.tsx
│   └── DocumentEditor.tsx
├── pages/              # Route components
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── SettingsPage.tsx
│   ├── AssignmentWorkspacePage.tsx
│   └── ConnectionTest.tsx
├── stores/             # State management
│   ├── userStore.ts
│   └── authStore.ts
├── services/           # API services
│   ├── aiService.ts    # OpenAI integration (GPT-4.1-nano)
│   └── canvasService.ts # Canvas API integration with demo mode
├── data/               # Demo data
│   └── demoData.ts     # Sample courses and assignments
├── types/              # TypeScript definitions
│   ├── user.ts
│   └── canvas.ts
└── hooks/              # Custom React hooks
```

## 🔧 Configuration

### Environment Variables

#### Client-Side (`.env` file):
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API endpoint URL | No | `/api/chat` (relative) |
| `VITE_USE_BACKEND_API` | Enable/disable backend API | No | `true` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | No | - |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No | - |
| `VITE_DEBUG` | Enable debug logging | No | `false` |

#### Server-Side (Vercel Dashboard):
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key (stored securely on server) | Yes* | - |

\* *Required for real AI features. Set in Vercel dashboard, never in `.env` file. App works in demo mode without it.*

**⚠️ Security Note**: The OpenAI API key is now stored securely on the Vercel server and never exposed to the frontend. This is the recommended production setup.

### Canvas Integration

1. **Get Canvas Access Token**:
   - Log into your Canvas account
   - Go to Account → Settings → Approved Integrations
   - Click "New Access Token"
   - Copy the generated token

2. **Add Canvas Account**:
   - Go to Settings → Canvas Accounts
   - Enter your Canvas domain (e.g., `school.instructure.com`)
   - Paste your access token
   - Click "Add Account"

**Note**: You can use the app without Canvas integration! The demo mode includes sample assignments that you can click and interact with to test the UI/UX.

## 🚀 Deployment

### ⚠️ Important: Secure AI Backend Setup

**The AI features now use a secure backend API** instead of exposing API keys in the frontend. This is the recommended production setup.

**📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.**

### Quick Start

1. **Deploy to Vercel** (includes serverless API):
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Add Environment Variables in Vercel Dashboard**:
   - `OPENAI_API_KEY`: Your OpenAI API key (server-side only)
   - `VITE_API_URL`: Your Vercel deployment URL (optional, defaults to `/api/chat`)

3. **That's it!** Your AI backend is now secure and production-ready.

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Deploy to AWS S3 + CloudFront

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Set up CloudFront distribution
   - Point to your S3 bucket
   - Configure custom domain (optional)

## 🔒 Security Considerations

### Authentication
- JWT tokens for user authentication
- Secure password hashing (bcrypt)
- Session management with automatic refresh
- CSRF protection

### Data Protection
- Canvas tokens encrypted at rest
- Secure API communication (HTTPS)
- Input validation and sanitization
- Rate limiting on API endpoints

### Privacy
- No data collection without consent
- GDPR compliance ready
- Data retention policies
- User data export/deletion

## 🧪 Testing

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npm run check
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for offline support
- **CDN Ready**: Optimized for global distribution

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### npm command not recognized
If you get `npm is not recognized`, you may need to:
1. Restart your terminal/PowerShell
2. Or use the full path: `& "C:\Program Files\nodejs\npm.cmd" run dev`

### AI responses are too quick
- Check browser console (F12) for API logs
- Verify `VITE_OPENAI_API_KEY` is set in `.env` file
- If using demo mode, responses will be instant (this is expected)
- Real API calls take 1-3 seconds and show detailed logs in console

### Demo assignments not clickable
- Make sure you're logged in (use demo credentials: `demo@example.com` / `demo123`)
- Check that you're viewing assignments in the calendar view
- Assignments should navigate to `/workspace/{courseId}/{assignmentId}` when clicked

## 🆘 Support

### Documentation
- Check browser console for detailed API logs
- Demo mode works without any API keys
- All AI API calls are logged to console for debugging

### Community
- [GitHub Discussions](https://github.com/Adam-Tout/collegeEasy/discussions)
- [Issue Tracker](https://github.com/Adam-Tout/collegeEasy/issues)

## 🎯 Roadmap

### Phase 1 (Current) ✅
- ✅ User authentication system
- ✅ Canvas integration with demo mode fallback
- ✅ AI chat interface (GPT-4.1-nano)
- ✅ Assignment calendar with clickable assignments
- ✅ Assignment workspaces (code & document editors)
- ✅ Subscription system
- ✅ Demo data for UI/UX development

### Phase 2 (Next) 🔄
- 🔄 Real-time collaboration
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics
- 🔄 Team management
- 🔄 Assignment submission tracking

### Phase 3 (Future) 📋
- 📋 AI-powered study plans
- 📋 Grade prediction
- 📋 Integration with other LMS platforms
- 📋 Enterprise features
- 📋 Offline mode support

---

**Built with ❤️ for students, by students.**