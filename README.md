# EDIT-CHATBOT 🤖

A production-ready, full-stack AI chatbot application with advanced rate limiting, admin dashboard, and token management system. Built with React, Node.js, Express, and OpenAI GPT-4o-mini.

## ✨ Key Features

### 🎯 Core Chat Functionality
- **AI-Powered Conversations**: Leverages OpenAI GPT-4o-mini for intelligent, context-aware responses
- **Conversation Memory**: Maintains chat history with sliding window context (last 5 messages)
- **Saved Conversations**: Persistent conversation storage with search and retrieval
- **Message Feedback**: Like/dislike system for response quality tracking
- **Real-time Interface**: Smooth, responsive chat experience with typing indicators

### 🔐 Authentication & Security
- **Google OAuth 2.0**: Secure authentication with Google Sign-In
- **JWT Tokens**: Industry-standard token-based authentication
- **Role-Based Access**: User and Admin roles with different permissions
- **Session Management**: Secure session handling with automatic expiration

### ⚡ Advanced Rate Limiting & Token Management
- **Request-Based Limits**: 
  - Users: 20 requests per 24 hours
  - Admins: 100 requests per 24 hours
- **Token-Based Limits**: 
  - Users: 2000 tokens per 24 hours
  - Admins: 10000 tokens per 24 hours
- **Automatic Reset**: 24-hour rolling windows with automatic limit resets
- **Server-Side Validation**: All limits enforced server-side to prevent abuse
- **Token Request System**: Users can request limit increases from admins
- **Violation Tracking**: Monitors and logs rate limit violations
- **Ban System**: Admin ability to ban users with expiration dates

### 📊 Comprehensive Admin Dashboard

#### Analytics Tab
- **System Metrics**: Total users, conversations, messages, active users
- **Visual Charts**: 
  - Messages per day (30-day bar chart)
  - Feedback distribution (pie chart)
- **Engagement Insights**: Average messages per conversation, feedback ratios
- **Trend Analysis**: Daily activity patterns and peak usage times

#### Conversations Tab
- **Full Conversation List**: View all user conversations with detailed metadata
- **Advanced Filtering**: Filter by date range, message count
- **Preview Modal**: Quick preview of first 3 messages
- **Bulk Actions**: Delete conversations, export to JSON
- **Rich Context**: User info, timestamps, duration, feedback stats

#### Users Tab
- **User Management**: View and manage all registered users
- **Inline Role Editing**: Change user roles (User ↔ Admin) with one click
- **Activity Tracking**: Last active date, join date, total conversations
- **Filtering**: Filter by role and activity status
- **User Details**: View user's conversation history
- **Data Export**: Export user list to JSON

#### Token Requests Tab
- **Request Management**: View and process user token increase requests
- **Status Tracking**: Pending, approved, and rejected requests
- **Approval Workflow**: Approve requests to reset user limits
- **Admin Responses**: Add custom messages when approving/rejecting
- **Usage Context**: See user's current token and request usage
- **Statistics**: Real-time stats on request volumes

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Modern, translucent UI elements with blur effects
- **Animated Background**: Dynamic video gallery with smooth transitions
- **Cyberpunk Aesthetic**: Futuristic color scheme (cyan, pink, purple gradients)
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion for fluid transitions and micro-interactions
- **Custom Fonts**: Orbitron and Outfit for modern typography

### 🛡️ Abuse Prevention
- **IP-Based Tracking**: Monitor requests per IP address
- **Violation Counting**: Track repeated rate limit violations
- **Temporary Bans**: Admin ability to ban users with automatic expiration
- **Request Limits**: Maximum 3 token requests per user per day
- **Duplicate Prevention**: Prevents multiple pending token requests

## 🏗️ Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Production-ready animation library
- **Lucide React** - Beautiful, consistent icon set
- **React Router DOM** - Client-side routing
- **React Markdown** - Render AI responses with markdown support
- **Google OAuth** - @react-oauth/google for authentication

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Fast, minimalist web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **OpenAI API** - GPT-4o-mini for AI responses
- **JWT** - JSON Web Tokens for authentication
- **Google Auth Library** - Server-side OAuth verification
- **Tiktoken** - Accurate token counting for OpenAI models
- **Express Rate Limit** - Request rate limiting middleware
- **Redis** - In-memory store for rate limiting (production-ready)

