# Habit Tracker - MERN Stack Application

A beautiful and functional habit tracker built with MongoDB, Express.js, React, and Node.js. Track your daily habits with a calendar-style interface that gets greener as you complete more habits.

## Features

- **Calendar-Style Interface**: Visual monthly view similar to GitHub's contribution graph
- **Habit Management**: Add, edit, and delete habits with custom colors
- **Progress Tracking**: Click to mark habits complete/incomplete for any day
- **Visual Feedback**: Calendar cells get greener based on completion percentage
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant feedback when marking habits complete

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Heroicons** for icons
- **React Hot Toast** for notifications

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository** (if from git) or navigate to the project directory

2. **Install server dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**:
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**:
   
   Server (`.env` in server directory):
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/habittracker
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ```
   
   Client (`.env` in client directory):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Start the development servers**:
   
   Terminal 1 - Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 - Start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## Usage

1. **Register/Login**: Create an account or sign in
2. **Add Habits**: Click "Manage Habits" to add your daily habits
3. **Track Progress**: Click on calendar cells to mark habits as complete
4. **Visual Progress**: Watch the calendar get greener as you complete more habits
5. **Edit/Delete**: Manage your habits through the habit manager

## Database Schema

### User
- username (String, unique)
- email (String, unique)
- password (String, hashed)

### Habit
- userId (ObjectId, ref to User)
- name (String)
- description (String, optional)
- color (String, hex color)
- isActive (Boolean)

### HabitCompletion
- userId (ObjectId, ref to User)
- habitId (ObjectId, ref to Habit)
- date (Date)
- completed (Boolean)
- notes (String, optional)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Habits
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Toggle habit completion
- `GET /api/habits/:id/completions` - Get habit completions
- `GET /api/habits/completions/range` - Get all completions in date range

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. - MERN Stack Application

A beautiful and modern habit tracking application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring authentication, social features, and streak-based leaderboards.

## Features

- 🔐 **Authentication**: Secure JWT-based authentication with protected routes
- 📊 **Dashboard**: Create, track, and manage your daily habits
- 🏆 **Leaderboard**: Compete with friends based on daily login streaks
- 👥 **Social Features**: Add friends, send requests, and stay motivated together
- 🎨 **Beautiful UI**: Modern, responsive design with Tailwind CSS
- 📱 **Mobile Friendly**: Fully responsive design that works on all devices
- 🔥 **Streak Tracking**: Track your daily login streaks and habit completion streaks

## Tech Stack

### Frontend
- React 19.1.1
- React Router DOM 6.26.0
- Tailwind CSS 4.1.13
- Axios for API calls
- Lucide React for icons
- React Hot Toast for notifications
- Date-fns for date handling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express Validator for input validation
- CORS for cross-origin requests
- Helmet for security headers
- Rate limiting for API protection

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd HabitTracker
```

### 2. Server Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/habittracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

### 3. Client Setup
```bash
cd ../client
npm install
```

### 4. Database Setup
Make sure MongoDB is running on your system:
- **Local MongoDB**: Start MongoDB service
- **MongoDB Atlas**: Update the MONGODB_URI in your .env file

### 5. Running the Application

#### Start the Backend Server
```bash
cd server
npm run dev
```
The server will run on http://localhost:5000

#### Start the Frontend Client
```bash
cd client
npm run dev
```
The client will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Habits
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Mark habit as completed
- `GET /api/habits/:id/progress` - Get habit progress

### Users
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/profile/:userId` - Get user profile
- `GET /api/users/search` - Search users
- `PUT /api/users/profile` - Update user profile

### Friends
- `GET /api/friends` - Get user's friends
- `POST /api/friends/request` - Send friend request
- `GET /api/friends/requests` - Get friend requests
- `PUT /api/friends/request/:requestId` - Accept/reject friend request
- `DELETE /api/friends/:friendId` - Remove friend

## Database Schema

### User Model
- username (unique)
- email (unique)
- password (hashed)
- avatar
- streak (daily login streak)
- lastLoginDate
- totalHabitsCompleted
- friends (array of user IDs)
- friendRequests (array of requests)

### Habit Model
- title
- description
- category (health, fitness, productivity, etc.)
- color
- frequency (daily, weekly, custom)
- userId (reference to User)
- streak (habit completion streak)
- bestStreak
- totalCompletions

### Progress Model
- userId (reference to User)
- habitId (reference to Habit)
- date
- completed (boolean)
- completedCount
- notes

## Features Explained

### Streak System
- **Daily Login Streak**: Increases by 1 each day you log in consecutively
- **Habit Streak**: Tracks consecutive days of habit completion
- **Leaderboard Ranking**: Users ranked by their daily login streaks

### Authentication Flow
- JWT-based authentication with access and refresh tokens
- Protected routes on both frontend and backend
- Automatic token refresh
- Secure password hashing with bcrypt

### Social Features
- Send and receive friend requests
- View friends' streaks and progress
- Search for users by username or email
- Remove friends functionality

## Development Scripts

### Server
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet for security headers
- Input validation and sanitization
- Protected routes and middleware

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

If you encounter any issues or have questions, please create an issue in the repository.

---

**Happy Habit Building! 🎯**
