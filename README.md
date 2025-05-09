Backend API build with Express, TypeScript, MVC, RESTful.

## Tutorial

Detailed documentation for all API endpoints available in the system.

### 1. Auth

#### 1.1. Register
- **Method:** POST
- **Path:** `/api/auth/register`
- **Access:** Public
- **Payload:**
  ```json
  {
    "name": "string",
    "email": "string",s
    "password": "string",
    "role": "string" // Optional: "student" (default), "admin", "coordinator". Nếu sinh viên tự đăng ký tài khoản thì không truyền vào field "role"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "token": "string"
    }
  }
  ```

#### 1.2. Login
- **Method:** POST
- **Path:** `/api/auth/login`
- **Access:** Public
- **Payload:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "data": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "isAdmin": "boolean",
      "token": "string"
    }
  }
  ```
- **Example Accounts:**
  - Admin: `admin@gmail.com / Admin123456`
  - Quản trị ngành: `quantringanh1@gmail.com / Qtn123456`,  `admin2@gmail.com / Admin123456`
  - Student: `buitranthienan1111@gmail.com / kidiezyllex.1111`

#### 1.3. Get Profile
- **Method:** GET
- **Path:** `/api/auth/profile`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "User profile retrieved successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "isAdmin": "boolean",
      "role": "string"
    }
  }
  ```

### 2. Users

#### 2.1. Get All Users
- **Method:** GET
- **Path:** `/api/users`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Users retrieved successfully",
    "data": [
      {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      }
    ]
  }
  ```

#### 2.2. Update User
- **Method:** PUT
- **Path:** `/api/users/:id`
- **Access:** Private (own profile or admin)
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "name": "string",
    "email": "string",
    "avatar": "string",
    "department": "string" // Department ID
  }
  ```
- **Response:**
  ```json
  {
    "message": "User updated successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "email": "string"
    }
  }
  ```

#### 2.3. Get User by ID
- **Method:** GET
- **Path:** `/api/users/:id`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "User retrieved successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

### 3. Departments

#### 3.1. Get All Departments
- **Method:** GET
- **Path:** `/api/departments`
- **Access:** Private (Admin, Coordinator)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Departments retrieved successfully",
    "data": [
      {
        "_id": "string",
        "name": "string",
        "code": "string",
        "description": "string",
        "coordinatorId": "string"
      }
    ]
  }
  ```

#### 3.2. Get Department by ID
- **Method:** GET
- **Path:** `/api/departments/:id`
- **Access:** Private (Admin, Coordinator)
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Department retrieved successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "code": "string",
      "description": "string",
      "coordinatorId": "string"
    }
  }
  ```

#### 3.3. Create Department
- **Method:** POST
- **Path:** `/api/departments`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
  "name": "Công nghệ thông tin",
  "code": "CNTT",
  "description": "Ngành học về công nghệ thông tin và lập trình",
  "coordinatorId": "67f80cb9b5b273e272ae6f44"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Department created successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "code": "string",
      "description": "string",
      "coordinatorId": "string"
    }
  }
  ```

#### 3.4. Update Department
- **Method:** PUT
- **Path:** `/api/departments/:id`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "name": "string",
    "code": "string",
    "description": "string",
    "coordinatorId": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Department updated successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "code": "string",
      "description": "string",
      "coordinatorId": "string"
    }
  }
  ```

#### 3.5. Delete Department
- **Method:** DELETE
- **Path:** `/api/departments/:id`
- **Access:** Admin only
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Department deleted successfully"
  }
  ```

### 4. Events

#### 4.1. Get Upcoming Events
- **Method:** GET
- **Path:** `/api/events`
- **Access:** Public
- **Query Parameters:**
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "Events retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "startDate": "date",
        "endDate": "date",
        "location": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "organizer": "string"
      }
    ]
  }
  ```

#### 4.2. Get All Events (Including Past)
- **Method:** GET
- **Path:** `/api/events/all`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Query Parameters:**
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "All events retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "startDate": "date",
        "endDate": "date",
        "location": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "organizer": "string"
      }
    ]
  }
  ```

#### 4.3. Get Event by ID
- **Method:** GET
- **Path:** `/api/events/:id`
- **Access:** Public
- **Response:**
  ```json
  {
    "message": "Event retrieved successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "startDate": "date",
      "endDate": "date",
      "location": "string",
      "department": {
        "_id": "string",
        "name": "string"
      },
      "organizer": "string"
    }
  }
  ```

#### 4.4. Create Event
- **Method:** POST
- **Path:** `/api/events`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
  "title": "Hội thảo Công nghệ",
  "description": "Mô tả chi tiết về hội thảo",
  "startDate": "2025-05-06T09:00:00Z",
  "endDate": "2025-05-15T16:00:00Z",
  "location": "Hội trường A",
  "department": "67f8d416b509cace3cc9d4ea",
  "organizer": "Khoa Công nghệ thông tin"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Event created successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "startDate": "date",
      "endDate": "date",
      "location": "string",
      "department": "string",
      "organizer": "string"
    }
  }
  ```

