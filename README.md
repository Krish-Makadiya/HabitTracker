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

**Happy Habit Building! 🎯**
