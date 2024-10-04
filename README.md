# RPA Cloud-Based Platform

## Overview

This project is a cloud-based Robotic Process Automation (RPA) platform built using Node.js for the backend and React for the frontend. The platform supports task management, execution, and user role-based access, including an admin interface for monitoring tasks.

## Features

- **User Authentication & Authorization**: Secure login and registration flow with JWT-based authentication.
- **Admin Control Panel**: Admins can approve or deny user registrations.
- **Task Management**: Users can create, list, and execute tasks.
- **Concurrency**: Supports running concurrent tasks with regular status updates.

## Project Structure

```
rpa-platform/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── taskRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── utils/
│   │   │   └── taskManager.js
│   │   └── app.js
│   │   └── server.js
│   ├── tasks/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.js
│   │   │   ├── Header.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── TaskExecution.js
│   │   │   └── TaskList.js
│   │   ├── context/
│   │   │   └── TaskContext.js
│   │   ├── App.js
│   │   ├── index.js
│   ├── package.json
│   └── .env
├── start.sh
└── README.md
```

## Installation

### Backend Setup
1. Ensure MongoDB is running on your machine.
2. Create a `.env` file in the `backend` directory with `MONGO_URI` and `JWT_SECRET`.
3. Navigate to the backend directory and install dependencies:

   ```bash
   cd backend
   npm install
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory and install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the frontend development server:

   ```bash
   npm start
   ```

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

#### Register User
- **URL**: `/users/register`
- **Method**: `POST`
- **Data Params**: 
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "token": "string"
    }
    ```
- **Error Response**:
  - **Code**: 400, 500
  - **Content**: 
    ```json
    {
      "msg": "string"
    }
    ```

#### Login User
- **URL**: `/users/login`
- **Method**: `POST`
- **Data Params**: 
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "token": "string"
    }
    ```
- **Error Response**:
  - **Code**: 400, 403, 500
  - **Content**: 
    ```json
    {
      "msg": "string"
    }
    ```

#### Get Current User (Protected)
- **URL**: `/users/me`
- **Method**: `GET`
- **Headers**: 
  - `x-auth-token`: User's JWT token
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "isAdmin": true,
      "isApproved": true
    }
    ```
- **Error Response**:
  - **Code**: 401, 500
  - **Content**: 
    ```json
    {
      "msg": "string"
    }
    ```

### Task Management

#### List All Tasks
- **URL**: `/tasks`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    [
      {
        "id": "string",
        "name": "string",
        "description": "string"
      }
    ]
    ```

#### Run a Task
- **URL**: `/tasks/run/:taskId`
- **Method**: `POST`
- **Url Params**: `taskId` (Task identifier)
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    {
      "message": "Task started successfully",
      "runId": "string"
    }
    ```
- **Error Response**:
  - **Code**: 500
  - **Content**: 
    ```json
    {
      "error": "string"
    }
    ```

#### Get All Running Tasks
- **URL**: `/tasks/running`
- **Method**: `GET`
- **Success Response**:
  - **Code**: 200
  - **Content**: 
    ```json
    [
      {
        "id": "string",
        "taskId": "string",
        "status": "running",
        "startTime": "Date",
        "endTime": null
      }
    ]
    ```

## Notes

- Ensure that your MongoDB service is running on your local machine or accessible through your configured URI in `.env`.
- The frontend and backend servers must be started concurrently to fully test the application.
- Ensure task logic adheres to asynchronous functions and proper error handling.
- Adjust CORS policy as needed when testing API endpoints across different platforms or environments.
- Ensure error handling and async mechanisms for critical paths like authentication and real-time task updates.

For further inquiries or troubleshooting, consult the project’s GitHub issues section or join the developer forum!