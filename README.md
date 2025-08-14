# Video Conferencing Platform

A full-stack video conferencing application built with React, Node.js, Express, MongoDB, and WebRTC.

## 🌟 Features

- **User Authentication**: Secure signup and login functionality
- **Real-time Video Calls**: High-quality video and audio communication
- **Chat**: Real-time text chat during video calls
- **Meeting History**: Track past meetings and join previous sessions
- **Responsive Design**: Works on desktop and mobile devices
- **Screen Sharing**: Share your screen with other participants
- **Mute/Unmute**: Control your audio and video settings
- **Copy Meeting Link**: Easy way to invite participants

## 🚀 Tech Stack

### Frontend
- React.js
- Material-UI (MUI) for UI components
- Socket.IO Client for real-time communication
- WebRTC for peer-to-peer video streaming
- React Router for navigation
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- Socket.IO for real-time communication
- JWT for authentication
- Bcrypt for password hashing

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

## 🚀 Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API base URL in `src/environment.js` if needed

4. Start the development server:
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## 🌐 Deployment

The application is deployed on Render:

- **Frontend**: [https://video-frontend-kr3g.onrender.com](https://video-frontend-kr3g.onrender.com)
- **Backend**: [https://video-backend-q7a6.onrender.com](https://video-backend-q7a6.onrender.com)

## 📂 Project Structure

```
video_conferencing_platform/
├── backend/               # Backend server
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── app.js         # Express app configuration
│   └── package.json
│
└── frontend/              # Frontend React app
    ├── public/            # Static files
    └── src/
        ├── components/    # Reusable UI components
        ├── contexts/      # React contexts
        ├── pages/         # Page components
        ├── styles/        # Global styles
        ├── utils/         # Utility functions
        └── App.js         # Main application component
```

## 🔒 Authentication

The application uses JWT (JSON Web Tokens) for authentication. After successful login, a token is stored in the browser's local storage and included in the Authorization header for subsequent requests.

## 📡 Real-time Communication

- **Socket.IO** is used for real-time signaling between peers
- **WebRTC** establishes direct peer-to-peer connections for video/audio streaming
- The signaling server helps peers discover and establish connections

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Meetings
- `POST /api/meetings` - Create a new meeting
- `GET /api/meetings/:id` - Get meeting details
- `GET /api/meetings/user/:userId` - Get user's meeting history

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as part of Apna College Web Development practice
- Special thanks to all contributors and open-source libraries used in this project

## 📧 Contact

For any queries or support, please contact the project maintainer.
