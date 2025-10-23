# Canvas AI Assistant

A sophisticated, AI-powered Canvas LMS integration that helps students manage assignments, get intelligent study assistance, and optimize their learning experience.

## ✨ Features

### 🔐 User Management
- **Secure Authentication**: Email/password registration and login
- **Profile Management**: Update personal information and preferences
- **Multi-Canvas Support**: Connect multiple Canvas accounts per user

### 🎨 Sophisticated UI/UX
- **Modern Design System**: Sophisticated color palette with gradients and animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Glass Morphism Effects**: Modern UI with backdrop blur and transparency
- **Smooth Animations**: Fade-in, slide-in, and pulse animations for better UX

### 🤖 AI-Powered Assistance
- **Intelligent Chat Interface**: Context-aware AI assistant for assignment help
- **Document Analysis**: Upload PDFs and text files for AI analysis
- **Exam Date Detection**: Automatically extract exam dates from syllabi
- **Study Planning**: Get personalized study recommendations

### 📅 Assignment Management
- **7-Day Calendar View**: Visual assignment calendar with color-coded urgency
- **Assignment Workspaces**: Dedicated spaces for writing and coding assignments
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Document Editor**: Rich text editor for writing assignments

### 💳 Subscription System
- **Multiple Plans**: Free, Basic, Premium, and Enterprise tiers
- **Feature Gating**: Different capabilities based on subscription level
- **Payment Integration**: Ready for Stripe integration
- **Subscription Management**: Easy plan upgrades and cancellations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI features)

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
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_API_URL=http://localhost:3001/api
   VITE_APP_NAME=Canvas AI Assistant
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **Zustand** for state management
- **React Router** for navigation
- **Monaco Editor** for code editing
- **PDF.js** for document parsing

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
│   ├── ChatInterface.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── DocumentAttachment.tsx
│   └── CalendarView.tsx
├── pages/              # Route components
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   └── SettingsPage.tsx
├── stores/             # State management
│   ├── userStore.ts
│   └── authStore.ts
├── services/           # API services
│   ├── aiService.ts
│   └── canvasService.ts
├── types/              # TypeScript definitions
│   ├── user.ts
│   └── canvas.ts
└── hooks/              # Custom React hooks
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | No |
| `VITE_DEBUG` | Enable debug logging | No |

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

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

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

### Run Tests
```bash
npm run test
```

### Lint Code
```bash
npm run lint
```

### Type Check
```bash
npm run check
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

## 🆘 Support

### Documentation
- [API Documentation](docs/api.md)
- [Component Library](docs/components.md)
- [Deployment Guide](docs/deployment.md)

### Community
- [GitHub Discussions](https://github.com/Adam-Tout/collegeEasy/discussions)
- [Issue Tracker](https://github.com/Adam-Tout/collegeEasy/issues)

### Contact
- Email: support@canvas-ai-assistant.com
- Twitter: [@CanvasAI](https://twitter.com/canvas-ai)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ User authentication system
- ✅ Canvas integration
- ✅ AI chat interface
- ✅ Assignment calendar
- ✅ Subscription system

### Phase 2 (Next)
- 🔄 Real-time collaboration
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics
- 🔄 Team management

### Phase 3 (Future)
- 📋 AI-powered study plans
- 📋 Grade prediction
- 📋 Integration with other LMS
- 📋 Enterprise features

---

**Built with ❤️ for students, by students.**