#### 4.5. Update Event
- **Method:** PUT
- **Path:** `/api/events/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "description": "string",
    "startDate": "date",
    "endDate": "date",
    "location": "string",
    "department": "string", // Department ID
    "organizer": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Event updated successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "startDate": "date",
      "endDate": "date",
      "location": "string",
      "department": "string",
      "organizer": "string"
    }
  }
  ```

#### 4.6. Delete Event
- **Method:** DELETE
- **Path:** `/api/events/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Event deleted successfully"
  }
  ```

### 5. Scholarships

#### 5.1. Get Active Scholarships
- **Method:** GET
- **Path:** `/api/scholarships`
- **Access:** Public
- **Query Parameters:**
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "Scholarships retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "requirements": "string",
        "value": "string",
        "applicationDeadline": "date",
        "provider": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "eligibility": "string",
        "applicationProcess": "string"
      }
    ]
  }
  ```

#### 5.2. Get All Scholarships (Including Expired)
- **Method:** GET
- **Path:** `/api/scholarships/all`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Query Parameters:**
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "All scholarships retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "requirements": "string",
        "value": "string",
        "applicationDeadline": "date",
        "provider": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "eligibility": "string",
        "applicationProcess": "string"
      }
    ]
  }
  ```

#### 5.3. Get Scholarship by ID
- **Method:** GET
- **Path:** `/api/scholarships/:id`
- **Access:** Public
- **Response:**
  ```json
  {
    "message": "Scholarship retrieved successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "value": "string",
      "applicationDeadline": "date",
      "provider": "string",
      "department": {
        "_id": "string",
        "name": "string"
      },
      "eligibility": "string",
      "applicationProcess": "string"
    }
  }
  ```

#### 5.4. Create Scholarship
- **Method:** POST
- **Path:** `/api/scholarships`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "description": "string",
    "requirements": "string",
    "value": "string",
    "applicationDeadline": "date",
    "provider": "string",
    "department": "string", // Department ID
    "eligibility": "string",
    "applicationProcess": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Scholarship created successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "value": "string",
      "applicationDeadline": "date",
      "provider": "string",
      "department": "string",
      "eligibility": "string",
      "applicationProcess": "string"
    }
  }
  ```

#### 5.5. Update Scholarship
- **Method:** PUT
- **Path:** `/api/scholarships/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "description": "string",
    "requirements": "string",
    "value": "string",
    "applicationDeadline": "date",
    "provider": "string",
    "department": "string", // Department ID
    "eligibility": "string",
    "applicationProcess": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Scholarship updated successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "requirements": "string",
      "value": "string",
      "applicationDeadline": "date",
      "provider": "string",
      "department": "string",
      "eligibility": "string",
      "applicationProcess": "string"
    }
  }
  ```

#### 5.6. Delete Scholarship
- **Method:** DELETE
- **Path:** `/api/scholarships/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Scholarship deleted successfully"
  }
  ```

### 6. Messages

#### 6.1. Get Conversations
- **Method:** GET
- **Path:** `/api/messages`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Conversations retrieved successfully",
    "data": [
      {
        "userId": "string",
        "name": "string",
        "lastMessage": "string",
        "lastMessageDate": "date",
        "unreadCount": 0
      }
    ]
  }
  ```

#### 6.2. Get Conversation History
- **Method:** GET
- **Path:** `/api/messages/:userId`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Messages retrieved successfully",
    "data": [
      {
        "_id": "string",
        "senderId": "string",
        "receiverId": "string",
        "content": "string",
        "read": "boolean",
        "createdAt": "date"
      }
    ]
  }
  ```

#### 6.3. Send Message
- **Method:** POST
- **Path:** `/api/messages`
- **Access:** Private
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "receiverId": "string",
    "content": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Message sent successfully",
    "data": {
      "_id": "string",
      "senderId": "string",
      "receiverId": "string",
      "content": "string",
      "read": false,
      "createdAt": "date"
    }
  }
  ```

#### 6.4. Mark Message as Read
- **Method:** PUT
- **Path:** `/api/messages/:messageId/read`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Message marked as read"
  }
  ```

#### 6.5. Mark All Messages as Read
- **Method:** PUT
- **Path:** `/api/messages/:userId/read-all`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "All messages marked as read"
  }
  ```

### 7. Notifications

