# TaskFlow.ai 🚀

TaskFlow.ai is a beautiful, full-stack Kanban-style task management application designed to help users organize their priorities efficiently. Built with a modern tech stack and featuring a sleek, responsive "Forest Green" glassmorphism UI.

## ✨ Features
- **Secure Authentication**: User registration and login powered by JWT and bcrypt password hashing.
- **Kanban Board**: Drag-and-drop task management across 'To Do', 'In Progress', and 'Done' columns.
- **Smart Dashboard**: Real-time statistics, priority breakdowns, and productivity charts.
- **Priority & Due Dates**: Tag tasks by priority (Low, Medium, High, Urgent) and set due dates.
- **Smart Notifications**: Priority-based notification system that alerts users to Urgent tasks or Due Soon/Overdue tasks.
- **Beautiful UI**: Modern, fluid, glassmorphic design that is fully responsive for mobile and desktop.

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Styling**: Vanilla CSS with CSS Variables for theming

## 🚀 How to Run Locally

Because this is a full-stack application, you need to run both the backend server and the frontend client simultaneously.

### 1. Start the Backend Server
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Node.js server:
   ```bash
   node server.js
   ```
   *The server will run on `http://localhost:5000`. It will automatically create the `taskflow.sqlite` database file.*

### 2. Start the Frontend Client
1. Open a **new** terminal window and navigate to the root directory (`client` files are currently at the root).
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`. Open this URL in your browser.*

## 🔒 Security
- Passwords are never stored in plain text. They are hashed using `bcrypt`.
- API endpoints are protected using JSON Web Tokens (JWT).
- The local SQLite database (`*.sqlite`) is excluded from source control to protect user data.
