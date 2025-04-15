# Chat-Net

A real-time chat application built with React, Node.js, and Socket.IO. This full-stack application features user authentication, real-time messaging, and active user tracking.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- Multiple device/browser support per user
- Active user tracking with connection count
- Responsive design with Chakra UI
- TypeScript support for better type safety

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for fast development and building
- Chakra UI for modern, accessible components
- Socket.IO client for real-time communication
- React Router for navigation
- Axios for HTTP requests

### Backend
- Node.js with Express
- Socket.IO for real-time bi-directional communication
- JWT for authentication
- bcrypt for password hashing
- In-memory data storage (can be extended to use a database)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chat-net.git
cd chat-net
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

### Configuration

1. Backend configuration:
   Create a `.env` file in the server directory:
```env
PORT=8000
JWT_SECRET=your_jwt_secret_here
```

2. Frontend configuration:
   Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:8000
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Register a new account with a unique nickname and contact number
2. Log in with your credentials
3. Start chatting in real-time with other users
4. View active users and their connection status
5. Messages are delivered instantly to all connected users
6. Support for multiple sessions per user (same account on different devices/browsers)

## Features in Detail

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes on both frontend and backend

### Real-time Communication
- Instant message delivery
- Active user tracking
- Multiple device support
- Connection status monitoring

### User Interface
- Clean and modern design with Chakra UI
- Responsive layout
- Real-time user list updates
- Message history
- Visual indicators for message status

## Project Structure

```
chat-net/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── types/        # TypeScript types
│   └── ...
└── server/                # Backend Node.js application
    ├── routes/           # Express routes
    │   ├── auth.js      # Authentication routes
    │   └── chat.js      # Chat routes
    └── index.js         # Main server file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Thanks to Socket.IO for making real-time communication easy
- Chakra UI for the beautiful component library
- The React team for an amazing frontend library