### DevOps & Tools
- **ESLint** - Code linting and quality
- **Autoprefixer** - CSS vendor prefixing
- **PostCSS** - CSS processing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
EDIT-CHATBOT/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx      # Admin dashboard with 4 tabs
│   │   │   ├── BackgroundGallery.jsx   # Animated video backgrounds
│   │   │   ├── GoogleLoginButton.jsx   # OAuth login component
│   │   │   ├── InputArea.jsx           # Chat input with token display
│   │   │   ├── LandingPage.jsx         # Home page
│   │   │   ├── MessageList.jsx         # Chat messages with feedback
│   │   │   ├── RequestTokensModal.jsx  # Token request modal
│   │   │   ├── Sidebar.jsx             # Conversation sidebar
│   │   │   └── TokenRequestsPanel.jsx  # Admin token requests tab
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Authentication state
│   │   ├── hooks/
│   │   │   └── useChat.js              # Chat logic hook
│   │   ├── App.jsx                     # Main app component
│   │   └── index.css                   # Global styles
│   ├── public/
│   │   └── videos/                     # Background videos
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification
│   │   │   └── rateLimiter.js          # Rate limiting middleware
│   │   ├── models/
│   │   │   ├── User.js                 # User schema with rate limits
│   │   │   ├── Conversation.js         # Conversation schema
│   │   │   ├── Message.js              # Message schema
│   │   │   ├── Log.js                  # Admin log schema
│   │   │   └── TokenRequest.js         # Token request schema
│   │   ├── routes/
│   │   │   ├── auth.js                 # Authentication routes
│   │   │   ├── admin.js                # Admin dashboard routes
│   │   │   ├── conversations.js        # Conversation routes
│   │   │   ├── messages.js             # Message routes
│   │   │   └── tokenRequests.js        # Token request routes
│   │   ├── services/
│   │   │   └── tokenValidator.js       # Token/rate limit validation
│   │   ├── openai.js                   # OpenAI API integration
│   │   └── index.js                    # Server entry point
│   ├── .env                            # Environment variables
│   └── package.json
│
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key
- Google OAuth 2.0 credentials

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EDIT-CHATBOT
```

### 2. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

**Server Configuration (`server/.env`):**
```env
# Core settings
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com  # URL of your deployed frontend

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/EDIT_CHATBOT
# REDIS_URL=redis://... (Skipped for demo)

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# OpenAI
OPENAI_API_KEY=sk-...
```

**Client Configuration (`client/.env`):**
```env
VITE_API_BASE_URL=https://your-backend-domain.com  # URL of your deployed backend
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - Your production domain
6. Add authorized redirect URIs
7. Copy Client ID and Client Secret to `.env`

### 5. Run the Application

**Start the server (Terminal 1):**
```bash
cd server
npm start
```

