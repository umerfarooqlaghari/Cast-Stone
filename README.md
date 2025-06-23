"# Cast-Stone - Full Stack Web Application

A modern full-stack web application built with Node.js backend and Next.js frontend with TypeScript and modular CSS architecture.

## 🏗️ Monorepo Structure

```
Cast-Stone/
├── backend/                 # Node.js Express server
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── .env                # Environment variables
│   ├── .env.example        # Environment template
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # Next.js React application
│   ├── src/
│   │   └── app/           # App router pages
│   │       ├── about/     # About page with modular CSS
│   │       ├── contact/   # Contact page with modular CSS
│   │       ├── page.tsx   # Home page
│   │       └── page.module.css # Home page styles
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── package.json           # Root package.json with workspace scripts
└── README.md              # This file
```

## 🚀 Features

- **Backend**: Node.js with Express.js framework
- **Frontend**: Next.js 14+ with TypeScript and App Router
- **Styling**: Modular CSS architecture (each page has its own .module.css file)
- **Database**: MongoDB with Mongoose ODM
- **Environment**: Configurable environment variables
- **Development**: Hot reload for both frontend and backend
- **Monorepo**: Single repository with workspace management

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd Cast-Stone
```

### 2. Install all dependencies
```bash
npm run install:all
```
This will install dependencies for the root, backend, and frontend.

### 3. Environment Configuration
Configure your backend environment variables:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cast-stone
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

## 🏃‍♂️ Running the Application

### Development Mode (Both servers simultaneously)
```bash
npm run dev
```
This starts both backend (http://localhost:5000) and frontend (http://localhost:3000) concurrently.

### Individual Development Servers
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Production Mode
```bash
npm run build
npm start
```

## 🎨 Modular CSS Architecture

This project uses a modular CSS approach where each page has its own CSS module:

- `page.tsx` - TypeScript component file
- `page.module.css` - Corresponding CSS module file

### Example Structure:
```
src/app/about/
├── page.tsx           # About page component
└── page.module.css    # About page styles

src/app/contact/
├── page.tsx           # Contact page component
└── page.module.css    # Contact page styles
```

### Benefits:
- ✅ Scoped styles (no CSS conflicts)
- ✅ Better maintainability
- ✅ Component-specific styling
- ✅ Easier debugging
- ✅ Better performance (only loads required CSS)

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

- `GET /health` - Health check endpoint
- `GET /test` - Test endpoint

## 🗄️ Database

The application uses MongoDB with Mongoose ODM. The connection string is configured in the `backend/.env` file.

### Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/cast-stone
```

### MongoDB Atlas
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

## 🔧 Available Scripts

### Root Level Scripts
- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only backend development server
- `npm run dev:frontend` - Start only frontend development server
- `npm run build` - Build frontend for production
- `npm start` - Start both servers in production mode
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Remove all node_modules directories
- `npm run lint` - Run ESLint on frontend

### Backend Scripts (from backend/ directory)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend Scripts (from frontend/ directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Quick Start Guide

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd Cast-Stone
   npm run install:all
   ```

2. **Configure environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

3. **Start development:**
   ```bash
   cd ..
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License."