#### 7.1. Get Notifications
- **Method:** GET
- **Path:** `/api/notifications`
- **Access:** Public
- **Query Parameters:**
  - `type`: Filter by notification type (optional)
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "Notifications retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "type": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "startDate": "date",
        "endDate": "date",
        "isImportant": "boolean",
        "createdAt": "date"
      }
    ]
  }
  ```

#### 7.2. Get Notification by ID
- **Method:** GET
- **Path:** `/api/notifications/:id`
- **Access:** Public
- **Response:**
  ```json
  {
    "message": "Notification retrieved successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "content": "string",
      "type": "string",
      "department": {
        "_id": "string",
        "name": "string"
      },
      "startDate": "date",
      "endDate": "date",
      "isImportant": "boolean",
      "createdAt": "date"
    }
  }
  ```

#### 7.3. Create Notification
- **Method:** POST
- **Path:** `/api/notifications`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "content": "string",
    "type": "string", // "general", "scholarship", "event", "department"
    "department": "string", // Department ID (optional)
    "startDate": "date", // Optional
    "endDate": "date", // Optional
    "isImportant": "boolean" // Optional
  }
  ```
- **Response:**
  ```json
  {
    "message": "Notification created successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "content": "string",
      "type": "string",
      "department": "string",
      "startDate": "date",
      "endDate": "date",
      "isImportant": "boolean",
      "createdAt": "date"
    }
  }
  ```

#### 7.4. Update Notification
- **Method:** PUT
- **Path:** `/api/notifications/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "title": "string",
    "content": "string",
    "type": "string",
    "department": "string", // Department ID
    "startDate": "date",
    "endDate": "date",
    "isImportant": "boolean"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Notification updated successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "content": "string",
      "type": "string",
      "department": "string",
      "startDate": "date",
      "endDate": "date",
      "isImportant": "boolean"
    }
  }
  ```

#### 7.5. Delete Notification
- **Method:** DELETE
- **Path:** `/api/notifications/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Notification deleted successfully"
  }
  ```

#### 7.6. Get Saved Notifications
- **Method:** GET
- **Path:** `/api/notifications/saved`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Saved notifications retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "type": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "startDate": "date",
        "endDate": "date",
        "isImportant": "boolean",
        "createdAt": "date"
      }
    ]
  }
  ```

#### 7.7. Save Notification
- **Method:** PUT
- **Path:** `/api/notifications/:id/save`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Notification saved successfully"
  }
  ```

#### 7.8. Unsave Notification
- **Method:** PUT
- **Path:** `/api/notifications/:id/unsave`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Notification unsaved successfully"
  }
  ```

### 8. Chat

#### 8.1. Ask AI Question
- **Method:** POST
- **Path:** `/api/chat/ask`
- **Access:** Private
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "question": "string",
    "sessionId": "string", // Optional for new chats
    "category": "string", // Optional for filtering data by category
    "departmentId": "string" // Optional for filtering data by department
  }
  ```
- **Response:**
  ```json
  {
    "message": "Response generated successfully",
    "data": {
      "answer": "string",
      "sessionId": "string",
      "messageIndex": 0
    }
  }
  ```

#### 8.2. Get Chat History
- **Method:** GET
- **Path:** `/api/chat/history`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Chat history retrieved successfully",
    "data": [
      {
        "_id": "string",
        "title": "string",
        "userId": "string",
        "createdAt": "date",
        "messages": [
          {
            "question": "string",
            "answer": "string",
            "timestamp": "date"
          }
        ]
      }
    ]
  }
  ```

#### 8.3. Get Chat Session
- **Method:** GET
- **Path:** `/api/chat/session/:id`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Chat session retrieved successfully",
    "data": {
      "_id": "string",
      "title": "string",
      "userId": "string",
      "createdAt": "date",
      "messages": [
        {
          "question": "string",
          "answer": "string",
          "timestamp": "date",
          "isAccurate": "boolean"
        }
      ]
    }
  }
  ```

#### 8.4. Rate AI Response
- **Method:** PUT
- **Path:** `/api/chat/rate`
- **Access:** Private
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "sessionId": "string",
    "messageIndex": 0,
    "isAccurate": "boolean"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Response rated successfully"
  }
  ```

#### 8.5. Delete Chat Session
- **Method:** DELETE
- **Path:** `/api/chat/session/:id`
- **Access:** Private
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Chat session deleted successfully"
  }
  ```

### 9. Dataset

#### 9.1. Get All Dataset Items
- **Method:** GET
- **Path:** `/api/dataset`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Query Parameters:**
  - `category`: Filter by category (optional)
  - `department`: Filter by department ID (optional)
- **Response:**
  ```json
  {
    "message": "Dataset retrieved successfully",
    "data": [
      {
        "_id": "string",
        "key": "string",
        "value": "string",
        "category": "string",
        "department": {
          "_id": "string",
          "name": "string"
        },
        "createdAt": "date"
      }
    ]
  }
  ```

