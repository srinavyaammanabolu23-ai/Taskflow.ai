# TaskFlow.ai 🚀

TaskFlow.ai is a beautiful, full-stack Kanban-style task management application designed to help users organize their priorities efficiently. Built with a modern tech stack and featuring a sleek, responsive "Forest Green" glassmorphism UI.

## ✨ Features
- **Secure Authentication**: User registration and login powered by Firebase Authentication.
- **Real-Time Data**: Tasks are synced in real-time across all your devices using Firebase Realtime Database.
- **Kanban Board**: Drag-and-drop task management across 'To Do', 'In Progress', and 'Done' columns.
- **Smart Dashboard**: Real-time statistics, priority breakdowns, and productivity charts.
- **Priority & Due Dates**: Tag tasks by priority (Low, Medium, High, Urgent) and set due dates.
- **Smart Notifications**: Priority-based notification system that alerts users to Urgent tasks or Due Soon/Overdue tasks.
- **Beautiful UI**: Modern, fluid, glassmorphic design that is fully responsive for mobile and desktop.

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Vite
- **Backend & Database**: Firebase (Authentication & Realtime Database)
- **Styling**: Vanilla CSS with CSS Variables for theming

## 🚀 How to Run Locally

Since this app runs purely on a Backend-as-a-Service (Firebase), there is only one server you need to run!

1. Open a terminal and navigate to the project root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`. Open this URL in your browser.*

## ☁️ Deployment
This application is fully ready to be deployed to Vercel. 
Simply push this code to GitHub and import the repository into your Vercel dashboard. No separate backend deployment is needed!