**Start the client (Terminal 2):**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/google          # Google OAuth login
GET    /api/auth/me              # Get current user
```

### Chat
```
POST   /chat                     # Send message
GET    /api/rate-limit-status/:userId  # Get user's rate limit status
```

### Conversations
```
GET    /api/conversations        # Get user's conversations
POST   /api/conversations        # Create new conversation
DELETE /api/conversations/:id    # Delete conversation
```

### Messages
```
GET    /api/messages/:conversationId  # Get conversation messages
POST   /api/messages             # Create message
PUT    /api/messages/:id/feedback  # Update message feedback
```

### Token Requests
```
POST   /api/token-requests       # Submit token request
GET    /api/token-requests/my-requests  # Get user's requests
GET    /api/token-requests/can-request  # Check if can request
```

### Admin
```
GET    /api/admin/analytics/overview      # System metrics
GET    /api/admin/analytics/feedback-trends  # Feedback charts
GET    /api/admin/conversations           # All conversations (filtered)
GET    /api/admin/conversations/:id/preview  # Preview conversation
DELETE /api/admin/conversations/:id       # Delete conversation
GET    /api/admin/users                   # All users (filtered)
GET    /api/admin/users/:id/conversations  # User's conversations
PUT    /api/admin/users/:id/role          # Change user role
DELETE /api/admin/users/:id               # Delete user
GET    /api/admin/token-requests          # All token requests
PUT    /api/admin/token-requests/:id/approve  # Approve request
PUT    /api/admin/token-requests/:id/reject   # Reject request
GET    /api/admin/token-requests/stats    # Request statistics
```

## 🎯 Key Features Explained

### Rate Limiting System
The application implements a sophisticated multi-layer rate limiting system:

1. **Request-Based Limits**: Tracks number of API calls per 24-hour window
2. **Token-Based Limits**: Monitors OpenAI token consumption per 24-hour window
3. **Automatic Resets**: Both limits reset automatically after 24 hours
4. **Server-Side Enforcement**: All validation happens server-side to prevent client manipulation
5. **Graceful Degradation**: Users receive clear messages when limits are reached

### Token Request Workflow
1. User hits token limit during conversation
2. "Request More Tokens" button appears (if eligible)
3. User submits request with reason
4. Admin reviews request in dashboard
5. Admin approves (resets limits) or rejects (with reason)
6. User can make up to 3 requests per day
7. Only one pending request allowed at a time

### Admin Dashboard Analytics
- **Real-time Metrics**: Live data on users, conversations, messages
- **Visual Charts**: Interactive charts for trends and patterns
- **Filtering**: Advanced filters on all tabs for data exploration
- **Export**: JSON export for external analysis
- **User Management**: One-click role changes and user actions

## 🔒 Security Features

- **Google OAuth 2.0**: Industry-standard authentication
- **JWT Tokens**: Secure, stateless authentication
- **Server-Side Validation**: All critical operations validated server-side
- **Rate Limiting**: Prevents API abuse and excessive costs
- **CORS Protection**: Configured for specific origins
- **Environment Variables**: Sensitive data stored securely
- **Ban System**: Admin ability to temporarily or permanently ban users
- **Violation Tracking**: Monitors and logs suspicious activity

## 🎨 Design Philosophy

The UI follows a modern cyberpunk aesthetic with:
- **Glassmorphism**: Translucent panels with backdrop blur
- **Neon Accents**: Cyan (#00fff5) and pink (#ff007a) highlights
- **Dark Theme**: Deep purple/blue gradients
- **Smooth Animations**: Framer Motion for all transitions
- **Responsive**: Mobile-first design approach

## 📊 Database Schema

### User
- Authentication (Google ID, email, name, profile picture)
- Role (user/admin)
- Rate limits (request count, token usage, windows, violations)
- Ban status and expiration
- Activity tracking (last active, last login)

### Conversation
- User reference
- Title
- Created/updated timestamps
- Message count

### Message
- Conversation reference
- Role (user/assistant)
- Content
- Feedback (like/dislike)
- Timestamps

### TokenRequest
- User reference
- Status (pending/approved/rejected)
- Reason and admin response
- Current usage snapshot
- Processed by (admin reference)
- Timestamps

### Log
- User reference
- Conversation and message references
- Feedback
- Timestamps (for admin analytics)

## �️ Security Best Practices

1.  **Environment Variables**: Never commit `.env` files. Use the hosting platform's environment variable manager.
2.  **HTTPS**: Always use HTTPS in production. Most platforms (Vercel, Heroku, Azure) provide this automatically.
3.  **Database Access**: Whitelist only your backend IP addresses in MongoDB Atlas and Redis Cloud.
4.  **JWT Secret**: Use a strong, random string (at least 32 characters) for `JWT_SECRET`.
5.  **Headers**: The server automatically sets security headers (CORS, Rate Limits). Ensure your frontend domain is correctly set in `FRONTEND_URL`.

## 🚀 Deployment Checklist

- [ ] **Database**: MongoDB Atlas and Redis Cloud instances provisioned.
- [ ] **Backend**: Deployed to cloud provider (Azure/Render/Heroku/Railway).
    - [ ] Env vars set: `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL`.
- [ ] **Frontend**: Deployed to Vercel/Netlify.
    - [ ] Build command: `npm run build`
    - [ ] Output directory: `dist`
    - [ ] Env vars set: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`.
- [ ] **Verification**:
    - [ ] Login works (Google OAuth).
    - [ ] Chat history persists (MongoDB).
    - [ ] Sessions persist across reloads (Redis).

### Deployment Steps

**1. Backend (e.g., Render/Railway):**
1.  Connect your GitHub repo.
2.  Set Root Directory to `server`.
3.  Build Command: `npm install`
4.  Start Command: `npm start`
5.  Add all environment variables from `server/.env`.

**2. Frontend (Vercel):**
1.  Connect your GitHub repo.
2.  Set Root Directory to `client`.
3.  Build Command: `npm run build`
4.  Output Directory: `dist`
5.  Add environment variables from `client/.env`.

## 📈 Future Enhancements

- [ ] Redis integration for production rate limiting
- [ ] Email notifications for token requests
- [ ] Advanced analytics with more charts
- [ ] Conversation export (PDF/TXT)
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] File upload support
- [ ] Custom AI model selection
- [ ] Conversation sharing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ by Shantanu Vhanmore

---

**Note**: This is a production-ready application with enterprise-grade features including advanced rate limiting, comprehensive admin controls, and robust security measures.