#### 9.2. Get Dataset Item by ID
- **Method:** GET
- **Path:** `/api/dataset/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Dataset item retrieved successfully",
    "data": {
      "_id": "string",
      "key": "string",
      "value": "string",
      "category": "string",
      "department": {
        "_id": "string",
        "name": "string"
      },
      "createdAt": "date"
    }
  }
  ```

#### 9.3. Create Dataset Item
- **Method:** POST
- **Path:** `/api/dataset`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "key": "string",
    "value": "string",
    "category": "string", // "general", "scholarship", "event", "department", "faq"
    "department": "string" // Department ID (optional)
  }
  ```
- **Response:**
  ```json
  {
    "message": "Dataset item created successfully",
    "data": {
      "_id": "string",
      "key": "string",
      "value": "string",
      "category": "string",
      "department": "string",
      "createdAt": "date"
    }
  }
  ```

#### 9.4. Update Dataset Item
- **Method:** PUT
- **Path:** `/api/dataset/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Payload:**
  ```json
  {
    "key": "string",
    "value": "string",
    "category": "string",
    "department": "string" // Department ID
  }
  ```
- **Response:**
  ```json
  {
    "message": "Dataset item updated successfully",
    "data": {
      "_id": "string",
      "key": "string",
      "value": "string",
      "category": "string",
      "department": "string"
    }
  }
  ```

#### 9.5. Delete Dataset Item
- **Method:** DELETE
- **Path:** `/api/dataset/:id`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Dataset item deleted successfully"
  }
  ```

### 10. AI Training

#### 10.1. Train AI
- **Method:** POST
- **Path:** `/api/ai/train`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "AI training started successfully",
    "data": {
      "trainingId": "string",
      "status": "string",
      "startTime": "date"
    }
  }
  ```

#### 10.2. Get Training History
- **Method:** GET
- **Path:** `/api/ai/training-history`
- **Access:** Admin or Coordinator
- **Headers:** Authorization token required
- **Response:**
  ```json
  {
    "message": "Training history retrieved successfully",
    "data": [
      {
        "_id": "string",
        "status": "string",
        "startTime": "date",
        "endTime": "date",
        "datasetSize": 0,
        "userId": "string"
      }
    ]
  }
  ```

## A. Phân quyền các chức năng

### 1. Role: Coordinator
#### Dataset
- `GET /api/dataset` — Lấy tất cả dữ liệu dataset
- `GET /api/dataset/:id` — Lấy chi tiết dữ liệu
- `POST /api/dataset` — Thêm dữ liệu mới (chỉ cho ngành mình)
- `PUT /api/dataset/:id` — Cập nhật dữ liệu (chỉ cho ngành mình)
- `DELETE /api/dataset/:id` — Xóa dữ liệu (chỉ cho ngành mình)

#### Event
- `GET /api/events/all` — Lấy tất cả sự kiện (chỉ của ngành mình)
- `POST /api/events` — Tạo sự kiện mới (chỉ cho ngành mình)
- `PUT /api/events/:id` — Cập nhật sự kiện (chỉ cho ngành mình, không được cập nhật sự kiện chung)
- `DELETE /api/events/:id` — Xóa sự kiện (chỉ cho ngành mình, không được xóa sự kiện chung)

#### Notification
- `POST /api/notifications` — Tạo thông báo mới (chỉ cho ngành mình)
- `PUT /api/notifications/:id` — Cập nhật thông báo (chỉ cho ngành mình, không được cập nhật thông báo chung)
- `DELETE /api/notifications/:id` — Xóa thông báo (chỉ cho ngành mình, không được xóa thông báo chung)

#### Scholarship
- `GET /api/scholarships/all` — Lấy tất cả học bổng (chỉ của ngành mình)
- `POST /api/scholarships` — Tạo học bổng mới (chỉ cho ngành mình)
- `PUT /api/scholarships/:id` — Cập nhật học bổng (chỉ cho ngành mình, không được cập nhật học bổng chung)
- `DELETE /api/scholarships/:id` — Xóa học bổng (chỉ cho ngành mình, không được xóa học bổng chung)

#### AI
- `POST /api/ai/train` — Training AI từ dataset
- `GET /api/ai/training-history` — Lấy lịch sử training AI

Coordinator cũng có thể sử dụng tất cả các route public như student.

---

### 2. Role: Student

#### Dataset
- `GET /api/dataset` — Lấy tất cả dữ liệu dataset
- `GET /api/dataset/:id` — Lấy chi tiết dữ liệu

#### Event
- `GET /api/events` — Lấy tất cả sự kiện sắp diễn ra hoặc đang diễn ra