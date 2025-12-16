# EDIT-CHATBOT

A full-stack AI chatbot application with a modern React frontend and Express backend powered by OpenAI.

## 🚀 Features

- **AI-Powered Conversations**: Leverages OpenAI API for intelligent responses
- **Modern UI**: Built with React 19 and styled with Tailwind CSS
- **Smooth Animations**: Framer Motion for fluid transitions
- **Real-time Chat**: Responsive messaging interface

## 📁 Project Structure

```
EDIT-CHATBOT/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── ...
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React (icons)

### Backend
- Node.js
- Express
- OpenAI API
- UUID
- Tiktoken

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EDIT-CHATBOT
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## 🚀 Running the Application

### Start the server
```bash
cd server
npm start
```

### Start the client (in a new terminal)
```bash
cd client
npm run dev
```

The client will be available at `http://localhost:5173` (default Vite port).

## 📝 Scripts

### Client
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Server
| Command | Description |
|---------|-------------|
| `npm start` | Start the server |

## 📄 License

ISC

---

Made with ❤️
